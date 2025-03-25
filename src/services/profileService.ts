
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StyleScore {
  [style: string]: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other' | null;
  profile_picture: string | null;
}

export interface StylePreference {
  user_id: string;
  style_scores: StyleScore;
  sizes?: {
    tops: string | null;
    bottoms: string | null;
    shoes: string | null;
    outerwear: string | null;
  };
  price_range?: {
    min: number;
    max: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'saved' | 'search';
  text: string;
  time: string;
  image?: string;
  listing_id?: string;
}

// Fetch user profile data
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as UserProfile;
};

// Fetch user style preferences
export const getUserStylePreferences = async (): Promise<StylePreference | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_style_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching style preferences:', error);
    return null;
  }
  
  return data as StylePreference;
};

// Update user style preferences
export const updateStylePreferences = async (
  preferences: Partial<StylePreference>
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('user_style_preferences')
    .update(preferences)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error updating style preferences:', error);
    toast.error('Failed to update preferences');
    return false;
  }
  
  toast.success('Preferences updated successfully');
  return true;
};

// Get user's recent activity (saved items)
export const getRecentActivity = async (limit = 4): Promise<RecentActivity[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  // Get saved items
  const { data: savedItems, error: savedError } = await supabase
    .from('saved_items')
    .select('*, listings(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })
    .limit(limit);
    
  if (savedError) {
    console.error('Error fetching saved items:', savedError);
    return [];
  }
  
  const activities: RecentActivity[] = savedItems.map(item => ({
    id: item.listing_id,
    type: 'saved',
    text: `Saved "${item.listings.title}"`,
    time: formatTimeAgo(new Date(item.saved_at)),
    image: item.listings.image,
    listing_id: item.listing_id
  }));
  
  return activities;
};

// Format time to relative format (e.g., "2 hours ago")
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out');
    return;
  }
  
  toast.success('Signed out successfully');
};
