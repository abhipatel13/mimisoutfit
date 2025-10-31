/**
 * Analytics API Service
 * Handles analytics data retrieval for admin dashboard
 */

import type {
  AnalyticsOverview,
  UserBehavior,
  ProductAnalytics,
  TimeRange,
  AnalyticsFilters,
  TimeSeriesData,
  CategoryDistribution,
  ConversionFunnel,
  TrendData,
} from '@/types/analytics.types';
import { apiClient } from './base.api';
import { apiConfig } from '@/config/api.config';

// Mock delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('admin-auth-storage');
  if (!token) throw new Error('Unauthorized');
  
  try {
    const parsed = JSON.parse(token);
    const authToken = parsed?.state?.token;
    if (!authToken) throw new Error('Unauthorized');
    return { Authorization: `Bearer ${authToken}` };
  } catch {
    throw new Error('Unauthorized');
  }
};

export const analyticsApi = {
  /**
   * Get analytics overview dashboard data
   */
  async getOverview(timeRange: TimeRange = '7d'): Promise<AnalyticsOverview> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      const flat = await apiClient.get<any>('/admin/analytics/overview', {
        params: { timeRange },
        headers,
      });
      // Backend returns flat fields; adapt to AnalyticsOverview shape
      const overview: AnalyticsOverview = {
        metrics: {
          totalVisitors: flat.totalVisitors ?? 0,
          totalPageViews: flat.totalPageViews ?? 0,
          totalProductViews: flat.totalProductViews ?? 0,
          totalMoodboardViews: flat.totalMoodboardViews ?? 0,
          totalSearches: flat.totalSearches ?? 0,
          totalFavorites: flat.totalFavorites ?? 0,
          totalAffiliateClicks: flat.totalAffiliateClicks ?? 0,
          avgSessionDuration: flat.avgSessionDuration ?? 0,
        },
        topProducts: [],
        topMoodboards: [],
        topSearchTerms: [],
      } as any;
      return overview;
    }

    // Mock implementation with realistic data
    await delay(800);

    const mockData: AnalyticsOverview = {
      metrics: {
        totalVisitors: timeRange === '7d' ? 1243 : timeRange === '30d' ? 5821 : 18492,
        totalPageViews: timeRange === '7d' ? 3876 : timeRange === '30d' ? 18234 : 62145,
        totalProductViews: timeRange === '7d' ? 2145 : timeRange === '30d' ? 9823 : 34567,
        totalMoodboardViews: timeRange === '7d' ? 876 : timeRange === '30d' ? 3421 : 12345,
        totalSearches: timeRange === '7d' ? 432 : timeRange === '30d' ? 1876 : 6543,
        totalFavorites: timeRange === '7d' ? 234 : timeRange === '30d' ? 987 : 3456,
        totalAffiliateClicks: timeRange === '7d' ? 156 : timeRange === '30d' ? 654 : 2345,
        avgSessionDuration: 245, // seconds
      },
      topProducts: [
        {
          id: 'prod_001',
          name: 'Classic Trench Coat',
          slug: 'classic-trench-coat',
          imageUrl: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400',
          brand: 'Burberry',
          viewCount: 342,
          uniqueViewers: 298,
          favoriteCount: 45,
          clickCount: 78,
          conversionRate: 22.8,
        },
        {
          id: 'prod_002',
          name: 'Silk Midi Dress',
          slug: 'silk-midi-dress',
          imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          brand: 'Reformation',
          viewCount: 298,
          uniqueViewers: 256,
          favoriteCount: 38,
          clickCount: 62,
          conversionRate: 20.8,
        },
        {
          id: 'prod_003',
          name: 'Leather Ankle Boots',
          slug: 'leather-ankle-boots',
          imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
          brand: 'Stuart Weitzman',
          viewCount: 276,
          uniqueViewers: 234,
          favoriteCount: 42,
          clickCount: 56,
          conversionRate: 20.3,
        },
        {
          id: 'prod_004',
          name: 'Cashmere Sweater',
          slug: 'cashmere-sweater',
          imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
          brand: 'Everlane',
          viewCount: 245,
          uniqueViewers: 212,
          favoriteCount: 35,
          clickCount: 48,
          conversionRate: 19.6,
        },
        {
          id: 'prod_005',
          name: 'High-Waist Denim',
          slug: 'high-waist-denim',
          imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
          brand: 'Levi\'s',
          viewCount: 234,
          uniqueViewers: 198,
          favoriteCount: 29,
          clickCount: 43,
          conversionRate: 18.4,
        },
      ],
      topMoodboards: [
        {
          id: 'mood_001',
          title: 'Parisian Chic',
          slug: 'parisian-chic',
          coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
          viewCount: 456,
          uniqueViewers: 398,
          clickThroughRate: 34.2,
        },
        {
          id: 'mood_002',
          title: 'Minimalist Capsule',
          slug: 'minimalist-capsule',
          coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
          viewCount: 389,
          uniqueViewers: 334,
          clickThroughRate: 28.5,
        },
        {
          id: 'mood_003',
          title: 'Autumn Layers',
          slug: 'autumn-layers',
          coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
          viewCount: 342,
          uniqueViewers: 298,
          clickThroughRate: 31.8,
        },
      ],
      topSearchTerms: [
        { term: 'dresses', count: 87, uniqueSearchers: 76, avgResultsCount: 14 },
        { term: 'leather jacket', count: 64, uniqueSearchers: 58, avgResultsCount: 8 },
        { term: 'boots', count: 52, uniqueSearchers: 45, avgResultsCount: 12 },
        { term: 'sustainable', count: 43, uniqueSearchers: 39, avgResultsCount: 7 },
        { term: 'blazer', count: 38, uniqueSearchers: 34, avgResultsCount: 9 },
        { term: 'white shirt', count: 31, uniqueSearchers: 28, avgResultsCount: 11 },
        { term: 'trench coat', count: 27, uniqueSearchers: 24, avgResultsCount: 5 },
        { term: 'vintage', count: 24, uniqueSearchers: 21, avgResultsCount: 13 },
      ],
      recentEvents: [
        {
          id: '1',
          userId: 'user_abc123',
          eventType: 'product_view',
          resourceType: 'product',
          resourceId: 'classic-trench-coat',
          resourceName: 'Classic Trench Coat',
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          userId: 'user_def456',
          eventType: 'search',
          metadata: { query: 'dresses' },
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          userId: 'user_ghi789',
          eventType: 'affiliate_click',
          resourceType: 'product',
          resourceId: 'silk-midi-dress',
          resourceName: 'Silk Midi Dress',
          metadata: { retailer: 'Nordstrom' },
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          userId: 'user_jkl012',
          eventType: 'favorite_add',
          resourceType: 'product',
          resourceId: 'leather-ankle-boots',
          resourceName: 'Leather Ankle Boots',
          createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          userId: 'user_mno345',
          eventType: 'moodboard_view',
          resourceType: 'moodboard',
          resourceId: 'parisian-chic',
          resourceName: 'Parisian Chic',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ],
    };

    return mockData;
  },

  /**
   * Get user behavior analytics
   */
  async getUserBehavior(timeRange: TimeRange = '7d'): Promise<UserBehavior> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<UserBehavior>('/admin/analytics/users', {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(600);

    return {
      newUsers: timeRange === '7d' ? 234 : timeRange === '30d' ? 1243 : 4567,
      returningUsers: timeRange === '7d' ? 1009 : timeRange === '30d' ? 4578 : 13925,
      avgPagesPerSession: 3.8,
      avgSessionDuration: 245, // seconds
      topReferrers: [
        { source: 'google.com', count: 543, percentage: 43.7 },
        { source: 'instagram.com', count: 298, percentage: 24.0 },
        { source: 'pinterest.com', count: 187, percentage: 15.0 },
        { source: 'direct', count: 145, percentage: 11.7 },
        { source: 'other', count: 70, percentage: 5.6 },
      ],
      userJourneys: [
        { path: ['/', '/products', '/products/:id'], count: 287, percentage: 23.1 },
        { path: ['/', '/moodboards', '/moodboards/:id', '/products/:id'], count: 198, percentage: 15.9 },
        { path: ['/products', '/products/:id', '/affiliate-redirect'], count: 156, percentage: 12.6 },
        { path: ['/', '/products'], count: 143, percentage: 11.5 },
        { path: ['/moodboards', '/moodboards/:id'], count: 98, percentage: 7.9 },
      ],
    };
  },

  /**
   * Get individual product analytics
   */
  async getProductAnalytics(productId: string, timeRange: TimeRange = '7d'): Promise<ProductAnalytics> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<ProductAnalytics>(`/admin/analytics/products/${productId}`, {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(500);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const viewsByDay = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10,
    }));

    const clicksByDay = viewsByDay.map(day => ({
      date: day.date,
      count: Math.floor(day.count * 0.2 * Math.random()),
    }));

    return {
      productId,
      metrics: {
        views: 342,
        uniqueViewers: 298,
        favorites: 45,
        clicks: 78,
        conversionRate: 22.8,
      },
      viewsByDay,
      clicksByDay,
      viewerLocations: [
        { country: 'United States', count: 145, percentage: 48.7 },
        { country: 'United Kingdom', count: 67, percentage: 22.5 },
        { country: 'Canada', count: 43, percentage: 14.4 },
        { country: 'Australia', count: 28, percentage: 9.4 },
        { country: 'Other', count: 15, percentage: 5.0 },
      ],
    };
  },

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(timeRange: TimeRange = '7d'): Promise<TimeSeriesData[]> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<TimeSeriesData[]>('/api/analytics/timeseries', {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(400);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Simulate weekend traffic drop
      const baseTraffic = isWeekend ? 0.7 : 1;
      
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor((Math.random() * 100 + 50) * baseTraffic),
        clicks: Math.floor((Math.random() * 30 + 10) * baseTraffic),
        searches: Math.floor((Math.random() * 20 + 5) * baseTraffic),
        favorites: Math.floor((Math.random() * 15 + 3) * baseTraffic),
        visitors: Math.floor((Math.random() * 80 + 30) * baseTraffic),
      };
    });
  },

  /**
   * Get category distribution data
   */
  async getCategoryDistribution(timeRange: TimeRange = '7d'): Promise<CategoryDistribution[]> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<CategoryDistribution[]>('/api/analytics/categories', {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(400);

    const categories = [
      { category: 'Dresses', count: 342, percentage: 28.5 },
      { category: 'Outerwear', count: 287, percentage: 23.9 },
      { category: 'Shoes', count: 234, percentage: 19.5 },
      { category: 'Tops', count: 198, percentage: 16.5 },
      { category: 'Bottoms', count: 87, percentage: 7.3 },
      { category: 'Accessories', count: 52, percentage: 4.3 },
    ];

    return categories;
  },

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(timeRange: TimeRange = '7d'): Promise<ConversionFunnel[]> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<ConversionFunnel[]>('/api/analytics/funnel', {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(400);

    const visitors = 1243;
    const productViews = 876;
    const favorites = 234;
    const clicks = 156;

    return [
      {
        stage: 'Visitors',
        count: visitors,
        conversionRate: 100,
        dropOffRate: 0,
      },
      {
        stage: 'Product Views',
        count: productViews,
        conversionRate: (productViews / visitors) * 100,
        dropOffRate: ((visitors - productViews) / visitors) * 100,
      },
      {
        stage: 'Favorites',
        count: favorites,
        conversionRate: (favorites / productViews) * 100,
        dropOffRate: ((productViews - favorites) / productViews) * 100,
      },
      {
        stage: 'Affiliate Clicks',
        count: clicks,
        conversionRate: (clicks / favorites) * 100,
        dropOffRate: ((favorites - clicks) / favorites) * 100,
      },
    ];
  },

  /**
   * Get trend comparison data
   */
  async getTrendData(timeRange: TimeRange = '7d'): Promise<TrendData[]> {
    const headers = getAuthHeaders();

    if (apiConfig.mode === 'real') {
      return apiClient.get<TrendData[]>('/api/analytics/trends', {
        params: { timeRange },
        headers,
      });
    }

    // Mock implementation
    await delay(400);

    const calculateTrend = (current: number, previous: number) => {
      const change = current - previous;
      const changePercentage = previous === 0 ? 0 : (change / previous) * 100;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';
      return { change, changePercentage, trend };
    };

    const metrics = [
      { metric: 'Visitors', current: 1243, previous: 1089 },
      { metric: 'Page Views', current: 3876, previous: 3421 },
      { metric: 'Product Views', current: 2145, previous: 1987 },
      { metric: 'Searches', current: 432, previous: 398 },
      { metric: 'Favorites', current: 234, previous: 256 },
      { metric: 'Affiliate Clicks', current: 156, previous: 143 },
    ];

    return metrics.map(m => ({
      ...m,
      ...calculateTrend(m.current, m.previous),
    }));
  },
};
