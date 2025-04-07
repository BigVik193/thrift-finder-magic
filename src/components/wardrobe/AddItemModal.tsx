
import { useState } from 'react';
import { X, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadWardrobeImage } from '@/services/wardrobeUploadService';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeId: string;
}

export const AddItemModal = ({ isOpen, onClose }: AddItemModalProps) => {
  const [file, setFile] = useState<File | null>(null);
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
    
    if (!file) {
      toast.error('Please upload an image.');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Upload the image using our service
      await uploadWardrobeImage(file, (status) => {
        setUploadProgress(status.progress);
        
        if (status.status === 'error') {
          throw new Error(status.message);
        }
      });
      
      toast.success('Item added successfully!');
      queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      
      // Reset form
      setFile(null);
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
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload an Image <span className="text-red-500">*</span>
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
                    disabled={loading}
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
                  <p className="text-xs text-muted-foreground mb-4 max-w-xs text-center">
                    Upload a clear image of a single clothing item for best results. Our AI will analyze it and add it to your wardrobe.
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
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress < 100
                  ? "Uploading and analyzing image..."
                  : "Processing complete!"}
              </p>
            </div>
          )}
          
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
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
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
