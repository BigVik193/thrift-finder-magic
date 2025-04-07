import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface ClothingItem {
  id: string;
  type: string;
  image_url: string;
  created_at: string;
  updated_at: string | null;
  embedding: string | null;
  wardrobe_id: string;
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
    const wardrobe = existingWardrobes[0];
    // Ensure style_aggregate is correctly typed
    return {
      id: wardrobe.id,
      user_id: wardrobe.user_id,
      created_at: wardrobe.created_at,
      style_aggregate: wardrobe.style_aggregate as Record<string, number> || {}
    };
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
  
  // Ensure style_aggregate is correctly typed
  return {
    id: newWardrobe.id,
    user_id: newWardrobe.user_id,
    created_at: newWardrobe.created_at,
    style_aggregate: newWardrobe.style_aggregate as Record<string, number> || {}
  };
};

export const getClothingItems = async (wardrobeId: string): Promise<ClothingItem[]> => {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .eq('wardrobe_id', wardrobeId);
    
  if (error) throw error;
  
  // Return the data directly since it matches our ClothingItem interface now
  return data || [];
};

export const deleteClothingItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', itemId);
    
  if (error) throw error;
};
