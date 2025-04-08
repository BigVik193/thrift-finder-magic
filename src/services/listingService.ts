
import { supabase } from '@/integrations/supabase/client';

// Define the Listing type
export interface Listing {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string;
  platform: string;
  seller_username: string;
  seller_feedback_percentage: string;
  seller_feedback_score: number;
  condition: string;
  url: string;
}

// Check if item is liked by user
export const isItemLiked = async (listingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Using saved_items table for backward compatibility until the database is updated
    const { count, error } = await supabase
      .from('saved_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('listing_id', listingId);
    
    if (error) throw error;
    
    return count ? count > 0 : false;
  } catch (error) {
    console.error('Error checking if item is liked:', error);
    return false;
  }
};

// Like/unlike an item for a user
export const likeItemForUser = async (itemId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }
    
    // Call the like-listing edge function
    const { data, error } = await supabase.functions.invoke('like-listing', {
      body: { item: { id: itemId }, userId: user.id }
    });
    
    if (error) throw error;
    
    // Return true if the item was liked, false if unliked
    return await isItemLiked(itemId);
  } catch (error) {
    console.error('Error liking item:', error);
    return false;
  }
};

// Get popular items based on likes
export const getPopularItems = async (limit = 10): Promise<Listing[]> => {
  try {
    // Using saved_items table for backward compatibility until the database is updated
    const { data: likedItems, error: countError } = await supabase
      .from('saved_items')
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
    const listingIds = likedItems.map(item => item.listing_id);
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

// Get user's liked items
export const getUserLikedItems = async (limit?: number): Promise<Listing[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // Using saved_items table for backward compatibility until the database is updated
    // Query to get the user's liked item IDs
    const query = supabase
      .from('saved_items')
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
    const listingIds = likedItemIds.map(item => item.listing_id);
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds);
    
    if (listingsError) throw listingsError;
    
    // Sort listings to maintain order from liked_items
    const sortedListings = listingIds
      .map(id => listings?.find(listing => listing.id === id))
      .filter(listing => !!listing) as Listing[];
    
    return sortedListings;
  } catch (error) {
    console.error('Error getting user liked items:', error);
    return [];
  }
};

// Search listings based on query
export const searchListings = async (query: string, limit = 20): Promise<Listing[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('thrift-search', {
      body: { query, limit }
    });
    
    if (error) throw error;
    
    return data?.items || [];
  } catch (error) {
    console.error('Error searching listings:', error);
    return [];
  }
};

// Get recommended items for the user
export const getRecommendedItems = async (limit = 10): Promise<Listing[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If no user, return popular items instead
      return getPopularItems(limit);
    }
    
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      body: { user_id: user.id, limit }
    });
    
    if (error) throw error;
    
    return data?.recommendations || [];
  } catch (error) {
    console.error('Error getting recommended items:', error);
    return getPopularItems(limit); // Fallback to popular items
  }
};
