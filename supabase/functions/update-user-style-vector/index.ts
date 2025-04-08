import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0';

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
        const alpha = 0.3;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase config');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { user_id, new_listing_id, clothing_item_id } = await req.json();

        if (!user_id || (!new_listing_id && !clothing_item_id)) {
            return new Response(
                JSON.stringify({
                    error: 'user_id and either new_listing_id or clothing_item_id are required',
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

        let embedding: number[] | null = null;

        if (new_listing_id) {
            const { data: listing, error } = await supabase
                .from('listings')
                .select('embedding')
                .eq('id', new_listing_id)
                .single();
            if (error || !listing)
                throw new Error('Failed to fetch listing embedding');
            embedding = listing.embedding;
        } else if (clothing_item_id) {
            const { data: clothing, error } = await supabase
                .from('clothing_items')
                .select('embedding')
                .eq('id', clothing_item_id)
                .single();
            if (error || !clothing)
                throw new Error('Failed to fetch clothing item embedding');
            embedding = clothing.embedding;
        }

        if (!embedding) {
            throw new Error('Embedding not found');
        }

        // Ensure embedding is an array
        if (!Array.isArray(embedding)) {
            console.log('Converting embedding to array:', typeof embedding);
            try {
                // If it's a JSON string, parse it
                if (typeof embedding === 'string') {
                    embedding = JSON.parse(embedding);
                } else {
                    // If it's an object with numeric keys, convert to array
                    embedding = Object.values(embedding);
                }

                // Verify it's now an array
                if (!Array.isArray(embedding)) {
                    throw new Error(
                        `Embedding is not in expected format: ${typeof embedding}`
                    );
                }
            } catch (err) {
                console.error('Failed to convert embedding to array:', err);
                throw new Error('Embedding format error');
            }
        }

        let { data: pref, error: prefError } = await supabase
            .from('user_style_preferences')
            .select('style_vector')
            .eq('user_id', user_id)
            .single();

        let currentVector: number[];

        if (!prefError && pref?.style_vector) {
            // Make sure currentVector is properly converted to an array
            let vectorData = pref.style_vector;

            if (!Array.isArray(vectorData)) {
                console.log(
                    'Converting style_vector to array:',
                    typeof vectorData
                );
                try {
                    // If it's a JSON string, parse it
                    if (typeof vectorData === 'string') {
                        vectorData = JSON.parse(vectorData);
                    }
                    // If it's an object with numeric keys, convert to array
                    if (
                        typeof vectorData === 'object' &&
                        !Array.isArray(vectorData)
                    ) {
                        vectorData = Object.values(vectorData);
                    }
                } catch (err) {
                    console.error('Failed to parse style_vector:', err);
                    // Fall back to zero vector if parsing fails
                    vectorData = Array(embedding.length).fill(0);
                }
            }

            currentVector = vectorData;

            // Final safety check
            if (!Array.isArray(currentVector)) {
                console.warn(
                    `currentVector is still not an array after conversion: ${typeof currentVector}`
                );
                currentVector = Array(embedding.length).fill(0);
            }
        } else {
            // Initialize with a zero vector matching embedding dimensions
            currentVector = Array(embedding.length).fill(0);

            // Upsert the zero vector as a starting point
            const { error: insertError } = await supabase
                .from('user_style_preferences')
                .upsert({
                    user_id,
                    style_vector: currentVector,
                    updated_at: new Date().toISOString(),
                });

            if (insertError) {
                throw new Error('Failed to create initial zero vector');
            }
        }

        // Log for debugging
        console.log(
            'Current vector type:',
            typeof currentVector,
            'isArray:',
            Array.isArray(currentVector),
            'length:',
            currentVector.length
        );
        console.log(
            'Embedding type:',
            typeof embedding,
            'isArray:',
            Array.isArray(embedding),
            'length:',
            embedding.length
        );

        // Now that we've ensured both are arrays, we can safely use map
        const updatedVector = currentVector.map(
            (val: number, i: number) => alpha * embedding[i] + (1 - alpha) * val
        );

        const { error: updateError } = await supabase
            .from('user_style_preferences')
            .update({
                style_vector: updatedVector,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user_id);

        if (updateError) {
            throw new Error('Failed to update style vector');
        }

        return new Response(
            JSON.stringify({ message: 'User style vector updated' }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in update-user-style-vector:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
