/**
 * Blurhash Encoder Utility
 * 
 * Generates blurhash from image files or URLs in the browser
 * No server-side processing required!
 */

import { encode } from 'blurhash';

/**
 * Generate blurhash from an image file
 * This runs entirely in the browser using Canvas API
 * 
 * @param file - The image file to encode
 * @param componentX - Horizontal components (1-9, default: 4)
 * @param componentY - Vertical components (1-9, default: 3)
 * @returns Promise<string> - The blurhash string
 */
export async function generateBlurhashFromFile(
  file: File,
  componentX: number = 4,
  componentY: number = 3
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const hash = await generateBlurhashFromUrl(dataUrl, componentX, componentY);
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate blurhash from an image URL or data URL
 * 
 * @param url - Image URL (can be http://, data:, or blob:)
 * @param componentX - Horizontal components (1-9, default: 4)
 * @param componentY - Vertical components (1-9, default: 3)
 * @returns Promise<string> - The blurhash string
 */
export async function generateBlurhashFromUrl(
  url: string,
  componentX: number = 4,
  componentY: number = 3
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS for external images
    
    img.onload = () => {
      try {
        // Create canvas with optimal size (32x32 is fast and sufficient)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Use small canvas for faster encoding
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        
        // Draw image scaled down
        context.drawImage(img, 0, 0, size, size);
        
        // Get pixel data
        const imageData = context.getImageData(0, 0, size, size);
        
        // Generate blurhash
        const hash = encode(
          imageData.data,
          imageData.width,
          imageData.height,
          componentX,
          componentY
        );
        
        resolve(hash);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Configuration options for blurhash generation
 */
export interface BlurhashOptions {
  /** Horizontal blur components (1-9, higher = more detail, default: 4) */
  componentX?: number;
  /** Vertical blur components (1-9, higher = more detail, default: 3) */
  componentY?: number;
  /** Show progress notifications (default: true) */
  showProgress?: boolean;
}

/**
 * Generate blurhash with default options optimized for product images
 * 
 * @param source - File or URL to encode
 * @param options - Optional encoding settings
 * @returns Promise<string> - The blurhash string
 * 
 * @example
 * // From file input
 * const file = event.target.files[0];
 * const hash = await generateBlurhash(file);
 * 
 * // From URL
 * const hash = await generateBlurhash('https://example.com/image.jpg');
 */
export async function generateBlurhash(
  source: File | string,
  options: BlurhashOptions = {}
): Promise<string> {
  const {
    componentX = 4,
    componentY = 3,
  } = options;
  
  if (source instanceof File) {
    return generateBlurhashFromFile(source, componentX, componentY);
  } else {
    return generateBlurhashFromUrl(source, componentX, componentY);
  }
}

/**
 * Batch generate blurhashes for multiple images
 * Useful for processing multiple product images at once
 * 
 * @param sources - Array of files or URLs
 * @param options - Optional encoding settings
 * @returns Promise<string[]> - Array of blurhash strings
 */
export async function generateBlurhashBatch(
  sources: (File | string)[],
  options: BlurhashOptions = {}
): Promise<string[]> {
  const promises = sources.map(source => generateBlurhash(source, options));
  return Promise.all(promises);
}

/**
 * Recommended component settings for different image types
 */
export const BLURHASH_COMPONENTS = {
  /** Fast encoding, minimal detail - good for thumbnails */
  fast: { componentX: 3, componentY: 3 },
  
  /** Balanced - good for most product images (default) */
  balanced: { componentX: 4, componentY: 3 },
  
  /** High detail - good for hero images */
  detailed: { componentX: 6, componentY: 4 },
  
  /** Maximum detail - use sparingly (slower) */
  maximum: { componentX: 9, componentY: 9 },
} as const;

/**
 * Estimate encoding time based on component count
 * Higher components = more detail but slower encoding
 */
export function estimateEncodingTime(componentX: number, componentY: number): string {
  const total = componentX * componentY;
  
  if (total <= 9) return '< 100ms';
  if (total <= 12) return '100-200ms';
  if (total <= 24) return '200-500ms';
  return '500ms+';
}
