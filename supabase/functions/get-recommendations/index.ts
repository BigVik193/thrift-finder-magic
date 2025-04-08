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

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { user_id, limit = 20 } = await req.json();

        if (!user_id) {
            return new Response(
                JSON.stringify({ error: 'user_id is required' }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // 1. Get user style vector
        const { data: userPref, error: userError } = await supabase
            .from('user_style_preferences')
            .select('style_vector')
            .eq('user_id', user_id)
            .maybeSingle();

        let userVector: number[];

        if (userPref?.style_vector) {
            try {
                const styleVector = userPref.style_vector;

                if (Array.isArray(styleVector)) {
                    userVector = styleVector.map(Number);
                } else if (typeof styleVector === 'string') {
                    userVector = JSON.parse(styleVector).map(Number);
                } else if (typeof styleVector === 'object') {
                    userVector = Object.values(styleVector).map(Number);
                } else {
                    userVector = Array(1536).fill(0);
                }
            } catch (e) {
                console.error('Error parsing vector:', e);
                userVector = Array(1536).fill(0);
            }
        } else {
            userVector = Array(1536).fill(0);

            const { error: insertError } = await supabase
                .from('user_style_preferences')
                .upsert({
                    user_id,
                    style_vector: userVector,
                    updated_at: new Date().toISOString(),
                });

            if (insertError) {
                throw new Error('Failed to create zero vector');
            }

            return new Response(JSON.stringify({ results: [] }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Check if userVector is a zero vector
        const isZeroVector =
            userVector.length > 0 &&
            userVector.every((val) => val === 0 || val === '0');

        if (isZeroVector) {
            return new Response(JSON.stringify({ results: [] }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Get saved listing IDs to exclude
        const { data: savedItems } = await supabase
            .from('saved_items')
            .select('listing_id')
            .eq('user_id', user_id);

        const savedIds = (savedItems || []).map((item) => item.listing_id);

        // 4. Run similarity query via RPC
        const { data: recommendations, error: simError } = await supabase.rpc(
            'get_similar_listings',
            {
                user_vector: userVector,
                exclude_ids: savedIds,
                result_limit: limit,
            }
        );

        if (simError) {
            throw new Error(`Similarity search failed: ${simError.message}`);
        }

        return new Response(JSON.stringify({ results: recommendations }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('get-recommendations error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Unexpected error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
