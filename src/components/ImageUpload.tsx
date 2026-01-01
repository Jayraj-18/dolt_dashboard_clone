import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export const ImageUpload = ({
  currentImage,
  onImageChange,
  maxSize = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!acceptedFormats.includes(fileExt)) {
      toast.error(`Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    // Basic validation first
    if (!validateFile(file)) return;

    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Define max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw compressed image
        ctx?.drawImage(img, 0, 0, width, height);

        // Get compressed Base64 string (JPEG, 0.7 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        setPreview(compressedBase64);
        onImageChange(compressedBase64);
        localStorage.setItem('profileImage', compressedBase64);
        toast.success('Image uploaded successfully');
        setIsLoading(false);
      };

      img.onerror = () => {
        toast.error('Failed to process image');
        setIsLoading(false);
      };
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onImageChange('');
    localStorage.removeItem('profileImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-lg object-cover border-2 border-primary/30"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map((fmt) => `.${fmt}`).join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          {isLoading ? 'Uploading...' : 'Drag and drop your image here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          or click to select from your computer
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Max file size: {maxSize}MB • Formats: {acceptedFormats.join(', ')}
        </p>
      </div>

      {/* Alternative: Google OAuth Mock */}
      {/* <Button variant="outline" className="w-full" disabled={isLoading}>
        <img
          src="https://www.gstatic.com/images/branding/product/1x/goog_logo_40dp.png"
          alt="Google"
          className="w-4 h-4 mr-2"
        />
        Connect Google (Mock)
      </Button> */}
    </div>
  );
};
