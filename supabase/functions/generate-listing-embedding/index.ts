import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
        'Authorization, X-Client-Info, Content-Type, apikey',
};

serve(async (req) => {
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
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'; // Or ada-002

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
            throw new Error('Missing required environment variables');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Parse input
        const { listing_id } = await req.json();

        if (!listing_id) {
            return new Response(
                JSON.stringify({ error: 'listing_id is required' }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Fetch listing info
        const { data: listing, error: fetchError } = await supabase
            .from('listings')
            .select('title, price, condition')
            .eq('id', listing_id)
            .single();

        if (fetchError || !listing) {
            return new Response(
                JSON.stringify({ error: 'Listing not found' }),
                {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Bucket price
        const price = Number(listing.price);
        let priceBucket = 'unknown price';
        if (!isNaN(price)) {
            if (price < 25) priceBucket = 'cheap price';
            else if (price < 100) priceBucket = 'mid-range price';
            else priceBucket = 'premium price';
        }

        const condition = listing.condition || 'unknown condition';
        const title = listing.title || '';

        // Create final input string
        const inputText = `${title}, ${condition}, ${priceBucket}`;

        // Get embedding
        const openaiRes = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: inputText,
                model: OPENAI_EMBEDDING_MODEL,
            }),
        });

        const openaiData = await openaiRes.json();

        if (!openaiRes.ok || !openaiData.data || !openaiData.data[0]) {
            console.error('OpenAI error:', openaiData);
            return new Response(
                JSON.stringify({
                    error: 'Failed to get embedding from OpenAI',
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const embedding = openaiData.data[0].embedding;

        // Store in database
        const { error: updateError } = await supabase
            .from('listings')
            .update({ embedding })
            .eq('id', listing_id);

        if (updateError) {
            return new Response(
                JSON.stringify({
                    error: 'Failed to update embedding in database',
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return new Response(
            JSON.stringify({ message: 'Embedding stored successfully' }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in generate-listing-embedding:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'An unknown error occurred',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
