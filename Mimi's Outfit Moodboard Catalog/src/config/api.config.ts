/**
 * API Configuration
 * Manages API mode (mock vs real) and settings
 */

export type ApiMode = 'mock' | 'real';

export interface ApiConfig {
  mode: ApiMode;
  baseUrl: string;
  apiKey?: string;
  debug: boolean;
  enableImageUpload: boolean;
  restrictAffiliateRetailers: boolean;
}

const getApiMode = (): ApiMode => {
  const mode = import.meta.env.VITE_API_MODE as string;
  return (mode === 'real' ? 'real' : 'mock') as ApiMode;
};

export const apiConfig: ApiConfig = {
  mode: getApiMode(),
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
  apiKey: import.meta.env.VITE_API_KEY,
  debug: import.meta.env.VITE_API_DEBUG === 'true',
  enableImageUpload: import.meta.env.VITE_ENABLE_IMAGE_UPLOAD !== 'false', // Default true
  restrictAffiliateRetailers: import.meta.env.VITE_RESTRICT_AFFILIATE_RETAILERS === 'true', // Default false
};

// Log current API mode in development
if (import.meta.env.DEV) {
  console.log(`[API Config] Running in ${apiConfig.mode.toUpperCase()} mode`);
  console.log(`[API Config] Image Upload: ${apiConfig.enableImageUpload ? 'ENABLED' : 'DISABLED'}`);
  console.log(`[API Config] Retailer Restriction: ${apiConfig.restrictAffiliateRetailers ? 'ENABLED' : 'DISABLED'}`);
}
