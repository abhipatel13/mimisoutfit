/**
 * Products Hook
 * React hook for fetching and managing product data
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product, FilterOptions, PaginationInfo } from '@/types';
import { productsApi } from '@/services/api';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination.utils';

export function useProducts(filters?: FilterOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsApi.getAllProducts(filters);
        
        if (isMounted) {
          setProducts(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { products, pagination, loading, error };
}

/**
 * Hook with pagination controls
 */
export function usePaginatedProducts(initialFilters?: Omit<FilterOptions, 'page' | 'limit'>) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...initialFilters,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  const { products, pagination, loading, error } = useProducts(filters);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: Omit<FilterOptions, 'page' | 'limit'>) => {
    setFilters(prev => ({ ...newFilters, page: 1, limit: prev.limit }));
  }, []);

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    updateFilters,
  };
}

export function useProduct(idOrSlug: string, type: 'id' | 'slug' = 'slug') {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let productData: Product | null;
        
        if (type === 'id') {
          productData = await productsApi.getProductById(idOrSlug);
        } else {
          const response = await productsApi.getProductBySlug(idOrSlug);
          productData = response?.product ?? null;
        }
        
        if (isMounted) {
          setProduct(productData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch product'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (idOrSlug) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [idOrSlug, type]);

  return { product, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getFeaturedProducts();
        
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch featured products'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, error };
}

export function useProductSearch(query: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.searchProducts(query);
        
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to search products'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { products, loading, error };
}

export function useProductCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getCategories();
        
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
}
