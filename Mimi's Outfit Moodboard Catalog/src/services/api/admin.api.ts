/**
 * Admin API Service
 * Handles authentication and admin operations with JWT
 */

import type {
  LoginCredentials,
  AuthResponse,
  CreateProductDto,
  UpdateProductDto,
  CreateMoodboardDto,
  UpdateMoodboardDto,
  PublishOptions,
  BulkOperationResult,
  AdminStats,
  ImageUploadResponse,
} from '@/types/admin.types';
import type { Product, Moodboard } from '@/types';
import { apiClient } from './base.api';
import { useAuthStore } from '@/store/auth-store';
import { apiConfig } from '@/config/api.config';

// Mock delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Unauthorized');
  return { Authorization: `Bearer ${token}` };
};

// ============================================
// AUTHENTICATION
// ============================================

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (apiConfig.mode === 'real') {
      // Real API call (backend mounts at /admin/auth/login)
      return apiClient.post<AuthResponse>('/admin/auth/login', credentials);
    }
    
    // Mock implementation
    await delay(500);
    
    // Simple mock validation
    if (credentials.email === 'admin@lookbook.com' && credentials.password === 'admin123') {
      const token = 'mock-jwt-token-' + Date.now();
      const user = {
        id: 'admin-001',
        email: credentials.email,
        name: 'Mimi Admin',
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
      };

      return {
        token,
        user,
        expiresIn: 3600, // 1 hour
      };
    }

    throw new Error('Invalid credentials');
  },
};

// ============================================
// PRODUCTS CRUD
// ============================================

export const adminProductsApi = {
  async createProduct(data: CreateProductDto): Promise<Product> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<Product>('/admin/products', data, { headers });
    }

    // Mock implementation
    await delay(500);
    const newProduct: Product = {
      id: 'prod_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    return newProduct;
  },

  async updateProduct(data: UpdateProductDto): Promise<Product> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.put<Product>(`/admin/products/${data.id}`, data, { headers });
    }

    // Mock implementation
    await delay(500);
    const updatedProduct: Product = {
      id: data.id,
      name: data.name || 'Updated Product',
      slug: data.slug || 'updated-product',
      price: data.price ?? 0,
      imageUrl: data.imageUrl || '',
      affiliateUrl: data.affiliateUrl || '',
      brand: data.brand,
      tags: data.tags,
      category: data.category,
      description: data.description,
      isFeatured: data.isFeatured,
      createdAt: new Date().toISOString(),
    };

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.delete<void>(`/admin/products/${id}`, { headers });
    }

    await delay(300);
  },

  async publishProduct(id: string, isPublished: boolean): Promise<Product> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.patch<Product>(`/admin/products/${id}/publish`, { isPublished }, { headers });
    }

    // Mock implementation
    await delay(300);
    return {
      id,
      name: 'Product',
      slug: 'product-slug',
      price: 100,
      imageUrl: '',
      affiliateUrl: '',
      isPublished,
      createdAt: new Date().toISOString(),
    };
  },

  async unpublishProduct(id: string): Promise<Product> {
    return this.publishProduct(id, false);
  },

  async bulkPublish(ids: string[], publish: boolean): Promise<BulkOperationResult> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<BulkOperationResult>(
        '/admin/products/bulk/publish',
        { ids, publish },
        { headers }
      );
    }

    // Mock implementation
    await delay(500);
    return {
      success: ids,
      failed: [],
      total: ids.length,
      successCount: ids.length,
      failedCount: 0,
    };
  },

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<BulkOperationResult>(
        '/admin/products/bulk/delete',
        { ids },
        { headers }
      );
    }

    // Mock implementation
    await delay(500);
    return {
      success: ids,
      failed: [],
      total: ids.length,
      successCount: ids.length,
      failedCount: 0,
    };
  },
};

// ============================================
// MOODBOARDS CRUD
// ============================================

export const adminMoodboardsApi = {
  async createMoodboard(data: CreateMoodboardDto): Promise<Moodboard> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<Moodboard>('/admin/moodboards', data, { headers });
    }

    // Mock implementation
    await delay(500);
    const newMoodboard: Moodboard = {
      id: 'mood_' + Date.now(),
      title: data.title,
      slug: data.slug,
      description: data.description,
      coverImage: data.coverImage,
      products: [], // Would be populated by backend
      tags: data.tags,
      isFeatured: data.isFeatured,
      stylingTips: data.stylingTips,
      howToWear: data.howToWear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newMoodboard;
  },

  async updateMoodboard(data: UpdateMoodboardDto): Promise<Moodboard> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.put<Moodboard>(`/admin/moodboards/${data.id}`, data, { headers });
    }

    // Mock implementation
    await delay(500);
    const updatedMoodboard: Moodboard = {
      id: data.id,
      title: data.title || 'Updated Moodboard',
      slug: data.slug || 'updated-moodboard',
      description: data.description,
      coverImage: data.coverImage || '',
      products: [],
      tags: data.tags,
      isFeatured: data.isFeatured,
      stylingTips: data.stylingTips,
      howToWear: data.howToWear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return updatedMoodboard;
  },

  async deleteMoodboard(id: string): Promise<void> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.delete<void>(`/admin/moodboards/${id}`, { headers });
    }

    await delay(300);
  },

  async publishMoodboard(id: string, isPublished: boolean): Promise<Moodboard> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.patch<Moodboard>(`/admin/moodboards/${id}/publish`, { isPublished }, { headers });
    }

    // Mock implementation
    await delay(300);
    return {
      id,
      title: 'Moodboard',
      slug: 'moodboard-slug',
      coverImage: '',
      products: [],
      isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async unpublishMoodboard(id: string): Promise<Moodboard> {
    return this.publishMoodboard(id, false);
  },

  async bulkPublish(ids: string[], publish: boolean): Promise<BulkOperationResult> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<BulkOperationResult>(
        '/admin/moodboards/bulk/publish',
        { ids, publish },
        { headers }
      );
    }

    // Mock implementation
    await delay(500);
    return {
      success: ids,
      failed: [],
      total: ids.length,
      successCount: ids.length,
      failedCount: 0,
    };
  },

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.post<BulkOperationResult>(
        '/admin/moodboards/bulk/delete',
        { ids },
        { headers }
      );
    }

    // Mock implementation
    await delay(500);
    return {
      success: ids,
      failed: [],
      total: ids.length,
      successCount: ids.length,
      failedCount: 0,
    };
  },
};

// ============================================
// ADMIN UTILITIES
// ============================================

export const adminUtilsApi = {
  async getStats(): Promise<AdminStats> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<AdminStats>('/admin/stats', { headers });
    }

    // Mock implementation
    await delay(300);
    
    // Calculate stats from mock data
    const { mockProducts } = await import('@/data/mock-data');
    const { mockMoodboards } = await import('@/data/mock-data');
    
    return {
      totalProducts: mockProducts.length,
      totalMoodboards: mockMoodboards.length,
      featuredProducts: mockProducts.filter(p => p.isFeatured).length,
      featuredMoodboards: mockMoodboards.filter(m => m.isFeatured).length,
    };
  },

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const headers = getAuthHeaders();
    const formData = new FormData();
    formData.append('image', file);

    if (apiConfig.mode === 'real') {
      return apiClient.postFormData<ImageUploadResponse>(
        '/admin/upload/image',
        formData,
        { headers }
      );
    }

    // Mock implementation
    await delay(1000);
    return {
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
    };
  },
};
