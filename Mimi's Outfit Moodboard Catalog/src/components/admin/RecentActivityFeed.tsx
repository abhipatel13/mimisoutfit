/**
 * Recent Activity Feed Component
 * Shows recent user events in real-time
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Search, Heart, ExternalLink, Grid3x3 } from 'lucide-react';
import type { AnalyticsEventRecord } from '@/types/analytics.types';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedProps {
  events: AnalyticsEventRecord[];
  loading?: boolean;
}

export function RecentActivityFeed({ events, loading }: RecentActivityFeedProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'product_view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'moodboard_view':
        return <Grid3x3 className="w-4 h-4 text-purple-500" />;
      case 'search':
        return <Search className="w-4 h-4 text-amber-500" />;
      case 'favorite_add':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'affiliate_click':
        return <ExternalLink className="w-4 h-4 text-green-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventText = (event: AnalyticsEventRecord): string => {
    switch (event.eventType) {
      case 'product_view':
        return `Viewed ${event.resourceName || 'product'}`;
      case 'moodboard_view':
        return `Viewed ${event.resourceName || 'moodboard'}`;
      case 'search':
        return `Searched for "${event.metadata?.query || 'unknown'}"`;
      case 'favorite_add':
        return `Added ${event.resourceName || 'product'} to favorites`;
      case 'affiliate_click':
        return `Clicked ${event.resourceName || 'product'} link`;
      default:
        return event.eventType;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live user events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full animate-pulse bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                  <div className="h-3 w-1/4 animate-pulse bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Live user events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {events.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
              No recent activity
            </p>
          ) : (
            events.map(event => (
              <div key={event.id} className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1 p-1.5 sm:p-2 rounded-full bg-muted flex-shrink-0">
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {getEventText(event)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    {' • '}
                    <span className="hidden sm:inline">{event.userId.substring(0, 8)}...</span>
                    <span className="inline sm:hidden">{event.userId.substring(0, 6)}...</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
