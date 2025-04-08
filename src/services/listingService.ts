
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
    
    return count ? count > 0 : false;
  } catch (error) {
    console.error('Error checking if item is liked:', error);
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
