/**
 * Admin Analytics Dashboard Page
 * Comprehensive analytics with user behavior tracking
 */

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsMetricCard } from '@/components/admin/AnalyticsMetricCard';
import { TopProductsTable } from '@/components/admin/TopProductsTable';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';
import { CategoryBarChart } from '@/components/admin/CategoryBarChart';
import { CategoryPieChart } from '@/components/admin/CategoryPieChart';
import { ConversionFunnelChart } from '@/components/admin/ConversionFunnelChart';
import { TrendComparisonChart } from '@/components/admin/TrendComparisonChart';
import { TrafficAreaChart } from '@/components/admin/TrafficAreaChart';
import {
  Users,
  Eye,
  Search,
  Heart,
  ExternalLink,
  TrendingUp,
  Grid3x3,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { analyticsApi } from '@/services/api/analytics.api';
import type {
  TimeRange,
  AnalyticsOverview,
  UserBehavior,
  TimeSeriesData,
  CategoryDistribution,
  ConversionFunnel,
} from '@/types/analytics.types';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setChartsLoading(true);
    try {
      const [
        overviewData,
        behaviorData,
        timeSeriesResult,
        categoryResult,
        funnelResult,
      ] = await Promise.all([
        analyticsApi.getOverview(timeRange),
        analyticsApi.getUserBehavior(timeRange),
        analyticsApi.getTimeSeriesData(timeRange),
        analyticsApi.getCategoryDistribution(timeRange),
        analyticsApi.getConversionFunnel(timeRange),
      ]);
      setOverview(overviewData);
      setUserBehavior(behaviorData);
      setTimeSeriesData(Array.isArray(timeSeriesResult?.data) ? timeSeriesResult.data : (Array.isArray(timeSeriesResult) ? timeSeriesResult : []));
      setCategoryData(Array.isArray(categoryResult?.data) ? categoryResult.data : (Array.isArray(categoryResult) ? categoryResult : []));
      setFunnelData(Array.isArray(funnelResult?.data) ? funnelResult.data : (Array.isArray(funnelResult) ? funnelResult : []));
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Analytics data has been updated',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <>
      <SEO
        title="Analytics Dashboard"
        description="View analytics and user behavior insights"
      />

      <div className="min-h-screen bg-background">
        <AdminHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Analytics</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track user behavior and content performance
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <AnalyticsMetricCard
              title="Total Visitors"
              value={overview?.metrics.totalVisitors ?? 0}
              icon={Users}
              subtitle={`${userBehavior?.newUsers ?? 0} new`}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Page Views"
              value={overview?.metrics.totalPageViews ?? 0}
              icon={Eye}
              subtitle={`${(overview?.metrics.totalPageViews ?? 0) / (overview?.metrics.totalVisitors ?? 1) | 0} avg per user`}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Product Views"
              value={overview?.metrics.totalProductViews ?? 0}
              icon={TrendingUp}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Affiliate Clicks"
              value={overview?.metrics.totalAffiliateClicks ?? 0}
              icon={ExternalLink}
              subtitle={`${((overview?.metrics.totalAffiliateClicks ?? 0) / (overview?.metrics.totalProductViews ?? 1) * 100).toFixed(1)}% CTR`}
              loading={loading}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <AnalyticsMetricCard
              title="Searches"
              value={overview?.metrics.totalSearches ?? 0}
              icon={Search}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Favorites"
              value={overview?.metrics.totalFavorites ?? 0}
              icon={Heart}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Moodboard Views"
              value={overview?.metrics.totalMoodboardViews ?? 0}
              icon={Grid3x3}
              loading={loading}
            />
            <AnalyticsMetricCard
              title="Avg Session"
              value={overview?.metrics.avgSessionDuration ? formatDuration(overview.metrics.avgSessionDuration) : '—'}
              icon={Clock}
              loading={loading}
            />
          </div>

          {/* Key Insights - Simplified Analytics */}
          <div className="space-y-4 sm:space-y-6">
            {/* Traffic Trends - The Big Picture */}
            <TrafficAreaChart
              data={timeSeriesData}
              loading={chartsLoading}
            />

            {/* Category Performance & Conversion Path */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <CategoryBarChart
                data={categoryData}
                loading={chartsLoading}
              />
              <ConversionFunnelChart
                data={funnelData}
                loading={chartsLoading}
              />
            </div>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="products" className="space-y-4 sm:space-y-6 mt-8">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1">
              <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
              <TabsTrigger value="moodboards" className="text-xs sm:text-sm">Moodboards</TabsTrigger>
              <TabsTrigger value="searches" className="text-xs sm:text-sm">Searches</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
            </TabsList>

            {/* Top Products Tab */}
            <TabsContent value="products" className="space-y-4 sm:space-y-6">
              <TopProductsTable
                products={overview?.topProducts ?? []}
                loading={loading}
              />
            </TabsContent>

            {/* Top Moodboards Tab */}
            <TabsContent value="moodboards" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Moodboards</CardTitle>
                  <CardDescription>Most viewed moodboards in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 w-full animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {(overview?.topMoodboards || []).map(moodboard => (
                        <Card key={moodboard.id} className="overflow-hidden">
                          <img
                            src={moodboard.coverImage}
                            alt={moodboard.title}
                            className="w-full h-24 sm:h-32 object-cover"
                          />
                          <CardContent className="p-3 sm:p-4">
                            <h3 className="font-medium mb-2 text-sm sm:text-base">{moodboard.title}</h3>
                            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{moodboard.viewCount} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                <span className="text-green-600">{moodboard.clickThroughRate.toFixed(1)}% CTR</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search Terms Tab */}
            <TabsContent value="searches" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Search Terms</CardTitle>
                  <CardDescription>Most searched terms by users</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 w-full animate-pulse bg-muted rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(overview?.topSearchTerms || []).map((term, index) => (
                        <div key={term.term} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">"{term.term}"</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {term.uniqueSearchers} searchers • {term.avgResultsCount} results
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-bold text-sm sm:text-base">{term.count}</p>
                            <p className="text-xs text-muted-foreground">searches</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Behavior Tab */}
            <TabsContent value="users" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* User Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Statistics</CardTitle>
                    <CardDescription>New vs returning visitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <div className="h-20 w-full animate-pulse bg-muted rounded" />
                        <div className="h-20 w-full animate-pulse bg-muted rounded" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">New Users</p>
                          <p className="text-2xl font-bold">{userBehavior?.newUsers.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Returning Users</p>
                          <p className="text-2xl font-bold">{userBehavior?.returningUsers.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">Avg Pages per Session</p>
                          <p className="text-2xl font-bold">{userBehavior?.avgPagesPerSession.toFixed(1)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where visitors come from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-12 w-full animate-pulse bg-muted rounded" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(userBehavior?.topReferrers || []).map(referrer => (
                          <div key={referrer.source} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{referrer.source}</p>
                              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${referrer.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="font-bold">{referrer.count}</p>
                              <p className="text-xs text-muted-foreground">{referrer.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="space-y-4 sm:space-y-6">
              <RecentActivityFeed
                events={overview?.recentEvents ?? []}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
