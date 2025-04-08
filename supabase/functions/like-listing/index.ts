
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
        const { data: existingLike } = await supabase
            .from('liked_items')
            .select('user_id, listing_id')
            .eq('user_id', userId)
            .eq('listing_id', item.id)
            .maybeSingle();

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
            // If not already in the database, save the listing
            const { data: existingListing } = await supabase
                .from('listings')
                .select('id')
                .eq('id', item.id)
                .maybeSingle();

            if (!existingListing) {
                const { error: insertError } = await supabase
                    .from('listings')
                    .insert({
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        currency: item.currency,
                        image: item.image,
                        platform: item.platform,
                        seller_username: item.seller_username,
                        seller_feedback_percentage: item.seller_feedback_percentage,
                        seller_feedback_score: item.seller_feedback_score,
                        condition: item.condition,
                        url: item.url,
                    });

                if (insertError) {
                    throw new Error(
                        `Error inserting listing: ${insertError.message}`
                    );
                }

                const { error: embeddingError } = await supabase.functions.invoke(
                    'generate-listing-embedding',
                    {
                        body: { listing_id: item.id },
                    }
                );

                if (embeddingError) {
                    console.error(
                        'Error invoking generate-listing-embedding:',
                        embeddingError
                    );
                }
            }

            // Now like the item (add record to liked_items)
            const { error: likeError } = await supabase
                .from('liked_items')
                .insert({
                    user_id: userId,
                    listing_id: item.id,
                });

            if (likeError) {
                throw new Error(
                    `Error liking item for user: ${likeError.message}`
                );
            }

            // Update user style vector using EMA with the new embedding
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
                console.error(
                    'Error updating user style vector:',
                    vectorUpdateError
                );
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
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
