
import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFilesAdded?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFilesAdded,
  maxFiles = 5,
  accept = 'image/*',
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      if (files.length + newFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} images.`);
        return;
      }
      
      addFiles(newFiles);
    }
  }, [files, maxFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      if (files.length + newFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} images.`);
        return;
      }
      
      addFiles(newFiles);
    }
  }, [files, maxFiles]);

  const addFiles = (newFiles: File[]) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    // Create previews for new files
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviews(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (onFilesAdded) {
      onFilesAdded(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    if (onFilesAdded) {
      onFilesAdded(updatedFiles);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden",
          "flex flex-col items-center justify-center text-center p-8",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/50",
          files.length > 0 ? "h-auto" : "h-64",
        )}
      >
        {files.length === 0 ? (
          <>
            <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Upload outfit photos</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Drag and drop your outfit photos here, or click to browse. Help us learn your style preferences.
            </p>
            <input
              type="file"
              id="file-upload"
              multiple
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              Select Files
            </label>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
              </h3>
              <input
                type="file"
                id="add-more-files"
                multiple
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              {files.length < maxFiles && (
                <label
                  htmlFor="add-more-files"
                  className="text-sm text-primary cursor-pointer hover:underline"
                >
                  Add more
                </label>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {files.length > 0 && (
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
};
