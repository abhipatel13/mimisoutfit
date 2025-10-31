# Backend Implementation Checklist

Complete step-by-step guide for implementing The Lookbook by Mimi backend API.

---

## Phase 1: Setup & Database

### 1.1 Choose Your Stack
- [ ] Select database (PostgreSQL, MySQL, or MongoDB)
- [ ] Choose backend framework (Node.js/Express, Django, Rails, etc.)
- [ ] Set up development environment

### 1.2 Database Setup
- [ ] Install database server
- [ ] Create database instance
- [ ] Run schema creation scripts from `/docs/DATABASE_SCHEMAS.md`
- [ ] Create indexes for performance
- [ ] Test database connection

**PostgreSQL Example:**
```bash
createdb lookbook_db
psql -d lookbook_db -f create_tables.sql
psql -d lookbook_db -f create_indexes.sql
```

**MongoDB Example:**
```javascript
use lookbook_db
db.products.createIndex({ id: 1 }, { unique: true })
db.products.createIndex({ category: 1 })
// ... other indexes
```

### 1.3 Environment Configuration
- [ ] Create `.env` file
- [ ] Set `DATABASE_URL`
- [ ] Set `API_KEY` for authentication
- [ ] Set `PORT` and other config

**Example `.env`:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/lookbook_db
API_KEY=your_secure_api_key_here
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## Phase 2: Core API Implementation

### 2.1 Base API Setup
- [ ] Initialize project (npm init, etc.)
- [ ] Install dependencies (express, database driver, etc.)
- [ ] Set up middleware (CORS, body-parser, etc.)
- [ ] Create base server file
- [ ] Implement API key authentication
- [ ] Test basic server startup

**Node.js Example:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHORIZED', message: 'Missing API key' }
    });
  }
  const apiKey = authHeader.substring(7);
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHORIZED', message: 'Invalid API key' }
    });
  }
  next();
};

app.use(authenticate);
```

### 2.2 Error Handling
- [ ] Create error response utility
- [ ] Implement global error handler
- [ ] Add validation error handling
- [ ] Add 404 handler

**Example Error Handler:**
```javascript
const errorResponse = (code, message, details = null) => ({
  error: { code, message, details }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json(
    errorResponse('INTERNAL_ERROR', 'An unexpected error occurred')
  );
});
```

---

## Phase 3: Products API

### 3.1 Get All Products (with Pagination & Filters)
**Endpoint:** `GET /products`

- [ ] Implement query parameter parsing
- [ ] Implement search functionality (multi-field)
- [ ] Implement category filter
- [ ] Implement brand filter
- [ ] Implement tag filter
- [ ] Implement price range filter (minPrice, maxPrice)
- [ ] Implement sorting (newest, price-low, price-high, name)
- [ ] Implement pagination logic
- [ ] Calculate pagination metadata
- [ ] Test with various filter combinations

**Node.js + PostgreSQL Example:**
```javascript
app.get('/products', async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      tag,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    let query = 'SELECT p.*, array_agg(pt.tag) as tags FROM products p ' +
                'LEFT JOIN product_tags pt ON p.id = pt.product_id';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    // Search
    if (search) {
      conditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.brand ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      conditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Brand filter
    if (brand) {
      conditions.push(`p.brand = $${paramIndex}`);
      params.push(brand);
      paramIndex++;
    }

    // Price range
    if (minPrice) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseFloat(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY p.id';

    // Sorting
    const sortMap = {
      newest: 'p.created_at DESC',
      'price-low': 'p.price ASC',
      'price-high': 'p.price DESC',
      name: 'p.name ASC'
    };
    query += ` ORDER BY ${sortMap[sortBy] || sortMap.newest}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(DISTINCT p.id) FROM')
                            .replace(/GROUP BY.*?$/, '')
                            .replace(/ORDER BY.*?$/, '')
                            .replace(/LIMIT.*?$/, '');
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: offset + result.rows.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### 3.2 Get Product by ID
**Endpoint:** `GET /products/:id`

- [ ] Implement ID parameter extraction
- [ ] Query product by ID with tags
- [ ] Return 404 if not found
- [ ] Test with valid and invalid IDs

**Example:**
```javascript
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.*, array_agg(pt.tag) as tags 
      FROM products p 
      LEFT JOIN product_tags pt ON p.id = pt.product_id 
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', `Product with id '${id}' not found`)
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
```

### 3.3 Get Product by Slug
**Endpoint:** `GET /products/slug/:slug`

- [ ] Implement slug parameter extraction
- [ ] Query product by slug
- [ ] Return 404 if not found
- [ ] Test with valid and invalid slugs

### 3.4 Get Featured Products
**Endpoint:** `GET /products/featured`

- [ ] Query products where `isFeatured = true`
- [ ] Include tags in response
- [ ] Test response

### 3.5 Get Categories
**Endpoint:** `GET /products/categories`

- [ ] Query distinct categories
- [ ] Return as string array
- [ ] Test response

**Example:**
```javascript
app.get('/products/categories', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    );
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    next(error);
  }
});
```

### 3.6 Get Brands
**Endpoint:** `GET /products/brands`

- [ ] Query distinct brands
- [ ] Return as string array
- [ ] Test response

### 3.7 Get Tags
**Endpoint:** `GET /products/tags`

- [ ] Query distinct tags
- [ ] Return as string array
- [ ] Test response

### 3.8 Search Products
**Endpoint:** `GET /products/search?q=query`

- [ ] Implement query parameter validation
- [ ] Perform multi-field search
- [ ] Return matching products with tags
- [ ] Test with various queries

---

## Phase 4: Moodboards API

### 4.1 Get All Moodboards (with Pagination & Filters)
**Endpoint:** `GET /moodboards`

- [ ] Implement search functionality
- [ ] Implement tag filter
- [ ] Implement featured filter
- [ ] Implement pagination
- [ ] Include nested products, tags, and styling tips
- [ ] Test with various filters

**Note:** Moodboards require joining multiple tables (products, tags, styling tips)

**PostgreSQL Example:**
```javascript
app.get('/moodboards', async (req, res) => {
  try {
    const {
      search,
      tag,
      featured,
      page = 1,
      limit = 12
    } = req.query;

    // Get moodboards with filters
    let query = 'SELECT * FROM moodboards';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (featured !== undefined) {
      conditions.push(`is_featured = $${paramIndex}`);
      params.push(featured === 'true');
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const moodboards = await db.query(query, params);

    // For each moodboard, get tags, styling tips, and products
    for (let moodboard of moodboards.rows) {
      // Get tags
      const tagsResult = await db.query(
        'SELECT tag FROM moodboard_tags WHERE moodboard_id = $1',
        [moodboard.id]
      );
      moodboard.tags = tagsResult.rows.map(r => r.tag);

      // Get styling tips
      const tipsResult = await db.query(
        'SELECT tip FROM moodboard_styling_tips WHERE moodboard_id = $1 ORDER BY sort_order',
        [moodboard.id]
      );
      moodboard.stylingTips = tipsResult.rows.map(r => r.tip);

      // Get products
      const productsResult = await db.query(`
        SELECT p.*, array_agg(pt.tag) as tags
        FROM moodboard_products mp
        JOIN products p ON mp.product_id = p.id
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        WHERE mp.moodboard_id = $1
        GROUP BY p.id
        ORDER BY mp.sort_order
      `, [moodboard.id]);
      moodboard.products = productsResult.rows;
    }

    // Get total count
    // ... similar to products API

    res.json({
      data: moodboards.rows,
      pagination: { /* ... */ }
    });
  } catch (error) {
    next(error);
  }
});
```

### 4.2 Get Moodboard by ID
**Endpoint:** `GET /moodboards/:id`

- [ ] Implement ID parameter extraction
- [ ] Query moodboard with all nested data
- [ ] Return 404 if not found
- [ ] Test with valid and invalid IDs

### 4.3 Get Featured Moodboards
**Endpoint:** `GET /moodboards/featured`

- [ ] Query moodboards where `isFeatured = true`
- [ ] Include nested data
- [ ] Test response

### 4.4 Get Moodboard Tags
**Endpoint:** `GET /moodboards/tags`

- [ ] Query distinct tags
- [ ] Return as string array
- [ ] Test response

### 4.5 Search Moodboards
**Endpoint:** `GET /moodboards/search?q=query`

- [ ] Implement query parameter validation
- [ ] Perform search on title, description, tags
- [ ] Include nested data
- [ ] Test with various queries

---

## Phase 5: Performance Optimization

### 5.1 Database Optimization
- [ ] Verify all indexes are created
- [ ] Run EXPLAIN ANALYZE on slow queries
- [ ] Add missing indexes if needed
- [ ] Consider materialized views for complex queries

### 5.2 Caching
- [ ] Implement Redis caching
- [ ] Cache featured products (1 hour TTL)
- [ ] Cache featured moodboards (1 hour TTL)
- [ ] Cache categories/brands/tags (24 hours TTL)
- [ ] Add cache invalidation on data updates

**Example Redis Caching:**
```javascript
const redis = require('redis');
const client = redis.createClient();

const cache = async (key, ttl, fetchFn) => {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await client.setex(key, ttl, JSON.stringify(data));
  return data;
};

app.get('/products/featured', async (req, res) => {
  try {
    const products = await cache('featured_products', 3600, async () => {
      const result = await db.query(/* ... */);
      return result.rows;
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});
```

### 5.3 Response Compression
- [ ] Install compression middleware
- [ ] Enable gzip compression
- [ ] Test response sizes

```javascript
const compression = require('compression');
app.use(compression());
```

---

## Phase 6: Security

### 6.1 Authentication & Authorization
- [ ] Implement secure API key storage
- [ ] Add rate limiting per API key
- [ ] Log API key usage
- [ ] Rotate API keys periodically

### 6.2 Rate Limiting
- [ ] Install rate limiting middleware
- [ ] Set 100 requests/minute per API key
- [ ] Set 1000 requests/hour per API key
- [ ] Return 429 on limit exceeded

**Example:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests')
    );
  }
});

app.use(limiter);
```

### 6.3 Input Validation
- [ ] Validate all query parameters
- [ ] Sanitize search inputs
- [ ] Validate pagination parameters (positive integers)
- [ ] Validate price ranges (non-negative)
- [ ] Return 400 for invalid inputs

**Example:**
```javascript
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 12 } = req.query;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json(
      errorResponse('INVALID_PARAMETER', 'Invalid pagination parameters')
    );
  }
  
  next();
};
```

### 6.4 SQL Injection Prevention
- [ ] Use parameterized queries (never string concatenation)
- [ ] Use ORM with query builders
- [ ] Validate and sanitize all inputs

---

## Phase 7: Testing

### 7.1 Unit Tests
- [ ] Test pagination logic
- [ ] Test filter logic
- [ ] Test search functionality
- [ ] Test error handling

### 7.2 Integration Tests
- [ ] Test GET /products with various filters
- [ ] Test GET /products/:id
- [ ] Test GET /moodboards with filters
- [ ] Test authentication
- [ ] Test rate limiting
- [ ] Test error responses

**Example Test (Jest):**
```javascript
describe('GET /products', () => {
  it('should return paginated products', async () => {
    const res = await request(app)
      .get('/products?page=1&limit=12')
      .set('Authorization', 'Bearer test_api_key');
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 12);
  });

  it('should filter by category', async () => {
    const res = await request(app)
      .get('/products?category=dresses')
      .set('Authorization', 'Bearer test_api_key');
    
    expect(res.status).toBe(200);
    res.body.data.forEach(product => {
      expect(product.category).toBe('dresses');
    });
  });
});
```

### 7.3 Load Testing
- [ ] Use tools like Apache Bench, k6, or Artillery
- [ ] Test 100 concurrent requests
- [ ] Verify response times < 200ms
- [ ] Check for memory leaks

```bash
# Apache Bench example
ab -n 1000 -c 100 -H "Authorization: Bearer test_key" http://localhost:3000/products
```

---

## Phase 8: Deployment

### 8.1 Environment Setup
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure domain DNS

### 8.2 Deployment Platform
Choose one:
- [ ] Deploy to Heroku
- [ ] Deploy to AWS (EC2, ECS, or Lambda)
- [ ] Deploy to Google Cloud
- [ ] Deploy to DigitalOcean
- [ ] Deploy to Railway or Render

### 8.3 Monitoring & Logging
- [ ] Set up application logging
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Set up performance monitoring (New Relic, DataDog)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)

### 8.4 Database Backups
- [ ] Configure automated daily backups
- [ ] Test backup restoration
- [ ] Document backup/restore procedures

---

## Phase 9: Documentation

### 9.1 API Documentation
- [ ] Create Swagger/OpenAPI specification
- [ ] Generate interactive API docs
- [ ] Document authentication
- [ ] Provide example requests/responses

### 9.2 Deployment Documentation
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Document backup/restore procedures
- [ ] Create runbook for common issues

---

## Phase 10: Frontend Integration

### 10.1 Update Frontend Configuration
- [ ] Set `VITE_API_MODE=real` in frontend `.env`
- [ ] Set `VITE_API_BASE_URL=https://api.yourdomain.com`
- [ ] Set `VITE_API_KEY=your_api_key`
- [ ] Test frontend connection

### 10.2 End-to-End Testing
- [ ] Test product browsing
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test moodboard browsing
- [ ] Test error handling
- [ ] Test on mobile devices

---

## Quick Start Commands

### PostgreSQL Setup
```bash
createdb lookbook_db
psql -d lookbook_db < schema.sql
```

### Node.js Project
```bash
npm init -y
npm install express pg cors dotenv compression express-rate-limit
npm install --save-dev jest supertest
```

### Run Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Deploy to Production
```bash
git push heroku main
# or
npm run deploy
```

---

## Resources

- **Frontend Docs**: `/docs/API_INTEGRATION.md`
- **API Spec**: `/docs/BACKEND_API_SPEC.md`
- **Database Schemas**: `/docs/DATABASE_SCHEMAS.md`
- **Endpoints Summary**: `/docs/API_ENDPOINTS_SUMMARY.md`

---

**Estimated Timeline:**
- Phase 1-2: 1-2 days (setup)
- Phase 3-4: 3-5 days (API implementation)
- Phase 5-6: 1-2 days (optimization & security)
- Phase 7: 2-3 days (testing)
- Phase 8-9: 1-2 days (deployment & docs)
- Phase 10: 1 day (frontend integration)

**Total: 9-15 days** for complete backend implementation

---

**Last Updated:** January 2025
