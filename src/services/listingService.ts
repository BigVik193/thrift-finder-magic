
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
      const { error } = await supabase
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
          url: item.url
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving listing:', error);
    return false;
  }
};

// Save an item for a user
export const saveItemForUser = async (listingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast('Please login to save items', {
        description: 'Create an account to save items to your collection',
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/auth'
        }
      });
      return false;
    }
    
    // Check if item is already saved by user
    const { data: existingSave } = await supabase
      .from('saved_items')
      .select('user_id, listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    
    if (existingSave) {
      // Item already saved, so unsave it
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      
      if (error) throw error;
      
      toast.success('Item removed from your saved items');
      return false; // Return false to indicate item is now unsaved
    } else {
      // Save the item
      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: user.id,
          listing_id: listingId
        });
      
      if (error) throw error;
      
      toast.success('Item saved to your collection');
      return true; // Return true to indicate item is now saved
    }
  } catch (error) {
    console.error('Error saving item for user:', error);
    toast.error('Failed to save item');
    return false;
  }
};

// Like an item
export const likeItem = async (listingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast('Please login to like items', {
        description: 'Create an account to like items',
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/auth'
        }
      });
      return false;
    }
    
    // Check if item is already liked by user
    const { data: existingLike } = await supabase
      .from('liked_items')
      .select('user_id, listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    
    if (existingLike) {
      // Item already liked, so unlike it
      const { error } = await supabase
        .from('liked_items')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      
      if (error) throw error;
      
      toast.success('Item unliked');
      return false; // Return false to indicate item is now unliked
    } else {
      // Like the item
      const { error } = await supabase
        .from('liked_items')
        .insert({
          user_id: user.id,
          listing_id: listingId
        });
      
      if (error) throw error;
      
      toast.success('Item liked');
      return true; // Return true to indicate item is now liked
    }
  } catch (error) {
    console.error('Error liking item:', error);
    toast.error('Failed to like item');
    return false;
  }
};

// Check if item is saved by user
export const isItemSaved = async (listingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data } = await supabase
      .from('saved_items')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();
    
    return !!data;
  } catch (error) {
    console.error('Error checking if item is saved:', error);
    return false;
  }
};

// Check if item is liked by user
export const isItemLiked = async (listingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
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

// Get popular items based on saves/likes
export const getPopularItems = async (limit = 5): Promise<Listing[]> => {
  try {
    // Get top saved items
    const { data: savedItems, error: savedError } = await supabase
      .from('saved_items')
      .select('listing_id, count')
      .order('count', { ascending: false })
      .limit(limit);
    
    if (savedError) throw savedError;
    
    // If there are not enough saved items, use random listings
    if (!savedItems || savedItems.length < limit) {
      const { data: randomItems, error: randomError } = await supabase
        .from('listings')
        .select('*')
        .limit(limit);
      
      if (randomError) throw randomError;
      
      return (randomItems || []) as Listing[];
    }
    
    // Get details for the popular listings
    const listingIds = savedItems.map(item => item.listing_id);
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

// Get recommended items (currently random)
export const getRecommendedItems = async (limit = 5): Promise<Listing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    
    return (data || []) as Listing[];
  } catch (error) {
    console.error('Error getting recommended items:', error);
    return [];
  }
};

// Search for listings
export const searchListings = async (query: string, limit = 10): Promise<Listing[]> => {
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
