/**
 * Analytics Type Definitions
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'moodboard_view'
  | 'moodboard_filter'
  | 'moodboard_shop_click'
  | 'moodboard_save_all'
  | 'moodboard_remove_all'
  | 'moodboard_product_click'
  | 'search'
  | 'favorite_add'
  | 'favorite_remove'
  | 'affiliate_click'
  | 'filter_change'
  | 'sort_change';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  resourceType?: 'product' | 'moodboard';
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsOverview {
  metrics: {
    totalVisitors: number;
    totalPageViews: number;
    totalProductViews: number;
    totalMoodboardViews: number;
    totalSearches: number;
    totalFavorites: number;
    totalAffiliateClicks: number;
    avgSessionDuration: number; // in seconds
  };
  topProducts: PopularProduct[];
  topMoodboards: PopularMoodboard[];
  topSearchTerms: SearchTerm[];
  recentEvents: AnalyticsEventRecord[];
}

export interface PopularProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  brand?: string;
  viewCount: number;
  uniqueViewers: number;
  favoriteCount: number;
  clickCount: number;
  conversionRate: number; // clicks / views * 100
}

export interface PopularMoodboard {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  viewCount: number;
  uniqueViewers: number;
  clickThroughRate: number; // product clicks / views * 100
}

export interface SearchTerm {
  term: string;
  count: number;
  uniqueSearchers: number;
  avgResultsCount: number;
}

export interface AnalyticsEventRecord {
  id: string;
  userId: string;
  eventType: AnalyticsEventType;
  resourceType?: 'product' | 'moodboard';
  resourceId?: string;
  resourceName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserBehavior {
  newUsers: number;
  returningUsers: number;
  avgPagesPerSession: number;
  avgSessionDuration: number;
  topReferrers: ReferrerData[];
  userJourneys: JourneyData[];
}

export interface ReferrerData {
  source: string;
  count: number;
  percentage: number;
}

export interface JourneyData {
  path: string[];
  count: number;
  percentage: number;
}

export interface ProductAnalytics {
  productId: string;
  metrics: {
    views: number;
    uniqueViewers: number;
    favorites: number;
    clicks: number;
    conversionRate: number;
  };
  viewsByDay: DailyMetric[];
  clicksByDay: DailyMetric[];
  viewerLocations?: LocationData[];
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface LocationData {
  country: string;
  count: number;
  percentage: number;
}

export type TimeRange = '7d' | '30d' | '90d';

export interface AnalyticsFilters {
  timeRange: TimeRange;
  eventType?: AnalyticsEventType;
  resourceType?: 'product' | 'moodboard';
}

// Chart Data Types
export interface TimeSeriesData {
  date: string;
  views?: number;
  clicks?: number;
  searches?: number;
  favorites?: number;
  visitors?: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}
