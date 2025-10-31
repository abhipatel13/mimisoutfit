# Analytics API - Quick Reference

## 🚀 Overview

This is a **quick reference** for backend developers implementing the analytics API.

For complete details, see: `/docs/ANALYTICS_API_REQUIREMENTS.md`

---

## 📊 API Endpoints Summary

### 1. Analytics Overview
```http
GET /admin/analytics/overview?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Metrics, top products, top moodboards, search terms, recent events

### 2. User Behavior
```http
GET /admin/analytics/users?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: New/returning users, session duration, referrers, user journeys

### 3. Product Analytics
```http
GET /admin/analytics/products/:productId?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Product metrics, daily views/clicks, locations

### 4. Time Series Data
```http
GET /admin/analytics/timeseries?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Daily array of views, clicks, searches, favorites, visitors

### 5. Category Distribution
```http
GET /admin/analytics/categories?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Category counts and percentages

### 6. Conversion Funnel
```http
GET /admin/analytics/funnel?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Funnel stages with conversion and drop-off rates

### 7. Trend Comparison
```http
GET /admin/analytics/trends?timeRange=7d
Authorization: Bearer {jwt_token}
```

**Returns**: Current vs previous period metrics with trend direction

### 8. Event Tracking (Public)
```http
POST /analytics/track
X-User-ID: {uuid}
Content-Type: application/json

{
  "events": [
    {
      "event": "search",
      "metadata": { "query": "dresses", "resultsCount": 14 },
      "timestamp": "2025-10-26T14:32:18.234Z",
      "url": "https://...",
      "referrer": "https://..."
    }
  ]
}
```

**Returns**: `{ "success": true, "eventsProcessed": 1 }`

---

## 🗄️ Database Schema

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
  
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_composite (event_type, created_at, user_id)
);
```

---

## 📝 Event Types

| Event Type | Source | Description |
|------------|--------|-------------|
| `page_view` | Server | Any page view |
| `product_view` | Server | Product detail page |
| `moodboard_view` | Server | Moodboard detail page |
| `search` | Client | Search query submitted |
| `favorite_add` | Client | Product favorited |
| `favorite_remove` | Client | Product unfavorited |
| `affiliate_click` | Client | "Shop Now" clicked |
| `filter_change` | Client | Filters changed |
| `sort_change` | Client | Sort order changed |

---

## 🔍 Key SQL Queries

### Total Visitors
```sql
SELECT COUNT(DISTINCT user_id) FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Top Products
```sql
SELECT 
  resource_id,
  COUNT(*) as views,
  COUNT(DISTINCT user_id) as unique_viewers
FROM analytics_events
WHERE event_type = 'product_view'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY resource_id
ORDER BY views DESC
LIMIT 5;
```

### Top Search Terms
```sql
SELECT 
  metadata->>'query' as term,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_searchers
FROM analytics_events
WHERE event_type = 'search'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY metadata->>'query'
ORDER BY count DESC
LIMIT 10;
```

### Conversion Funnel
```sql
SELECT 
  COUNT(DISTINCT user_id) as visitors,
  COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN user_id END) as product_viewers,
  COUNT(DISTINCT CASE WHEN event_type = 'favorite_add' THEN user_id END) as favoriters,
  COUNT(DISTINCT CASE WHEN event_type = 'affiliate_click' THEN user_id END) as clickers
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Time Series (Daily)
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'affiliate_click' THEN 1 END) as clicks,
  COUNT(DISTINCT user_id) as visitors
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

---

## ⚡ Performance Targets

| Endpoint | Target Response Time |
|----------|---------------------|
| Overview | < 500ms |
| Users | < 400ms |
| Products | < 300ms |
| Timeseries | < 300ms |
| Categories | < 300ms |
| Funnel | < 300ms |
| Trends | < 300ms |
| Track (POST) | < 100ms |

---

## 🛡️ Security

- ✅ All GET endpoints require JWT authentication
- ✅ POST /analytics/track is public (no auth)
- ✅ Rate limiting: 100 req/min for track endpoint
- ✅ Validate X-User-ID header exists
- ✅ Sanitize metadata JSON

---

## 🔧 Implementation Checklist

### Database Setup
- [ ] Create `analytics_events` table
- [ ] Add all indexes
- [ ] Test insert performance

### Middleware/Tracking
- [ ] Extract X-User-ID from request headers
- [ ] Log GET requests to analytics_events
- [ ] Parse URLs to determine event type
- [ ] Make logging non-blocking

### API Endpoints (7 total)
- [ ] GET /admin/analytics/overview
- [ ] GET /admin/analytics/users
- [ ] GET /admin/analytics/products/:id
- [ ] GET /admin/analytics/timeseries
- [ ] GET /admin/analytics/categories
- [ ] GET /admin/analytics/funnel
- [ ] GET /admin/analytics/trends

### Event Tracking
- [ ] POST /analytics/track endpoint
- [ ] Batch insert events
- [ ] Validate event structure
- [ ] Handle missing metadata

### Testing
- [ ] Test each endpoint with mock data
- [ ] Verify response times
- [ ] Test edge cases (empty data)
- [ ] Load test track endpoint

### Optimization
- [ ] Add query result caching
- [ ] Monitor slow queries
- [ ] Optimize complex joins
- [ ] Consider materialized views

---

## 📚 Complete Documentation

For full details including:
- Complete SQL queries with joins
- Error handling specifications
- Code examples (Express.js, FastAPI)
- Type definitions
- Testing requirements

**See**: `/docs/ANALYTICS_API_REQUIREMENTS.md`

---

## ⏱️ Estimated Timeline

| Task | Time |
|------|------|
| Database setup | 1-2 hours |
| Middleware | 2-3 hours |
| 7 Analytics endpoints | 6-8 hours |
| Event tracking endpoint | 1-2 hours |
| Testing & optimization | 4-6 hours |
| **Total** | **14-21 hours** |

---

## 🎯 What Frontend Sends

### Automatic (Every Request)
```http
X-User-ID: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
```

Sent on ALL requests (products, moodboards, search, etc.)

### Manual Events (Batched)
- Search queries
- Favorite add/remove
- Affiliate clicks

Sent every 5 seconds to `POST /analytics/track`

---

**Frontend**: ✅ 100% Ready  
**Backend**: ⏳ Ready to implement  
**Docs**: ✅ Complete  

Let's build this! 🚀
