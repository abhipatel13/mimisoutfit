# Backend Analytics API Implementation Guide

**Complete implementation guide for analytics endpoints with database queries**

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [SQL Queries](#sql-queries)
5. [Implementation Examples](#implementation-examples)
6. [Performance Optimization](#performance-optimization)
7. [Testing](#testing)

---

## Overview

### Architecture

```
Frontend (X-User-ID header) 
    ↓
Analytics Endpoints
    ↓
Database Queries
    ↓
Aggregated Metrics
```

### Key Features

- **User Tracking**: Every request includes `X-User-ID` header
- **Event Logging**: Track views, searches, favorites, clicks
- **Time-Based Filtering**: 7d, 30d, 90d ranges
- **Real-Time Metrics**: Session duration, bounce rate, conversion
- **Popular Content**: Top products, moodboards, searches

---

## Database Schema

### 1. Analytics Events Table

**PostgreSQL:**
```sql
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- UUID from X-User-ID header
    event_type VARCHAR(50) NOT NULL,  -- 'page_view', 'product_view', 'search', etc.
    event_data JSONB,  -- Flexible event metadata
    product_id BIGINT,  -- FK to products (nullable)
    moodboard_id BIGINT,  -- FK to moodboards (nullable)
    session_id VARCHAR(36),  -- Session tracking
    ip_address VARCHAR(45),  -- For analytics (anonymized)
    user_agent TEXT,  -- Browser/device info
    referrer TEXT,  -- Traffic source
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_product_id (product_id),
    INDEX idx_moodboard_id (moodboard_id),
    INDEX idx_composite (event_type, created_at, user_id)
);
```

**MySQL:**
```sql
CREATE TABLE analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    product_id BIGINT,
    moodboard_id BIGINT,
    session_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_product_id (product_id),
    INDEX idx_moodboard_id (moodboard_id),
    INDEX idx_composite (event_type, created_at, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. User Sessions Table (Optional - for advanced analytics)

```sql
CREATE TABLE user_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP NOT NULL,
    page_views INT DEFAULT 0,
    is_new_user BOOLEAN DEFAULT false,
    
    INDEX idx_user_id (user_id),
    INDEX idx_started_at (started_at)
);
```

---

## API Endpoints

### 1. Analytics Overview

**Endpoint:** `GET /api/admin/analytics/overview`

**Query Parameters:**
- `timeRange` (optional): `7d` | `30d` | `90d` (default: `30d`)

**Response:**
```json
{
  "totalVisitors": 1250,
  "totalPageViews": 8450,
  "totalProductViews": 3200,
  "totalSearches": 890,
  "totalFavorites": 450,
  "totalAffiliateClicks": 320,
  "avgSessionDuration": 245,
  "bounceRate": 42.5,
  "timeRange": "30d"
}
```

---

### 2. User Behavior Analytics

**Endpoint:** `GET /api/admin/analytics/user-behavior`

**Query Parameters:**
- `timeRange` (optional): `7d` | `30d` | `90d` (default: `30d`)

**Response:**
```json
{
  "newUsers": 450,
  "returningUsers": 800,
  "avgSessionDuration": 245,
  "avgPagesPerSession": 4.2,
  "trafficSources": [
    { "source": "Direct", "visitors": 580, "percentage": 46.4 },
    { "source": "Google", "visitors": 420, "percentage": 33.6 },
    { "source": "Instagram", "visitors": 180, "percentage": 14.4 },
    { "source": "Other", "visitors": 70, "percentage": 5.6 }
  ],
  "timeRange": "30d"
}
```

---

### 3. Product Analytics

**Endpoint:** `GET /api/admin/analytics/products`

**Query Parameters:**
- `timeRange` (optional): `7d` | `30d` | `90d` (default: `30d`)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "topProducts": [
    {
      "id": 1,
      "name": "Classic Trench Coat",
      "views": 450,
      "favorites": 120,
      "clicks": 85,
      "conversionRate": 18.9,
      "imageUrl": "https://...",
      "price": 198
    }
  ],
  "topSearches": [
    { "term": "trench coat", "count": 120, "uniqueSearchers": 85 },
    { "term": "denim jacket", "count": 95, "uniqueSearchers": 72 }
  ],
  "timeRange": "30d"
}
```

---

### 4. Moodboard Analytics

**Endpoint:** `GET /api/admin/analytics/moodboards`

**Query Parameters:**
- `timeRange` (optional): `7d` | `30d` | `90d` (default: `30d`)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "topMoodboards": [
    {
      "id": 1,
      "title": "Parisian Chic",
      "views": 850,
      "clicks": 320,
      "clickThroughRate": 37.6,
      "coverImage": "https://..."
    }
  ],
  "timeRange": "30d"
}
```

---

### 5. Recent Activity

**Endpoint:** `GET /api/admin/analytics/recent-activity`

**Query Parameters:**
- `limit` (optional): number (default: 20)

**Response:**
```json
{
  "events": [
    {
      "id": 12345,
      "type": "product_view",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Classic Trench Coat",
      "timestamp": "2025-10-26T14:32:10Z"
    },
    {
      "id": 12344,
      "type": "search",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "searchTerm": "denim jacket",
      "timestamp": "2025-10-26T14:31:45Z"
    }
  ]
}
```

---

## SQL Queries

### 1. Analytics Overview Queries

#### Total Visitors (Unique Users)
```sql
-- PostgreSQL
SELECT COUNT(DISTINCT user_id) as total_visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days';

-- MySQL
SELECT COUNT(DISTINCT user_id) as total_visitors
FROM analytics_events
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

#### Total Page Views
```sql
SELECT COUNT(*) as total_page_views
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '30 days';
```

#### Total Product Views
```sql
SELECT COUNT(*) as total_product_views
FROM analytics_events
WHERE event_type = 'product_view'
  AND created_at >= NOW() - INTERVAL '30 days';
```

#### Total Searches
```sql
SELECT COUNT(*) as total_searches
FROM analytics_events
WHERE event_type = 'search'
  AND created_at >= NOW() - INTERVAL '30 days';
```

#### Total Favorites
```sql
SELECT COUNT(*) as total_favorites
FROM analytics_events
WHERE event_type = 'favorite_add'
  AND created_at >= NOW() - INTERVAL '30 days';
```

#### Total Affiliate Clicks
```sql
SELECT COUNT(*) as total_clicks
FROM analytics_events
WHERE event_type = 'affiliate_click'
  AND created_at >= NOW() - INTERVAL '30 days';
```

#### Average Session Duration (seconds)
```sql
-- Using session tracking
SELECT AVG(
  EXTRACT(EPOCH FROM (last_activity - started_at))
) as avg_duration
FROM user_sessions
WHERE started_at >= NOW() - INTERVAL '30 days';

-- Alternative: Calculate from page views
WITH session_durations AS (
  SELECT 
    user_id,
    session_id,
    EXTRACT(EPOCH FROM (
      MAX(created_at) - MIN(created_at)
    )) as duration
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id, session_id
  HAVING COUNT(*) > 1
)
SELECT AVG(duration) as avg_duration
FROM session_durations;
```

#### Bounce Rate (%)
```sql
WITH session_page_counts AS (
  SELECT 
    session_id,
    COUNT(*) as page_count
  FROM analytics_events
  WHERE event_type = 'page_view'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY session_id
)
SELECT 
  (COUNT(CASE WHEN page_count = 1 THEN 1 END) * 100.0 / COUNT(*)) as bounce_rate
FROM session_page_counts;
```

---

### 2. User Behavior Queries

#### New vs Returning Users
```sql
WITH user_first_seen AS (
  SELECT 
    user_id,
    MIN(created_at) as first_seen
  FROM analytics_events
  GROUP BY user_id
),
period_users AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  COUNT(CASE 
    WHEN ufs.first_seen >= NOW() - INTERVAL '30 days' 
    THEN 1 
  END) as new_users,
  COUNT(CASE 
    WHEN ufs.first_seen < NOW() - INTERVAL '30 days' 
    THEN 1 
  END) as returning_users
FROM period_users pu
JOIN user_first_seen ufs ON pu.user_id = ufs.user_id;
```

#### Average Pages Per Session
```sql
WITH session_counts AS (
  SELECT 
    session_id,
    COUNT(*) as page_count
  FROM analytics_events
  WHERE event_type = 'page_view'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY session_id
)
SELECT AVG(page_count) as avg_pages_per_session
FROM session_counts;
```

#### Traffic Sources
```sql
WITH traffic_data AS (
  SELECT 
    CASE 
      WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
      WHEN referrer LIKE '%google%' THEN 'Google'
      WHEN referrer LIKE '%instagram%' THEN 'Instagram'
      WHEN referrer LIKE '%facebook%' THEN 'Facebook'
      WHEN referrer LIKE '%pinterest%' THEN 'Pinterest'
      ELSE 'Other'
    END as source,
    user_id
  FROM analytics_events
  WHERE event_type = 'page_view'
    AND created_at >= NOW() - INTERVAL '30 days'
),
source_counts AS (
  SELECT 
    source,
    COUNT(DISTINCT user_id) as visitor_count
  FROM traffic_data
  GROUP BY source
),
total_visitors AS (
  SELECT COUNT(DISTINCT user_id) as total
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  sc.source,
  sc.visitor_count as visitors,
  ROUND((sc.visitor_count * 100.0 / tv.total), 1) as percentage
FROM source_counts sc
CROSS JOIN total_visitors tv
ORDER BY sc.visitor_count DESC;
```

---

### 3. Product Analytics Queries

#### Top Products by Views
```sql
SELECT 
  p.id,
  p.name,
  COUNT(*) as views,
  p.image_url,
  p.price
FROM analytics_events ae
JOIN products p ON ae.product_id = p.id
WHERE ae.event_type = 'product_view'
  AND ae.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.image_url, p.price
ORDER BY views DESC
LIMIT 10;
```

#### Top Products with Favorites and Conversion
```sql
WITH product_views AS (
  SELECT 
    product_id,
    COUNT(*) as view_count
  FROM analytics_events
  WHERE event_type = 'product_view'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY product_id
),
product_favorites AS (
  SELECT 
    product_id,
    COUNT(*) as favorite_count
  FROM analytics_events
  WHERE event_type = 'favorite_add'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY product_id
),
product_clicks AS (
  SELECT 
    product_id,
    COUNT(*) as click_count
  FROM analytics_events
  WHERE event_type = 'affiliate_click'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY product_id
)
SELECT 
  p.id,
  p.name,
  COALESCE(pv.view_count, 0) as views,
  COALESCE(pf.favorite_count, 0) as favorites,
  COALESCE(pc.click_count, 0) as clicks,
  CASE 
    WHEN pv.view_count > 0 
    THEN ROUND((pc.click_count * 100.0 / pv.view_count), 1)
    ELSE 0 
  END as conversion_rate,
  p.image_url,
  p.price
FROM products p
LEFT JOIN product_views pv ON p.id = pv.product_id
LEFT JOIN product_favorites pf ON p.id = pf.product_id
LEFT JOIN product_clicks pc ON p.id = pc.product_id
WHERE pv.view_count IS NOT NULL
ORDER BY pv.view_count DESC
LIMIT 10;
```

#### Top Search Terms
```sql
SELECT 
  event_data->>'searchTerm' as search_term,
  COUNT(*) as search_count,
  COUNT(DISTINCT user_id) as unique_searchers
FROM analytics_events
WHERE event_type = 'search'
  AND created_at >= NOW() - INTERVAL '30 days'
  AND event_data->>'searchTerm' IS NOT NULL
GROUP BY event_data->>'searchTerm'
ORDER BY search_count DESC
LIMIT 10;
```

---

### 4. Moodboard Analytics Queries

#### Top Moodboards
```sql
WITH moodboard_views AS (
  SELECT 
    moodboard_id,
    COUNT(*) as view_count
  FROM analytics_events
  WHERE event_type = 'moodboard_view'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY moodboard_id
),
moodboard_clicks AS (
  SELECT 
    moodboard_id,
    COUNT(*) as click_count
  FROM analytics_events
  WHERE event_type = 'moodboard_product_click'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY moodboard_id
)
SELECT 
  m.id,
  m.title,
  COALESCE(mv.view_count, 0) as views,
  COALESCE(mc.click_count, 0) as clicks,
  CASE 
    WHEN mv.view_count > 0 
    THEN ROUND((mc.click_count * 100.0 / mv.view_count), 1)
    ELSE 0 
  END as click_through_rate,
  m.cover_image
FROM moodboards m
LEFT JOIN moodboard_views mv ON m.id = mv.moodboard_id
LEFT JOIN moodboard_clicks mc ON m.id = mc.moodboard_id
WHERE mv.view_count IS NOT NULL
ORDER BY mv.view_count DESC
LIMIT 10;
```

---

### 5. Recent Activity Query

```sql
SELECT 
  ae.id,
  ae.event_type,
  ae.user_id,
  ae.created_at,
  ae.event_data,
  p.name as product_name,
  m.title as moodboard_title
FROM analytics_events ae
LEFT JOIN products p ON ae.product_id = p.id
LEFT JOIN moodboards m ON ae.moodboard_id = m.id
ORDER BY ae.created_at DESC
LIMIT 20;
```

---

## Implementation Examples

### 1. Express.js with PostgreSQL

```javascript
// routes/admin/analytics.routes.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateAdmin } = require('../../middleware/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper: Get time interval
function getTimeInterval(timeRange) {
  const intervals = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days'
  };
  return intervals[timeRange] || '30 days';
}

// GET /api/admin/analytics/overview
router.get('/overview', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const interval = getTimeInterval(timeRange);

    // Run all queries in parallel
    const [
      visitorsResult,
      pageViewsResult,
      productViewsResult,
      searchesResult,
      favoritesResult,
      clicksResult,
      sessionDurationResult,
      bounceRateResult
    ] = await Promise.all([
      // Total visitors
      pool.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Total page views
      pool.query(`
        SELECT COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Total product views
      pool.query(`
        SELECT COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'product_view'
          AND created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Total searches
      pool.query(`
        SELECT COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'search'
          AND created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Total favorites
      pool.query(`
        SELECT COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'favorite_add'
          AND created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Total clicks
      pool.query(`
        SELECT COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'affiliate_click'
          AND created_at >= NOW() - INTERVAL '${interval}'
      `),
      
      // Average session duration
      pool.query(`
        WITH session_durations AS (
          SELECT 
            user_id,
            session_id,
            EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as duration
          FROM analytics_events
          WHERE created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY user_id, session_id
          HAVING COUNT(*) > 1
        )
        SELECT COALESCE(AVG(duration), 0) as avg_duration
        FROM session_durations
      `),
      
      // Bounce rate
      pool.query(`
        WITH session_page_counts AS (
          SELECT 
            session_id,
            COUNT(*) as page_count
          FROM analytics_events
          WHERE event_type = 'page_view'
            AND created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY session_id
        )
        SELECT 
          COALESCE(
            (COUNT(CASE WHEN page_count = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
            0
          ) as bounce_rate
        FROM session_page_counts
      `)
    ]);

    res.json({
      totalVisitors: parseInt(visitorsResult.rows[0].count),
      totalPageViews: parseInt(pageViewsResult.rows[0].count),
      totalProductViews: parseInt(productViewsResult.rows[0].count),
      totalSearches: parseInt(searchesResult.rows[0].count),
      totalFavorites: parseInt(favoritesResult.rows[0].count),
      totalAffiliateClicks: parseInt(clicksResult.rows[0].count),
      avgSessionDuration: Math.round(parseFloat(sessionDurationResult.rows[0].avg_duration)),
      bounceRate: parseFloat(bounceRateResult.rows[0].bounce_rate).toFixed(1),
      timeRange
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/admin/analytics/user-behavior
router.get('/user-behavior', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const interval = getTimeInterval(timeRange);

    const [newReturningResult, pagesPerSessionResult, trafficSourcesResult] = await Promise.all([
      // New vs returning users
      pool.query(`
        WITH user_first_seen AS (
          SELECT 
            user_id,
            MIN(created_at) as first_seen
          FROM analytics_events
          GROUP BY user_id
        ),
        period_users AS (
          SELECT DISTINCT user_id
          FROM analytics_events
          WHERE created_at >= NOW() - INTERVAL '${interval}'
        )
        SELECT 
          COUNT(CASE WHEN ufs.first_seen >= NOW() - INTERVAL '${interval}' THEN 1 END) as new_users,
          COUNT(CASE WHEN ufs.first_seen < NOW() - INTERVAL '${interval}' THEN 1 END) as returning_users
        FROM period_users pu
        JOIN user_first_seen ufs ON pu.user_id = ufs.user_id
      `),
      
      // Pages per session
      pool.query(`
        WITH session_counts AS (
          SELECT 
            session_id,
            COUNT(*) as page_count
          FROM analytics_events
          WHERE event_type = 'page_view'
            AND created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY session_id
        )
        SELECT COALESCE(AVG(page_count), 0) as avg_pages
        FROM session_counts
      `),
      
      // Traffic sources
      pool.query(`
        WITH traffic_data AS (
          SELECT 
            CASE 
              WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
              WHEN referrer LIKE '%google%' THEN 'Google'
              WHEN referrer LIKE '%instagram%' THEN 'Instagram'
              WHEN referrer LIKE '%facebook%' THEN 'Facebook'
              ELSE 'Other'
            END as source,
            user_id
          FROM analytics_events
          WHERE event_type = 'page_view'
            AND created_at >= NOW() - INTERVAL '${interval}'
        ),
        source_counts AS (
          SELECT 
            source,
            COUNT(DISTINCT user_id) as visitor_count
          FROM traffic_data
          GROUP BY source
        ),
        total_visitors AS (
          SELECT COUNT(DISTINCT user_id) as total
          FROM analytics_events
          WHERE created_at >= NOW() - INTERVAL '${interval}'
        )
        SELECT 
          sc.source,
          sc.visitor_count as visitors,
          ROUND((sc.visitor_count * 100.0 / NULLIF(tv.total, 0)), 1) as percentage
        FROM source_counts sc
        CROSS JOIN total_visitors tv
        ORDER BY sc.visitor_count DESC
      `)
    ]);

    res.json({
      newUsers: parseInt(newReturningResult.rows[0].new_users),
      returningUsers: parseInt(newReturningResult.rows[0].returning_users),
      avgPagesPerSession: parseFloat(pagesPerSessionResult.rows[0].avg_pages).toFixed(1),
      trafficSources: trafficSourcesResult.rows,
      timeRange
    });
  } catch (error) {
    console.error('User behavior error:', error);
    res.status(500).json({ error: 'Failed to fetch user behavior data' });
  }
});

// GET /api/admin/analytics/products
router.get('/products', authenticateAdmin, async (req, res) => {
  try {
    const { timeRange = '30d', limit = 10 } = req.query;
    const interval = getTimeInterval(timeRange);

    const [topProductsResult, topSearchesResult] = await Promise.all([
      // Top products
      pool.query(`
        WITH product_views AS (
          SELECT product_id, COUNT(*) as view_count
          FROM analytics_events
          WHERE event_type = 'product_view'
            AND created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY product_id
        ),
        product_favorites AS (
          SELECT product_id, COUNT(*) as favorite_count
          FROM analytics_events
          WHERE event_type = 'favorite_add'
            AND created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY product_id
        ),
        product_clicks AS (
          SELECT product_id, COUNT(*) as click_count
          FROM analytics_events
          WHERE event_type = 'affiliate_click'
            AND created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY product_id
        )
        SELECT 
          p.id,
          p.name,
          COALESCE(pv.view_count, 0) as views,
          COALESCE(pf.favorite_count, 0) as favorites,
          COALESCE(pc.click_count, 0) as clicks,
          CASE 
            WHEN pv.view_count > 0 
            THEN ROUND((pc.click_count * 100.0 / pv.view_count), 1)
            ELSE 0 
          END as conversion_rate,
          p.image_url,
          p.price
        FROM products p
        LEFT JOIN product_views pv ON p.id = pv.product_id
        LEFT JOIN product_favorites pf ON p.id = pf.product_id
        LEFT JOIN product_clicks pc ON p.id = pc.product_id
        WHERE pv.view_count IS NOT NULL
        ORDER BY pv.view_count DESC
        LIMIT $1
      `, [limit]),
      
      // Top searches
      pool.query(`
        SELECT 
          event_data->>'searchTerm' as term,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_searchers
        FROM analytics_events
        WHERE event_type = 'search'
          AND created_at >= NOW() - INTERVAL '${interval}'
          AND event_data->>'searchTerm' IS NOT NULL
        GROUP BY event_data->>'searchTerm'
        ORDER BY count DESC
        LIMIT $1
      `, [limit])
    ]);

    res.json({
      topProducts: topProductsResult.rows,
      topSearches: topSearchesResult.rows,
      timeRange
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

module.exports = router;
```

---

### 2. Event Logging Middleware

```javascript
// middleware/analytics-logger.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware to log analytics events
async function logAnalyticsEvent(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const sessionId = req.headers['x-session-id'] || req.sessionID;
    const eventType = determineEventType(req);
    
    // Don't log admin or static requests
    if (req.path.startsWith('/api/admin') || 
        req.path.startsWith('/static') ||
        !userId) {
      return next();
    }

    // Extract event data
    const eventData = {
      path: req.path,
      method: req.method,
      query: req.query
    };

    // Log asynchronously (don't block request)
    pool.query(`
      INSERT INTO analytics_events (
        user_id, event_type, event_data, session_id,
        ip_address, user_agent, referrer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      eventType,
      JSON.stringify(eventData),
      sessionId,
      req.ip,
      req.headers['user-agent'],
      req.headers['referer'] || req.headers['referrer']
    ]).catch(err => console.error('Analytics logging error:', err));

  } catch (error) {
    console.error('Analytics middleware error:', error);
  }
  
  next();
}

function determineEventType(req) {
  const path = req.path.toLowerCase();
  
  if (path.includes('/products/') && req.method === 'GET') {
    return 'product_view';
  }
  if (path.includes('/moodboards/') && req.method === 'GET') {
    return 'moodboard_view';
  }
  if (path.includes('/search')) {
    return 'search';
  }
  if (path.includes('/affiliate/redirect')) {
    return 'affiliate_click';
  }
  
  return 'page_view';
}

module.exports = { logAnalyticsEvent };
```

---

## Performance Optimization

### 1. Database Indexes

```sql
-- Composite index for common queries
CREATE INDEX idx_events_composite 
ON analytics_events(event_type, created_at, user_id);

-- Product analytics
CREATE INDEX idx_events_product 
ON analytics_events(product_id, event_type, created_at);

-- Moodboard analytics
CREATE INDEX idx_events_moodboard 
ON analytics_events(moodboard_id, event_type, created_at);

-- Session tracking
CREATE INDEX idx_events_session 
ON analytics_events(session_id, created_at);
```

### 2. Materialized Views (PostgreSQL)

```sql
-- Pre-computed daily stats
CREATE MATERIALIZED VIEW daily_product_stats AS
SELECT 
  DATE(created_at) as date,
  product_id,
  COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'favorite_add' THEN 1 END) as favorites,
  COUNT(CASE WHEN event_type = 'affiliate_click' THEN 1 END) as clicks
FROM analytics_events
GROUP BY DATE(created_at), product_id;

-- Refresh daily
CREATE INDEX idx_daily_product_stats ON daily_product_stats(date, product_id);

-- Refresh command (run via cron)
REFRESH MATERIALIZED VIEW daily_product_stats;
```

### 3. Query Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

router.get('/overview', authenticateAdmin, async (req, res) => {
  const { timeRange = '30d' } = req.query;
  const cacheKey = `analytics:overview:${timeRange}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const data = await fetchAnalyticsOverview(timeRange);
  
  // Store in cache
  cache.set(cacheKey, data);
  
  res.json(data);
});
```

---

## Testing

### 1. Test Data Generation

```sql
-- Generate test events (PostgreSQL)
INSERT INTO analytics_events (user_id, event_type, product_id, created_at)
SELECT 
  uuid_generate_v4()::text,
  (ARRAY['page_view', 'product_view', 'search', 'favorite_add', 'affiliate_click'])[floor(random() * 5 + 1)],
  floor(random() * 52 + 1)::int,
  NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 10000);
```

### 2. API Testing (Jest)

```javascript
describe('Analytics API', () => {
  it('should return analytics overview', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/overview?timeRange=7d')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('totalVisitors');
    expect(response.body).toHaveProperty('totalPageViews');
    expect(response.body.timeRange).toBe('7d');
  });

  it('should return top products', async () => {
    const response = await request(app)
      .get('/api/admin/analytics/products?limit=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.topProducts).toHaveLength(5);
    expect(response.body.topProducts[0]).toHaveProperty('views');
    expect(response.body.topProducts[0]).toHaveProperty('conversionRate');
  });
});
```

---

## Summary

### What's Implemented

✅ **5 Analytics Endpoints** with complete SQL queries  
✅ **Database Schema** (PostgreSQL + MySQL)  
✅ **Express.js Examples** with parallel queries  
✅ **Event Logging Middleware** for automatic tracking  
✅ **Performance Optimizations** (indexes, caching, materialized views)  
✅ **Test Data Generation** for development  

### Backend Checklist

- [ ] Create `analytics_events` table with indexes
- [ ] Implement `/overview` endpoint with 8 metrics
- [ ] Implement `/user-behavior` endpoint
- [ ] Implement `/products` endpoint with top products + searches
- [ ] Implement `/moodboards` endpoint
- [ ] Implement `/recent-activity` endpoint
- [ ] Add analytics logging middleware to track X-User-ID
- [ ] Add database indexes for performance
- [ ] Add query caching (5-15 minutes)
- [ ] Set up materialized views (optional, for scale)
- [ ] Add admin authentication to all endpoints
- [ ] Test with 10k+ events
- [ ] Monitor query performance (< 500ms target)

### Time Estimates

- **Database Setup**: 2-3 hours
- **API Endpoints**: 6-8 hours
- **Middleware**: 2-3 hours
- **Testing**: 3-4 hours
- **Optimization**: 2-3 hours

**Total**: 15-21 hours for complete implementation

---

**Frontend is 100% ready!** Just implement these backend endpoints and the analytics dashboard will work seamlessly.
