
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UploadStatus {
    status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
    progress: number;
    message?: string;
}

/**
 * Resizes an image to specified dimensions while maintaining aspect ratio
 * @param file The image file to resize
 * @param maxWidth Maximum width of the resized image
 * @param maxHeight Maximum height of the resized image
 * @param quality JPEG quality (0-1)
 * @returns Base64 string of the resized image
 */
const resizeImage = async (
    file: File,
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.8
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }

            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64
            const base64 = canvas.toDataURL('image/jpeg', quality);
            resolve(base64);
        };

        img.onerror = (error) => {
            reject(error);
        };

        // Load image from file
        img.src = URL.createObjectURL(file);
    });
};

// Upload a clothing item image to the wardrobe
export const uploadWardrobeImage = async (
    file: File,
    onStatusChange: (status: UploadStatus) => void
): Promise<any> => {
    try {
        onStatusChange({
            status: 'uploading',
            progress: 10,
            message: 'Preparing image...',
        });

        // Resize image before uploading - reduced to 600x600 for better performance
        const imageBase64 = await resizeImage(file, 600, 600, 0.8);

        onStatusChange({
            status: 'uploading',
            progress: 30,
            message: 'Image prepared, uploading...',
        });

        // Get user ID
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        onStatusChange({
            status: 'processing',
            progress: 50,
            message: 'Uploading image...',
        });

        // Call the Supabase Edge Function
        const { data, error } = await supabase.functions.invoke(
            'upload-wardrobe-image',
            {
                body: {
                    imageBase64,
                    user_id: user.id,
                },
            }
        );

        if (error) {
            console.error('Upload function error:', error);
            onStatusChange({
                status: 'error',
                progress: 0,
                message: 'Upload failed',
            });
            throw error;
        }

        // Response now comes back quickly before background processing completes
        onStatusChange({
            status: 'success',
            progress: 100,
            message: data.message || 'Upload complete! Processing in background...',
        });

        toast.success('Image uploaded successfully', {
            description: 'The image is being processed in the background and will appear in your wardrobe shortly.'
        });

        return data;
    } catch (error: any) {
        console.error('Error uploading wardrobe image:', error);
        onStatusChange({
            status: 'error',
            progress: 0,
            message: error.message || 'Failed to upload',
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
        const {
            data: { user },
        } = await supabase.auth.getUser();
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
