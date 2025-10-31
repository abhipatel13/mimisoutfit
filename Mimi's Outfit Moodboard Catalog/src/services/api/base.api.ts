/**
 * Base API Client
 * Handles HTTP requests with error handling and logging
 * Automatically injects auth token and user identifier
 */

import { apiConfig } from '@/config/api.config';
import { getUserIdentifier } from '@/lib/user-identifier';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class BaseApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get auth token from localStorage
   * Returns token if authenticated, null otherwise
   */
  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('admin-auth-storage');
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  }

  /**
   * Build headers with automatic auth token and user identifier injection
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (apiConfig.apiKey) {
      headers['X-API-Key'] = apiConfig.apiKey;
    }

    // Add user identifier (always sent with every request)
    const userId = getUserIdentifier();
    headers['X-User-ID'] = userId;

    // Add auth token if available (for all requests when authenticated)
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with custom headers (custom headers take priority)
    return { ...headers, ...customHeaders };
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] GET:', url);
    }

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'GET',
        headers: this.buildHeaders(options?.headers),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] POST:', url, data);
    }

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: this.buildHeaders(options?.headers),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] PUT:', url, data);
    }

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'PUT',
        headers: this.buildHeaders(options?.headers),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] PATCH:', url, data);
    }

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'PATCH',
        headers: this.buildHeaders(options?.headers),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] DELETE:', url);
    }

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'DELETE',
        headers: this.buildHeaders(options?.headers),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    if (apiConfig.debug) {
      console.log('[API] POST (FormData):', url);
    }

    // For FormData, don't set Content-Type (browser handles it with boundary)
    const headers: Record<string, string> = {};
    
    // Add API key if configured
    if (apiConfig.apiKey) {
      headers['X-API-Key'] = apiConfig.apiKey;
    }

    // Add user identifier (always sent with every request)
    const userId = getUserIdentifier();
    headers['X-User-ID'] = userId;

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with custom headers (but exclude Content-Type)
    const customHeaders = { ...options?.headers };
    delete customHeaders['Content-Type'];

    // Add 10 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: { ...headers, ...customHeaders },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }
}

export const apiClient = new BaseApi(apiConfig.baseUrl);
