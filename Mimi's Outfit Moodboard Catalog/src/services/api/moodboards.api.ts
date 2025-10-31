/**
 * Moodboards API Service
 * Handles moodboard data fetching with mock/real mode support
 */

import type { Moodboard, Product, PaginatedResponse } from '@/types';
import { apiConfig } from '@/config/api.config';
import { apiClient } from './base.api';
import { calculatePagination, DEFAULT_PAGE_SIZE } from '@/lib/pagination.utils';
import { fuzzySearchMoodboards } from '@/lib/fuzzy-search.utils';
import {
  mockMoodboards,
  getFeaturedMoodboards,
  getMoodboardById,
  getMoodboardBySlug,
  getMoodboardsByTag,
} from '@/data/mock-data';

// Simulated API delay for mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface MoodboardFilters {
  search?: string; // Search query for title, description, tags
  tag?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// MOCK DATA IMPLEMENTATIONS
// ============================================

const mockApi = {
  async getAllMoodboards(filters?: MoodboardFilters): Promise<PaginatedResponse<Moodboard>> {
    await delay(300);
    
    let moodboards = [...mockMoodboards];

    // Apply search filter first
    if (filters?.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      moodboards = moodboards.filter(m => {
        const matchesTitle = m.title.toLowerCase().includes(searchLower);
        const matchesDescription = m.description?.toLowerCase().includes(searchLower);
        const matchesTags = m.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        return matchesTitle || matchesDescription || matchesTags;
      });
    }

    // Apply other filters
    if (filters?.tag) {
      moodboards = moodboards.filter(m => m.tags?.includes(filters.tag!));
    }

    if (filters?.featured !== undefined) {
      moodboards = moodboards.filter(m => m.isFeatured === filters.featured);
    }

    // Apply pagination
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? DEFAULT_PAGE_SIZE;
    const { paginatedData, pagination } = calculatePagination(moodboards, page, limit);

    return {
      data: paginatedData,
      pagination,
    };
  },

  async getMoodboardById(id: string): Promise<Moodboard | null> {
    await delay(200);
    return getMoodboardById(id) || null;
  },

  async getMoodboardBySlug(slug: string): Promise<Moodboard | null> {
    await delay(200);
    return getMoodboardBySlug(slug) || null;
  },

  async getFeaturedMoodboards(): Promise<Moodboard[]> {
    await delay(200);
    return getFeaturedMoodboards();
  },

  async getMoodboardsByTag(tag: string): Promise<Moodboard[]> {
    await delay(200);
    return getMoodboardsByTag(tag);
  },

  async getMoodboardTags(): Promise<string[]> {
    await delay(100);
    const allTags = mockMoodboards.flatMap(m => m.tags || []);
    return Array.from(new Set(allTags));
  },

  async searchMoodboards(query: string): Promise<Moodboard[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return mockMoodboards.filter(
      m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description?.toLowerCase().includes(lowerQuery) ||
        m.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  async getRelatedProducts(moodboardId: string, limit: number = 10): Promise<Product[]> {
    await delay(200);
    const moodboard = getMoodboardById(moodboardId) || getMoodboardBySlug(moodboardId);
    if (!moodboard) return [];
    
    // Get all products from mock data
    const { mockProducts } = await import('@/data/mock-data');
    
    // Get IDs of products already in the moodboard
    const moodboardProductIds = moodboard.products.map(p => p.id);
    
    // Find related products based on tag overlap
    const related = mockProducts
      .filter(p => !moodboardProductIds.includes(p.id))
      .map(p => {
        let score = 0;
        
        // Tag overlap (weight: 0.6)
        const overlappingTags = p.tags?.filter(tag => moodboard.tags?.includes(tag)).length || 0;
        if (overlappingTags > 0 && moodboard.tags) {
          score += (overlappingTags / moodboard.tags.length) * 0.6;
        }
        
        // Semantic similarity (simplified - just check if product name/description contains moodboard title words)
        const moodboardWords = moodboard.title.toLowerCase().split(' ');
        const matchingWords = moodboardWords.filter(word => 
          p.name.toLowerCase().includes(word) || 
          p.description?.toLowerCase().includes(word)
        ).length;
        if (matchingWords > 0) {
          score += (matchingWords / moodboardWords.length) * 0.4;
        }
        
        return { product: p, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      ?.slice(0, limit)
      ?.map(({ product }) => product) || [];
    
    return related;
  },
};

// ============================================
// REAL API IMPLEMENTATIONS
// ============================================

const realApi = {
  async getAllMoodboards(filters?: MoodboardFilters): Promise<PaginatedResponse<Moodboard>> {
    const params: Record<string, string | number | boolean> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.tag) params.tag = filters.tag;
    if (filters?.featured !== undefined) params.featured = filters.featured;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;

    return apiClient.get<PaginatedResponse<Moodboard>>('/moodboards', { params });
  },

  async getMoodboardById(id: string): Promise<Moodboard | null> {
    try {
      return await apiClient.get<Moodboard>(`/moodboards/${id}`);
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getMoodboardBySlug(slug: string): Promise<Moodboard | null> {
    try {
      return await apiClient.get<Moodboard>(`/moodboards/slug/${slug}`);
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getFeaturedMoodboards(limit?: number): Promise<Moodboard[]> {
    const params = limit ? { limit } : {};
    const response = await apiClient.get<{ data: Moodboard[] }>('/moodboards/featured', { params });
    return response.data;
  },

  async getMoodboardsByTag(tag: string): Promise<Moodboard[]> {
    return apiClient.get<Moodboard[]>('/moodboards', { params: { tag } });
  },

  async getMoodboardTags(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>('/moodboards/tags');
    return response.data;
  },

  async searchMoodboards(query: string): Promise<Moodboard[]> {
    const response = await apiClient.get<PaginatedResponse<Moodboard>>('/moodboards', { 
      params: { search: query, limit: 50 } 
    });
    return response.data;
  },

  async getRelatedProducts(moodboardId: string, limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ data: Product[] }>(`/moodboards/${moodboardId}/related`, { 
      params: { limit } 
    });
    return response.data;
  },
};

// ============================================
// UNIFIED API INTERFACE
// ============================================

export const moodboardsApi = apiConfig.mode === 'mock' ? mockApi : realApi;
