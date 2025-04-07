
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
}

// Upload a clothing item image to the wardrobe
export const uploadWardrobeImage = async (
  file: File,
  onStatusChange: (status: UploadStatus) => void
): Promise<any> => {
  try {
    onStatusChange({ status: 'uploading', progress: 10, message: 'Starting upload...' });
    
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
    });
    
    reader.readAsDataURL(file);
    const imageBase64 = await base64Promise;
    
    onStatusChange({ status: 'uploading', progress: 40, message: 'Uploading to server...' });

    // Get user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('upload-wardrobe-image', {
      body: {
        imageBase64,
        user_id: user.id
      }
    });
    
    if (error) {
      console.error('Upload function error:', error);
      onStatusChange({ status: 'error', progress: 0, message: 'Upload failed' });
      throw error;
    }
    
    onStatusChange({ status: 'success', progress: 100, message: 'Upload complete!' });
    
    return data;
  } catch (error: any) {
    console.error('Error uploading wardrobe image:', error);
    onStatusChange({ 
      status: 'error', 
      progress: 0, 
      message: error.message || 'Failed to upload' 
    });
    throw error;
  }
};

// Delete a clothing item from the wardrobe
export const deleteWardrobeItem = async (itemId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', itemId);
      
    if (error) throw error;
    
    toast.success('Item deleted successfully');
  } catch (error: any) {
    console.error('Error deleting wardrobe item:', error);
    toast.error(error.message || 'Failed to delete item');
    throw error;
  }
};

// Get all wardrobe items for the current user
export const getWardrobeItems = async () => {
  try {
    // First get the user's wardrobe
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data: wardrobe, error: wardrobeError } = await supabase
      .from('wardrobes')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (wardrobeError) throw wardrobeError;
    
    // Then get all clothing items in the wardrobe
    const { data: items, error: itemsError } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('wardrobe_id', wardrobe.id);
      
    if (itemsError) throw itemsError;
    
    return items || [];
  } catch (error: any) {
    console.error('Error fetching wardrobe items:', error);
    toast.error(error.message || 'Failed to fetch wardrobe items');
    throw error;
  }
};
