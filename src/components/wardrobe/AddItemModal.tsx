
import { useState } from 'react';
import { X, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeId: string;
}

export const AddItemModal = ({ isOpen, onClose, wardrobeId }: AddItemModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tops');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !category) {
      toast.error('Please fill in all required fields and upload an image.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload the image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${wardrobeId}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('clothing_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('clothing_images')
        .getPublicUrl(filePath);
      
      // Create clothing item record
      const { error: insertError } = await supabase
        .from('clothing_items')
        .insert({
          wardrobe_id: wardrobeId,
          type: category,
          color: color || null,
          material: material || null,
          image_url: publicUrl,
          style_matches: tags.split(',').reduce((acc, tag) => {
            const trimmedTag = tag.trim();
            if (trimmedTag) acc[trimmedTag] = true;
            return acc;
          }, {} as Record<string, boolean>)
        });
        
      if (insertError) throw insertError;
      
      toast.success('Item added successfully!');
      queryClient.invalidateQueries({ queryKey: ['wardrobeItems', wardrobeId] });
      
      // Reset form
      setTitle('');
      setCategory('Tops');
      setColor('');
      setMaterial('');
      setFile(null);
      setTags('');
      
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error adding item');
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl p-6 max-w-md w-full animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Item</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Blue Denim Jacket"
              className="w-full px-3 py-2 border border-border rounded-md"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
              required
            >
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="E.g., Blue"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="E.g., Denim"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="E.g., casual, summer, favorite"
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-md p-4">
              {file ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your image here, or click to browse
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    Select File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
