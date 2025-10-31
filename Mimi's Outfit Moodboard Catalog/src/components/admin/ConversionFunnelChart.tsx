/**
 * Conversion Funnel Chart
 * Shows user journey through different stages
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConversionFunnel } from '@/types/analytics.types';
import { TrendingDown } from 'lucide-react';

interface ConversionFunnelChartProps {
  data: ConversionFunnel[];
  title?: string;
  description?: string;
  loading?: boolean;
}

export function ConversionFunnelChart({
  data,
  title = 'Conversion Funnel',
  description = 'User journey and drop-off rates',
  loading = false,
}: ConversionFunnelChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const funnel = Array.isArray(data) ? data : [];

  if (funnel.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
            No funnel data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...funnel.map((d) => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {funnel.map((stage, index) => {
            const widthPercentage = (stage.count / maxCount) * 100;
            const isLast = index === funnel.length - 1;

            return (
              <div key={stage.stage} className="relative">
                {/* Stage Bar */}
                <div
                  className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-violet-500 to-violet-600 text-white transition-all hover:shadow-md"
                  style={{
                    width: `${Math.max(widthPercentage, 60)}%`,
                    minWidth: '150px',
                    marginLeft: window.innerWidth < 640 ? '0' : `${(100 - widthPercentage) / 2}%`,
                  }}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{stage.stage}</p>
                        <p className="text-xs sm:text-sm opacity-90">
                          {stage.count.toLocaleString()} users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold">
                          {stage.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] sm:text-xs opacity-90">conversion</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop-off Indicator */}
                {!isLast && stage.dropOffRate > 0 && (
                  <div className="flex items-center justify-center mt-2 mb-2">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span className="text-red-600 font-medium">
                        {stage.dropOffRate.toFixed(1)}% drop-off
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t">
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Total Entered</p>
            <p className="text-lg sm:text-2xl font-bold">{funnel[0]?.count?.toLocaleString?.()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-lg sm:text-2xl font-bold">
              {funnel[funnel.length - 1]?.count?.toLocaleString?.()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Overall Rate</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {funnel[funnel.length - 1]?.conversionRate?.toFixed?.(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
