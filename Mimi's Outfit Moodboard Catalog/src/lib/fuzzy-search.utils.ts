/**
 * Fuzzy Search Utilities
 * Provides typo-tolerant search functionality using Fuse.js
 */

import Fuse from 'fuse.js';
import type { Product, Moodboard } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FuseOptions<T> = any;

// ============================================
// CONFIGURATION
// ============================================

/**
 * Fuse.js options for product search
 * 
 * Key Settings:
 * - threshold: 0.4 (0.0 = exact match, 1.0 = match anything)
 * - distance: 100 (max distance between characters for fuzzy match)
 * - minMatchCharLength: 2 (minimum characters to trigger search)
 * - includeScore: true (return relevance score for sorting)
 * - useExtendedSearch: true (enable advanced search patterns)
 */
const PRODUCT_SEARCH_OPTIONS: FuseOptions<Product> = {
  threshold: 0.4, // Moderate tolerance for typos
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  useExtendedSearch: true,
  ignoreLocation: true, // Search entire string, not just beginning
  keys: [
    {
      name: 'name',
      weight: 3, // Name is most important (3x weight)
    },
    {
      name: 'brand',
      weight: 2, // Brand is second most important (2x weight)
    },
    {
      name: 'category',
      weight: 1.5,
    },
    {
      name: 'tags',
      weight: 1.5,
    },
    {
      name: 'description',
      weight: 1, // Description is least important but still searchable
    },
  ],
};

/**
 * Fuse.js options for moodboard search
 */
const MOODBOARD_SEARCH_OPTIONS: FuseOptions<Moodboard> = {
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  useExtendedSearch: true,
  ignoreLocation: true,
  keys: [
    {
      name: 'name',
      weight: 3,
    },
    {
      name: 'tags',
      weight: 2,
    },
    {
      name: 'description',
      weight: 1.5,
    },
    {
      name: 'stylingTips',
      weight: 1,
    },
  ],
};

// ============================================
// FUZZY SEARCH FUNCTIONS
// ============================================

/**
 * Search products with fuzzy matching (typo-tolerant)
 * 
 * @param products - Array of products to search
 * @param query - Search query (can contain typos)
 * @returns Array of products sorted by relevance
 * 
 * @example
 * // Typo-tolerant searches:
 * fuzzySearchProducts(products, "cashmre")  // Finds "cashmere"
 * fuzzySearchProducts(products, "everlne")  // Finds "Everlane"
 * fuzzySearchProducts(products, "blazr")    // Finds "blazer"
 */
export function fuzzySearchProducts(products: Product[], query: string): Product[] {
  if (!query || query.trim().length < 2) {
    return products;
  }

  const fuse = new Fuse(products, PRODUCT_SEARCH_OPTIONS);
  const results = fuse.search(query);

  // Return products sorted by relevance score (lower score = better match)
  return results.map(result => result.item);
}

/**
 * Search moodboards with fuzzy matching (typo-tolerant)
 * 
 * @param moodboards - Array of moodboards to search
 * @param query - Search query (can contain typos)
 * @returns Array of moodboards sorted by relevance
 */
export function fuzzySearchMoodboards(moodboards: Moodboard[], query: string): Moodboard[] {
  if (!query || query.trim().length < 2) {
    return moodboards;
  }

  const fuse = new Fuse(moodboards, MOODBOARD_SEARCH_OPTIONS);
  const results = fuse.search(query);

  return results.map(result => result.item);
}

/**
 * Calculate similarity score between two strings (0-100)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity percentage (100 = exact match, 0 = no match)
 * 
 * @example
 * calculateSimilarity("cashmere", "cashmre") // Returns ~88
 * calculateSimilarity("blazer", "blazr")     // Returns ~83
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Levenshtein distance algorithm
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Get search suggestions based on fuzzy matching
 * Helps users correct their typos
 * 
 * @param products - Array of products
 * @param query - User's search query
 * @param maxSuggestions - Maximum number of suggestions to return (default: 5)
 * @returns Array of suggested search terms
 * 
 * @example
 * getSearchSuggestions(products, "cashmre") 
 * // Returns ["cashmere", "cashmere blazer", "cashmere coat"]
 */
export function getSearchSuggestions(
  products: Product[], 
  query: string, 
  maxSuggestions: number = 5
): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const suggestions = new Set<string>();

  // Extract all searchable terms
  products.forEach(product => {
    // Add product name words
    product.name.toLowerCase().split(' ').forEach(word => {
      if (word.length >= 3) suggestions.add(word);
    });

    // Add brand
    if (product.brand) suggestions.add(product.brand.toLowerCase());

    // Add tags
    product.tags?.forEach(tag => suggestions.add(tag.toLowerCase()));

    // Add category
    if (product.category) suggestions.add(product.category.toLowerCase());
  });

  // Find best matches using fuzzy search
  const fuse = new Fuse(Array.from(suggestions), {
    threshold: 0.5,
    distance: 100,
    includeScore: true,
  });

  const results = fuse.search(query.toLowerCase());

  return results
    ?.slice(0, maxSuggestions)
    ?.map(result => result.item) || [];
}

/**
 * Check if a query has potential typos
 * Returns true if fuzzy search might help improve results
 * 
 * @param query - Search query
 * @returns Boolean indicating if fuzzy search is recommended
 */
export function hasPotentialTypos(query: string): boolean {
  // Check for common typo patterns:
  // 1. Very short words (likely incomplete)
  // 2. Unusual character patterns (qwerty adjacency)
  // 3. Missing vowels
  
  const words = query.toLowerCase().trim().split(/\s+/);
  
  for (const word of words) {
    // Skip very short words
    if (word.length <= 2) continue;
    
    // Check for missing vowels (potential typo)
    const vowelCount = (word.match(/[aeiou]/g) || []).length;
    if (word.length > 4 && vowelCount === 0) {
      return true;
    }
    
    // Check for unusual consonant clusters
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(word)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Enhanced search that falls back to fuzzy if exact search has few results
 * 
 * @param products - Array of products
 * @param query - Search query
 * @param minResults - Minimum results before triggering fuzzy search (default: 3)
 * @returns Object with results and search type used
 */
export function smartSearch(
  products: Product[], 
  query: string,
  minResults: number = 3
): { results: Product[]; searchType: 'exact' | 'fuzzy' } {
  if (!query || query.trim().length < 2) {
    return { results: products, searchType: 'exact' };
  }

  // First try exact search
  const searchLower = query.toLowerCase().trim();
  const exactResults = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchLower);
    const matchesBrand = p.brand?.toLowerCase().includes(searchLower);
    const matchesDescription = p.description?.toLowerCase().includes(searchLower);
    const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    const matchesCategory = p.category?.toLowerCase().includes(searchLower);
    
    return matchesName || matchesBrand || matchesDescription || matchesTags || matchesCategory;
  });

  // If exact search returns enough results, use it
  if (exactResults.length >= minResults) {
    return { results: exactResults, searchType: 'exact' };
  }

  // Otherwise, use fuzzy search for better typo tolerance
  const fuzzyResults = fuzzySearchProducts(products, query);
  
  return { results: fuzzyResults, searchType: 'fuzzy' };
}
