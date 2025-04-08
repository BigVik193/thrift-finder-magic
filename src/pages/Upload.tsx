
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Upload as UploadIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadWardrobeImage } from '@/services/wardrobeUploadService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const navigate = useNavigate();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await uploadWardrobeImage(file, (status) => {
        setUploadProgress(status.progress);
        
        if (status.status === 'error') {
          throw new Error(status.message);
        }
      });
      
      setUploadComplete(true);
      toast.success('Item added to your wardrobe!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload item');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUploadAnother = () => {
    resetForm();
  };
  
  const handleViewWardrobe = () => {
    navigate('/wardrobe');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom max-w-xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Add Item to Wardrobe
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a photo of a single clothing item to add to your wardrobe.
            </p>
          </div>
          
          {!uploadComplete ? (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl transition-all duration-200",
                  "flex flex-col items-center justify-center text-center p-8",
                  file ? "border-primary bg-primary/5" : "border-border bg-muted/50"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="w-full">
                    <div className="aspect-square max-w-xs mx-auto relative mb-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={resetForm}
                        className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-red-500/80 rounded-full transition-colors"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ready to add this item to your wardrobe
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
                      <UploadIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Upload a clothing item</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md">
                      Drag and drop an image here, or click to browse. Upload a clear image of a single clothing item.
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Select Image
                    </label>
                  </>
                )}
              </div>
              
              {isUploading && (
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
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="gap-2"
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Add to Wardrobe</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center py-8 animate-fade-in">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Item Added Successfully!</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Your clothing item has been added to your wardrobe.
              </p>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleUploadAnother}>
                  Upload Another Item
                </Button>
                <Button onClick={handleViewWardrobe}>
                  View Your Wardrobe
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
