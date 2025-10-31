# Backend API Specification
**The Lookbook by Mimi - Complete API Documentation**

## Table of Contents
1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Products API](#products-api)
4. [Moodboards API](#moodboards-api)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Pagination](#pagination)

---

## Base Configuration

### Base URL
```
https://api.yourdomain.com
```

### Headers (Required for all requests)
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

### Environment Variables
```bash
VITE_API_MODE=real                          # Set to 'real' for backend connection
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key_here
VITE_API_DEBUG=true                          # Enable request/response logging
```

---

## Authentication

The API expects an API key in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

All requests without a valid API key will return `401 Unauthorized`.

---

## Products API

### 1. Get All Products (with Pagination & Filters)

**Endpoint:** `GET /products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search query (searches name, brand, description, tags, category) |
| `category` | string | No | Filter by category |
| `brand` | string | No | Filter by brand |
| `tag` | string | No | Filter by tag |
| `minPrice` | number | No | Minimum price filter |
| `maxPrice` | number | No | Maximum price filter |
| `sortBy` | string | No | Sort order: `newest`, `price-low`, `price-high`, `name` |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 12) |

**Example Request:**
```bash
GET /products?search=dress&category=dresses&sortBy=price-low&page=1&limit=12
```

**Response Model:**
```typescript
{
  data: Product[];
  pagination: {
    page: number;           // Current page
    limit: number;          // Items per page
    total: number;          // Total items matching filters
    totalPages: number;     // Total number of pages
    hasNextPage: boolean;   // Whether there's a next page
    hasPrevPage: boolean;   // Whether there's a previous page
  }
}
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "price": 450,
      "imageUrl": "https://images.unsplash.com/photo-...",
      "affiliateUrl": "https://...",
      "brand": "Burberry",
      "tags": ["outerwear", "classic", "timeless"],
      "category": "outerwear",
      "description": "A timeless trench coat...",
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

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Server error

---

### 2. Get Product by ID

**Endpoint:** `GET /products/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Example Request:**
```bash
GET /products/prod_001
```

**Response Model:**
```typescript
Product | null
```

**Example Response:**
```json
{
  "id": "prod_001",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450,
  "imageUrl": "https://images.unsplash.com/photo-...",
  "affiliateUrl": "https://...",
  "brand": "Burberry",
  "tags": ["outerwear", "classic", "timeless"],
  "category": "outerwear",
  "description": "A timeless trench coat...",
  "isFeatured": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Product found
- `404 Not Found` - Product not found
- `401 Unauthorized` - Missing or invalid API key

---

### 3. Get Product by Slug

**Endpoint:** `GET /products/slug/:slug`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Product slug (URL-friendly name) |

**Example Request:**
```bash
GET /products/slug/classic-trench-coat
```

**Response Model:**
```typescript
Product | null
```

**Example Response:** Same as Get Product by ID

**Status Codes:**
- `200 OK` - Product found
- `404 Not Found` - Product not found
- `401 Unauthorized` - Missing or invalid API key

---

### 4. Get Featured Products

**Endpoint:** `GET /products/featured`

**Example Request:**
```bash
GET /products/featured
```

**Response Model:**
```typescript
Product[]
```

**Example Response:**
```json
[
  {
    "id": "prod_001",
    "name": "Classic Trench Coat",
    "slug": "classic-trench-coat",
    "price": 450,
    "imageUrl": "https://images.unsplash.com/photo-...",
    "affiliateUrl": "https://...",
    "brand": "Burberry",
    "tags": ["outerwear", "classic", "timeless"],
    "category": "outerwear",
    "description": "A timeless trench coat...",
    "isFeatured": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 5. Get All Categories

**Endpoint:** `GET /products/categories`

**Example Request:**
```bash
GET /products/categories
```

**Response Model:**
```typescript
string[]
```

**Example Response:**
```json
[
  "outerwear",
  "dresses",
  "tops",
  "bottoms",
  "shoes",
  "accessories"
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 6. Get All Brands

**Endpoint:** `GET /products/brands`

**Example Request:**
```bash
GET /products/brands
```

**Response Model:**
```typescript
string[]
```

**Example Response:**
```json
[
  "Burberry",
  "Zara",
  "H&M",
  "Mango",
  "The Row",
  "Toteme"
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 7. Get All Tags

**Endpoint:** `GET /products/tags`

**Example Request:**
```bash
GET /products/tags
```

**Response Model:**
```typescript
string[]
```

**Example Response:**
```json
[
  "outerwear",
  "classic",
  "timeless",
  "modern",
  "vintage",
  "minimalist"
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 8. Search Products

**Endpoint:** `GET /products/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

**Example Request:**
```bash
GET /products/search?q=trench%20coat
```

**Response Model:**
```typescript
Product[]
```

**Example Response:**
```json
[
  {
    "id": "prod_001",
    "name": "Classic Trench Coat",
    "slug": "classic-trench-coat",
    "price": 450,
    "imageUrl": "https://images.unsplash.com/photo-...",
    "affiliateUrl": "https://...",
    "brand": "Burberry",
    "tags": ["outerwear", "classic", "timeless"],
    "category": "outerwear",
    "description": "A timeless trench coat...",
    "isFeatured": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing query parameter
- `401 Unauthorized` - Missing or invalid API key

---

## Moodboards API

### 1. Get All Moodboards (with Pagination & Filters)

**Endpoint:** `GET /moodboards`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search query (searches title, description, tags) |
| `tag` | string | No | Filter by tag |
| `featured` | boolean | No | Filter by featured status |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 12) |

**Example Request:**
```bash
GET /moodboards?tag=minimalist&featured=true&page=1&limit=12
```

**Response Model:**
```typescript
{
  data: Moodboard[];
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

**Example Response:**
```json
{
  "data": [
    {
      "id": "mood_001",
      "title": "Parisian Chic",
      "description": "Effortlessly elegant French-inspired looks",
      "coverImage": "https://images.unsplash.com/photo-...",
      "products": [
        {
          "id": "prod_001",
          "name": "Classic Trench Coat",
          "slug": "classic-trench-coat",
          "price": 450,
          "imageUrl": "https://images.unsplash.com/photo-...",
          "affiliateUrl": "https://...",
          "brand": "Burberry",
          "tags": ["outerwear", "classic"],
          "category": "outerwear",
          "description": "A timeless trench coat...",
          "isFeatured": true,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "tags": ["minimalist", "french", "classic"],
      "isFeatured": true,
      "stylingTips": [
        "Layer with neutral pieces",
        "Keep accessories minimal",
        "Focus on quality fabrics"
      ],
      "howToWear": "Perfect for transitional seasons...",
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-25T14:20:00Z"
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

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Server error

---

### 2. Get Moodboard by Slug

**Endpoint:** `GET /moodboards/slug/:slug`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Moodboard slug (SEO-friendly identifier) |

**Example Request:**
```bash
GET /moodboards/slug/parisian-chic
```

**Response Model:**
```typescript
Moodboard | null
```

**Example Response:**
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "description": "Effortlessly elegant French-inspired looks",
  "coverImage": "https://images.unsplash.com/photo-...",
  "products": [...],
  "tags": ["minimalist", "french", "classic"],
  "isFeatured": true,
  "stylingTips": [
    "Layer with neutral pieces",
    "Keep accessories minimal"
  ],
  "howToWear": "Perfect for transitional seasons...",
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-25T14:20:00Z"
}
```

**Status Codes:**
- `200 OK` - Moodboard found
- `404 Not Found` - Moodboard not found
- `401 Unauthorized` - Missing or invalid API key

---

### 3. Get Moodboard by ID

**Endpoint:** `GET /moodboards/:id`

**Note:** This endpoint is maintained for backward compatibility. New implementations should use the slug endpoint above.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Moodboard ID |

**Example Request:**
```bash
GET /moodboards/mood_001
```

**Response Model:**
```typescript
Moodboard | null
```

**Example Response:**
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "description": "Effortlessly elegant French-inspired looks",
  "coverImage": "https://images.unsplash.com/photo-...",
  "products": [...],
  "tags": ["minimalist", "french", "classic"],
  "isFeatured": true,
  "stylingTips": [
    "Layer with neutral pieces",
    "Keep accessories minimal"
  ],
  "howToWear": "Perfect for transitional seasons...",
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-25T14:20:00Z"
}
```

**Status Codes:**
- `200 OK` - Moodboard found
- `404 Not Found` - Moodboard not found
- `401 Unauthorized` - Missing or invalid API key

---

### 4. Get Featured Moodboards

**Endpoint:** `GET /moodboards/featured`

**Example Request:**
```bash
GET /moodboards/featured
```

**Response Model:**
```typescript
Moodboard[]
```

**Example Response:**
```json
[
  {
    "id": "mood_001",
    "title": "Parisian Chic",
    "description": "Effortlessly elegant French-inspired looks",
    "coverImage": "https://images.unsplash.com/photo-...",
    "products": [...],
    "tags": ["minimalist", "french", "classic"],
    "isFeatured": true,
    "stylingTips": [...],
    "howToWear": "Perfect for transitional seasons...",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-25T14:20:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 5. Get All Moodboard Tags

**Endpoint:** `GET /moodboards/tags`

**Example Request:**
```bash
GET /moodboards/tags
```

**Response Model:**
```typescript
string[]
```

**Example Response:**
```json
[
  "minimalist",
  "french",
  "classic",
  "modern",
  "vintage",
  "bohemian"
]
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Missing or invalid API key

---

### 6. Search Moodboards

**Endpoint:** `GET /moodboards/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

**Example Request:**
```bash
GET /moodboards/search?q=minimalist
```

**Response Model:**
```typescript
Moodboard[]
```

**Example Response:**
```json
[
  {
    "id": "mood_001",
    "title": "Parisian Chic",
    "description": "Effortlessly elegant French-inspired looks",
    "coverImage": "https://images.unsplash.com/photo-...",
    "products": [...],
    "tags": ["minimalist", "french", "classic"],
    "isFeatured": true,
    "stylingTips": [...],
    "howToWear": "Perfect for transitional seasons...",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-25T14:20:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing query parameter
- `401 Unauthorized` - Missing or invalid API key

---

## Data Models

### Product Model
```typescript
interface Product {
  id: string;              // Unique identifier
  name: string;            // Product name
  slug: string;            // URL-friendly slug
  price: number | null;    // Price in USD (null for unavailable)
  imageUrl: string;        // Product image URL
  affiliateUrl: string;    // Affiliate link URL
  brand?: string;          // Brand name (optional)
  tags?: string[];         // Product tags (optional)
  category?: string;       // Product category (optional)
  description?: string;    // Product description (optional)
  isFeatured?: boolean;    // Featured status (optional)
  createdAt: string;       // ISO 8601 timestamp
}
```

### Moodboard Model
```typescript
interface Moodboard {
  id: string;              // Unique identifier
  slug: string;            // URL-friendly slug (SEO-friendly)
  title: string;           // Moodboard title
  description?: string;    // Moodboard description (optional)
  coverImage: string;      // Cover image URL
  products: Product[];     // Array of products in this moodboard
  tags?: string[];         // Moodboard tags (optional)
  isFeatured?: boolean;    // Featured status (optional)
  stylingTips?: string[];  // Array of styling tips (optional)
  howToWear?: string;      // Detailed styling guide (optional)
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### Pagination Info Model
```typescript
interface PaginationInfo {
  page: number;          // Current page number (1-indexed)
  limit: number;         // Items per page
  total: number;         // Total items matching filters
  totalPages: number;    // Total number of pages
  hasNextPage: boolean;  // Whether there's a next page
  hasPrevPage: boolean;  // Whether there's a previous page
}
```

### Paginated Response Model
```typescript
interface PaginatedResponse<T> {
  data: T[];                    // Array of items for current page
  pagination: PaginationInfo;   // Pagination metadata
}
```

### Filter Options Model (Query Parameters)
```typescript
interface FilterOptions {
  category?: string;
  brand?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Error Handling

### Standard Error Response
All errors return a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;         // Error code (e.g., "INVALID_PARAMETER")
    message: string;      // Human-readable error message
    details?: any;        // Additional error details (optional)
  }
}
```

### Example Error Responses

**400 Bad Request:**
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid page number. Must be a positive integer.",
    "details": {
      "parameter": "page",
      "value": "-1"
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid API key."
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with id 'prod_999' not found."
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "details": {
      "requestId": "req_abc123"
    }
  }
}
```

---

## Pagination

### Pagination Parameters

All list endpoints support pagination via query parameters:
- `page` - Page number (1-indexed, default: 1)
- `limit` - Items per page (default: 12, max: 100)

### Pagination Response

All paginated endpoints return:
```typescript
{
  data: T[];              // Items for current page
  pagination: {
    page: number;         // Current page (1-indexed)
    limit: number;        // Items per page
    total: number;        // Total items matching filters
    totalPages: number;   // Total pages available
    hasNextPage: boolean; // true if more pages available
    hasPrevPage: boolean; // true if previous page exists
  }
}
```

### Pagination Examples

**First Page:**
```bash
GET /products?page=1&limit=12
```

**Second Page:**
```bash
GET /products?page=2&limit=12
```

**Last Page Calculation:**
```typescript
// totalPages from pagination response
const lastPage = pagination.totalPages;
GET /products?page=${lastPage}&limit=12
```

### Pagination Best Practices

1. **Default Behavior:** If no pagination parameters provided, return first page with default limit
2. **Out of Range:** If page > totalPages, return empty array with correct pagination metadata
3. **Invalid Parameters:** Return 400 error for negative or non-numeric values
4. **Max Limit:** Enforce maximum limit (e.g., 100) to prevent performance issues
5. **Total Count:** Always include accurate total count in pagination metadata

---

## Implementation Notes

### Database Indexing
For optimal performance, create indexes on:
- `products.category`
- `products.brand`
- `products.tags`
- `products.price`
- `products.isFeatured`
- `products.createdAt`
- `moodboards.tags`
- `moodboards.isFeatured`
- `moodboards.createdAt`

### Search Implementation
The `search` parameter should perform case-insensitive partial matching on:
- Products: `name`, `brand`, `description`, `tags`, `category`
- Moodboards: `title`, `description`, `tags`

For better performance, consider implementing:
- Full-text search using database features (PostgreSQL FTS, MongoDB text indexes)
- Search index services (Elasticsearch, Algolia, etc.)
- Fuzzy matching for typo tolerance

### Caching Strategy
Consider caching for frequently accessed endpoints:
- Featured products (cache for 1 hour)
- Featured moodboards (cache for 1 hour)
- Categories/brands/tags lists (cache for 24 hours)
- Individual products/moodboards (cache for 1 hour)

### Rate Limiting
Implement rate limiting to prevent abuse:
- 100 requests per minute per API key
- 1000 requests per hour per API key
- Return `429 Too Many Requests` when limit exceeded

### CORS Configuration
Enable CORS for your frontend domain:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Quick Start Guide

### 1. Set Environment Variables
```bash
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key_here
VITE_API_DEBUG=true
```

### 2. Test Connection
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.yourdomain.com/products?limit=5
```

### 3. Implement Endpoints
Follow the specifications above to implement each endpoint with proper:
- Request validation
- Error handling
- Pagination logic
- Search functionality
- Response formatting

### 4. Database Schema
Refer to the [Data Models](#data-models) section for TypeScript interfaces.
Convert to your database schema (SQL, MongoDB, etc.)

### 5. Deploy & Monitor
- Deploy your API
- Monitor error rates
- Track response times
- Implement logging for debugging

---

## Support

For questions or issues with the API specification, please refer to:
- `/docs/API_INTEGRATION.md` - Frontend integration guide
- `/docs/MIGRATION_CHECKLIST.md` - Migration from mock to real API
- `/docs/API_USAGE_EXAMPLES.md` - Code examples

---

**Last Updated:** January 2025
**API Version:** 1.0.0
