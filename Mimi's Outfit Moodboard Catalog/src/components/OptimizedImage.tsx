import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';
import { decode } from 'blurhash';
import { isValidBlurhash, getBlurhashDimensions } from '@/lib/blurhash.utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  blurhash?: string; // Blurhash string for LQIP (Low Quality Image Placeholder)
  className?: string;
  aspectRatio?: string; // e.g., '3/4', '4/5', '16/9'
  priority?: boolean; // Load immediately without lazy loading
  sizes?: string; // Responsive sizes attribute
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'blurhash' | 'empty';
  objectFit?: 'cover' | 'contain' | 'fill';
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blurhash LQIP (Low Quality Image Placeholder)
 * - Responsive image loading with srcset
 * - Error handling with fallback UI
 * - Automatic aspect ratio management
 * - Progressive image enhancement
 * - Preload support for critical images
 * - Canvas-based blurhash rendering
 */
export default function OptimizedImage({
  src,
  alt,
  blurhash,
  className = '',
  aspectRatio,
  priority = false,
  sizes,
  onLoad,
  onError,
  placeholder = 'blurhash',
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const [blurhashUrl, setBlurhashUrl] = useState<string>('');
  const imgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine effective placeholder strategy
  // If blurhash requested but not provided, fallback to simple blur
  const effectivePlaceholder = placeholder === 'blurhash' && !blurhash ? 'blur' : placeholder;
  const shouldUseBlurhash = effectivePlaceholder === 'blurhash' && blurhash && isValidBlurhash(blurhash);

  // Generate blurhash canvas on mount (only if blurhash is provided)
  useEffect(() => {
    if (!shouldUseBlurhash || !canvasRef.current) return;

    try{
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get optimal dimensions based on aspect ratio
      const { width, height } = getBlurhashDimensions(aspectRatio);
      canvas.width = width;
      canvas.height = height;

      // Decode blurhash to pixel array
      const pixels = decode(blurhash, width, height);
      
      // Create ImageData and draw to canvas
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to data URL
      setBlurhashUrl(canvas.toDataURL());
    } catch (error) {
      console.warn('[OptimizedImage] Blurhash decode failed, using simple blur fallback:', error);
      // Silently fallback to simple blur - no user-facing error
    }
  }, [shouldUseBlurhash, aspectRatio]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  // Generate optimized image URLs for different sizes
  // This assumes you're using a CDN or image optimization service
  // Adjust based on your actual image hosting setup
  const generateSrcSet = (src: string) => {
    // If using Unsplash, generate multiple sizes
    if (src.includes('unsplash.com')) {
      return `
        ${src}&w=400 400w,
        ${src}&w=800 800w,
        ${src}&w=1200 1200w,
        ${src}&w=1600 1600w
      `.trim();
    }
    
    // If using Cloudinary or other CDN, add similar logic
    if (src.includes('cloudinary.com')) {
      // Extract base URL and add transformations
      const baseUrl = src.split('/upload/')[0] + '/upload/';
      const imagePath = src.split('/upload/')[1];
      return `
        ${baseUrl}w_400,f_auto,q_auto/${imagePath} 400w,
        ${baseUrl}w_800,f_auto,q_auto/${imagePath} 800w,
        ${baseUrl}w_1200,f_auto,q_auto/${imagePath} 1200w,
        ${baseUrl}w_1600,f_auto,q_auto/${imagePath} 1600w
      `.trim();
    }

    // Default: no srcset
    return undefined;
  };

  const srcSet = generateSrcSet(src);

  // Map common aspect ratios to Tailwind classes
  const aspectRatioClass = aspectRatio ? {
    '1/1': 'aspect-square',
    '3/4': 'aspect-[3/4]',
    '4/5': 'aspect-[4/5]',
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
  }[aspectRatio] || `aspect-[${aspectRatio}]` : '';

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden bg-muted ${aspectRatioClass} ${className}`}
    >
      {/* Hidden canvas for blurhash generation */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Error State */}
      {hasError ? (
        <div className="image-placeholder w-full h-full">
          <div className="text-center">
            <ImageOff className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/60">Image unavailable</p>
          </div>
        </div>
      ) : (
        <>
          {/* Blurhash Placeholder (LQIP) */}
          {!isLoaded && placeholder === 'blurhash' && blurhashUrl && (
            <img
              src={blurhashUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl"
            />
          )}

          {/* Simple Blur Placeholder (fallback) */}
          {!isLoaded && placeholder === 'blur' && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
          )}

          {/* Actual Image */}
          {isInView && (
            <img
              src={src}
              alt={alt}
              srcSet={srcSet}
              sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
              className={`
                relative z-10 w-full h-full transition-all duration-700
                ${objectFit === 'cover' ? 'object-cover' : ''}
                ${objectFit === 'contain' ? 'object-contain' : ''}
                ${objectFit === 'fill' ? 'object-fill' : ''}
                ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
              `}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {/* Loading Indicator (only for blur placeholder) */}
          {!isLoaded && isInView && placeholder === 'blur' && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * 1. Basic usage with blurhash LQIP:
 * <OptimizedImage
 *   src={product.imageUrl}
 *   alt={product.name}
 *   blurhash={product.blurhash}
 *   className="rounded-lg"
 * />
 * 
 * 2. With aspect ratio and blurhash:
 * <OptimizedImage
 *   src={product.imageUrl}
 *   alt={product.name}
 *   blurhash={product.blurhash}
 *   aspectRatio="3/4"
 * />
 * 
 * 3. Priority loading with blurhash (above fold):
 * <OptimizedImage
 *   src={hero.imageUrl}
 *   alt="Hero image"
 *   blurhash={hero.blurhash}
 *   priority={true}
 *   aspectRatio="16/9"
 * />
 * 
 * 4. With responsive sizes:
 * <OptimizedImage
 *   src={product.imageUrl}
 *   alt={product.name}
 *   blurhash={product.blurhash}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 * 
 * 5. Fallback to simple blur (no blurhash):
 * <OptimizedImage
 *   src={logo.imageUrl}
 *   alt="Logo"
 *   placeholder="blur"
 *   objectFit="contain"
 * />
 * 
 * 6. Without placeholder:
 * <OptimizedImage
 *   src={icon.imageUrl}
 *   alt="Icon"
 *   placeholder="empty"
 * />
 */
