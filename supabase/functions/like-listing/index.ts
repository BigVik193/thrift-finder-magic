
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
            throw new Error('Supabase configuration is missing');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { item, userId, currentlyLiked } = await req.json();

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

        // Verify the current like status
        let isCurrentlyLiked = currentlyLiked;
        
        if (isCurrentlyLiked === undefined) {
            // If not provided, query the database to check
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
            
            isCurrentlyLiked = !!existingLike;
        }

        let success = false;
        let message = '';

        if (isCurrentlyLiked) {
            // Unlike: Remove the record
            const { error: unlikeError } = await supabase
                .from('liked_items')
                .delete()
                .eq('user_id', userId)
                .eq('listing_id', item.id);

            if (unlikeError) {
                console.error('Error unliking item:', unlikeError);
                throw new Error(`Error unliking item: ${unlikeError.message}`);
            }
            
            success = false; // Not liked anymore
            message = 'Item unliked successfully';
        } else {
            // Like: Add the record after ensuring the listing exists
            let listingExists = false;
            
            // Check if the listing already exists
            const { data: existingListing, error: listingError } = await supabase
                .from('listings')
                .select('id')
                .eq('id', item.id)
                .maybeSingle();

            if (listingError) {
                console.error('Error checking for existing listing:', listingError);
            } else {
                listingExists = !!existingListing;
            }

            // If listing doesn't exist, insert it
            if (!listingExists) {
                // Validate required fields for new listings
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
            }

            // Like the item (add record to liked_items)
            try {
                const { error: likeError } = await supabase
                    .from('liked_items')
                    .insert({
                        user_id: userId,
                        listing_id: item.id,
                    });

                if (likeError) {
                    // Check if this is a duplicate key error
                    if (likeError.message.includes('duplicate key')) {
                        console.log('Item already liked, handling gracefully');
                        // Item is already liked, so we'll treat this as a success
                    } else {
                        throw new Error(`Error liking item for user: ${likeError.message}`);
                    }
                }
            } catch (likeErr) {
                console.error('Error inserting like:', likeErr);
                throw likeErr;
            }
            
            success = true; // Now liked
            message = 'Item liked successfully';
        }

        // Prepare response immediately after core operation is complete
        const response = new Response(
            JSON.stringify({
                success, // This now represents the new like state (true=liked, false=unliked)
                message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

        // Run remaining tasks in the background using Edge Runtime
        if (success && self.EdgeRuntime) {
            // Only do background tasks for new likes, not unlikes
            self.EdgeRuntime.waitUntil((async () => {
                try {
                    console.log('Starting background tasks for item:', item.id);
                    
                    // Generate embedding for the new listing in the background
                    try {
                        // Check if listing exists and if it has an embedding
                        const { data: listingData } = await supabase
                            .from('listings')
                            .select('embedding')
                            .eq('id', item.id)
                            .maybeSingle();
                            
                        // Only generate embedding if we don't have one yet
                        if (!listingData?.embedding) {
                            console.log('Generating embedding for listing:', item.id);
                            await supabase.functions.invoke(
                                'generate-listing-embedding',
                                {
                                    body: { listing_id: item.id },
                                }
                            );
                        }
                    } catch (embeddingErr) {
                        console.error('Failed to generate embedding (background task):', embeddingErr);
                        // Continue despite embedding error
                    }

                    // Update user style vector using EMA with the new embedding
                    try {
                        console.log('Updating user style vector for user:', userId);
                        await supabase.functions.invoke(
                            'update-user-style-vector',
                            {
                                body: {
                                    user_id: userId,
                                    new_listing_id: item.id,
                                },
                            }
                        );
                    } catch (vectorErr) {
                        console.error('Failed to update style vector (background task):', vectorErr);
                        // Continue despite vector update error
                    }
                    
                    console.log('Background tasks completed for item:', item.id);
                } catch (error) {
                    console.error('Error in background tasks:', error);
                }
            })());
        }

        return response;
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
