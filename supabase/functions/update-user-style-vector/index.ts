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
        const alpha = 0.3; // Tweak this to control sensitivity

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase environment config');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { user_id, new_listing_id } = await req.json();

        if (!user_id || !new_listing_id) {
            return new Response(
                JSON.stringify({
                    error: 'user_id and new_listing_id are required',
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

        // Fetch new listing embedding
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('embedding')
            .eq('id', new_listing_id)
            .single();

        if (listingError || !listing) {
            throw new Error('Could not fetch new listing embedding');
        }

        const newEmbedding = listing.embedding;

        // Fetch current user style vector
        const { data: pref, error: userError } = await supabase
            .from('user_style_preferences')
            .select('style_vector')
            .eq('user_id', user_id)
            .single();

        let updatedVector: number[];

        if (!userError && pref && pref.style_vector) {
            const currentVector = pref.style_vector;
            updatedVector = currentVector.map(
                (val: number, i: number) =>
                    alpha * newEmbedding[i] + (1 - alpha) * val
            );
        } else {
            // If no current vector exists, use the new one
            updatedVector = newEmbedding;
        }

        // Update in DB
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
            JSON.stringify({ message: 'User style vector updated (EMA)' }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in update-user-style-vector:', error);
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
