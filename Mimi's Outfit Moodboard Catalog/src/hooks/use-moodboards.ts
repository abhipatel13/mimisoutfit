/**
 * Moodboards Hook
 * React hook for fetching and managing moodboard data
 */

import { useState, useEffect, useCallback } from 'react';
import type { Moodboard, PaginationInfo } from '@/types';
import { moodboardsApi } from '@/services/api';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination.utils';

interface MoodboardFilters {
  tag?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function useMoodboards(filters?: MoodboardFilters) {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
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

    const fetchMoodboards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await moodboardsApi.getAllMoodboards(filters);
        
        if (isMounted) {
          setMoodboards(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch moodboards'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMoodboards();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { moodboards, pagination, loading, error };
}

/**
 * Hook with pagination controls for moodboards
 */
export function usePaginatedMoodboards(initialFilters?: Omit<MoodboardFilters, 'page' | 'limit'>) {
  const [filters, setFilters] = useState<MoodboardFilters>({
    ...initialFilters,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  const { moodboards, pagination, loading, error } = useMoodboards(filters);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: Omit<MoodboardFilters, 'page' | 'limit'>) => {
    setFilters(prev => ({ ...newFilters, page: 1, limit: prev.limit }));
  }, []);

  return {
    moodboards,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    updateFilters,
  };
}

export function useMoodboard(id: string) {
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMoodboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await moodboardsApi.getMoodboardById(id);
        
        if (isMounted) {
          setMoodboard(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch moodboard'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchMoodboard();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { moodboard, loading, error };
}

export function useFeaturedMoodboards() {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMoodboards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await moodboardsApi.getFeaturedMoodboards();
        
        if (isMounted) {
          setMoodboards(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch featured moodboards'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMoodboards();

    return () => {
      isMounted = false;
    };
  }, []);

  return { moodboards, loading, error };
}

export function useMoodboardSearch(query: string) {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const searchMoodboards = async () => {
      if (!query.trim()) {
        setMoodboards([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await moodboardsApi.searchMoodboards(query);
        
        if (isMounted) {
          setMoodboards(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to search moodboards'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchMoodboards, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return { moodboards, loading, error };
}
