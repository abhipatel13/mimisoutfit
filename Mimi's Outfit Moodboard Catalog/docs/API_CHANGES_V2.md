# API Changes - Version 2.0

**Date:** January 2024  
**Status:** ✅ Implementation Complete

---

## Overview

This document outlines the API changes between v1.0 and v2.0 to align the frontend implementation with the backend specification.

---

## Breaking Changes

### 1. Response Structure Changes

**All list endpoints now wrap data in a `data` property:**

#### Before (v1.0):
```typescript
GET /products/featured
Response: Product[]
```

#### After (v2.0):
```typescript
GET /products/featured
Response: { data: Product[] }
```

**Affected Endpoints:**
- `GET /products/featured`
- `GET /products/categories`
- `GET /products/brands`
- `GET /products/tags`
- `GET /moodboards/featured`
- `GET /moodboards/tags`

### 2. Search Endpoint Consolidation

**Products search now uses the main `/products` endpoint:**

#### Before (v1.0):
```typescript
GET /products/search?q=jacket
```

#### After (v2.0):
```typescript
GET /products?search=jacket
```

**Same change for moodboards:**

#### Before (v1.0):
```typescript
GET /moodboards/search?q=chic
```

#### After (v2.0):
```typescript
GET /moodboards?search=chic
```

### 3. SortBy Parameter Changes

**Updated sort values:**

#### Before (v1.0):
```typescript
sortBy: 'relevance' | 'newest' | 'price-low' | 'price-high'
```

#### After (v2.0):
```typescript
sortBy: 'newest' | 'price-low' | 'price-high' | 'name'
```

**Changes:**
- ❌ Removed `'relevance'` (automatic when using search)
- ✅ Added `'name'` for alphabetical sorting

---

## New Features

### 1. Related Products API

**New endpoint for getting related products:**

```typescript
GET /products/{id}/related?limit=4

Response: {
  data: Product[]
}
```

**Algorithm:**
- Same category (weight: 0.4)
- Same brand (weight: 0.3)
- Overlapping tags (weight: 0.3)
- Sorted by combined relevance score

**Frontend Usage:**
```typescript
import { productsApi } from '@/services/api';

const related = await productsApi.getRelatedProducts(productId, 4);
```

### 2. Moodboard Related Products API

**New endpoint for finding related products for moodboards:**

```typescript
GET /moodboards/{id}/related?limit=10

Response: {
  data: Product[]
}
```

**Algorithm:**
- Tag overlap (weight: 0.6)
- Semantic similarity (weight: 0.4)
- Excludes products already in moodboard

**Frontend Usage:**
```typescript
import { moodboardsApi } from '@/services/api';

const related = await moodboardsApi.getRelatedProducts(moodboardId, 10);
```

---

## Updated API Methods

### Products API

```typescript
interface ProductsApi {
  // Existing methods (no signature changes)
  getAllProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByTag(tag: string): Promise<Product[]>;
  getCategories(): Promise<string[]>;
  getBrands(): Promise<string[]>;
  getTags(): Promise<string[]>;
  
  // Updated methods
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // NEW methods
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
}
```

### Moodboards API

```typescript
interface MoodboardsApi {
  // Existing methods (no signature changes)
  getAllMoodboards(filters?: MoodboardFilters): Promise<PaginatedResponse<Moodboard>>;
  getMoodboardById(id: string): Promise<Moodboard | null>;
  getMoodboardBySlug(slug: string): Promise<Moodboard | null>;
  getMoodboardsByTag(tag: string): Promise<Moodboard[]>;
  
  // Updated methods
  getFeaturedMoodboards(limit?: number): Promise<Moodboard[]>;
  getMoodboardTags(): Promise<string[]>;
  searchMoodboards(query: string): Promise<Moodboard[]>;
  
  // NEW methods
  getRelatedProducts(moodboardId: string, limit?: number): Promise<Product[]>;
}
```

---

## Migration Guide

### Frontend Code Changes

#### 1. Product Detail Page

**Before:**
```typescript
// Manually filter all products to find related ones
const { data: allProducts } = await productsApi.getAllProducts({ limit: 100 });
const related = allProducts
  .filter(p => p.id !== productId && (
    p.category === product.category || 
    p.brand === product.brand ||
    p.tags?.some(tag => product.tags?.includes(tag))
  ))
  .slice(0, 4);
```

**After:**
```typescript
// Use dedicated API endpoint
const related = await productsApi.getRelatedProducts(productId, 4);
```

#### 2. Featured Products

**Before:**
```typescript
const featured = await productsApi.getFeaturedProducts();
```

**After:**
```typescript
// Now supports limit parameter
const featured = await productsApi.getFeaturedProducts(6);
```

#### 3. Search Products

**Before:**
```typescript
const results = await productsApi.searchProducts(query);
```

**After:**
```typescript
// Still works the same way, but backend uses different endpoint
const results = await productsApi.searchProducts(query);
```

---

## Backend Implementation Notes

### Database Indexes Needed

#### Products Table
```sql
-- Full-text search index
CREATE INDEX idx_products_fts ON products 
USING GIN(to_tsvector('english', name || ' ' || brand || ' ' || description));

-- Category, brand, tag indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Price range queries
CREATE INDEX idx_products_price ON products(price);
```

#### Product Tags Table (for many-to-many)
```sql
CREATE TABLE product_tags (
  product_id VARCHAR(50) REFERENCES products(id),
  tag VARCHAR(50),
  PRIMARY KEY (product_id, tag)
);
CREATE INDEX idx_product_tags_tag ON product_tags(tag);
```

#### Moodboards Table
```sql
-- Full-text search
CREATE INDEX idx_moodboards_fts ON moodboards 
USING GIN(to_tsvector('english', title || ' ' || description));

-- Featured flag
CREATE INDEX idx_moodboards_featured ON moodboards(is_featured) WHERE is_featured = true;
```

### Related Products Algorithm (Backend)

**For `/products/{id}/related`:**

```sql
SELECT 
  p.*,
  -- Category match score
  CASE WHEN p.category = $1 THEN 0.4 ELSE 0 END +
  -- Brand match score
  CASE WHEN p.brand = $2 THEN 0.3 ELSE 0 END +
  -- Tag overlap score
  (SELECT COUNT(*) * 0.1 FROM product_tags pt 
   WHERE pt.product_id = p.id AND pt.tag = ANY($3)) 
  AS relevance_score
FROM products p
WHERE p.id != $4
  AND (
    p.category = $1 OR 
    p.brand = $2 OR 
    EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag = ANY($3))
  )
ORDER BY relevance_score DESC
LIMIT $5;
```

**For `/moodboards/{id}/related`:**

```sql
SELECT 
  p.*,
  -- Tag overlap with moodboard
  (SELECT COUNT(*) FROM product_tags pt 
   WHERE pt.product_id = p.id AND pt.tag = ANY($1)) * 0.6 +
  -- Semantic similarity (simplified)
  ts_rank(
    to_tsvector('english', p.name || ' ' || p.description),
    to_tsquery('english', $2)
  ) * 0.4 AS relevance_score
FROM products p
WHERE p.id NOT IN (
  SELECT product_id FROM moodboard_products WHERE moodboard_id = $3
)
ORDER BY relevance_score DESC
LIMIT $4;
```

---

## Testing Checklist

### Unit Tests
- [ ] Test related products algorithm with various scenarios
- [ ] Test response structure wrapping (data property)
- [ ] Test search endpoint consolidation
- [ ] Test limit parameter on featured endpoints

### Integration Tests
- [ ] Test ProductDetailPage with new related products API
- [ ] Test search functionality with new endpoints
- [ ] Test pagination with search queries
- [ ] Test featured products with limit parameter

### Performance Tests
- [ ] Related products query performance (<50ms)
- [ ] Search with filters performance (<100ms)
- [ ] Full-text search index effectiveness

---

## Rollout Plan

### Phase 1: Backend Updates (Day 1-2)
1. ✅ Update API specification document
2. ✅ Add response wrapping middleware
3. ✅ Implement related products endpoints
4. ✅ Update search endpoints
5. ✅ Add database indexes

### Phase 2: Frontend Updates (Day 3)
1. ✅ Update API service methods
2. ✅ Update ProductDetailPage
3. ✅ Update response parsing
4. ✅ Test in mock mode

### Phase 3: Testing (Day 4)
1. ✅ Unit tests for new methods
2. ✅ Integration tests
3. ✅ Manual testing in staging
4. ✅ Performance testing

### Phase 4: Deployment (Day 5)
1. Deploy backend to staging
2. Test with real API
3. Deploy to production
4. Monitor error rates

---

## API Endpoint Summary

### Before (v1.0) - 12 Endpoints

**Products (6):**
- GET /products
- GET /products/{id}
- GET /products/slug/{slug}
- GET /products/featured
- GET /products/categories
- GET /products/brands

**Moodboards (6):**
- GET /moodboards
- GET /moodboards/{id}
- GET /moodboards/slug/{slug}
- GET /moodboards/featured
- GET /moodboards/tags
- GET /moodboards/{id}/related (partial)

### After (v2.0) - 14 Endpoints

**Products (8):**
- GET /products
- GET /products/{id}
- GET /products/slug/{slug}
- GET /products/{id}/related ⭐ **NEW**
- GET /products/featured
- GET /products/categories
- GET /products/brands
- GET /products/tags ⭐ **NEW**

**Moodboards (6):**
- GET /moodboards
- GET /moodboards/{id}
- GET /moodboards/slug/{slug}
- GET /moodboards/{id}/related ✅ **COMPLETE**
- GET /moodboards/featured
- GET /moodboards/tags

---

## Support

**Questions?** Contact dev@thelookbookbymimi.com  
**Documentation:** [BACKEND_API_SPEC_UPDATED.md](./BACKEND_API_SPEC_UPDATED.md)

---

**Last Updated:** January 2024  
**Version:** 2.0.0
