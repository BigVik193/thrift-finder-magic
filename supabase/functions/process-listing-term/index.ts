import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0';

// Number of results to fetch per search term
const RESULTS_PER_TERM = 20;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
        'Authorization, X-Client-Info, Content-Type, apikey',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('OK', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
            'SUPABASE_SERVICE_ROLE_KEY'
        );
        const EBAY_SEARCH_URL = Deno.env.get('EBAY_SEARCH_URL');
        const EBAY_AUTH = Deno.env.get('EBAY_AUTH');

        if (
            !SUPABASE_URL ||
            !SUPABASE_SERVICE_ROLE_KEY ||
            !EBAY_SEARCH_URL ||
            !EBAY_AUTH
        ) {
            throw new Error('Required environment variables are missing');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get batch ID from request
        const { batchId, continueProcessing } = await req.json();

        if (!batchId) {
            throw new Error('Missing batch ID');
        }

        // Get batch status
        const { data: batchStatus, error: batchError } = await supabase
            .from('daily_fetch_status')
            .select('*')
            .eq('id', batchId)
            .single();

        if (batchError || !batchStatus) {
            throw new Error(`Batch ${batchId} not found`);
        }

        // If the batch is already marked complete or failed, don't proceed
        if (
            batchStatus.status === 'completed' ||
            batchStatus.status === 'failed'
        ) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Batch ${batchId} is already ${batchStatus.status}`,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Get the next unprocessed search term
        const { data: terms, error: termsError } = await supabase
            .from('daily_search_terms')
            .select('id, search_term')
            .eq('is_active', true)
            .order('last_fetched_at', { ascending: true, nullsFirst: true })
            .limit(1);

        if (termsError) {
            throw new Error(
                `Error fetching search terms: ${termsError.message}`
            );
        }

        if (!terms || terms.length === 0) {
            // No more terms to process, mark batch as complete
            await supabase
                .from('daily_fetch_status')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', batchId);

            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Batch ${batchId} completed - all terms processed`,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const term = terms[0];
        let resultCount = 0;
        let hasError = false;

        try {
            // Fetch listings from eBay API
            const response = await fetch(
                `${EBAY_SEARCH_URL}?q=${encodeURIComponent(
                    term.search_term
                )}&limit=${RESULTS_PER_TERM}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${EBAY_AUTH}`,
                        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `eBay API error: ${response.status} - ${errorText}`
                );
            }

            const data = await response.json();
            const ebayItems = data.itemSummaries || [];

            // Process each item fetched
            for (const ebayItem of ebayItems) {
                // Check if item already exists in database
                const { data: existingListing } = await supabase
                    .from('listings')
                    .select('id')
                    .eq('id', ebayItem.itemId)
                    .maybeSingle();

                // Skip if it already exists
                if (existingListing) {
                    continue;
                }

                // Prepare item data for insertion
                const listingData = {
                    id: ebayItem.itemId,
                    title: ebayItem.title,
                    price: ebayItem.price.value,
                    currency: ebayItem.price.currency,
                    image: ebayItem.image?.imageUrl || '',
                    platform: 'ebay',
                    seller_username:
                        ebayItem.seller?.username || 'Unknown Seller',
                    seller_feedback_percentage:
                        ebayItem.seller?.feedbackPercentage || 'N/A',
                    seller_feedback_score: ebayItem.seller?.feedbackScore || 0,
                    condition: ebayItem.condition || 'Not specified',
                    url: ebayItem.itemWebUrl,
                    last_updated: new Date().toISOString(),
                };

                // Insert the new listing
                const { error: insertError } = await supabase
                    .from('listings')
                    .insert(listingData);

                if (insertError) {
                    console.error(
                        `Error inserting listing ${ebayItem.itemId}:`,
                        insertError
                    );
                    continue;
                }

                // Generate embedding for the new listing
                const { error: embeddingError } =
                    await supabase.functions.invoke(
                        'generate-listing-embedding',
                        {
                            body: { listing_id: ebayItem.itemId },
                        }
                    );

                if (embeddingError) {
                    console.error(
                        'Error generating embedding:',
                        embeddingError
                    );
                }

                resultCount++;
            }
        } catch (error) {
            console.error(
                `Error processing search term "${term.search_term}":`,
                error
            );
            hasError = true;
        }

        // Update the search term's last fetched timestamp
        await supabase
            .from('daily_search_terms')
            .update({
                last_fetched_at: new Date().toISOString(),
            })
            .eq('id', term.id);

        // Update batch status
        await supabase
            .from('daily_fetch_status')
            .update({
                terms_processed: batchStatus.terms_processed + 1,
                terms_with_errors:
                    batchStatus.terms_with_errors + (hasError ? 1 : 0),
                new_listings_added:
                    batchStatus.new_listings_added + resultCount,
            })
            .eq('id', batchId);

        // If we should continue processing, trigger the next item
        if (continueProcessing) {
            // Schedule next term with a slight delay
            setTimeout(async () => {
                try {
                    await supabase.functions.invoke('process-listing-term', {
                        body: {
                            batchId: batchId,
                            continueProcessing: true,
                        },
                    });
                } catch (e) {
                    console.error('Error scheduling next term:', e);

                    // Update batch status to failed if we can't continue
                    await supabase
                        .from('daily_fetch_status')
                        .update({
                            status: 'failed',
                            completed_at: new Date().toISOString(),
                        })
                        .eq('id', batchId);
                }
            }, 1000);
        }

        return new Response(
            JSON.stringify({
                success: true,
                processed: {
                    term: term.search_term,
                    new_listings: resultCount,
                    had_error: hasError,
                },
                batch_progress: {
                    processed: batchStatus.terms_processed + 1,
                    total: batchStatus.term_count,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in process-listing-term function:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'An unknown error occurred',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
