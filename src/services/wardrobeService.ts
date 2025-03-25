import { supabase } from '@/integrations/supabase/client';

export interface ClothingItem {
  id: string;
  type: string;
  color: string | null;
  material: string | null;
  image_url: string;
  style_matches: Record<string, boolean>;
  created_at: string;
}

export interface Wardrobe {
  id: string;
  user_id: string;
  created_at: string;
  style_aggregate: Record<string, number>;
}

export const getOrCreateWardrobe = async (): Promise<Wardrobe> => {
  // First check if user already has a wardrobe
  const { data: existingWardrobes, error: fetchError } = await supabase
    .from('wardrobes')
    .select('*')
    .limit(1);
    
  if (fetchError) throw fetchError;
  
  // If wardrobe exists, return it
  if (existingWardrobes && existingWardrobes.length > 0) {
    return existingWardrobes[0];
  }
  
  // Otherwise create a new wardrobe
  const { data: auth } = await supabase.auth.getUser();
  
  if (!auth.user) throw new Error('User not authenticated');
  
  const { data: newWardrobe, error: insertError } = await supabase
    .from('wardrobes')
    .insert({
      user_id: auth.user.id,
      style_aggregate: {}
    })
    .select()
    .single();
    
  if (insertError) throw insertError;
  
  return newWardrobe;
};

export const getClothingItems = async (wardrobeId: string): Promise<ClothingItem[]> => {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .eq('wardrobe_id', wardrobeId);
    
  if (error) throw error;
  
  return data || [];
};

export const deleteClothingItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', itemId);
    
  if (error) throw error;
};
