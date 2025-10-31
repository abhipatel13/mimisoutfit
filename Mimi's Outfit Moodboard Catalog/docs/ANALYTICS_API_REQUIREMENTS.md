# Analytics API Requirements - Complete Backend Specification

## Executive Summary

This document provides **complete API requirements** for implementing the analytics backend for The Lookbook by Mimi. The frontend is **100% ready** and already sending all necessary tracking data.

### Status
- ✅ **Frontend**: 100% Complete - User tracking, event batching, analytics service
- ⏳ **Backend**: Needs implementation (this document)
- 📊 **Dashboard**: Built and ready - needs real data

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Required API Endpoints](#required-api-endpoints)
4. [Request/Response Specifications](#requestresponse-specifications)
5. [Event Tracking System](#event-tracking-system)
6. [Analytics Calculations](#analytics-calculations)
7. [Implementation Examples](#implementation-examples)
8. [Performance Requirements](#performance-requirements)

---

## Overview

### What Frontend Sends

**Automatic Tracking** (Already Implemented):
- Every API request includes `X-User-ID` header with unique GUID
- User identifier persists across sessions (localStorage)
- Sent on ALL 28 endpoints (products, moodboards, search, etc.)

**Client-Side Event Tracking** (Already Implemented):
- Search queries with results count
- Favorite add/remove with product details
- Affiliate clicks with retailer information
- Events batched and sent every 5 seconds or 10 events
- Automatic flush on page unload

### What Backend Needs to Provide

**7 Analytics API Endpoints:**
1. `GET /admin/analytics/overview` - Dashboard overview metrics
2. `GET /admin/analytics/users` - User behavior analytics
3. `GET /admin/analytics/products/:id` - Individual product analytics
4. `GET /admin/analytics/timeseries` - Time series chart data
5. `GET /admin/analytics/categories` - Category distribution
6. `GET /admin/analytics/funnel` - Conversion funnel data
7. `GET /admin/analytics/trends` - Trend comparison data

**1 Event Tracking Endpoint:**
8. `POST /analytics/track` - Receive batched events from frontend

---

## Database Schema

### Primary Table: `analytics_events`

```sql
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  resource_name VARCHAR(255),
  metadata JSONB,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_composite (event_type, created_at, user_id)
);
```

### Event Types

```typescript
type AnalyticsEventType =
  | 'page_view'           // Homepage, about, etc.
  | 'product_view'        // Product detail page view
  | 'moodboard_view'      // Moodboard detail page view
  | 'search'              // Search query submitted
  | 'favorite_add'        // Product added to favorites
  | 'favorite_remove'     // Product removed from favorites
  | 'affiliate_click'     // "Shop Now" button clicked
  | 'filter_change'       // Product filters changed
  | 'sort_change';        // Product sort order changed
```

### Event Tracking Sources

**Server-Side (Middleware):**
- `page_view` - Any GET request to public pages
- `product_view` - GET `/products/:id` or `/products/slug/:slug`
- `moodboard_view` - GET `/moodboards/:id` or `/moodboards/slug/:slug`
- Extract from `X-User-ID` header on each request

**Client-Side (Analytics Service):**
- `search` - Search bar submission with query and results count
- `favorite_add` - Add product to favorites
- `favorite_remove` - Remove product from favorites
- `affiliate_click` - Click "Shop Now" button with retailer info
- Sent via `POST /analytics/track` endpoint

---

## Required API Endpoints

### 1. Analytics Overview - Dashboard Metrics

**Endpoint**: `GET /admin/analytics/overview`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
{
  metrics: {
    totalVisitors: number;          // COUNT(DISTINCT user_id)
    totalPageViews: number;         // COUNT(*) WHERE event_type = 'page_view'
    totalProductViews: number;      // COUNT(*) WHERE event_type = 'product_view'
    totalMoodboardViews: number;    // COUNT(*) WHERE event_type = 'moodboard_view'
    totalSearches: number;          // COUNT(*) WHERE event_type = 'search'
    totalFavorites: number;         // COUNT(*) WHERE event_type = 'favorite_add'
    totalAffiliateClicks: number;   // COUNT(*) WHERE event_type = 'affiliate_click'
    avgSessionDuration: number;     // Average in seconds
  };
  topProducts: [
    {
      id: string;
      name: string;
      slug: string;
      imageUrl: string;
      brand?: string;
      viewCount: number;           // Total views for this product
      uniqueViewers: number;       // Distinct users who viewed
      favoriteCount: number;       // Times added to favorites
      clickCount: number;          // Affiliate clicks
      conversionRate: number;      // (clicks / views) * 100
    }
  ];
  topMoodboards: [
    {
      id: string;
      title: string;
      slug: string;
      coverImage: string;
      viewCount: number;
      uniqueViewers: number;
      clickThroughRate: number;    // % of viewers who clicked products
    }
  ];
  topSearchTerms: [
    {
      term: string;                // Search query
      count: number;               // Times searched
      uniqueSearchers: number;     // Distinct users
      avgResultsCount: number;     // Avg results returned
    }
  ];
  recentEvents: [
    {
      id: string;
      userId: string;
      eventType: AnalyticsEventType;
      resourceType?: 'product' | 'moodboard';
      resourceId?: string;
      resourceName?: string;
      metadata?: Record<string, any>;
      createdAt: string;           // ISO 8601 timestamp
    }
  ];
}
```

**SQL Queries** (See [Analytics Calculations](#analytics-calculations))

---

### 2. User Behavior Analytics

**Endpoint**: `GET /admin/analytics/users`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
{
  newUsers: number;               // First-time visitors in period
  returningUsers: number;         // Users with previous activity
  avgPagesPerSession: number;     // Avg pages per user session
  avgSessionDuration: number;     // Avg session time in seconds
  topReferrers: [
    {
      source: string;             // Referrer domain or 'direct'
      count: number;              // Number of visits
      percentage: number;         // % of total traffic
    }
  ];
  userJourneys: [
    {
      path: string[];             // Array of pages visited
      count: number;              // Users who followed this path
      percentage: number;         // % of total users
    }
  ];
}
```

---

### 3. Individual Product Analytics

**Endpoint**: `GET /admin/analytics/products/:productId`

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `productId` - Product ID or slug

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
{
  productId: string;
  metrics: {
    views: number;
    uniqueViewers: number;
    favorites: number;
    clicks: number;
    conversionRate: number;
  };
  viewsByDay: [
    {
      date: string;              // YYYY-MM-DD
      count: number;             // Views on this day
    }
  ];
  clicksByDay: [
    {
      date: string;
      count: number;
    }
  ];
  viewerLocations?: [
    {
      country: string;
      count: number;
      percentage: number;
    }
  ];
}
```

---

### 4. Time Series Data - Chart Data

**Endpoint**: `GET /admin/analytics/timeseries`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
[
  {
    date: string;                 // YYYY-MM-DD
    views?: number;               // Product views
    clicks?: number;              // Affiliate clicks
    searches?: number;            // Search queries
    favorites?: number;           // Favorites added
    visitors?: number;            // Unique visitors
  }
]
```

**Purpose**: Powers TimeSeriesChart and TrafficAreaChart components

---

### 5. Category Distribution - Bar/Pie Charts

**Endpoint**: `GET /admin/analytics/categories`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
[
  {
    category: string;             // Product category name
    count: number;                // Views in this category
    percentage: number;           // % of total views
  }
]
```

**Purpose**: Powers CategoryBarChart and CategoryPieChart components

---

### 6. Conversion Funnel Data

**Endpoint**: `GET /admin/analytics/funnel`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
[
  {
    stage: string;                // Funnel stage name
    count: number;                // Users at this stage
    conversionRate: number;       // % from previous stage
    dropOffRate: number;          // % who didn't continue
  }
]
```

**Typical Stages**:
1. Visitors (total unique users)
2. Product Views (users who viewed products)
3. Favorites (users who favorited)
4. Affiliate Clicks (users who clicked "Shop Now")

**Purpose**: Powers ConversionFunnelChart component

---

### 7. Trend Comparison - Period over Period

**Endpoint**: `GET /admin/analytics/trends`

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
```typescript
{
  timeRange?: '7d' | '30d' | '90d'  // Default: '7d'
}
```

**Response** (`200 OK`):
```typescript
[
  {
    metric: string;               // Metric name
    current: number;              // Current period value
    previous: number;             // Previous period value
    change: number;               // Absolute change
    changePercentage: number;     // Percentage change
    trend: 'up' | 'down' | 'stable';  // Trend direction
  }
]
```

**Metrics to Compare**:
- Visitors
- Page Views
- Product Views
- Searches
- Favorites
- Affiliate Clicks

**Purpose**: Powers TrendComparisonChart component

---

### 8. Event Tracking Endpoint - Receive Client Events

**Endpoint**: `POST /analytics/track`

**Authentication**: NOT required (public endpoint)

**Headers**:
```http
X-User-ID: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
Content-Type: application/json
```

**Request Body**:
```typescript
{
  events: [
    {
      event: AnalyticsEventType;
      resourceType?: 'product' | 'moodboard';
      resourceId?: string;
      metadata?: Record<string, any>;
      timestamp: string;          // ISO 8601
      url: string;                // Current page URL
      referrer: string;           // Document referrer
    }
  ]
}
```

**Response** (`200 OK`):
```typescript
{
  success: true;
  eventsProcessed: number;
}
```

**Error Response** (`400 Bad Request`):
```typescript
{
  success: false;
  error: string;
}
```

**Example Request**:
```json
{
  "events": [
    {
      "event": "search",
      "metadata": {
        "query": "leather jacket",
        "resultsCount": 8,
        "category": "outerwear"
      },
      "timestamp": "2025-10-26T14:32:18.234Z",
      "url": "https://lookbook.example.com/products?search=leather+jacket",
      "referrer": "https://lookbook.example.com/"
    },
    {
      "event": "favorite_add",
      "resourceType": "product",
      "resourceId": "classic-trench-coat",
      "metadata": {
        "productName": "Classic Trench Coat",
        "brand": "Burberry",
        "price": 698
      },
      "timestamp": "2025-10-26T14:33:45.567Z",
      "url": "https://lookbook.example.com/products/classic-trench-coat",
      "referrer": "https://lookbook.example.com/products"
    },
    {
      "event": "affiliate_click",
      "resourceType": "product",
      "resourceId": "silk-midi-dress",
      "metadata": {
        "productName": "Silk Midi Dress",
        "retailer": "Nordstrom",
        "brand": "Reformation",
        "price": 278
      },
      "timestamp": "2025-10-26T14:35:22.890Z",
      "url": "https://lookbook.example.com/products/silk-midi-dress",
      "referrer": "https://lookbook.example.com/moodboards/parisian-chic"
    }
  ]
}
```

---

## Event Tracking System

### How Events are Generated

#### 1. Server-Side Tracking (Middleware)

**When**: On every GET request to public endpoints

**What to Track**:
- Extract `X-User-ID` from request headers
- Parse URL to determine event type and resource
- Log to `analytics_events` table

**Middleware Pseudocode**:
```javascript
function analyticsMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();
  
  const userId = req.headers['x-user-id'];
  if (!userId) return next();
  
  let eventType = 'page_view';
  let resourceType = null;
  let resourceId = null;
  
  // Parse URL
  if (req.path.startsWith('/products/slug/')) {
    eventType = 'product_view';
    resourceType = 'product';
    resourceId = extractSlugFromPath(req.path);
  } else if (req.path.startsWith('/moodboards/slug/')) {
    eventType = 'moodboard_view';
    resourceType = 'moodboard';
    resourceId = extractSlugFromPath(req.path);
  }
  
  // Log async (don't block request)
  logAnalyticsEvent({
    userId,
    eventType,
    resourceType,
    resourceId,
    url: req.originalUrl,
    referrer: req.headers.referer,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });
  
  next();
}
```

#### 2. Client-Side Tracking (Analytics Service)

**When**: User performs explicit actions

**Events Tracked**:
- `search` - Search query submitted
- `favorite_add` - Product added to favorites
- `favorite_remove` - Product removed from favorites
- `affiliate_click` - "Shop Now" button clicked

**How It Works**:
1. Frontend calls `analytics.track({ event, resourceType, resourceId, metadata })`
2. Event added to queue with timestamp, URL, referrer
3. Queue flushes every 5 seconds OR when 10 events accumulated
4. Batch sent to `POST /analytics/track` endpoint

**Already Implemented**:
- ✅ Search bar component tracks queries
- ✅ Favorites store tracks add/remove
- ✅ Affiliate redirect page tracks clicks
- ✅ Event batching and auto-flush
- ✅ Page unload flush

---

## Analytics Calculations

### 1. Total Visitors

```sql
SELECT COUNT(DISTINCT user_id) as total_visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### 2. Total Page Views

```sql
SELECT COUNT(*) as total_page_views
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '7 days';
```

### 3. Total Product Views

```sql
SELECT COUNT(*) as total_product_views
FROM analytics_events
WHERE event_type = 'product_view'
  AND created_at >= NOW() - INTERVAL '7 days';
```

### 4. Top Products

```sql
SELECT 
  ae.resource_id as product_id,
  p.name,
  p.slug,
  p.image_url,
  p.brand,
  COUNT(*) as view_count,
  COUNT(DISTINCT ae.user_id) as unique_viewers,
  COALESCE(fav.count, 0) as favorite_count,
  COALESCE(clicks.count, 0) as click_count,
  ROUND(COALESCE(clicks.count, 0)::NUMERIC / COUNT(*) * 100, 2) as conversion_rate
FROM analytics_events ae
JOIN products p ON ae.resource_id = p.slug
LEFT JOIN (
  SELECT resource_id, COUNT(*) as count
  FROM analytics_events
  WHERE event_type = 'favorite_add'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY resource_id
) fav ON ae.resource_id = fav.resource_id
LEFT JOIN (
  SELECT resource_id, COUNT(*) as count
  FROM analytics_events
  WHERE event_type = 'affiliate_click'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY resource_id
) clicks ON ae.resource_id = clicks.resource_id
WHERE ae.event_type = 'product_view'
  AND ae.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ae.resource_id, p.name, p.slug, p.image_url, p.brand, fav.count, clicks.count
ORDER BY view_count DESC
LIMIT 5;
```

### 5. Top Moodboards

```sql
SELECT 
  ae.resource_id as moodboard_id,
  m.title,
  m.slug,
  m.cover_image,
  COUNT(*) as view_count,
  COUNT(DISTINCT ae.user_id) as unique_viewers,
  ROUND(
    COALESCE(
      (SELECT COUNT(*)
       FROM analytics_events ae2
       WHERE ae2.user_id = ae.user_id
         AND ae2.event_type = 'product_view'
         AND ae2.created_at > ae.created_at
         AND ae2.created_at < ae.created_at + INTERVAL '1 hour')
      , 0
    )::NUMERIC / COUNT(*) * 100, 2
  ) as click_through_rate
FROM analytics_events ae
JOIN moodboards m ON ae.resource_id = m.slug
WHERE ae.event_type = 'moodboard_view'
  AND ae.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ae.resource_id, m.title, m.slug, m.cover_image
ORDER BY view_count DESC
LIMIT 3;
```

### 6. Top Search Terms

```sql
SELECT 
  metadata->>'query' as term,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_searchers,
  AVG((metadata->>'resultsCount')::INTEGER) as avg_results_count
FROM analytics_events
WHERE event_type = 'search'
  AND created_at >= NOW() - INTERVAL '7 days'
  AND metadata->>'query' IS NOT NULL
GROUP BY metadata->>'query'
ORDER BY count DESC
LIMIT 8;
```

### 7. Recent Events

```sql
SELECT 
  id,
  user_id,
  event_type,
  resource_type,
  resource_id,
  resource_name,
  metadata,
  created_at
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;
```

### 8. New vs Returning Users

```sql
WITH first_visit AS (
  SELECT user_id, MIN(created_at) as first_visit_at
  FROM analytics_events
  GROUP BY user_id
)
SELECT 
  COUNT(DISTINCT CASE 
    WHEN fv.first_visit_at >= NOW() - INTERVAL '7 days' 
    THEN ae.user_id 
  END) as new_users,
  COUNT(DISTINCT CASE 
    WHEN fv.first_visit_at < NOW() - INTERVAL '7 days' 
    THEN ae.user_id 
  END) as returning_users
FROM analytics_events ae
JOIN first_visit fv ON ae.user_id = fv.user_id
WHERE ae.created_at >= NOW() - INTERVAL '7 days';
```

### 9. Average Session Duration

```sql
WITH sessions AS (
  SELECT 
    user_id,
    DATE(created_at) as session_date,
    MAX(created_at) - MIN(created_at) as duration
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY user_id, DATE(created_at)
  HAVING COUNT(*) > 1
)
SELECT AVG(EXTRACT(EPOCH FROM duration)) as avg_session_duration_seconds
FROM sessions;
```

### 10. Time Series Data

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN id END) as views,
  COUNT(DISTINCT CASE WHEN event_type = 'affiliate_click' THEN id END) as clicks,
  COUNT(DISTINCT CASE WHEN event_type = 'search' THEN id END) as searches,
  COUNT(DISTINCT CASE WHEN event_type = 'favorite_add' THEN id END) as favorites,
  COUNT(DISTINCT user_id) as visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### 11. Category Distribution

```sql
SELECT 
  p.category,
  COUNT(*) as count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM analytics_events ae
JOIN products p ON ae.resource_id = p.slug
WHERE ae.event_type = 'product_view'
  AND ae.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.category
ORDER BY count DESC;
```

### 12. Conversion Funnel

```sql
WITH funnel AS (
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
  100.0 as conversion_rate,
  0.0 as drop_off_rate
FROM funnel
UNION ALL
SELECT 
  'Product Views',
  product_viewers,
  ROUND(product_viewers::NUMERIC / visitors * 100, 2),
  ROUND((visitors - product_viewers)::NUMERIC / visitors * 100, 2)
FROM funnel
UNION ALL
SELECT 
  'Favorites',
  favoriters,
  ROUND(favoriters::NUMERIC / product_viewers * 100, 2),
  ROUND((product_viewers - favoriters)::NUMERIC / product_viewers * 100, 2)
FROM funnel
UNION ALL
SELECT 
  'Affiliate Clicks',
  clickers,
  ROUND(clickers::NUMERIC / favoriters * 100, 2),
  ROUND((favoriters - clickers)::NUMERIC / favoriters * 100, 2)
FROM funnel;
```

---

## Implementation Examples

### Express.js + PostgreSQL

```javascript
// routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db');

// Analytics overview
router.get('/admin/analytics/overview', requireAuth, async (req, res) => {
  const { timeRange = '7d' } = req.query;
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  try {
    // Total metrics
    const metricsResult = await db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_visitors,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as total_page_views,
        COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) as total_product_views,
        COUNT(CASE WHEN event_type = 'moodboard_view' THEN 1 END) as total_moodboard_views,
        COUNT(CASE WHEN event_type = 'search' THEN 1 END) as total_searches,
        COUNT(CASE WHEN event_type = 'favorite_add' THEN 1 END) as total_favorites,
        COUNT(CASE WHEN event_type = 'affiliate_click' THEN 1 END) as total_affiliate_clicks
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `);
    
    // Top products (see SQL query above)
    const topProductsResult = await db.query(/* top products query */);
    
    // Top moodboards (see SQL query above)
    const topMoodboardsResult = await db.query(/* top moodboards query */);
    
    // Top search terms (see SQL query above)
    const topSearchesResult = await db.query(/* top searches query */);
    
    // Recent events (see SQL query above)
    const recentEventsResult = await db.query(/* recent events query */);
    
    // Calculate avg session duration
    const sessionDurationResult = await db.query(/* session duration query */);
    
    res.json({
      metrics: {
        ...metricsResult.rows[0],
        avgSessionDuration: sessionDurationResult.rows[0].avg_session_duration_seconds || 0
      },
      topProducts: topProductsResult.rows,
      topMoodboards: topMoodboardsResult.rows,
      topSearchTerms: topSearchesResult.rows,
      recentEvents: recentEventsResult.rows
    });
  } catch (error) {
    console.error('[Analytics] Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Event tracking endpoint
router.post('/analytics/track', async (req, res) => {
  const { events } = req.body;
  const userId = req.headers['x-user-id'];
  
  if (!userId || !events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  try {
    const values = events.map(event => [
      userId,
      event.event,
      event.resourceType || null,
      event.resourceId || null,
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.url,
      event.referrer,
      req.headers['user-agent'],
      req.ip,
      event.timestamp
    ]);
    
    const query = `
      INSERT INTO analytics_events 
      (user_id, event_type, resource_type, resource_id, metadata, url, referrer, user_agent, ip_address, created_at)
      VALUES ${values.map((_, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`).join(', ')}
    `;
    
    await db.query(query, values.flat());
    
    res.json({ success: true, eventsProcessed: events.length });
  } catch (error) {
    console.error('[Analytics] Error tracking events:', error);
    res.status(500).json({ error: 'Failed to track events' });
  }
});

module.exports = router;
```

### FastAPI + PostgreSQL (Python)

```python
# routes/analytics.py
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from models.analytics import AnalyticsOverview, AnalyticsEvent
from database import get_db
from auth import require_auth

router = APIRouter(prefix="/admin/analytics")

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    time_range: str = Query("7d", regex="^(7d|30d|90d)$"),
    current_user = Depends(require_auth),
    db = Depends(get_db)
):
    days = 7 if time_range == "7d" else 30 if time_range == "30d" else 90
    
    # Execute queries (see SQL examples above)
    metrics_query = """
        SELECT 
          COUNT(DISTINCT user_id) as total_visitors,
          COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as total_page_views,
          -- ... more metrics
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '%s days'
    """ % days
    
    metrics = await db.fetch_one(metrics_query)
    top_products = await db.fetch_all(top_products_query)
    # ... fetch other data
    
    return AnalyticsOverview(
        metrics=metrics,
        topProducts=top_products,
        # ... rest of data
    )

# Event tracking endpoint
@router.post("/track")
async def track_events(
    events: List[AnalyticsEvent],
    x_user_id: str = Header(..., alias="X-User-ID"),
    db = Depends(get_db)
):
    if not events:
        raise HTTPException(400, "No events provided")
    
    query = """
        INSERT INTO analytics_events 
        (user_id, event_type, resource_type, resource_id, metadata, url, referrer, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """
    
    values = [
        (
            x_user_id,
            event.event,
            event.resourceType,
            event.resourceId,
            json.dumps(event.metadata) if event.metadata else None,
            event.url,
            event.referrer,
            event.timestamp
        )
        for event in events
    ]
    
    await db.executemany(query, values)
    
    return {"success": True, "eventsProcessed": len(events)}
```

---

## Performance Requirements

### Response Times

| Endpoint | Target | Max Acceptable |
|----------|--------|----------------|
| `GET /admin/analytics/overview` | < 500ms | 1000ms |
| `GET /admin/analytics/users` | < 400ms | 800ms |
| `GET /admin/analytics/products/:id` | < 300ms | 600ms |
| `GET /admin/analytics/timeseries` | < 300ms | 600ms |
| `GET /admin/analytics/categories` | < 300ms | 600ms |
| `GET /admin/analytics/funnel` | < 300ms | 600ms |
| `GET /admin/analytics/trends` | < 300ms | 600ms |
| `POST /analytics/track` | < 100ms | 200ms |

### Optimization Strategies

1. **Database Indexes** (Already defined in schema)
   - `idx_user_id` - For user-specific queries
   - `idx_event_type` - For filtering by event type
   - `idx_created_at` - For time range filters
   - `idx_resource` - For resource lookups
   - `idx_composite` - For complex queries

2. **Query Optimization**
   - Use `COUNT(DISTINCT ...)` sparingly
   - Pre-calculate aggregates for common queries
   - Use materialized views for complex analytics

3. **Caching**
   - Cache overview metrics for 5 minutes
   - Cache top products/moodboards for 10 minutes
   - Cache time series data for 15 minutes
   - Invalidate on new data (optional)

4. **Async Processing**
   - Process `POST /analytics/track` asynchronously
   - Batch insert events every 5 seconds
   - Use queue (Redis, RabbitMQ) for high traffic

---

## Error Handling

### Standard Error Responses

**401 Unauthorized** (Analytics endpoints):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**400 Bad Request** (Track endpoint):
```json
{
  "error": "Bad Request",
  "message": "Missing X-User-ID header or invalid events array"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process analytics request"
}
```

---

## Testing Requirements

### Test Cases

1. **Analytics Overview**
   - ✅ Returns correct metrics for 7d/30d/90d
   - ✅ Top products sorted by view count
   - ✅ Top moodboards include click-through rate
   - ✅ Search terms sorted by count
   - ✅ Recent events sorted by timestamp

2. **User Behavior**
   - ✅ New vs returning users calculation
   - ✅ Session duration calculation
   - ✅ Referrer aggregation

3. **Product Analytics**
   - ✅ Correct metrics for specific product
   - ✅ Daily views and clicks arrays
   - ✅ Conversion rate calculation

4. **Event Tracking**
   - ✅ Accepts batch of events
   - ✅ Validates X-User-ID header
   - ✅ Handles missing metadata gracefully
   - ✅ Non-blocking insertion

5. **Edge Cases**
   - ✅ Empty results for new installations
   - ✅ Invalid time range defaults to 7d
   - ✅ Missing product/moodboard data
   - ✅ Duplicate events (idempotency)

---

## Security Considerations

1. **Authentication**
   - ✅ All analytics endpoints require JWT auth
   - ✅ Only admin users can access analytics
   - ✅ Track endpoint is public (no auth)

2. **Rate Limiting**
   - ✅ Track endpoint: 100 requests/minute per IP
   - ✅ Analytics endpoints: 60 requests/minute per user

3. **Data Privacy**
   - ✅ User IDs are anonymous GUIDs
   - ✅ IP addresses hashed or anonymized
   - ✅ No personally identifiable information

4. **Input Validation**
   - ✅ Validate event types against enum
   - ✅ Sanitize metadata JSON
   - ✅ Validate time range parameters

---

## Deployment Checklist

### Pre-Deployment

- [ ] Database table created with indexes
- [ ] Middleware or tracking logic implemented
- [ ] All 7 analytics endpoints implemented
- [ ] Event tracking endpoint implemented
- [ ] SQL queries tested and optimized
- [ ] Error handling implemented
- [ ] Authentication middleware configured
- [ ] Rate limiting configured

### Post-Deployment

- [ ] Verify events being logged to database
- [ ] Check analytics dashboard displays data
- [ ] Monitor query performance (< 500ms)
- [ ] Verify event batching works
- [ ] Test all time range filters (7d, 30d, 90d)
- [ ] Confirm charts render correctly

---

## Summary

### What's Ready on Frontend

✅ User tracking system (X-User-ID header)  
✅ Client-side analytics service  
✅ Event batching and auto-flush  
✅ Analytics dashboard UI  
✅ 6 chart components  
✅ All data types and interfaces  

### What Backend Needs to Build

1. **Database**: `analytics_events` table with indexes
2. **Middleware**: Automatic event logging from X-User-ID header
3. **7 Analytics Endpoints**: Overview, users, products, timeseries, categories, funnel, trends
4. **1 Tracking Endpoint**: Receive batched events from frontend
5. **SQL Queries**: 12+ queries for analytics calculations
6. **Authentication**: JWT verification for admin endpoints
7. **Performance**: Optimize queries, add caching, async processing

### Expected Timeline

- **Database Setup**: 1-2 hours
- **Middleware Implementation**: 2-3 hours
- **Analytics Endpoints**: 6-8 hours (1 hour per endpoint)
- **Event Tracking Endpoint**: 1-2 hours
- **Testing & Optimization**: 4-6 hours
- **Total**: 14-21 hours (2-3 days)

---

## Related Documentation

- **Complete Tracking Guide**: `/docs/ANALYTICS_TRACKING_IMPLEMENTATION.md`
- **User Tracking System**: `/docs/ANALYTICS_USER_TRACKING.md`
- **Dashboard Implementation**: `/docs/ANALYTICS_DASHBOARD_GUIDE.md`
- **Charts Guide**: `/docs/ADVANCED_CHARTS_GUIDE.md`
- **Backend API Spec**: `/docs/BACKEND_API_SPEC_UPDATED.md`
- **Admin API Spec**: `/docs/ADMIN_BACKEND_SPEC.md`

---

**Frontend Status**: ✅ 100% Complete  
**Backend Status**: ⏳ Awaiting Implementation  
**Documentation**: ✅ Complete and Ready  

The frontend is production-ready and waiting for backend analytics implementation! 🚀
