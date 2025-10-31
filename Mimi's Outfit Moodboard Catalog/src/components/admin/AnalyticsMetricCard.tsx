/**
 * Analytics Metric Card Component
 * Displays a single metric with icon and trend
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsMetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  loading?: boolean;
  trend?: {
    value: number; // percentage
    direction: 'up' | 'down';
  };
  className?: string;
}

export function AnalyticsMetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  loading,
  trend,
  className,
}: AnalyticsMetricCardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 sm:h-8 w-20 sm:w-24 animate-pulse bg-muted rounded" />
            {subtitle && <div className="h-3 w-16 sm:w-20 animate-pulse bg-muted rounded" />}
          </div>
        ) : (
          <>
            <div className="text-xl sm:text-2xl font-bold">{formatValue(value)}</div>
            {(subtitle || trend) && (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                {subtitle && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
                {trend && (
                  <span
                    className={cn(
                      'text-[10px] sm:text-xs font-medium flex-shrink-0',
                      trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
