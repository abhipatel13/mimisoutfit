/**
 * Blurhash Utilities
 * 
 * Collection of sample blurhashes for different image types
 * These are pre-generated for common image patterns
 */

/**
 * Generate a sample blurhash for different image categories
 * In production, these should be generated server-side when images are uploaded
 */
export function getBlurhashForCategory(category?: string): string {
  const blurhashes: Record<string, string> = {
    // Fashion product images (neutral backgrounds)
    outerwear: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4', // Beige/neutral
    dresses: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', // Soft pink/cream
    tops: 'L9R{#8^+0KD%~qofofWB00WB%MWB', // Light gray
    bottoms: 'L4R:EXNG00IU~q9F00xu00xu00xu', // Light denim blue
    shoes: 'L4S6Rp0000-p00%M009F009F009F', // White/cream
    accessories: 'LHQ]zL~q4nWB-;M{WBj[%MWBxuof', // Warm brown
    
    // Moodboard covers (more colorful/varied)
    'parisian-chic': 'LGQJk9xu00~q00M{%M-;00M{-;%M', // Elegant gray
    'minimal-monochrome': 'L00000fQ00fQ00fQ00fQ00fQ00fQ', // True black/white
    'bohemian-romance': 'LMMaw}IU~qxu-;oft7j[x]j[WBof', // Warm earth tones
    'coastal-escape': 'L8KKN}~q4n%M-;RjWBfk00t7-;IU', // Ocean blue
    'urban-edge': 'L3Q,n$4T~q-;%M9F-;ofM{xtM{M{', // Dark gray/urban
    'classic-sophistication': 'LKP5|x~p4.NG~q%2ofWC9FNG%Mxu', // Warm beige
    
    // Default fallbacks
    default: 'L5H2EC=PM+yV0g-mq.wG9c010J}I', // Neutral gray
  };

  return blurhashes[category || 'default'] || blurhashes.default;
}

/**
 * Common blurhash patterns for different image types
 */
export const BLURHASH_PRESETS = {
  // Neutral backgrounds (most fashion products)
  neutralLight: 'L9R{#8^+0KD%~qofofWB00WB%MWB',
  neutralMedium: 'L5H2EC=PM+yV0g-mq.wG9c010J}I',
  neutralDark: 'L3Q,n$4T~q-;%M9F-;ofM{xtM{M{',
  
  // White/cream backgrounds
  white: 'L4S6Rp0000-p00%M009F009F009F',
  cream: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4',
  
  // Colored backgrounds
  beige: 'LKP5|x~p4.NG~q%2ofWC9FNG%Mxu',
  pink: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
  blue: 'L8KKN}~q4n%M-;RjWBfk00t7-;IU',
  brown: 'LHQ]zL~q4nWB-;M{WBj[%MWBxuof',
  
  // Special cases
  transparent: 'L00000fQ00fQ00fQ00fQ00fQ00fQ',
} as const;

/**
 * Validate if a string is a valid blurhash
 */
export function isValidBlurhash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  
  // Blurhash should be at least 6 characters
  if (hash.length < 6) return false;
  
  // Basic validation - blurhash uses base83 encoding
  const validChars = /^[0-9A-Za-z#$%*+,\-.:;=?@[\]^_{|}~]+$/;
  return validChars.test(hash);
}

/**
 * Get optimal blurhash dimensions based on aspect ratio
 */
export function getBlurhashDimensions(aspectRatio?: string): { width: number; height: number } {
  const ratios: Record<string, { width: number; height: number }> = {
    '1/1': { width: 32, height: 32 },
    '3/4': { width: 32, height: 42 },
    '4/5': { width: 32, height: 40 },
    '16/9': { width: 32, height: 18 },
    '21/9': { width: 32, height: 14 },
  };
  
  return ratios[aspectRatio || '1/1'] || { width: 32, height: 32 };
}

/**
 * Sample blurhashes for mock data
 * In production, these would be generated server-side
 */
export const MOCK_BLURHASHES = {
  // Products
  products: [
    'L6Pj0^jE.AyE_3t7t7R**0o#DgR4', // Cashmere Blazer
    'LKP5|x~p4.NG~q%2ofWC9FNG%Mxu', // Camel Coat
    'L3Q,n$4T~q-;%M9F-;ofM{xtM{M{', // Leather Trench
    'L9R{#8^+0KD%~qofofWB00WB%MWB', // Puffer Jacket
    'LHQ]zL~q4nWB-;M{WBj[%MWBxuof', // Longline Cardigan
    'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', // Silk Slip Dress
    'L4S6Rp0000-p00%M009F009F009F', // Linen Maxi
    'L8KKN}~q4n%M-;RjWBfk00t7-;IU', // Midi Wrap
    'L5H2EC=PM+yV0g-mq.wG9c010J}I', // Shirt Dress
    'LGQJk9xu00~q00M{%M-;00M{-;%M', // Mini Dress
  ],
  
  // Moodboards
  moodboards: [
    'LGQJk9xu00~q00M{%M-;00M{-;%M', // Parisian Chic
    'L00000fQ00fQ00fQ00fQ00fQ00fQ', // Minimal Monochrome
    'LMMaw}IU~qxu-;oft7j[x]j[WBof', // Bohemian Romance
    'L8KKN}~q4n%M-;RjWBfk00t7-;IU', // Coastal Escape
    'L3Q,n$4T~q-;%M9F-;ofM{xtM{M{', // Urban Edge
    'LKP5|x~p4.NG~q%2ofWC9FNG%Mxu', // Classic Sophistication
    'L6Pj0^jE.AyE_3t7t7R**0o#DgR4', // Warm Neutrals
    'LHQ]zL~q4nWB-;M{WBj[%MWBxuof', // Modern Romance
    'L9R{#8^+0KD%~qofofWB00WB%MWB', // Effortless Chic
    'LKO2?U%2Tw=w]~RBVZRi};RPxuwH', // Statement Pieces
  ],
};
