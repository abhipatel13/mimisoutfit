/**
 * Home Hook
 * Fetches unified featured content for the homepage
 */

import { useEffect, useState } from 'react';
import type { Product, Moodboard, HomepageData } from '@/types';
import { productsApi } from '@/services/api';

export function useHomeFeatured() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredMoodboards, setFeaturedMoodboards] = useState<Moodboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: HomepageData = await productsApi.getHomepageData();
        if (!isMounted) return;
        setFeaturedProducts(data.featuredProducts || []);
        setFeaturedMoodboards(data.featuredMoodboards || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load home'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      isMounted = false;
    };
  }, []);

  return { featuredProducts, featuredMoodboards, loading, error };
}


