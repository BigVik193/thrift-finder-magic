
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0';

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
            'Authorization, X-Client-Info, Content-Type, apikey',
    };

    if (req.method === 'OPTIONS') {
        return new Response('OK', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
            'SUPABASE_SERVICE_ROLE_KEY'
        );

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase configuration is missing');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { item, userId } = await req.json();

        if (!item || !item.id) {
            return new Response(
                JSON.stringify({ error: 'Valid item data is required' }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'User ID is required' }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Check if the user already liked this item
        const { data: existingLike, error: checkError } = await supabase
            .from('liked_items')
            .select('user_id, listing_id')
            .eq('user_id', userId)
            .eq('listing_id', item.id)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking for existing like:', checkError);
            throw new Error(`Error checking like status: ${checkError.message}`);
        }

        let success = false;
        let message = '';

        if (existingLike) {
            // If already liked, unlike it (remove the record)
            const { error: unlikeError } = await supabase
                .from('liked_items')
                .delete()
                .eq('user_id', userId)
                .eq('listing_id', item.id);

            if (unlikeError) {
                throw new Error(`Error unliking item: ${unlikeError.message}`);
            }
            
            success = false;
            message = 'Item unliked successfully';
        } else {
            // If not already in the database, check if the listing exists
            const { data: existingListing, error: listingError } = await supabase
                .from('listings')
                .select('id')
                .eq('id', item.id)
                .maybeSingle();

            if (listingError) {
                console.error('Error checking for existing listing:', listingError);
            }

            // Validate required fields for new listings
            if (!existingListing) {
                const requiredFields = ['title', 'price', 'currency', 'image', 'platform', 'url'];
                const missingFields = requiredFields.filter(field => !item[field]);
                
                if (missingFields.length > 0) {
                    return new Response(
                        JSON.stringify({ 
                            error: `Missing required fields: ${missingFields.join(', ')}`,
                            provided: item
                        }),
                        {
                            status: 400,
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                }

                // Insert the new listing
                const { error: insertError } = await supabase
                    .from('listings')
                    .insert({
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        currency: item.currency,
                        image: item.image,
                        platform: item.platform,
                        seller_username: item.seller_username || 'Unknown',
                        seller_feedback_percentage: item.seller_feedback_percentage || 'N/A',
                        seller_feedback_score: item.seller_feedback_score || 0,
                        condition: item.condition || 'Unknown',
                        url: item.url,
                    });

                if (insertError) {
                    console.error('Error inserting listing:', insertError);
                    throw new Error(`Error inserting listing: ${insertError.message}`);
                }

                // Generate embedding for the new listing
                try {
                    const { error: embeddingError } = await supabase.functions.invoke(
                        'generate-listing-embedding',
                        {
                            body: { listing_id: item.id },
                        }
                    );

                    if (embeddingError) {
                        console.error('Error invoking generate-listing-embedding:', embeddingError);
                        // Continue despite embedding error - we'll handle this later
                    }
                } catch (embeddingErr) {
                    console.error('Failed to generate embedding:', embeddingErr);
                    // Continue despite embedding error
                }
            }

            // Now like the item (add record to liked_items)
            try {
                const { error: likeError } = await supabase
                    .from('liked_items')
                    .insert({
                        user_id: userId,
                        listing_id: item.id,
                    });

                if (likeError) {
                    throw new Error(`Error liking item for user: ${likeError.message}`);
                }
            } catch (likeErr) {
                console.error('Error inserting like:', likeErr);
                throw likeErr;
            }

            // Update user style vector using EMA with the new embedding
            try {
                const { error: vectorUpdateError } = await supabase.functions.invoke(
                    'update-user-style-vector',
                    {
                        body: {
                            user_id: userId,
                            new_listing_id: item.id,
                        },
                    }
                );

                if (vectorUpdateError) {
                    console.error('Error updating user style vector:', vectorUpdateError);
                    // Continue despite vector update error
                }
            } catch (vectorErr) {
                console.error('Failed to update style vector:', vectorErr);
                // Continue despite vector update error
            }
            
            success = true;
            message = 'Item liked successfully';
        }

        return new Response(
            JSON.stringify({
                success,
                message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in like-listing function:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'An unknown error occurred',
                success: false,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
