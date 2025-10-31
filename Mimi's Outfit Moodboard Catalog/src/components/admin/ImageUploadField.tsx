/**
 * Image Upload Field Component
 * Handles file upload with LOCAL preview AND automatic blurhash generation
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, AlertCircle, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateBlurhash } from '@/lib/blurhash-encoder';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  aspectRatio?: 'square' | '4/3' | '16/9';
  disabled?: boolean;
  onFileSelect?: (file: File) => void; // Callback for file selection (no upload yet)
  onBlurhashGenerated?: (blurhash: string) => void; // NEW: Callback when blurhash is ready
}

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  required = false,
  aspectRatio = 'square',
  disabled = false,
  onFileSelect,
  onBlurhashGenerated,
}: ImageUploadFieldProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatingBlurhash, setGeneratingBlurhash] = useState(false);
  const [blurhashGenerated, setBlurhashGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aspectRatioClass = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
  }[aspectRatio];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Create local preview using FileReader
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setLocalPreview(result);
      setSelectedFile(file);
      
      // Notify parent component about file selection
      if (onFileSelect) {
        onFileSelect(file);
      }
      
      // Store file reference in the value field temporarily
      onChange(`[LOCAL_FILE]:${file.name}`);
      
      // Generate blurhash automatically
      await generateBlurhashFromPreview(result);
      
      toast({
        title: 'Image Selected',
        description: 'Image will be uploaded when you save',
      });
    };
    
    reader.readAsDataURL(file);
  };

  /**
   * Generate blurhash from the preview image
   */
  const generateBlurhashFromPreview = async (dataUrl: string) => {
    try {
      setGeneratingBlurhash(true);
      setBlurhashGenerated(false);
      
      // Generate blurhash (runs in browser, ~100-300ms)
      const hash = await generateBlurhash(dataUrl, {
        componentX: 4,
        componentY: 3,
      });
      
      // Notify parent component
      if (onBlurhashGenerated) {
        onBlurhashGenerated(hash);
      }
      
      setBlurhashGenerated(true);
      
      toast({
        title: 'Blurhash Generated',
        description: 'Image placeholder created automatically',
      });
    } catch (error) {
      console.error('Failed to generate blurhash:', error);
      toast({
        title: 'Blurhash Generation Failed',
        description: 'Product will work fine without it',
        variant: 'destructive',
      });
    } finally {
      setGeneratingBlurhash(false);
    }
  };

  /**
   * Generate blurhash from existing URL
   */
  const handleGenerateBlurhashFromUrl = async () => {
    if (!value || value.startsWith('[LOCAL_FILE]:')) return;
    
    try {
      setGeneratingBlurhash(true);
      const hash = await generateBlurhash(value);
      
      if (onBlurhashGenerated) {
        onBlurhashGenerated(hash);
      }
      
      setBlurhashGenerated(true);
      
      toast({
        title: 'Blurhash Generated',
        description: 'Image placeholder created from URL',
      });
    } catch (error) {
      console.error('Failed to generate blurhash:', error);
      toast({
        title: 'Blurhash Generation Failed',
        description: 'Please check the image URL and CORS settings',
        variant: 'destructive',
      });
    } finally {
      setGeneratingBlurhash(false);
    }
  };

  const handleRemoveImage = () => {
    setLocalPreview(null);
    setSelectedFile(null);
    setBlurhashGenerated(false);
    onChange('');
    if (onBlurhashGenerated) {
      onBlurhashGenerated('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  // Determine which image to show: local preview or existing URL
  const displayImage = localPreview || value;
  const isLocalFile = value.startsWith('[LOCAL_FILE]:');

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {/* URL Input Field (manual entry option) */}
      <div className="flex gap-2">
        <Input
          id={id}
          value={isLocalFile ? '' : value}
          onChange={(e) => {
            setLocalPreview(null);
            setSelectedFile(null);
            setBlurhashGenerated(false);
            onChange(e.target.value);
          }}
          placeholder="https://images.unsplash.com/photo-... or upload below"
          disabled={disabled || !!localPreview}
          required={required}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowse}
          disabled={disabled}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Local file indicator with blurhash status */}
      {isLocalFile && selectedFile && (
        <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>
              <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB) - Will upload on save
            </span>
          </div>
          
          {/* Blurhash generation status */}
          {generatingBlurhash && (
            <div className="flex items-center gap-2 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Generating placeholder...</span>
            </div>
          )}
          {blurhashGenerated && !generatingBlurhash && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Placeholder ready</span>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {displayImage && !isLocalFile && (
        <div className="relative mt-2">
          <div className={`${aspectRatioClass} max-w-[300px] rounded-lg overflow-hidden border relative group`}>
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
              }}
            />
            
            {/* Remove button overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          
          {/* URL display and blurhash button */}
          {!localPreview && (
            <div className="mt-2 space-y-2">
              <div className="p-2 bg-muted rounded text-xs text-muted-foreground break-all">
                {value}
              </div>
              
              {/* Generate blurhash button for existing URLs */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerateBlurhashFromUrl}
                disabled={disabled || generatingBlurhash}
                className="w-full"
              >
                {generatingBlurhash ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Generating Placeholder...
                  </>
                ) : blurhashGenerated ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-2" />
                    Placeholder Generated
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 mr-2" />
                    Generate Blur Placeholder
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        <AlertCircle className="inline w-3 h-3 mr-1" />
        Upload an image (max 5MB) or paste an image URL. Blurhash placeholder will be generated automatically.
      </p>
    </div>
  );
}

// Export helper function to extract file from component
export function getFileFromValue(value: string): string | null {
  if (value.startsWith('[LOCAL_FILE]:')) {
    return value.replace('[LOCAL_FILE]:', '');
  }
  return null;
}
