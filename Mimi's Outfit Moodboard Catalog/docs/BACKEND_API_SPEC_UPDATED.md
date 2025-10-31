# The Lookbook API - Complete Backend Specification

**Version:** 2.0.0  
**Last Updated:** January 2024  
**Base URL:** `https://api.thelookbookbymimi.com/v1`

---

## Overview

This document provides the complete REST API specification for The Lookbook by Mimi backend. All endpoints support JSON request/response format and include proper error handling.

### Base Response Format

All successful API responses follow this structure:

```json
{
  "data": [...],      // Array or object with the actual data
  "pagination": {...} // Optional: Only for paginated endpoints
}
```

### Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional: Additional context
  }
}
```

### Common Query Parameters

Most list endpoints support these parameters:

- `page` (integer, default: 1) - Page number for pagination
- `limit` (integer, default: 12, max: 100) - Number of items per page
- `search` (string) - Full-text search query

---

## Products Endpoints

### 1. List/Search Products

**Endpoint:** `GET /products`

**Description:** Fetch products with optional search, filters, and sorting. Supports pagination.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Full-text search across name, brand, description, tags, category |
| `category` | string | No | Filter by exact category match |
| `brand` | string | No | Filter by exact brand match |
| `tag` | string | No | Filter by tag (exact match) |
| `minPrice` | number | No | Minimum price filter (inclusive) |
| `maxPrice` | number | No | Maximum price filter (inclusive) |
| `sortBy` | string | No | Sort order: `newest`, `price-low`, `price-high`, `name` (default: `newest`) |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 12, max: 100) |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "brand": "Burberry",
      "category": "outerwear",
      "description": "Timeless beige trench coat...",
      "price": 450.00,
      "imageUrl": "https://cdn.example.com/prod001.jpg",
      "affiliateUrl": "https://partner.com/prod001",
      "tags": ["classic", "minimalist", "timeless"],
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 52,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Example Requests:**

```bash
# Search with pagination
GET /products?search=jacket&page=1&limit=12

# Filter by category and price range
GET /products?category=outerwear&minPrice=100&maxPrice=500

# Sort by price
GET /products?sortBy=price-low&limit=24

# Multiple filters
GET /products?brand=Burberry&tag=minimalist&sortBy=newest
```

---

### 2. Get Product by ID

**Endpoint:** `GET /products/{id}`

**Description:** Fetch a single product by its internal database ID.

**Path Parameters:**

- `id` (string, required) - Product ID (e.g., `prod_001`)

**Response:** `200 OK`

```json
{
  "id": "prod_001",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat for all seasons...",
  "price": 450.00,
  "imageUrl": "https://cdn.example.com/prod001.jpg",
  "affiliateUrl": "https://partner.com/prod001",
  "tags": ["classic", "minimalist", "timeless"],
  "isFeatured": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Product doesn't exist
- `500 Internal Server Error` - Database error

---

### 3. Get Product by Slug

**Endpoint:** `GET /products/slug/{slug}`

**Description:** Fetch a single product by its URL-friendly slug. This is the preferred method for product detail pages.

**Path Parameters:**

- `slug` (string, required) - Product slug (e.g., `classic-trench-coat`)

**Response:** `200 OK` (Same structure as Get Product by ID)

**Example Request:**

```bash
GET /products/slug/classic-trench-coat
```

**Error Responses:**

- `404 Not Found` - Product with that slug doesn't exist
- `500 Internal Server Error` - Database error

---

### 4. Get Related Products

**Endpoint:** `GET /products/{id}/related`

**Description:** Get products related to a specific product based on category, brand, tags, and similarity score.

**Path Parameters:**

- `id` (string, required) - Product ID

**Query Parameters:**

- `limit` (integer, optional, default: 4, max: 20) - Maximum number of related products

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "prod_002",
      "name": "Wool Blazer",
      "slug": "wool-blazer",
      "brand": "Burberry",
      "category": "outerwear",
      "description": "Tailored wool blazer...",
      "price": 380.00,
      "imageUrl": "https://cdn.example.com/prod002.jpg",
      "affiliateUrl": "https://partner.com/prod002",
      "tags": ["classic", "professional"],
      "isFeatured": false,
      "createdAt": "2024-01-20T14:20:00Z",
      "relevanceScore": 0.85
    }
  ]
}
```

**Related Products Algorithm:**

1. Same category (weight: 0.4)
2. Same brand (weight: 0.3)
3. Overlapping tags (weight: 0.3)
4. Sort by combined relevance score
5. Exclude the original product

**Error Responses:**

- `404 Not Found` - Product doesn't exist
- `500 Internal Server Error` - Database error

---

### 5. Get Featured Products

**Endpoint:** `GET /products/featured`

**Description:** Get all products marked as featured. Used for homepage hero sections.

**Query Parameters:**

- `limit` (integer, optional, default: 6, max: 20) - Maximum number of featured products

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "brand": "Burberry",
      "category": "outerwear",
      "price": 450.00,
      "imageUrl": "https://cdn.example.com/prod001.jpg",
      "affiliateUrl": "https://partner.com/prod001",
      "tags": ["classic", "minimalist"],
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 6. Get All Product Categories

**Endpoint:** `GET /products/categories`

**Description:** Get a distinct list of all product categories.

**Response:** `200 OK`

```json
{
  "data": [
    "outerwear",
    "dresses",
    "tops",
    "bottoms",
    "shoes",
    "accessories"
  ]
}
```

---

### 7. Get All Product Brands

**Endpoint:** `GET /products/brands`

**Description:** Get a distinct list of all product brands.

**Response:** `200 OK`

```json
{
  "data": [
    "Burberry",
    "Reformation",
    "Everlane",
    "& Other Stories",
    "Veja"
  ]
}
```

---

### 8. Get All Product Tags

**Endpoint:** `GET /products/tags`

**Description:** Get a distinct list of all product tags.

**Response:** `200 OK`

```json
{
  "data": [
    "classic",
    "minimalist",
    "timeless",
    "sustainable",
    "versatile",
    "statement"
  ]
}
```

---

## Moodboards Endpoints

### 9. List/Search Moodboards

**Endpoint:** `GET /moodboards`

**Description:** Fetch moodboards with optional search, filters, and pagination.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Full-text search across title, description, tags |
| `tag` | string | No | Filter by tag (exact match) |
| `featured` | boolean | No | Only featured moodboards (true/false) |
| `sortBy` | string | No | Sort order: `newest`, `oldest` (default: `newest`) |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 12, max: 50) |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "mood_001",
      "slug": "parisian-chic",
      "title": "Parisian Chic",
      "description": "Effortlessly chic French-inspired looks...",
      "coverImage": "https://cdn.example.com/mood001.jpg",
      "tags": ["elegant", "french", "timeless"],
      "isFeatured": true,
      "productCount": 8,
      "createdAt": "2024-01-10T09:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Example Requests:**

```bash
# Get featured moodboards
GET /moodboards?featured=true

# Search moodboards
GET /moodboards?search=french&page=1

# Filter by tag
GET /moodboards?tag=minimalist
```

---

### 10. Get Moodboard by ID

**Endpoint:** `GET /moodboards/{id}`

**Description:** Fetch a complete moodboard including all products, styling tips, and metadata.

**Path Parameters:**

- `id` (string, required) - Moodboard ID (e.g., `mood_001`)

**Response:** `200 OK`

```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "description": "Effortlessly chic French-inspired looks...",
  "coverImage": "https://cdn.example.com/mood001.jpg",
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair the trench coat with tailored trousers for a polished look",
    "Add a silk scarf for an authentic Parisian touch",
    "Keep accessories minimal and elegant"
  ],
  "howToWear": "Perfect for spring and fall transitions...",
  "products": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "brand": "Burberry",
      "category": "outerwear",
      "price": 450.00,
      "imageUrl": "https://cdn.example.com/prod001.jpg",
      "affiliateUrl": "https://partner.com/prod001",
      "tags": ["classic", "timeless"],
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Moodboard doesn't exist
- `500 Internal Server Error` - Database error

---

### 11. Get Moodboard by Slug

**Endpoint:** `GET /moodboards/slug/{slug}`

**Description:** Fetch a moodboard by its URL-friendly slug. Preferred method for moodboard detail pages.

**Path Parameters:**

- `slug` (string, required) - Moodboard slug (e.g., `parisian-chic`)

**Response:** `200 OK` (Same structure as Get Moodboard by ID)

**Example Request:**

```bash
GET /moodboards/slug/parisian-chic
```

---

### 12. Get Featured Moodboards

**Endpoint:** `GET /moodboards/featured`

**Description:** Get all moodboards marked as featured. Used for homepage.

**Query Parameters:**

- `limit` (integer, optional, default: 3, max: 10) - Maximum number of featured moodboards

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "mood_001",
      "slug": "parisian-chic",
      "title": "Parisian Chic",
      "description": "Effortlessly chic...",
      "coverImage": "https://cdn.example.com/mood001.jpg",
      "tags": ["elegant", "french"],
      "isFeatured": true,
      "productCount": 8,
      "createdAt": "2024-01-10T09:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ]
}
```

---

### 13. Get Moodboard Tags

**Endpoint:** `GET /moodboards/tags`

**Description:** Get a distinct list of all moodboard tags.

**Response:** `200 OK`

```json
{
  "data": [
    "elegant",
    "french",
    "minimalist",
    "bohemian",
    "casual",
    "professional"
  ]
}
```

---

### 14. Get Related Products for Moodboard

**Endpoint:** `GET /moodboards/{id}/related`

**Description:** Get products related to a moodboard based on tag overlap and semantic similarity.

**Path Parameters:**

- `id` (string, required) - Moodboard ID

**Query Parameters:**

- `limit` (integer, optional, default: 10, max: 50) - Maximum related products

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "prod_015",
      "name": "Silk Scarf",
      "slug": "silk-scarf-parisian",
      "brand": "Hermès",
      "category": "accessories",
      "price": 120.00,
      "imageUrl": "https://cdn.example.com/prod015.jpg",
      "affiliateUrl": "https://partner.com/prod015",
      "tags": ["elegant", "french", "accessory"],
      "relevanceScore": 0.92,
      "matchReason": "2 overlapping tags"
    }
  ]
}
```

**Related Products Algorithm:**

1. Tag overlap with moodboard tags (weight: 0.6)
2. Semantic similarity with moodboard title/description (weight: 0.4)
3. Exclude products already in the moodboard
4. Sort by combined relevance score

---

## Data Models

### Product Model

```typescript
interface Product {
  id: string;              // Unique identifier (e.g., "prod_001")
  name: string;            // Product name
  slug: string;            // URL-friendly slug (e.g., "classic-trench-coat")
  brand?: string;          // Brand name (optional)
  category?: string;       // Category (e.g., "outerwear")
  description?: string;    // Product description
  price: number | null;    // Price in USD (null if not available)
  imageUrl: string;        // Product image URL
  affiliateUrl: string;    // Affiliate purchase link
  tags?: string[];         // Array of tags
  isFeatured?: boolean;    // Featured flag (default: false)
  createdAt: string;       // ISO 8601 timestamp
}
```

### Moodboard Model

```typescript
interface Moodboard {
  id: string;              // Unique identifier (e.g., "mood_001")
  slug: string;            // URL-friendly slug (e.g., "parisian-chic")
  title: string;           // Moodboard title
  description?: string;    // Moodboard description
  coverImage: string;      // Cover image URL
  tags?: string[];         // Array of tags
  isFeatured?: boolean;    // Featured flag (default: false)
  stylingTips?: string[];  // Array of styling tips
  howToWear?: string;      // How to wear guide
  products: Product[];     // Array of products in this moodboard
  productCount?: number;   // Number of products (for list views)
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### Pagination Model

```typescript
interface PaginationInfo {
  page: number;          // Current page number
  limit: number;         // Items per page
  total: number;         // Total number of items
  totalPages: number;    // Total number of pages
  hasNextPage: boolean;  // Has next page flag
  hasPrevPage: boolean;  // Has previous page flag
}
```

### Paginated Response Model

```typescript
interface PaginatedResponse<T> {
  data: T[];                  // Array of items
  pagination: PaginationInfo; // Pagination metadata
}
```

---

## API Endpoints Summary

### Products (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List/search products with filters and pagination |
| GET | `/products/{id}` | Get product by ID |
| GET | `/products/slug/{slug}` | Get product by slug (preferred) |
| GET | `/products/{id}/related` | Get related products |
| GET | `/products/featured` | Get featured products |
| GET | `/products/categories` | Get all categories |
| GET | `/products/brands` | Get all brands |
| GET | `/products/tags` | Get all tags |

### Moodboards (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/moodboards` | List/search moodboards with filters |
| GET | `/moodboards/{id}` | Get moodboard by ID |
| GET | `/moodboards/slug/{slug}` | Get moodboard by slug (preferred) |
| GET | `/moodboards/featured` | Get featured moodboards |
| GET | `/moodboards/tags` | Get all moodboard tags |
| GET | `/moodboards/{id}/related` | Get related products for moodboard |

**Total: 14 Endpoints**

---

## Authentication & Security

### API Key Authentication

All requests must include an API key in the header:

```
X-API-Key: your_api_key_here
```

**Error Response (401 Unauthorized):**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### Rate Limiting

- **Rate Limit:** 1000 requests per hour per API key
- **Headers:**
  - `X-RateLimit-Limit` - Maximum requests per hour
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Unix timestamp when limit resets

**Error Response (429 Too Many Requests):**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 minutes.",
    "details": {
      "retryAfter": 1800
    }
  }
}
```

---

## Error Codes Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily down |

---

## Testing & Environment

### Base URLs

- **Production:** `https://api.thelookbookbymimi.com/v1`
- **Staging:** `https://staging-api.thelookbookbymimi.com/v1`
- **Development:** `http://localhost:3000`

### Test API Key

Development/staging API key for testing:

```
dev_test_key_1234567890abcdef
```

---

## Implementation Checklist

### Phase 1: Core Setup (2-3 days)
- [ ] Set up Node.js + Express server
- [ ] Configure PostgreSQL database
- [ ] Implement database schema with indexes
- [ ] Set up environment variables
- [ ] Implement API key authentication middleware
- [ ] Set up error handling middleware

### Phase 2: Products API (3-4 days)
- [ ] Implement `/products` with search & filters
- [ ] Implement `/products/{id}` and `/products/slug/{slug}`
- [ ] Implement `/products/{id}/related` with algorithm
- [ ] Implement `/products/featured`
- [ ] Implement `/products/categories`
- [ ] Implement `/products/brands`
- [ ] Implement `/products/tags`
- [ ] Add full-text search indexes

### Phase 3: Moodboards API (2-3 days)
- [ ] Implement `/moodboards` with search & filters
- [ ] Implement `/moodboards/{id}` and `/moodboards/slug/{slug}`
- [ ] Implement `/moodboards/{id}/related`
- [ ] Implement `/moodboards/featured`
- [ ] Implement `/moodboards/tags`
- [ ] Set up moodboard-product relationships

### Phase 4: Performance & Security (2-3 days)
- [ ] Add Redis caching for frequently accessed data
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Add SQL injection prevention
- [ ] Set up CORS properly
- [ ] Add compression middleware

### Phase 5: Testing & Documentation (2 days)
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Load testing
- [ ] API documentation with examples
- [ ] Deployment guide

**Total Timeline:** 11-15 days

---

## Support & Resources

- **GitHub Repository:** [github.com/lookbook/backend](https://github.com/lookbook/backend)
- **Documentation:** [docs.thelookbookbymimi.com](https://docs.thelookbookbymimi.com)
- **Support Email:** dev@thelookbookbymimi.com

---

**Last Updated:** January 2024  
**Version:** 2.0.0
