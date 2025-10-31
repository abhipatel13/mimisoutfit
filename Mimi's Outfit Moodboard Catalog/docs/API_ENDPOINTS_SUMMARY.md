# API Endpoints Quick Reference

## Base Configuration
```
Base URL: https://api.yourdomain.com
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

---

## Products Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/products` | Get all products with filters & pagination | `search`, `category`, `brand`, `tag`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit` |
| GET | `/products/:id` | Get product by ID | - |
| GET | `/products/slug/:slug` | Get product by slug | - |
| GET | `/products/featured` | Get featured products | - |
| GET | `/products/categories` | Get all categories | - |
| GET | `/products/brands` | Get all brands | - |
| GET | `/products/tags` | Get all tags | - |
| GET | `/products/search?q=query` | Search products | `q` (required) |

---

## Moodboards Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/moodboards` | Get all moodboards with filters & pagination | `search`, `tag`, `featured`, `page`, `limit` |
| GET | `/moodboards/slug/:slug` | Get moodboard by slug (SEO-friendly) | - |
| GET | `/moodboards/:id` | Get moodboard by ID (backward compatible) | - |
| GET | `/moodboards/featured` | Get featured moodboards | - |
| GET | `/moodboards/tags` | Get all moodboard tags | - |
| GET | `/moodboards/search?q=query` | Search moodboards | `q` (required) |

---

## Data Models (TypeScript)

### Product
```typescript
{
  id: string;
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string;
  affiliateUrl: string;
  brand?: string;
  tags?: string[];
  category?: string;
  description?: string;
  isFeatured?: boolean;
  createdAt: string; // ISO 8601
}
```

### Moodboard
```typescript
{
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
  products: Product[];
  tags?: string[];
  isFeatured?: boolean;
  stylingTips?: string[];
  howToWear?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Paginated Response
```typescript
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

### Error Response
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing/invalid API key) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Example Requests

### Get Products with Pagination
```bash
GET /products?page=1&limit=12&sortBy=price-low
```

### Search Products
```bash
GET /products?search=dress&category=dresses&minPrice=50&maxPrice=200
```

### Get Product by ID
```bash
GET /products/prod_001
```

### Get Featured Moodboards
```bash
GET /moodboards/featured
```

### Search Moodboards
```bash
GET /moodboards?search=minimalist&tag=classic
```

---

## Database Indexes (Recommended)

### Products Table
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_featured ON products(isFeatured);
CREATE INDEX idx_products_created ON products(createdAt);
```

### Moodboards Table
```sql
CREATE INDEX idx_moodboards_slug ON moodboards(slug);
CREATE INDEX idx_moodboards_featured ON moodboards(isFeatured);
CREATE INDEX idx_moodboards_created ON moodboards(createdAt);
```

---

## Rate Limiting
- 100 requests/minute per API key
- 1000 requests/hour per API key
- Returns `429 Too Many Requests` when exceeded

---

For complete documentation, see: `/docs/BACKEND_API_SPEC.md`
