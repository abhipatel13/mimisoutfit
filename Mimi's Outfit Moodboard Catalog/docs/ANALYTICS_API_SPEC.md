# Analytics API Specification v1.0

**Complete API specification for backend analytics endpoints**

---

## Base URL

```
Production: https://api.lookbookbymimi.com
Development: http://localhost:3000
```

---

## Authentication

All analytics endpoints require admin authentication via JWT token.

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Admin authentication required"
}
```

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/analytics/overview` | GET | Get key metrics overview |
| `/api/admin/analytics/user-behavior` | GET | Get user behavior analytics |
| `/api/admin/analytics/products` | GET | Get product analytics |
| `/api/admin/analytics/moodboards` | GET | Get moodboard analytics |
| `/api/admin/analytics/recent-activity` | GET | Get recent user activity |

---

## 1. Analytics Overview

**Endpoint:** `GET /api/admin/analytics/overview`

**Description:** Get aggregated metrics for visitors, views, searches, favorites, and clicks.

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeRange` | string | No | `30d` | Time period: `7d`, `30d`, or `90d` |

**Example:**
```
GET /api/admin/analytics/overview?timeRange=7d
```

### Response

**Status Code:** `200 OK`

**Response Body:**
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

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `totalVisitors` | integer | Unique visitors (distinct user IDs) |
| `totalPageViews` | integer | Total page view events |
| `totalProductViews` | integer | Total product detail page views |
| `totalSearches` | integer | Total search queries |
| `totalFavorites` | integer | Total products added to favorites |
| `totalAffiliateClicks` | integer | Total affiliate link clicks |
| `avgSessionDuration` | integer | Average session duration in seconds |
| `bounceRate` | number | Percentage of single-page sessions |
| `timeRange` | string | Echo of requested time range |

### Error Responses

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch analytics overview",
  "message": "Database query failed"
}
```

---

## 2. User Behavior Analytics

**Endpoint:** `GET /api/admin/analytics/user-behavior`

**Description:** Get user behavior metrics including new/returning users and traffic sources.

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeRange` | string | No | `30d` | Time period: `7d`, `30d`, or `90d` |

**Example:**
```
GET /api/admin/analytics/user-behavior?timeRange=30d
```

### Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "newUsers": 450,
  "returningUsers": 800,
  "avgSessionDuration": 245,
  "avgPagesPerSession": 4.2,
  "trafficSources": [
    {
      "source": "Direct",
      "visitors": 580,
      "percentage": 46.4
    },
    {
      "source": "Google",
      "visitors": 420,
      "percentage": 33.6
    },
    {
      "source": "Instagram",
      "visitors": 180,
      "percentage": 14.4
    },
    {
      "source": "Other",
      "visitors": 70,
      "percentage": 5.6
    }
  ],
  "timeRange": "30d"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `newUsers` | integer | Users who visited for the first time in period |
| `returningUsers` | integer | Users who visited before the period started |
| `avgSessionDuration` | integer | Average session duration in seconds |
| `avgPagesPerSession` | number | Average pages viewed per session |
| `trafficSources` | array | Traffic source breakdown |
| `trafficSources[].source` | string | Traffic source name |
| `trafficSources[].visitors` | integer | Unique visitors from source |
| `trafficSources[].percentage` | number | Percentage of total traffic |

### Error Responses

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch user behavior data",
  "message": "Database query failed"
}
```

---

## 3. Product Analytics

**Endpoint:** `GET /api/admin/analytics/products`

**Description:** Get product performance metrics and top search terms.

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeRange` | string | No | `30d` | Time period: `7d`, `30d`, or `90d` |
| `limit` | integer | No | `10` | Number of top products to return (1-50) |

**Example:**
```
GET /api/admin/analytics/products?timeRange=7d&limit=5
```

### Response

**Status Code:** `200 OK`

**Response Body:**
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
      "imageUrl": "https://images.unsplash.com/photo-xyz",
      "price": 198
    },
    {
      "id": 5,
      "name": "Leather Ankle Boots",
      "views": 380,
      "favorites": 95,
      "clicks": 72,
      "conversionRate": 18.9,
      "imageUrl": "https://images.unsplash.com/photo-abc",
      "price": 285
    }
  ],
  "topSearches": [
    {
      "term": "trench coat",
      "count": 120,
      "uniqueSearchers": 85
    },
    {
      "term": "denim jacket",
      "count": 95,
      "uniqueSearchers": 72
    }
  ],
  "timeRange": "30d"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `topProducts` | array | Top performing products |
| `topProducts[].id` | integer | Product ID |
| `topProducts[].name` | string | Product name |
| `topProducts[].views` | integer | Product detail page views |
| `topProducts[].favorites` | integer | Times added to favorites |
| `topProducts[].clicks` | integer | Affiliate link clicks |
| `topProducts[].conversionRate` | number | Click-to-view ratio (%) |
| `topProducts[].imageUrl` | string | Product image URL |
| `topProducts[].price` | number | Product price |
| `topSearches` | array | Top search terms |
| `topSearches[].term` | string | Search term |
| `topSearches[].count` | integer | Total searches for term |
| `topSearches[].uniqueSearchers` | integer | Unique users who searched term |

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid limit parameter",
  "message": "Limit must be between 1 and 50"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch product analytics",
  "message": "Database query failed"
}
```

---

## 4. Moodboard Analytics

**Endpoint:** `GET /api/admin/analytics/moodboards`

**Description:** Get moodboard performance metrics.

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeRange` | string | No | `30d` | Time period: `7d`, `30d`, or `90d` |
| `limit` | integer | No | `10` | Number of top moodboards to return (1-50) |

**Example:**
```
GET /api/admin/analytics/moodboards?timeRange=30d&limit=8
```

### Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "topMoodboards": [
    {
      "id": 1,
      "title": "Parisian Chic",
      "views": 850,
      "clicks": 320,
      "clickThroughRate": 37.6,
      "coverImage": "https://images.unsplash.com/photo-xyz"
    },
    {
      "id": 3,
      "title": "Weekend Casual",
      "views": 720,
      "clicks": 285,
      "clickThroughRate": 39.6,
      "coverImage": "https://images.unsplash.com/photo-abc"
    }
  ],
  "timeRange": "30d"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `topMoodboards` | array | Top performing moodboards |
| `topMoodboards[].id` | integer | Moodboard ID |
| `topMoodboards[].title` | string | Moodboard title |
| `topMoodboards[].views` | integer | Moodboard detail page views |
| `topMoodboards[].clicks` | integer | Product clicks from moodboard |
| `topMoodboards[].clickThroughRate` | number | Click-to-view ratio (%) |
| `topMoodboards[].coverImage` | string | Moodboard cover image URL |

### Error Responses

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch moodboard analytics",
  "message": "Database query failed"
}
```

---

## 5. Recent Activity

**Endpoint:** `GET /api/admin/analytics/recent-activity`

**Description:** Get recent user activity events in chronological order.

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | `20` | Number of recent events to return (1-100) |

**Example:**
```
GET /api/admin/analytics/recent-activity?limit=50
```

### Response

**Status Code:** `200 OK`

**Response Body:**
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
    },
    {
      "id": 12343,
      "type": "affiliate_click",
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "productName": "Leather Ankle Boots",
      "timestamp": "2025-10-26T14:30:22Z"
    },
    {
      "id": 12342,
      "type": "moodboard_view",
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "moodboardTitle": "Parisian Chic",
      "timestamp": "2025-10-26T14:29:15Z"
    },
    {
      "id": 12341,
      "type": "favorite_add",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Silk Midi Dress",
      "timestamp": "2025-10-26T14:28:50Z"
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `events` | array | Recent activity events |
| `events[].id` | integer | Event ID |
| `events[].type` | string | Event type (see Event Types below) |
| `events[].userId` | string | User UUID from X-User-ID header |
| `events[].productName` | string | Product name (if applicable) |
| `events[].moodboardTitle` | string | Moodboard title (if applicable) |
| `events[].searchTerm` | string | Search term (if applicable) |
| `events[].timestamp` | string | ISO 8601 timestamp |

**Event Types:**

| Type | Description |
|------|-------------|
| `page_view` | User viewed a page |
| `product_view` | User viewed product detail page |
| `moodboard_view` | User viewed moodboard detail page |
| `search` | User performed a search |
| `favorite_add` | User added product to favorites |
| `favorite_remove` | User removed product from favorites |
| `affiliate_click` | User clicked affiliate link |
| `moodboard_product_click` | User clicked product from moodboard |

### Error Responses

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch recent activity",
  "message": "Database query failed"
}
```

---

## Event Logging

### X-User-ID Header

**All public API requests automatically include:**
```
X-User-ID: 550e8400-e29b-41d4-a716-446655440000
```

- Generated on frontend (UUID v4)
- Persistent in localStorage
- Enables user journey tracking
- Privacy-friendly (no personal data)

### Event Data Structure

**Analytics Event Schema:**
```typescript
interface AnalyticsEvent {
  id: number;
  user_id: string;          // From X-User-ID header
  event_type: string;       // Event type (see Event Types)
  event_data: object;       // Flexible JSON metadata
  product_id?: number;      // FK to products table
  moodboard_id?: number;    // FK to moodboards table
  session_id?: string;      // Session identifier
  ip_address?: string;      // User IP (anonymized)
  user_agent?: string;      // Browser/device info
  referrer?: string;        // Traffic source
  created_at: Date;         // Timestamp
}
```

---

## Rate Limiting

**Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per admin user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

**Rate Limit Error (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

---

## Caching

**Response Headers:**
```
Cache-Control: private, max-age=300
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

- Analytics data cached for 5 minutes (300 seconds)
- Use `ETag` for conditional requests
- Admins can force refresh with `Cache-Control: no-cache` request header

---

## Performance Targets

| Metric | Target | Max |
|--------|--------|-----|
| Response Time (p50) | < 200ms | < 500ms |
| Response Time (p99) | < 500ms | < 1000ms |
| Database Query Time | < 100ms | < 300ms |
| Concurrent Requests | 50 req/s | 100 req/s |

---

## Testing

### Example Requests (cURL)

**Overview:**
```bash
curl -X GET "https://api.lookbookbymimi.com/api/admin/analytics/overview?timeRange=7d" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Products:**
```bash
curl -X GET "https://api.lookbookbymimi.com/api/admin/analytics/products?limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Recent Activity:**
```bash
curl -X GET "https://api.lookbookbymimi.com/api/admin/analytics/recent-activity?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Frontend Integration

**Frontend uses these endpoints via:**
```typescript
// services/api/analytics.api.ts
import { apiClient } from './base.api';

export const analyticsApi = {
  async getOverview(timeRange: '7d' | '30d' | '90d') {
    return apiClient.get<AnalyticsOverview>(
      `/admin/analytics/overview?timeRange=${timeRange}`
    );
  },
  
  async getUserBehavior(timeRange: '7d' | '30d' | '90d') {
    return apiClient.get<UserBehavior>(
      `/admin/analytics/user-behavior?timeRange=${timeRange}`
    );
  },
  
  async getProductAnalytics(timeRange: '7d' | '30d' | '90d', limit = 10) {
    return apiClient.get<ProductAnalytics>(
      `/admin/analytics/products?timeRange=${timeRange}&limit=${limit}`
    );
  }
};
```

---

## Summary

### Implementation Checklist

- [ ] Create `analytics_events` table
- [ ] Add logging middleware for X-User-ID tracking
- [ ] Implement 5 analytics endpoints
- [ ] Add admin authentication
- [ ] Add query caching (5 minutes)
- [ ] Add rate limiting (100 req/min)
- [ ] Optimize database queries (< 300ms)
- [ ] Add error handling and logging
- [ ] Write API tests (Jest/Mocha)
- [ ] Deploy and monitor

### Response Time Targets

✅ **Overview**: < 300ms  
✅ **User Behavior**: < 400ms  
✅ **Products**: < 350ms  
✅ **Moodboards**: < 300ms  
✅ **Recent Activity**: < 200ms  

---

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Status:** Ready for implementation
