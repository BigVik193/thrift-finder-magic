
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

// Save a listing to the database
export const saveListing = async (item: Listing): Promise<boolean> => {
    try {
        // Check if listing already exists
        const { data: existingListing } = await supabase
            .from('listings')
            .select('id')
            .eq('id', item.id)
            .maybeSingle();

        // If listing doesn't exist, save it
        if (!existingListing) {
            const { error } = await supabase.from('listings').insert({
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

            if (error) throw error;
        }

        return true;
    } catch (error) {
        console.error('Error saving listing:', error);
        return false;
    }
};

// Like an item for a user (renamed from saveItemForUser)
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

        // Use the like-listing edge function instead of direct database operations
        const { data, error } = await supabase.functions.invoke('like-listing', {
            body: { 
                item: { id: listingId },
                userId: user.id
            },
        });

        if (error) throw error;

        // The edge function returns whether the item is now liked
        const isLiked = data.success;
        
        if (data.message.includes("liked")) {
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

// Save an item for a user (legacy alias for backward compatibility)
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
        // Get top liked items by counting them (without using groupBy which is not available)
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

// Get user's liked items (renamed from getUserSavedItems)
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

// Search for listings
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
