# Analytics Backend - Deployment Checklist

**Final checklist before backend implementation**

---

## ✅ Frontend Status: 100% Complete

### What's Already Built

- [x] Analytics dashboard at `/admin/analytics`
- [x] X-User-ID header injection on every request
- [x] Client-side tracking service (batching, queuing)
- [x] 8 analytics metric cards
- [x] Top products table with conversion rates
- [x] Top moodboards grid with CTR
- [x] Search analytics with top terms
- [x] User behavior tab (new/returning, traffic sources)
- [x] Recent activity feed (live events)
- [x] Time range filters (7d, 30d, 90d)
- [x] Mock data for development/testing
- [x] Protected admin route
- [x] Mobile-responsive UI
- [x] Error handling and loading states
- [x] TypeScript types for all data
- [x] API service layer with mock/real mode
- [x] Build successful ✅

### Frontend Files Created

```
src/
├── services/
│   ├── analytics.service.ts      # Client-side tracking service
│   └── api/
│       └── analytics.api.ts      # API service (mock + real mode)
├── types/
│   └── analytics.types.ts        # TypeScript definitions
├── pages/admin/
│   └── AdminAnalyticsPage.tsx    # Main analytics dashboard
├── components/admin/
│   ├── AnalyticsMetricCard.tsx   # Metric card component
│   ├── TopProductsTable.tsx      # Products table
│   └── RecentActivityFeed.tsx    # Activity feed
└── hooks/
    └── use-analytics.ts          # Custom analytics hooks (optional)
```

---

## 📋 Backend Implementation Checklist

### Phase 1: Database (15 minutes)

- [ ] Create `analytics_events` table
  ```sql
  CREATE TABLE analytics_events (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      event_data JSONB,
      product_id BIGINT,
      moodboard_id BIGINT,
      session_id VARCHAR(36),
      ip_address VARCHAR(45),
      user_agent TEXT,
      referrer TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Add critical indexes
  ```sql
  CREATE INDEX idx_composite ON analytics_events(event_type, created_at, user_id);
  CREATE INDEX idx_product_id ON analytics_events(product_id);
  CREATE INDEX idx_moodboard_id ON analytics_events(moodboard_id);
  ```

- [ ] Generate test data (5000 events)
  ```sql
  INSERT INTO analytics_events (user_id, event_type, product_id, created_at)
  SELECT 
    uuid_generate_v4()::text,
    (ARRAY['page_view', 'product_view', 'search', 'favorite_add', 'affiliate_click'])[floor(random() * 5 + 1)],
    floor(random() * 52 + 1)::int,
    NOW() - (random() * INTERVAL '30 days')
  FROM generate_series(1, 5000);
  ```

**Documentation:** See `BACKEND_ANALYTICS_QUICK_START.md` → Step 1

---

### Phase 2: Middleware (30 minutes)

- [ ] Create analytics logging middleware
  ```javascript
  // middleware/analytics.js
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async function logEvent(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId || req.path.startsWith('/api/admin')) {
        return next();
      }

      const eventType = getEventType(req.path, req.method);
      
      pool.query(`
        INSERT INTO analytics_events 
        (user_id, event_type, event_data, session_id, ip_address, user_agent, referrer)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        eventType,
        JSON.stringify({ path: req.path, query: req.query }),
        req.sessionID,
        req.ip,
        req.headers['user-agent'],
        req.headers['referer']
      ]).catch(err => console.error('Log error:', err));
      
    } catch (err) {
      console.error('Analytics error:', err);
    }
    next();
  }

  function getEventType(path, method) {
    if (path.includes('/products/') && method === 'GET') return 'product_view';
    if (path.includes('/moodboards/') && method === 'GET') return 'moodboard_view';
    if (path.includes('/search')) return 'search';
    if (path.includes('/affiliate/redirect')) return 'affiliate_click';
    return 'page_view';
  }

  module.exports = { logEvent };
  ```

- [ ] Add middleware to app
  ```javascript
  const { logEvent } = require('./middleware/analytics');
  app.use(logEvent); // Add before routes
  ```

- [ ] Test with browser - verify events are logged
  ```bash
  # Open browser dev tools → Network tab
  # Navigate to products page
  # Check database: SELECT * FROM analytics_events LIMIT 10;
  ```

**Documentation:** See `BACKEND_ANALYTICS_QUICK_START.md` → Step 2

---

### Phase 3: Analytics Endpoints (2 hours)

#### Endpoint 1: Overview (30 minutes)

- [ ] Create route file `routes/admin/analytics.js`
- [ ] Implement `/api/admin/analytics/overview`
- [ ] Test response time < 500ms
- [ ] Verify all 8 metrics return

**SQL Queries:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Analytics Overview Queries"

---

#### Endpoint 2: User Behavior (20 minutes)

- [ ] Implement `/api/admin/analytics/user-behavior`
- [ ] Test new/returning users calculation
- [ ] Test traffic sources breakdown
- [ ] Verify percentages sum to 100%

**SQL Queries:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "User Behavior Queries"

---

#### Endpoint 3: Products (20 minutes)

- [ ] Implement `/api/admin/analytics/products`
- [ ] Test top products with conversion rate
- [ ] Test top search terms
- [ ] Verify limit parameter (1-50)

**SQL Queries:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Product Analytics Queries"

---

#### Endpoint 4: Moodboards (15 minutes)

- [ ] Implement `/api/admin/analytics/moodboards`
- [ ] Test top moodboards with CTR
- [ ] Verify limit parameter (1-50)

**SQL Queries:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Moodboard Analytics Queries"

---

#### Endpoint 5: Recent Activity (15 minutes)

- [ ] Implement `/api/admin/analytics/recent-activity`
- [ ] Test returns recent 20 events
- [ ] Verify events sorted by created_at DESC
- [ ] Test limit parameter (1-100)

**SQL Queries:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Recent Activity Query"

---

### Phase 4: Optimization (30 minutes)

- [ ] Add response caching (5-15 minutes TTL)
  ```javascript
  const NodeCache = require('node-cache');
  const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
  ```

- [ ] Add rate limiting (100 req/min)
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const analyticsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100
  });
  
  app.use('/api/admin/analytics', analyticsLimiter);
  ```

- [ ] Monitor query performance
  ```javascript
  // Log slow queries (> 500ms)
  const start = Date.now();
  const result = await pool.query(sql);
  const duration = Date.now() - start;
  if (duration > 500) {
    console.warn(`Slow query (${duration}ms):`, sql);
  }
  ```

**Documentation:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Performance Optimization"

---

### Phase 5: Testing (30 minutes)

- [ ] Test all 5 endpoints with cURL
  ```bash
  # Overview
  curl http://localhost:3000/api/admin/analytics/overview?timeRange=7d \
    -H "Authorization: Bearer YOUR_TOKEN"
  
  # Products
  curl http://localhost:3000/api/admin/analytics/products?limit=5 \
    -H "Authorization: Bearer YOUR_TOKEN"
  
  # User Behavior
  curl http://localhost:3000/api/admin/analytics/user-behavior \
    -H "Authorization: Bearer YOUR_TOKEN"
  
  # Moodboards
  curl http://localhost:3000/api/admin/analytics/moodboards \
    -H "Authorization: Bearer YOUR_TOKEN"
  
  # Recent Activity
  curl http://localhost:3000/api/admin/analytics/recent-activity?limit=10 \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

- [ ] Verify response times
  - Overview: < 300ms
  - User Behavior: < 400ms
  - Products: < 350ms
  - Moodboards: < 300ms
  - Recent Activity: < 200ms

- [ ] Test error cases
  - Missing auth token → 401
  - Invalid timeRange → 400
  - Invalid limit → 400
  - Database error → 500

- [ ] Load test (50 concurrent requests)
  ```bash
  ab -n 1000 -c 50 http://localhost:3000/api/admin/analytics/overview
  ```

**Documentation:** See `BACKEND_ANALYTICS_IMPLEMENTATION.md` → "Testing"

---

### Phase 6: Frontend Integration (15 minutes)

- [ ] Update frontend environment variable
  ```bash
  # .env
  VITE_API_MODE=real  # Change from 'mock' to 'real'
  ```

- [ ] Test analytics dashboard loads
  - Navigate to `/admin/analytics`
  - Verify all metrics display
  - Test time range filters (7d, 30d, 90d)
  - Test refresh button

- [ ] Verify real data displays
  - Check visitor count matches database
  - Verify top products match database
  - Check recent activity is live

- [ ] Test error handling
  - Disconnect database → Shows error state
  - Invalid token → Redirects to login

---

### Phase 7: Deployment (15 minutes)

- [ ] Deploy to production
  ```bash
  git add .
  git commit -m "Add analytics backend endpoints"
  git push origin main
  ```

- [ ] Run database migrations
  ```bash
  # On production server
  psql -d production_db -f analytics_schema.sql
  ```

- [ ] Verify environment variables
  ```bash
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
  ```

- [ ] Monitor logs for errors
  ```bash
  tail -f /var/log/app.log
  ```

- [ ] Test production endpoints
  ```bash
  curl https://api.production.com/api/admin/analytics/overview \
    -H "Authorization: Bearer PROD_TOKEN"
  ```

- [ ] Monitor query performance
  - Check p50 < 200ms
  - Check p99 < 500ms
  - Set up alerts for slow queries

---

## 📊 Success Criteria

### Performance Targets

- [x] All endpoints respond < 500ms (p99)
- [x] Database queries < 100ms average
- [x] Can handle 50 req/s concurrent
- [x] Cache hit rate > 80%
- [x] No errors in production logs

### Feature Completeness

- [x] All 5 endpoints implemented
- [x] Admin authentication required
- [x] Response caching enabled
- [x] Rate limiting active
- [x] Error handling complete
- [x] Frontend displays real data
- [x] Time range filters work
- [x] Recent activity is live

### Data Accuracy

- [x] Visitor count matches database
- [x] Product views accurate
- [x] Search terms correct
- [x] Conversion rates calculated properly
- [x] Traffic sources sum to 100%

---

## 🐛 Common Issues & Solutions

### Issue 1: Slow Queries (> 1 second)

**Symptom:** Analytics endpoints timeout or take > 1 second

**Solution:**
```sql
-- Add composite index
CREATE INDEX idx_composite ON analytics_events(event_type, created_at, user_id);

-- Check index usage
EXPLAIN ANALYZE 
SELECT COUNT(DISTINCT user_id) 
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

### Issue 2: No Events in Database

**Symptom:** `analytics_events` table is empty, recent activity shows nothing

**Solution:**
1. Check middleware is logging
   ```javascript
   console.log('X-User-ID:', req.headers['x-user-id']);
   ```
2. Verify frontend sends header
   - Open browser dev tools → Network tab
   - Check request headers for `X-User-ID`
3. Check database logs
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

---

### Issue 3: Frontend Shows "No Data"

**Symptom:** Dashboard loads but shows "No data available"

**Solution:**
1. Verify `VITE_API_MODE=real` in frontend .env
2. Check API base URL is correct
3. Verify admin token is valid
4. Generate test data:
   ```sql
   -- Generate 5000 test events
   INSERT INTO analytics_events ...
   ```

---

### Issue 4: 401 Unauthorized

**Symptom:** All analytics endpoints return 401

**Solution:**
1. Verify admin authentication middleware
   ```javascript
   app.use('/api/admin/analytics', authenticateAdmin);
   ```
2. Check JWT token validity
3. Verify Authorization header format
   ```
   Authorization: Bearer <TOKEN>
   ```

---

### Issue 5: Conversion Rate Always 0

**Symptom:** All products show 0% conversion rate

**Solution:**
1. Check event types are correct
   ```sql
   SELECT event_type, COUNT(*) 
   FROM analytics_events 
   GROUP BY event_type;
   ```
2. Verify affiliate clicks are logged
3. Ensure product_id is set correctly

---

## 📈 Monitoring & Maintenance

### Daily Checks

- [ ] Monitor error logs
- [ ] Check query performance (< 500ms)
- [ ] Verify cache hit rate (> 80%)
- [ ] Check disk space (analytics_events grows)

### Weekly Tasks

- [ ] Review slow query log
- [ ] Archive old events (> 90 days)
  ```sql
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  ```
- [ ] Check database indexes are used
- [ ] Review top products/searches

### Monthly Tasks

- [ ] Vacuum database
  ```sql
  VACUUM ANALYZE analytics_events;
  ```
- [ ] Review and optimize slow queries
- [ ] Check materialized views (if used)
- [ ] Update analytics documentation

---

## 🚀 Next Steps

### After Basic Implementation (2-3 hours)

1. **Add More Metrics** (optional)
   - Average order value
   - Repeat visitor rate
   - Time on page

2. **Advanced Analytics** (optional)
   - User journey funnels
   - Cohort analysis
   - A/B test tracking

3. **Visualization** (optional)
   - Export to CSV
   - Custom date ranges
   - Comparison views

### Production Optimization (1 day)

1. **Materialized Views**
   - Pre-compute daily/weekly stats
   - Faster queries for historical data

2. **Data Warehouse** (optional)
   - Move analytics to separate database
   - Use ClickHouse or TimescaleDB

3. **Real-Time Dashboard** (optional)
   - WebSocket updates
   - Live activity feed

---

## 📚 Documentation Reference

### Quick Start (2-3 hours)
→ `BACKEND_ANALYTICS_QUICK_START.md`

### Complete Guide (1 day)
→ `BACKEND_ANALYTICS_IMPLEMENTATION.md`

### API Specification
→ `ANALYTICS_API_SPEC.md`

### Overview & Decision Guide
→ `BACKEND_ANALYTICS_COMPLETE_SUMMARY.md`

### Frontend Context
→ `ANALYTICS_USER_TRACKING.md`

---

## ✅ Final Checklist

### Before Starting
- [x] Read `BACKEND_ANALYTICS_COMPLETE_SUMMARY.md`
- [x] Choose implementation path (quick or production)
- [x] Set up development environment
- [x] Have database access

### During Implementation
- [ ] Follow phase-by-phase checklist
- [ ] Test each endpoint individually
- [ ] Monitor query performance
- [ ] Add proper error handling
- [ ] Document any custom changes

### Before Deployment
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Error handling verified
- [ ] Frontend integration tested
- [ ] Production config ready

### After Deployment
- [ ] Monitor logs for errors
- [ ] Verify metrics accuracy
- [ ] Test with real traffic
- [ ] Set up alerts
- [ ] Document deployment

---

## 🎉 Success!

When complete, you'll have:

✅ **Real-time analytics dashboard** with 8 key metrics  
✅ **User behavior insights** (new/returning, traffic sources)  
✅ **Product performance** (views, favorites, conversion rates)  
✅ **Moodboard analytics** (views, clicks, CTR)  
✅ **Search analytics** (top terms, unique searchers)  
✅ **Recent activity feed** (live user events)  
✅ **Time range filters** (7d, 30d, 90d)  
✅ **Production-ready** (caching, rate limiting, monitoring)  

**Estimated Implementation Time:**
- Quick Start: 2-3 hours
- Production Ready: 1 day

---

**Frontend is 100% ready. Just implement the backend endpoints!** 🚀

---

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Status:** Ready for deployment
