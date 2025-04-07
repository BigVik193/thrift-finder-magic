
import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { UploadZone } from '@/components/ui/UploadZone';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Info, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadWardrobeImage, UploadStatus } from '@/services/wardrobeUploadService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle', progress: 0 });
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
  };
  
  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    // Move to processing step
    setStep(2);
    setUploadStatus({ status: 'uploading', progress: 0 });
    setUploadResults([]);
    
    try {
      // Upload each file sequentially
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus({
          status: 'uploading',
          progress: (i / files.length) * 50,
          message: `Uploading item ${i + 1} of ${files.length}...`
        });
        
        const result = await uploadWardrobeImage(file, (status) => {
          // Normalize progress to the current file's portion of the total
          const baseProgress = (i / files.length) * 100;
          const fileProgress = status.progress / files.length;
          setUploadStatus({
            ...status,
            progress: baseProgress + fileProgress
          });
        });
        
        results.push(result);
      }
      
      setUploadResults(results);
      
      // Set complete status
      setUploadStatus({
        status: 'success',
        progress: 100,
        message: 'All items uploaded successfully!'
      });
      
      // Move to completion step after processing
      setTimeout(() => {
        setStep(3);
      }, 1000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: error.message || 'An error occurred during upload'
      });
      toast.error('Failed to upload items. Please try again.');
    }
  };
  
  const resetUpload = () => {
    setFiles([]);
    setStep(1);
    setUploadStatus({ status: 'idle', progress: 0 });
    setUploadResults([]);
  };
  
  const goToWardrobe = () => {
    navigate('/wardrobe');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="container-custom max-w-4xl">
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Upload Your Outfits
            </h1>
            <p className="text-muted-foreground text-lg">
              Help us understand your style by sharing photos of outfits you love.
            </p>
          </div>
          
          {/* Step Indicator */}
          <div className="flex justify-between relative mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0"></div>
            
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={cn(
                  "relative z-10 flex flex-col items-center"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-300",
                  step === i 
                    ? "border-primary bg-primary text-white"
                    : step > i
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground"
                )}>
                  {step > i ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    i
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  step >= i ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {i === 1 ? "Upload Photos" : i === 2 ? "Processing" : "Style Analysis"}
                </span>
              </div>
            ))}
          </div>
          
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <UploadZone 
                onFilesAdded={handleFilesAdded} 
                maxFiles={5}
              />
              
              <div className="mt-8 glass-card p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Tips for better style analysis</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-4">
                    <li>Upload clear, well-lit photos of complete outfits</li>
                    <li>Include a variety of styles you like (casual, formal, etc.)</li>
                    <li>Photos from different angles help our AI understand better</li>
                    <li>You can upload up to 5 photos per session</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={files.length === 0}
                  className="gap-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Processing */}
          {step === 2 && (
            <div className="animate-fade-in glass-card p-8 text-center" style={{ animationDelay: '200ms' }}>
              {uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="h-16 w-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <div className="w-full max-w-md">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${uploadStatus.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {uploadStatus.message || 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-3">Analyzing Your Style</h2>
                  <p className="text-muted-foreground">
                    Our AI is processing your images to understand your style preferences. This may take a minute...
                  </p>
                </>
              ) : uploadStatus.status === 'success' ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-3">Processing Complete!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your style preferences have been analyzed successfully.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-3">Upload Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    {uploadStatus.message || 'There was an error processing your request. Please try again.'}
                  </p>
                  <Button variant="outline" onClick={resetUpload}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
          
          {/* Step 3: Results */}
          {step === 3 && (
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-8 mb-8">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-6 text-center">Your Style Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-medium mb-2">Primary Style</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Modern Vintage</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Minimalist</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-medium mb-2">Color Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Earth Tones</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Neutrals</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-medium mb-2">Pattern Affinities</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Solid Colors</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Subtle Textures</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-3">Style Notes</h3>
                  <p className="text-muted-foreground mb-4">
                    Your style reflects a preference for timeless pieces with modern minimal elements. You gravitate toward quality basics in neutral colors that can be mixed and matched. Your ideal thrift finds would include:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>High-quality basics with interesting details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Vintage denim and well-structured tops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Natural fabrics like cotton, linen, and wool</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Simple but distinctive accessories</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={resetUpload} 
                  variant="outline"
                >
                  Upload More Photos
                </Button>
                <Button onClick={goToWardrobe}>
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
