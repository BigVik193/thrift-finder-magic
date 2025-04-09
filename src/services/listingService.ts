
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Listing {
    id: string;
    title: string;
    price: number;
    currency: string;
    image: string;
    platform: 'eBay' | 'Etsy' | 'Depop' | 'Grailed' | 'ThredUp';
    seller_username: string;
    seller_feedback_percentage: string;
    seller_feedback_score: number | null;
    condition: string;
    url: string;
}

// Like an item for a user
export const likeItemForUser = async (listingId: string): Promise<boolean> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast('Please login to like items', {
                description:
                    'Create an account to like items to your collection',
                action: {
                    label: 'Login',
                    onClick: () => (window.location.href = '/auth'),
                },
            });
            return false;
        }

        // For debugging
        console.log(`Attempting to like item ${listingId} for user ${user.id}`);

        // Get full item details if we have them
        const { data: listing } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .maybeSingle();
        
        if (listing) {
            console.log('Found listing details:', listing.id, listing.title);
        } else {
            console.log('No listing details found in database, using minimal data');
        }

        // Check the current like status to toggle correctly
        const { data: existingLike } = await supabase
            .from('liked_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .maybeSingle();

        let isLiked = false;
        let message = '';

        // Directly modify the database instead of using the edge function
        // which seems to be failing or not being called
        if (existingLike) {
            // If already liked, unlike it
            const { error: unlikeError } = await supabase
                .from('liked_items')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', listingId);

            if (unlikeError) {
                console.error('Error unliking item:', unlikeError);
                throw unlikeError;
            }
            
            isLiked = false;
            message = 'Item unliked successfully';
            console.log('Item unliked successfully');
        } else {
            // If not liked, like it
            // First, ensure the listing exists in the database if we have full details
            if (listing) {
                // No need to insert, it already exists
                console.log('Listing already exists in database');
            } else if (listing === null) {
                // This means the item doesn't exist and we only have the ID
                // We'll create a minimal listing entry
                console.log('Creating minimal listing entry');
                const minimalListing = {
                    id: listingId,
                    title: 'Unknown Item',
                    price: 0,
                    currency: 'USD',
                    image: '',
                    platform: 'eBay' as const,
                    seller_username: 'Unknown',
                    seller_feedback_percentage: '0',
                    condition: 'Unknown',
                    url: ''
                };
                
                const { error: insertError } = await supabase
                    .from('listings')
                    .insert(minimalListing);
                
                if (insertError) {
                    console.error('Error inserting minimal listing:', insertError);
                    // Continue anyway - we'll just reference the ID
                }
            }

            // Now add the like entry
            const { error: likeError } = await supabase
                .from('liked_items')
                .insert({
                    user_id: user.id,
                    listing_id: listingId,
                });

            if (likeError) {
                console.error('Error liking item:', likeError);
                throw likeError;
            }
            
            isLiked = true;
            message = 'Item liked successfully';
            console.log('Item liked successfully');
            
            // Separately trigger the style vector update
            try {
                console.log('Triggering style vector update');
                await supabase.functions.invoke('update-user-style-vector', {
                    body: {
                        user_id: user.id,
                        new_listing_id: listingId,
                    },
                });
            } catch (vectorError) {
                // Don't fail the like operation if this fails
                console.error('Error updating style vector, but like was saved:', vectorError);
            }
        }
        
        if (message.includes("liked")) {
            toast.success('Item liked successfully');
        } else {
            toast.success('Item unliked successfully');
        }

        return isLiked;
    } catch (error) {
        console.error('Error liking item for user:', error);
        toast.error('Failed to like item');
        return false;
    }
};

// Legacy alias for backward compatibility
export const saveItemForUser = likeItemForUser;

// Check if item is liked by user
export const isItemLiked = async (listingId: string): Promise<boolean> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return false;

        const { data } = await supabase
            .from('liked_items')
            .select('listing_id')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .maybeSingle();

        return !!data;
    } catch (error) {
        console.error('Error checking if item is liked:', error);
        return false;
    }
};

// Legacy alias for backward compatibility
export const isItemSaved = isItemLiked;

// Get popular items based on likes
export const getPopularItems = async (limit = 10): Promise<Listing[]> => {
    try {
        // Get top liked items by counting them
        const { data: likedItems, error: countError } = await supabase
            .from('liked_items')
            .select('listing_id, count')
            .select('listing_id')
            .limit(limit);

        if (countError) throw countError;

        // If there are not enough liked items, use random listings
        if (!likedItems || likedItems.length < limit) {
            const { data: randomItems, error: randomError } = await supabase
                .from('listings')
                .select('*')
                .limit(limit);

            if (randomError) throw randomError;

            return (randomItems || []) as Listing[];
        }

        // Get details for the popular listings
        const listingIds = likedItems.map((item) => item.listing_id);
        const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .in('id', listingIds);

        if (listingsError) throw listingsError;

        return (listings || []) as Listing[];
    } catch (error) {
        console.error('Error getting popular items:', error);
        return [];
    }
};

// Get recommended items using the recommendation edge function
export const getRecommendedItems = async (limit = 10): Promise<Listing[]> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user found, returning random items');
            // Return random items if user is not logged in
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .limit(limit);

            if (error) throw error;

            return (data || []) as Listing[];
        }

        // Call the recommendation edge function
        const { data, error } = await supabase.functions.invoke(
            'get-recommendations',
            {
                body: { user_id: user.id, limit },
            }
        );

        if (error) {
            console.error('Error calling recommendations function:', error);
            throw error;
        }

        // If no recommendations or empty results, return random items
        if (!data || !data.results || data.results.length === 0) {
            console.log(
                'No recommendations returned, falling back to random items'
            );
            const { data: randomItems, error: randomError } = await supabase
                .from('listings')
                .select('*')
                .limit(limit);

            if (randomError) throw randomError;

            return (randomItems || []) as Listing[];
        }

        return data.results as Listing[];
    } catch (error) {
        console.error('Error getting recommended items:', error);
        // Fall back to random items if there's an error
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .limit(limit);

            if (error) throw error;

            return (data || []) as Listing[];
        } catch (fallbackError) {
            console.error(
                'Error getting fallback random items:',
                fallbackError
            );
            return [];
        }
    }
};

// Get user's liked items
export const getUserLikedItems = async (limit?: number): Promise<Listing[]> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return [];

        // Query to get the user's liked item IDs
        const query = supabase
            .from('liked_items')
            .select('listing_id')
            .eq('user_id', user.id)
            .order('saved_at', { ascending: false });

        // Apply limit if provided
        if (limit) {
            query.limit(limit);
        }

        const { data: likedItemIds, error: likedError } = await query;

        if (likedError) throw likedError;

        if (!likedItemIds || likedItemIds.length === 0) {
            return [];
        }

        // Get the listing details for the liked items
        const listingIds = likedItemIds.map((item) => item.listing_id);
        const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .in('id', listingIds);

        if (listingsError) throw listingsError;

        // Sort listings to maintain order from liked_items
        const sortedListings = listingIds
            .map((id) => listings?.find((listing) => listing.id === id))
            .filter((listing) => !!listing) as Listing[];

        return sortedListings;
    } catch (error) {
        console.error('Error getting user liked items:', error);
        return [];
    }
};

// Legacy alias for backward compatibility
export const getUserSavedItems = getUserLikedItems;

// Search for listings without automatically saving them
export const searchListings = async (
    query: string,
    limit = 10
): Promise<Listing[]> => {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .ilike('title', `%${query}%`)
            .limit(limit);

        if (error) throw error;

        return (data || []) as Listing[];
    } catch (error) {
        console.error('Error searching listings:', error);
        return [];
    }
};
