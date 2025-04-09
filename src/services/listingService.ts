
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

// Toggle like status (like or unlike) for an item
export const toggleItemLike = async (listingId: string, fullListingData?: Partial<Listing>): Promise<boolean> => {
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

        // Check current like status first
        const currentlyLiked = await isItemLiked(listingId);

        // Get full item details if we have them or if it exists in our database
        const { data: existingListing } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .maybeSingle();

        // If the listing doesn't exist in our database yet, use the provided data
        const itemData = existingListing || fullListingData || { id: listingId };
        
        // Check if we have all the required data for a new listing
        if (!currentlyLiked && !existingListing && 
            (!fullListingData?.platform || !fullListingData?.title || !fullListingData?.price)) {
            console.error('Missing required listing data for id:', listingId, 'Data:', fullListingData);
            toast.error('Unable to like item: Missing required data');
            return false;
        }

        // Call the like-listing edge function to handle the toggle
        const { data, error } = await supabase.functions.invoke('like-listing', {
            body: { 
                item: itemData,
                userId: user.id,
                currentlyLiked // Pass the current like status to the function
            },
        });

        if (error) {
            console.error('Error from like-listing function:', error);
            throw error;
        }

        // The edge function returns whether the item is now liked
        const isNowLiked = data.success;
        
        // Show appropriate toast message based on the returned status, not the previous status
        if (isNowLiked) {
            toast.success('Item liked successfully');
        } else {
            toast.success('Item unliked successfully');
        }

        return isNowLiked;
    } catch (error) {
        console.error('Error toggling item like status:', error);
        toast.error('Failed to update like status');
        return false;
    }
};

// Legacy alias for backward compatibility
export const likeItemForUser = toggleItemLike;
export const saveItemForUser = toggleItemLike;

// Check if item is liked by user
export const isItemLiked = async (listingId: string): Promise<boolean> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return false;

        const { data, error } = await supabase
            .from('liked_items')
            .select('listing_id')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .maybeSingle();

        if (error) {
            console.error('Error checking if item is liked:', error);
            return false;
        }

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
