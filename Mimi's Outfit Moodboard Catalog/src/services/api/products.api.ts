/**
 * Products API Service
 * Handles product data fetching with mock/real mode support
 */

import type { Product, FilterOptions, PaginatedResponse, ProductDetailResponse, HomepageData, Moodboard } from '@/types';
import { apiConfig } from '@/config/api.config';
import { apiClient } from './base.api';
import { calculatePagination, DEFAULT_PAGE_SIZE } from '@/lib/pagination.utils';
import { smartSearch } from '@/lib/fuzzy-search.utils';
import {
  mockProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByTag,
  getProductsByPriceRange,
  getAllCategories,
  getAllBrands,
  getAllTags,
} from '@/data/mock-data';

// Simulated API delay for mock mode (makes it feel more realistic)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MOCK DATA IMPLEMENTATIONS
// ============================================

const mockApi = {
  async getAllProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    await delay(300); // Simulate network delay
    
    let products = [...mockProducts];

    // Apply search filter first (most important)
    if (filters?.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      products = products.filter(p => {
        // Search in name, brand, description, and tags
        const matchesName = p.name.toLowerCase().includes(searchLower);
        const matchesBrand = p.brand?.toLowerCase().includes(searchLower);
        const matchesDescription = p.description?.toLowerCase().includes(searchLower);
        const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesCategory = p.category?.toLowerCase().includes(searchLower);
        
        return matchesName || matchesBrand || matchesDescription || matchesTags || matchesCategory;
      });
    }

    // Apply other filters
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters?.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }

    if (filters?.tag) {
      products = products.filter(p => p.tags?.includes(filters.tag));
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const min = filters.minPrice ?? 0;
      const max = filters.maxPrice ?? Infinity;
      products = products.filter(p => p.price && p.price >= min && p.price <= max);
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'price-low':
          products.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
          break;
        case 'price-high':
          products.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
          break;
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    // Apply pagination
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? DEFAULT_PAGE_SIZE;
    const { paginatedData, pagination } = calculatePagination(products, page, limit);

    return {
      data: paginatedData,
      pagination,
    };
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find(p => p.id === id) || null;
  },

  async getProductBySlug(slug: string, includeRelated?: boolean): Promise<ProductDetailResponse | null> {
    await delay(200);
    const product = getProductBySlug(slug);
    if (!product) return null;
    
    const response: ProductDetailResponse = { product };
    
    // Include related products if requested
    if (includeRelated) {
      response.relatedProducts = await this.getRelatedProducts(product.id, 4);
    }
    
    return response;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await delay(200);
    return getFeaturedProducts();
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    await delay(200);
    return getProductsByCategory(category);
  },

  async getProductsByTag(tag: string): Promise<Product[]> {
    await delay(200);
    return getProductsByTag(tag);
  },

  async getCategories(): Promise<string[]> {
    await delay(100);
    return getAllCategories();
  },

  async getBrands(): Promise<string[]> {
    await delay(100);
    return getAllBrands();
  },

  async getTags(): Promise<string[]> {
    await delay(100);
    return getAllTags();
  },

  async searchProducts(query: string): Promise<Product[]> {
    await delay(300);
    const { results } = smartSearch(mockProducts, query, 3);
    return results;
  },

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    await delay(200);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return [];
    
    // Find related products based on category, brand, and tags
    const related = mockProducts
      .filter(p => p.id !== productId)
      .map(p => {
        let score = 0;
        
        // Same category (weight: 0.4)
        if (p.category === product.category) score += 0.4;
        
        // Same brand (weight: 0.3)
        if (p.brand === product.brand) score += 0.3;
        
        // Overlapping tags (weight: 0.3)
        const overlappingTags = p.tags?.filter(tag => product.tags?.includes(tag)).length || 0;
        if (overlappingTags > 0 && product.tags) {
          score += (overlappingTags / product.tags.length) * 0.3;
        }
        
        return { product: p, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      ?.slice(0, limit)
      ?.map(({ product }) => product) || [];
    
    return related;
  },

  async getHomepageData(): Promise<HomepageData> {
    await delay(300);
    const { getFeaturedMoodboards } = await import('@/data/mock-data');
    
    return {
      featuredProducts: getFeaturedProducts(),
      featuredMoodboards: getFeaturedMoodboards(),
    };
  },
};

// ============================================
// REAL API IMPLEMENTATIONS
// ============================================

const realApi = {
  async getAllProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    const params: Record<string, string | number | boolean> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
    if (filters?.brand) params.brand = filters.brand;
    if (filters?.tag) params.tag = filters.tag;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;

    return apiClient.get<PaginatedResponse<Product>>('/products', { params });
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getProductBySlug(slug: string, includeRelated?: boolean): Promise<ProductDetailResponse | null> {
    try {
      // Backend returns the product object directly, not wrapped
      const product = await apiClient.get<Product>(`/products/slug/${slug}`);
      if (!includeRelated) return { product };

      let relatedProducts: Product[] = [];
      try {
        relatedProducts = await this.getRelatedProducts(product.id, 4);
      } catch {
        relatedProducts = [];
      }
      return { product, relatedProducts };
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<{ data: Product[] }>('/products/featured', { params });
    return response.data;
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    return apiClient.get<Product[]>('/products', { params: { category } });
  },

  async getProductsByTag(tag: string): Promise<Product[]> {
    return apiClient.get<Product[]>('/products', { params: { tag } });
  },

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/products/categories');
  },

  async getBrands(): Promise<string[]> {
    return apiClient.get<string[]>('/products/brands');
  },

  async getTags(): Promise<string[]> {
    return apiClient.get<string[]>('/products/tags');
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', { 
      params: { search: query, limit: 100 } 
    });
    return response.data;
  },

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>(`/products/${productId}/related`, { 
      params: { limit } 
    });
    return response.data;
  },

  async getHomepageData(): Promise<HomepageData> {
    const res = await apiClient.get<{ moodboards: Moodboard[]; products: Product[] }>('/products/homeFeatured');
    return {
      featuredProducts: res.products || [],
      featuredMoodboards: res.moodboards || [],
    };
  },
};

// ============================================
// UNIFIED API INTERFACE
// ============================================

export const productsApi = apiConfig.mode === 'mock' ? mockApi : realApi;
