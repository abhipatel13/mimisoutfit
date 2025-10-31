/**
 * Trend Comparison Chart
 * Shows current vs previous period trends
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendData } from '@/types/analytics.types';

interface TrendComparisonChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
  loading?: boolean;
}

export function TrendComparisonChart({
  data,
  title = 'Period Comparison',
  description = 'Current vs previous period',
  loading = false,
}: TrendComparisonChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.metric,
    Current: item.current,
    Previous: item.previous,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Current" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Previous" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Trend Details */}
        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          {data.map((item) => {
            const TrendIcon =
              item.trend === 'up'
                ? TrendingUp
                : item.trend === 'down'
                ? TrendingDown
                : Minus;
            const trendColor =
              item.trend === 'up'
                ? 'text-green-600'
                : item.trend === 'down'
                ? 'text-red-600'
                : 'text-gray-600';

            return (
              <div
                key={item.metric}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <TrendIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${trendColor} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{item.metric}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {item.current.toLocaleString()} vs {item.previous.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm sm:text-lg font-bold ${trendColor}`}>
                    {item.change > 0 ? '+' : ''}
                    {item.change.toLocaleString()}
                  </p>
                  <p className={`text-xs sm:text-sm ${trendColor}`}>
                    {item.changePercentage > 0 ? '+' : ''}
                    {item.changePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
