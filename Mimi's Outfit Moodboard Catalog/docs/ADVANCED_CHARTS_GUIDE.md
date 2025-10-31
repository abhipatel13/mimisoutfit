# Advanced Charts & Visualizations Guide

**Complete guide to the analytics dashboard's advanced charts and visualizations**

## Table of Contents
1. [Overview](#overview)
2. [Chart Components](#chart-components)
3. [Data Flow](#data-flow)
4. [Customization](#customization)
5. [Integration Examples](#integration-examples)
6. [Backend Implementation](#backend-implementation)

---

## Overview

The analytics dashboard now features **6 advanced chart components** powered by Recharts, providing comprehensive data visualization for user behavior, traffic patterns, and conversion metrics.

### Key Features
- ✅ **Responsive Design** - Auto-scales to container width
- ✅ **Interactive Tooltips** - Hover for detailed metrics
- ✅ **Smooth Animations** - Professional transitions
- ✅ **Loading States** - Skeleton placeholders during data fetch
- ✅ **Theming Support** - Matches app's color scheme
- ✅ **Time Range Filtering** - 7d, 30d, 90d views
- ✅ **Mock/Real Mode** - Works in development and production

### Library
All charts use **Recharts** (v2.15.3) - a composable charting library built on React components.

---

## Chart Components

### 1. Traffic Area Chart 📊
**File**: `/src/components/admin/TrafficAreaChart.tsx`

**Purpose**: Shows visitor traffic patterns over time with gradient-filled areas.

**Data Type**:
```typescript
interface TimeSeriesData {
  date: string;           // YYYY-MM-DD
  visitors?: number;
  views?: number;
  clicks?: number;
  searches?: number;
  favorites?: number;
}
```

**Features**:
- Dual area chart (visitors + page views)
- Gradient fills with opacity
- Date formatting on X-axis
- Smooth curves with `type="monotone"`

**Usage**:
```tsx
import { TrafficAreaChart } from '@/components/admin/TrafficAreaChart';

<TrafficAreaChart
  data={timeSeriesData}
  title="Traffic Overview"
  description="Visitor traffic patterns over time"
  loading={loading}
/>
```

**Visual Style**:
- Purple gradient for visitors (`#8b5cf6`)
- Green gradient for views (`#10b981`)
- Smooth area curves with opacity fade

---

### 2. Time Series Line Chart 📈
**File**: `/src/components/admin/TimeSeriesChart.tsx`

**Purpose**: Displays multiple metrics over time as line graphs (views, clicks, searches).

**Data Type**: Same as Traffic Area Chart (`TimeSeriesData[]`)

**Features**:
- Multi-line support (up to 3+ metrics)
- Configurable metrics via props
- Dot markers on data points
- Active dot hover effect

**Usage**:
```tsx
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';

<TimeSeriesChart
  data={timeSeriesData}
  title="Activity Trends"
  description="Daily views, clicks, and searches"
  loading={loading}
  metrics={[
    { key: 'views', label: 'Views', color: '#8b5cf6' },
    { key: 'clicks', label: 'Clicks', color: '#10b981' },
    { key: 'searches', label: 'Searches', color: '#f59e0b' },
  ]}
/>
```

**Default Metrics**:
```typescript
const defaultMetrics = [
  { key: 'views', label: 'Views', color: '#8b5cf6' },       // purple
  { key: 'clicks', label: 'Clicks', color: '#10b981' },     // green
  { key: 'searches', label: 'Searches', color: '#f59e0b' }, // amber
];
```

---

### 3. Category Bar Chart 📊
**File**: `/src/components/admin/CategoryBarChart.tsx`

**Purpose**: Shows distribution of views/clicks across product categories.

**Data Type**:
```typescript
interface CategoryDistribution {
  category: string;      // e.g., "Dresses", "Outerwear"
  count: number;         // Total views/clicks
  percentage: number;    // Percentage of total
}
```

**Features**:
- Vertical bars with rounded tops
- Different color per category
- Angled X-axis labels for readability
- CartesianGrid for reference lines

**Usage**:
```tsx
import { CategoryBarChart } from '@/components/admin/CategoryBarChart';

<CategoryBarChart
  data={categoryData}
  title="Category Distribution"
  description="Views and clicks by category"
  loading={loading}
  colors={['#8b5cf6', '#10b981', '#f59e0b', '#ef4444']}
/>
```

**Color Palette**:
```typescript
const defaultColors = [
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];
```

---

### 4. Category Pie Chart 🥧
**File**: `/src/components/admin/CategoryPieChart.tsx`

**Purpose**: Displays category breakdown as percentage slices.

**Data Type**: Same as Category Bar Chart (`CategoryDistribution[]`)

**Features**:
- Percentage labels on slices
- Color-coded segments
- Hover tooltips with counts
- Legend with category names

**Usage**:
```tsx
import { CategoryPieChart } from '@/components/admin/CategoryPieChart';

<CategoryPieChart
  data={categoryData}
  title="Category Breakdown"
  description="Percentage distribution by category"
  loading={loading}
/>
```

**Label Formatting**:
```typescript
const renderLabel = (entry: CategoryDistribution) => {
  return `${entry.category}: ${entry.percentage.toFixed(1)}%`;
};
```

---

### 5. Conversion Funnel Chart 🎯
**File**: `/src/components/admin/ConversionFunnelChart.tsx`

**Purpose**: Visualizes user journey through conversion stages with drop-off rates.

**Data Type**:
```typescript
interface ConversionFunnel {
  stage: string;          // e.g., "Visitors", "Product Views"
  count: number;          // Users at this stage
  conversionRate: number; // Percentage converted (0-100)
  dropOffRate: number;    // Percentage dropped off (0-100)
}
```

**Features**:
- Horizontal funnel bars (width proportional to count)
- Gradient purple background
- Drop-off indicators between stages
- Summary stats (total entered, completed, overall rate)

**Usage**:
```tsx
import { ConversionFunnelChart } from '@/components/admin/ConversionFunnelChart';

<ConversionFunnelChart
  data={funnelData}
  title="Conversion Funnel"
  description="User journey and drop-off rates"
  loading={loading}
/>
```

**Example Data**:
```typescript
const funnelData = [
  { stage: 'Visitors', count: 1243, conversionRate: 100, dropOffRate: 0 },
  { stage: 'Product Views', count: 876, conversionRate: 70.5, dropOffRate: 29.5 },
  { stage: 'Favorites', count: 234, conversionRate: 26.7, dropOffRate: 73.3 },
  { stage: 'Affiliate Clicks', count: 156, conversionRate: 66.7, dropOffRate: 33.3 },
];
```

**Visual Design**:
- Centered alignment with margin calculation
- Red drop-off indicators with TrendingDown icon
- Green final conversion rate
- White text on gradient background

---

### 6. Trend Comparison Chart 📊
**File**: `/src/components/admin/TrendComparisonChart.tsx`

**Purpose**: Compares current period metrics vs previous period with trend indicators.

**Data Type**:
```typescript
interface TrendData {
  metric: string;         // e.g., "Visitors", "Page Views"
  current: number;        // Current period value
  previous: number;       // Previous period value
  change: number;         // Absolute change (current - previous)
  changePercentage: number; // Percentage change
  trend: 'up' | 'down' | 'stable'; // Trend direction
}
```

**Features**:
- Side-by-side bar comparison (Current vs Previous)
- Trend icons (TrendingUp, TrendingDown, Minus)
- Color-coded trend indicators (green/red/gray)
- Detailed list view below chart

**Usage**:
```tsx
import { TrendComparisonChart } from '@/components/admin/TrendComparisonChart';

<TrendComparisonChart
  data={trendData}
  title="Period Comparison"
  description="Current vs previous period"
  loading={loading}
/>
```

**Example Data**:
```typescript
const trendData = [
  {
    metric: 'Visitors',
    current: 1243,
    previous: 1089,
    change: 154,
    changePercentage: 14.1,
    trend: 'up'
  },
  // ...more metrics
];
```

**Trend Logic**:
```typescript
const calculateTrend = (current: number, previous: number) => {
  const change = current - previous;
  const changePercentage = previous === 0 ? 0 : (change / previous) * 100;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercentage > 5) trend = 'up';
  else if (changePercentage < -5) trend = 'down';
  return { change, changePercentage, trend };
};
```

---

## Data Flow

### Architecture Overview
```
User Action → Analytics API → Chart Component → Recharts Library → Rendered Chart
```

### 1. User Interaction
```typescript
// User selects time range (7d, 30d, 90d)
const [timeRange, setTimeRange] = useState<TimeRange>('7d');
```

### 2. API Data Fetch
```typescript
// Load all chart data
const loadAnalytics = async () => {
  const [
    timeSeriesResult,
    categoryResult,
    funnelResult,
    trendResult,
  ] = await Promise.all([
    analyticsApi.getTimeSeriesData(timeRange),
    analyticsApi.getCategoryDistribution(timeRange),
    analyticsApi.getConversionFunnel(timeRange),
    analyticsApi.getTrendData(timeRange),
  ]);
  
  setTimeSeriesData(timeSeriesResult);
  setCategoryData(categoryResult);
  setFunnelData(funnelResult);
  setTrendData(trendResult);
};
```

### 3. Component Rendering
```tsx
<TimeSeriesChart
  data={timeSeriesData}  // Pass fetched data
  loading={loading}      // Show skeleton during load
  title="Activity Trends"
/>
```

### 4. Recharts Processing
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* Recharts automatically processes data array */}
    <Line dataKey="views" stroke="#8b5cf6" />
  </LineChart>
</ResponsiveContainer>
```

---

## Customization

### Changing Chart Colors

**Individual Chart**:
```tsx
<TimeSeriesChart
  data={data}
  metrics={[
    { key: 'views', label: 'Views', color: '#ff0000' },  // Custom red
    { key: 'clicks', label: 'Clicks', color: '#00ff00' }, // Custom green
  ]}
/>
```

**Category Colors**:
```tsx
<CategoryBarChart
  data={data}
  colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731']}
/>
```

### Adjusting Chart Height

All charts use `ResponsiveContainer` with configurable height:

```tsx
// In component file, change height prop
<ResponsiveContainer width="100%" height={400}>  // Taller chart
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

### Custom Tooltips

Replace default tooltip with custom styling:

```tsx
<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    padding: '12px',
  }}
  formatter={(value: number, name: string) => [
    `${value.toLocaleString()} users`,
    name
  ]}
  labelFormatter={(label) => `Date: ${label}`}
/>
```

### Adding New Metrics

**Step 1**: Update TypeScript type
```typescript
// In analytics.types.ts
export interface TimeSeriesData {
  date: string;
  views?: number;
  clicks?: number;
  newMetric?: number;  // Add new field
}
```

**Step 2**: Update API mock data
```typescript
// In analytics.api.ts
return {
  date: date.toISOString().split('T')[0],
  views: Math.floor(Math.random() * 100),
  newMetric: Math.floor(Math.random() * 50),  // Add data
};
```

**Step 3**: Add to chart
```tsx
<TimeSeriesChart
  metrics={[
    { key: 'views', label: 'Views', color: '#8b5cf6' },
    { key: 'newMetric', label: 'New Metric', color: '#ec4899' },
  ]}
/>
```

---

## Integration Examples

### Full Analytics Dashboard Page

```tsx
import { useState, useEffect } from 'react';
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';
import { CategoryBarChart } from '@/components/admin/CategoryBarChart';
import { ConversionFunnelChart } from '@/components/admin/ConversionFunnelChart';
import { analyticsApi } from '@/services/api/analytics.api';
import type { TimeRange } from '@/types/analytics.types';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ts, cat, fun] = await Promise.all([
        analyticsApi.getTimeSeriesData(timeRange),
        analyticsApi.getCategoryDistribution(timeRange),
        analyticsApi.getConversionFunnel(timeRange),
      ]);
      setTimeSeriesData(ts);
      setCategoryData(cat);
      setFunnelData(fun);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
      </Select>

      {/* Charts Grid */}
      <div className="grid gap-6">
        <TimeSeriesChart data={timeSeriesData} loading={loading} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryBarChart data={categoryData} loading={loading} />
          <ConversionFunnelChart data={funnelData} loading={loading} />
        </div>
      </div>
    </div>
  );
}
```

### Embedding Single Chart

```tsx
import { TimeSeriesChart } from '@/components/admin/TimeSeriesChart';

function QuickStats() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Fetch data
    fetchTimeSeriesData().then(setData);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <TimeSeriesChart
          data={data}
          title="Last 7 Days"
          metrics={[{ key: 'views', label: 'Views', color: '#8b5cf6' }]}
        />
      </CardContent>
    </Card>
  );
}
```

---

## Backend Implementation

### Required API Endpoints

#### 1. Time Series Data
```
GET /admin/analytics/timeseries?timeRange=7d
```

**Response**:
```json
[
  {
    "date": "2025-10-20",
    "views": 145,
    "clicks": 32,
    "searches": 18,
    "favorites": 12,
    "visitors": 98
  },
  // ...more days
]
```

**SQL Query Example**:
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'affiliate_click' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'search' THEN 1 END) as searches,
  COUNT(CASE WHEN event_type = 'favorite_add' THEN 1 END) as favorites,
  COUNT(DISTINCT user_id) as visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

#### 2. Category Distribution
```
GET /admin/analytics/categories?timeRange=7d
```

**Response**:
```json
[
  {
    "category": "Dresses",
    "count": 342,
    "percentage": 28.5
  },
  // ...more categories
]
```

**SQL Query Example**:
```sql
WITH category_counts AS (
  SELECT 
    p.category,
    COUNT(*) as count
  FROM analytics_events ae
  JOIN products p ON ae.resource_id = p.id
  WHERE ae.event_type = 'product_view'
    AND ae.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY p.category
),
total AS (
  SELECT SUM(count) as total_count FROM category_counts
)
SELECT 
  c.category,
  c.count,
  ROUND((c.count::numeric / t.total_count) * 100, 1) as percentage
FROM category_counts c
CROSS JOIN total t
ORDER BY c.count DESC;
```

#### 3. Conversion Funnel
```
GET /admin/analytics/funnel?timeRange=7d
```

**Response**:
```json
[
  {
    "stage": "Visitors",
    "count": 1243,
    "conversionRate": 100,
    "dropOffRate": 0
  },
  {
    "stage": "Product Views",
    "count": 876,
    "conversionRate": 70.5,
    "dropOffRate": 29.5
  },
  // ...more stages
]
```

**SQL Query Example**:
```sql
WITH funnel_stages AS (
  SELECT
    COUNT(DISTINCT user_id) as visitors,
    COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN user_id END) as product_viewers,
    COUNT(DISTINCT CASE WHEN event_type = 'favorite_add' THEN user_id END) as favoriters,
    COUNT(DISTINCT CASE WHEN event_type = 'affiliate_click' THEN user_id END) as clickers
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  'Visitors' as stage,
  visitors as count,
  100.0 as conversionRate,
  0.0 as dropOffRate
FROM funnel_stages
UNION ALL
SELECT 
  'Product Views',
  product_viewers,
  ROUND((product_viewers::numeric / visitors) * 100, 1),
  ROUND(((visitors - product_viewers)::numeric / visitors) * 100, 1)
FROM funnel_stages
-- ...more stages
```

#### 4. Trend Data
```
GET /admin/analytics/trends?timeRange=7d
```

**Response**:
```json
[
  {
    "metric": "Visitors",
    "current": 1243,
    "previous": 1089,
    "change": 154,
    "changePercentage": 14.1,
    "trend": "up"
  },
  // ...more metrics
]
```

**SQL Query Example**:
```sql
WITH current_period AS (
  SELECT
    COUNT(DISTINCT user_id) as visitors,
    COUNT(*) as page_views
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
),
previous_period AS (
  SELECT
    COUNT(DISTINCT user_id) as visitors,
    COUNT(*) as page_views
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '14 days'
    AND created_at < NOW() - INTERVAL '7 days'
)
SELECT
  'Visitors' as metric,
  c.visitors as current,
  p.visitors as previous,
  (c.visitors - p.visitors) as change,
  ROUND(((c.visitors - p.visitors)::numeric / NULLIF(p.visitors, 0)) * 100, 1) as changePercentage,
  CASE
    WHEN ((c.visitors - p.visitors)::numeric / NULLIF(p.visitors, 0)) * 100 > 5 THEN 'up'
    WHEN ((c.visitors - p.visitors)::numeric / NULLIF(p.visitors, 0)) * 100 < -5 THEN 'down'
    ELSE 'stable'
  END as trend
FROM current_period c, previous_period p;
```

---

## Performance Optimization

### 1. Data Caching
Cache API responses to reduce database load:

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Debounced Refresh
Prevent excessive API calls on time range changes:

```typescript
import { useEffect, useRef } from 'react';

function useDebounce(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  };
}

// Usage
const debouncedLoad = useDebounce(loadData, 300);
useEffect(() => {
  debouncedLoad();
}, [timeRange]);
```

### 3. Lazy Loading Charts
Load charts only when tab is active:

```tsx
<TabsContent value="charts">
  {activeTab === 'charts' && (
    <>
      <TimeSeriesChart data={data} />
      <CategoryBarChart data={categoryData} />
    </>
  )}
</TabsContent>
```

---

## Troubleshooting

### Chart Not Rendering
**Issue**: Chart shows blank/empty space
**Solution**: Check data format and ensure array length > 0

```typescript
// Before passing to chart
console.log('Chart data:', timeSeriesData);
console.log('Data length:', timeSeriesData.length);
console.log('Sample item:', timeSeriesData[0]);
```

### Tooltips Not Showing
**Issue**: Hover tooltips don't appear
**Solution**: Ensure parent container has overflow visible

```css
.chart-container {
  overflow: visible !important; /* Allow tooltips to escape bounds */
}
```

### Colors Not Applying
**Issue**: Custom colors prop ignored
**Solution**: Check color format (use hex or rgb, not CSS variables)

```tsx
// ❌ Wrong
colors={['var(--primary)', 'var(--secondary)']}

// ✅ Correct
colors={['#8b5cf6', '#10b981']}
```

### Responsive Issues
**Issue**: Chart doesn't resize on mobile
**Solution**: Ensure parent container has width set

```tsx
<div className="w-full"> {/* Full width container */}
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

---

## Summary

You now have **6 production-ready chart components** for the analytics dashboard:

✅ **Traffic Area Chart** - Traffic patterns with gradient fills  
✅ **Time Series Line Chart** - Multi-metric trends over time  
✅ **Category Bar Chart** - Category distribution with colors  
✅ **Category Pie Chart** - Percentage breakdown  
✅ **Conversion Funnel** - User journey visualization  
✅ **Trend Comparison** - Period-over-period comparison  

**Key Benefits**:
- 🎨 Professional visualizations out of the box
- 📱 Fully responsive on all devices
- 🔄 Real-time updates with time range filtering
- 🎭 Smooth animations and transitions
- 📊 Interactive tooltips and legends
- 🛡️ TypeScript type safety throughout
- 🔌 Mock/real mode support

**Next Steps**:
1. Customize colors to match your brand
2. Add more metrics to time series charts
3. Implement backend API endpoints
4. Add export functionality (CSV, PNG)
5. Create drill-down views for detailed analysis

For more help, see:
- [Analytics Dashboard Guide](/docs/ANALYTICS_DASHBOARD_GUIDE.md)
- [Analytics API Documentation](/docs/BACKEND_API_SPEC_UPDATED.md)
- [Recharts Documentation](https://recharts.org)
