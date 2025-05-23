import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture: string | null;
  gender: 'male' | 'female' | 'other' | 'unspecified' | null;
}

export interface StylePreference {
  user_id: string;
  sizes: {
    tops: string | null;
    bottoms: string | null;
    shoes: string | null;
    outerwear: string | null;
  };
  price_range: {
    min: number;
    max: number;
  };
}

export type StyleScore = Record<string, number>;

export interface RecentActivity {
  id: string;
  type: 'liked' | 'search';
  text: string;
  time: string;
}

export interface UserSearch {
  id: string;
  query: string;
  created_at: string;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    const transformedData: UserProfile = {
      id: data.id,
      name: data.name,
      email: data.email,
      profile_picture: data.profile_picture,
      gender: data.gender ? data.gender.toLowerCase() as 'male' | 'female' | 'other' : null
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserStylePreferences = async (): Promise<StylePreference | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_style_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    
    let sizesData: Record<string, string | null> = {};
    if (data.sizes && typeof data.sizes === 'object' && !Array.isArray(data.sizes)) {
      sizesData = data.sizes as Record<string, string | null>;
    }
    
    let priceRangeData: Record<string, number> = { min: 0, max: 100 };
    if (data.price_range && typeof data.price_range === 'object' && !Array.isArray(data.price_range)) {
      const priceRange = data.price_range as Record<string, unknown>;
      if (typeof priceRange.min === 'number') priceRangeData.min = priceRange.min;
      if (typeof priceRange.max === 'number') priceRangeData.max = priceRange.max;
    }
    
    const transformedData: StylePreference = {
      user_id: data.user_id,
      sizes: {
        tops: sizesData.tops || null,
        bottoms: sizesData.bottoms || null,
        shoes: sizesData.shoes || null,
        outerwear: sizesData.outerwear || null
      },
      price_range: {
        min: priceRangeData.min,
        max: priceRangeData.max
      }
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching user style preferences:', error);
    return null;
  }
};

export const updateStylePreferences = async (preferences: Partial<StylePreference>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to update preferences');
      return false;
    }
    
    const { error } = await supabase
      .from('user_style_preferences')
      .update(preferences)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    toast.success('Style preferences updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating style preferences:', error);
    toast.error('Failed to update style preferences');
    return false;
  }
};

export const getRecentActivity = async (limit = 5): Promise<RecentActivity[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data: likedData, error: likedError } = await supabase
      .from('liked_items')
      .select('listing_id, saved_at')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false })
      .limit(limit);
    
    if (likedError) throw likedError;
    
    const likedActivity: RecentActivity[] = [];
    
    if (likedData && likedData.length > 0) {
      const listingIds = likedData.map(item => item.listing_id);
      
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('id, title')
        .in('id', listingIds);
      
      if (listingsError) throw listingsError;
      
      for (const likedItem of likedData) {
        const listing = listingsData?.find(l => l.id === likedItem.listing_id);
        if (listing) {
          likedActivity.push({
            id: likedItem.listing_id,
            type: 'liked',
            text: `You liked "${listing.title || 'an item'}"`,
            time: format(new Date(likedItem.saved_at), 'MMM d, h:mm a')
          });
        }
      }
    }
    
    const { data: searches, error: searchError } = await supabase
      .from('user_searches')
      .select('id, query, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (searchError) throw searchError;
    
    const searchActivity = (searches || []).map(search => ({
      id: search.id,
      type: 'search' as const,
      text: `You searched for "${search.query}"`,
      time: format(new Date(search.created_at), 'MMM d, h:mm a')
    }));
    
    const allActivity = [...likedActivity, ...searchActivity]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
    
    return allActivity;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out');
  }
};

export const getUserRecentSearches = async (limit = 5): Promise<UserSearch[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('user_searches')
      .select('id, query, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user searches:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserRecentSearches:', error);
    return [];
  }
};
