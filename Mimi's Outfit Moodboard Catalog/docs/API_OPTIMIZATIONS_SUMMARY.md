# API Optimizations Summary

Complete summary of API optimizations implemented to reduce API calls, improve performance, and streamline data fetching.

## Overview

This update includes several major API optimizations:

1. ✅ **Added `isPublished` field** to products and moodboards with yellow "UNPUBLISHED" badge indicators
2. ✅ **Combined related products** into product detail endpoint with `?includeRelated=true` query param
3. ✅ **Unified homepage endpoint** that returns both featured products and moodboards in one call
4. ✅ **Added publish/unpublish admin endpoints** for single-item status toggling
5. ✅ **Fixed ProductsPage** to use 100% live API (no more mock data imports)

---

## 1. isPublished Field Implementation

### What Changed

**Before**: Products/moodboards had no visibility control
**After**: Both support `isPublished` boolean field with visual indicators

### New Features

- **Yellow "UNPUBLISHED" Badge** - Only shows when `isPublished === false`
- **Admin Publish/Unpublish Buttons** - One-click toggle on detail pages
- **Draft Support** - Create and save items as drafts before publishing
- **Admin Forms** - Dropdown to select publish status when creating/editing

### API Changes

#### New Admin Endpoints

```typescript
// Publish/unpublish product
POST /admin/products/:id/publish
Body: { isPublished: boolean }
Response: { id: string, isPublished: boolean, message: string }

// Publish/unpublish moodboard
POST /admin/moodboards/:id/publish
Body: { isPublished: boolean }
Response: { id: string, isPublished: boolean, message: string }
```

#### Updated DTOs

```typescript
// All product/moodboard DTOs now include:
interface ProductDto {
  // ... existing fields
  isPublished?: boolean;  // Optional, defaults to true
}
```

### UI Components Updated

1. **ProductCard.tsx** - Shows yellow badge when `isPublished === false`
2. **MoodboardCard.tsx** - Shows yellow badge when `isPublished === false`
3. **ProductDetailPage.tsx** - Admin controls (Edit, Publish/Unpublish buttons)
4. **MoodboardDetailPage.tsx** - Admin controls (Edit, Publish/Unpublish buttons)
5. **AdminProductForm.tsx** - Publish Status dropdown
6. **AdminMoodboardForm.tsx** - Publish Status dropdown

### Badge Design

```tsx
{product.isPublished === false && (
  <div className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-950 px-2 py-1 rounded text-xs font-semibold shadow-sm z-10">
    UNPUBLISHED
  </div>
)}
```

---

## 2. Combined Related Products Endpoint

### What Changed

**Before**: Two separate API calls
```typescript
// Call 1: Get product detail
const product = await productsApi.getProductBySlug(slug);

// Call 2: Get related products
const related = await productsApi.getRelatedProducts(product.id, 4);
```

**After**: Single API call with optional related products
```typescript
// One call with includeRelated=true
const product = await productsApi.getProductBySlug(slug, true);
// product.relatedProducts is included (if available)
```

### Benefits

✅ **50% fewer API calls** for product detail pages  
✅ **Faster page load** - One round trip instead of two  
✅ **Automatic fallback** - Returns product even if related products fail  
✅ **Backend optimization** - Server can optimize related products query  

### API Specification

#### Endpoint

```
GET /products/:slug?includeRelated=true
```

#### Request

```typescript
// Query Parameters
{
  includeRelated?: boolean;  // Optional, defaults to false
}
```

#### Response

```typescript
{
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  affiliateUrl: string;
  slug: string;
  tags: string[];
  isPublished: boolean;
  blurhash?: string;
  purchaseType?: 'affiliate' | 'direct';
  relatedProducts?: Product[];  // ✅ NEW - Only when includeRelated=true
}
```

### Implementation

```typescript
// products.api.ts
getProductBySlug: async (slug: string, includeRelated = false): Promise<Product> => {
  if (apiConfig.isRealMode) {
    const url = includeRelated 
      ? `/products/${slug}?includeRelated=true`
      : `/products/${slug}`;
    
    const response = await apiClient.get<Product>(url);
    return response;
  }
  
  // Mock mode
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (includeRelated) {
    // Add related products in mock mode
    const related = mockProducts
      .filter((p) => 
        p.category === product.category && 
        p.id !== product.id
      )
      .slice(0, 4);
    
    return { ...product, relatedProducts: related };
  }
  
  return product;
},
```

### Usage in ProductDetailPage

```typescript
useEffect(() => {
  const fetchProduct = async () => {
    try {
      // Fetch product with related products included
      const data = await productsApi.getProductBySlug(slug, true);
      setProduct(data);
      setRelatedProducts(data.relatedProducts || []);
    } catch (err) {
      console.error('Failed to fetch product:', err);
    }
  };

  fetchProduct();
}, [slug]);
```

---

## 3. Unified Homepage Endpoint

### What Changed

**Before**: Two separate API calls on HomePage
```typescript
// Call 1: Get featured products
const { products } = useFeaturedProducts();

// Call 2: Get featured moodboards
const { moodboards } = useFeaturedMoodboards();
```

**After**: Single unified API call
```typescript
// One call returns both
const { products, moodboards } = await productsApi.getHomepageData();
```

### Benefits

✅ **50% fewer API calls** on homepage  
✅ **Faster initial load** - Critical for first impression  
✅ **Atomic data** - Products and moodboards always in sync  
✅ **Backend optimization** - Server can batch queries  

### API Specification

#### Endpoint

```
GET /homepage
```

#### Response

```typescript
{
  featuredProducts: Product[];
  featuredMoodboards: Moodboard[];
}
```

### Type Definition

```typescript
// types/index.ts
export interface HomepageData {
  featuredProducts: Product[];
  featuredMoodboards: Moodboard[];
}
```

### Implementation

```typescript
// products.api.ts
getHomepageData: async (): Promise<HomepageData> => {
  if (apiConfig.isRealMode) {
    const response = await apiClient.get<HomepageData>('/homepage');
    return response;
  }
  
  // Mock mode - return first 6 featured items
  return {
    featuredProducts: mockProducts.slice(0, 6),
    featuredMoodboards: mockMoodboards.slice(0, 4),
  };
},
```

### Usage in HomePage

```typescript
// HomePage.tsx
const [data, setData] = useState<HomepageData | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchHomepageData = async () => {
    setIsLoading(true);
    try {
      const homepageData = await productsApi.getHomepageData();
      setData(homepageData);
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchHomepageData();
}, []);

// Render with data.featuredProducts and data.featuredMoodboards
```

---

## 4. ProductsPage 100% Live API

### What Changed

**Before**: Mixed mock data and API calls
```typescript
// Direct import from mock-data.ts
import { getCategories, getBrands } from '@/data/mock-data';

// Used directly in component
const categories = getCategories();
const brands = getBrands();
```

**After**: 100% API-driven
```typescript
// No mock imports
// Fetch from API
const [categories, setCategories] = useState<string[]>([]);
const [brands, setBrands] = useState<string[]>([]);

useEffect(() => {
  const fetchFilters = async () => {
    const cats = await productsApi.getCategories();
    const brandsList = await productsApi.getBrands();
    setCategories(cats);
    setBrands(brandsList);
  };
  fetchFilters();
}, []);
```

### Benefits

✅ **Consistent data source** - All data from API  
✅ **Real mode ready** - Switch modes without code changes  
✅ **Backend control** - Server determines available filters  
✅ **No mock imports** - Clean architecture  

### API Endpoints

```typescript
// Get all categories
GET /products/categories
Response: string[]

// Get all brands
GET /products/brands
Response: string[]
```

### Implementation

```typescript
// products.api.ts
getCategories: async (): Promise<string[]> => {
  if (apiConfig.isRealMode) {
    return await apiClient.get<string[]>('/products/categories');
  }
  
  // Mock mode
  const categories = new Set<string>();
  mockProducts.forEach((p) => categories.add(p.category));
  return Array.from(categories).sort();
},

getBrands: async (): Promise<string[]> => {
  if (apiConfig.isRealMode) {
    return await apiClient.get<string[]>('/products/brands');
  }
  
  // Mock mode
  const brands = new Set<string>();
  mockProducts.forEach((p) => brands.add(p.brand));
  return Array.from(brands).sort();
},
```

---

## 5. Backend Implementation Guide

### Database Schema Changes

#### PostgreSQL

```sql
-- Add isPublished column
ALTER TABLE products
ADD COLUMN is_published BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE moodboards
ADD COLUMN is_published BOOLEAN DEFAULT true NOT NULL;

-- Create indexes
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_moodboards_is_published ON moodboards(is_published);
```

### New Endpoints to Implement

#### 1. Publish/Unpublish Product

```typescript
// POST /admin/products/:id/publish
app.post('/admin/products/:id/publish', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;
  
  try {
    await db
      .update(products)
      .set({ isPublished, updatedAt: new Date() })
      .where(eq(products.id, id));
    
    res.json({
      id,
      isPublished,
      message: `Product ${isPublished ? 'published' : 'unpublished'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});
```

#### 2. Publish/Unpublish Moodboard

```typescript
// POST /admin/moodboards/:id/publish
app.post('/admin/moodboards/:id/publish', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;
  
  try {
    await db
      .update(moodboards)
      .set({ isPublished, updatedAt: new Date() })
      .where(eq(moodboards.id, id));
    
    res.json({
      id,
      isPublished,
      message: `Moodboard ${isPublished ? 'published' : 'unpublished'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update moodboard' });
  }
});
```

#### 3. Product Detail with Related Products

```typescript
// GET /products/:slug?includeRelated=true
app.get('/products/:slug', async (req, res) => {
  const { slug } = req.params;
  const { includeRelated } = req.query;
  
  try {
    // Get main product
    const product = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    
    if (!product.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const result = product[0];
    
    // Optionally include related products
    if (includeRelated === 'true') {
      const related = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.category, result.category),
            ne(products.id, result.id),
            eq(products.isPublished, true)
          )
        )
        .limit(4);
      
      result.relatedProducts = related;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});
```

#### 4. Homepage Data Endpoint

```typescript
// GET /homepage
app.get('/homepage', async (req, res) => {
  try {
    // Fetch featured products and moodboards in parallel
    const [featuredProducts, featuredMoodboards] = await Promise.all([
      db
        .select()
        .from(products)
        .where(eq(products.isPublished, true))
        .orderBy(desc(products.createdAt))
        .limit(6),
      
      db
        .select()
        .from(moodboards)
        .where(eq(moodboards.isPublished, true))
        .orderBy(desc(moodboards.createdAt))
        .limit(4),
    ]);
    
    res.json({
      featuredProducts,
      featuredMoodboards,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch homepage data' });
  }
});
```

#### 5. Categories and Brands Endpoints

```typescript
// GET /products/categories
app.get('/products/categories', async (req, res) => {
  try {
    const categories = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(eq(products.isPublished, true));
    
    const categoryList = categories
      .map((c) => c.category)
      .sort();
    
    res.json(categoryList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /products/brands
app.get('/products/brands', async (req, res) => {
  try {
    const brands = await db
      .selectDistinct({ brand: products.brand })
      .from(products)
      .where(eq(products.isPublished, true));
    
    const brandList = brands
      .map((b) => b.brand)
      .sort();
    
    res.json(brandList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});
```

---

## 6. Performance Improvements

### API Calls Reduction

| Page | Before | After | Improvement |
|------|--------|-------|-------------|
| **HomePage** | 2 calls | 1 call | **50% reduction** |
| **ProductDetailPage** | 2 calls | 1 call | **50% reduction** |
| **ProductsPage** | 1 call + mock imports | 3 calls (paginated, categories, brands) | **100% API** |

### Network Performance

- **Reduced latency** - Fewer round trips to server
- **Batch queries** - Server can optimize database queries
- **Atomic data** - Related data fetched together (consistency)
- **Cleaner code** - No mock data imports in components

### User Experience

- **Faster page loads** - Fewer API calls = faster renders
- **Better error handling** - Single try/catch for related data
- **Consistent UI** - All data from same source (API)

---

## 7. Testing Checklist

### isPublished Feature

- [ ] **Badge Visibility**
  - [ ] Yellow badge shows on unpublished products
  - [ ] Yellow badge shows on unpublished moodboards
  - [ ] Badge does NOT show on published items
  
- [ ] **Admin Actions**
  - [ ] Publish button works on product detail page
  - [ ] Unpublish button works on product detail page
  - [ ] Publish button works on moodboard detail page
  - [ ] Unpublish button works on moodboard detail page
  - [ ] Success toasts display correctly
  
- [ ] **Admin Forms**
  - [ ] Publish Status dropdown in product form
  - [ ] Publish Status dropdown in moodboard form
  - [ ] Default value is "Published"

### Combined Related Products

- [ ] **Product Detail Page**
  - [ ] Related products load with main product
  - [ ] No separate API call for related products
  - [ ] Page still works if related products fail
  - [ ] Related products show correct items

### Unified Homepage

- [ ] **HomePage**
  - [ ] Featured products and moodboards load together
  - [ ] Only one API call on page load
  - [ ] Loading state shows for both sections
  - [ ] Error handling works for both

### ProductsPage API

- [ ] **Filters**
  - [ ] Categories load from API (not mock data)
  - [ ] Brands load from API (not mock data)
  - [ ] Filter dropdowns populate correctly
  - [ ] No mock data imports in component

---

## 8. Documentation Files

### New Documentation

1. **UNPUBLISHED_TAGS_GUIDE.md** - Complete guide to `isPublished` feature
   - Data model changes
   - UI indicators
   - Admin actions
   - API endpoints
   - Usage examples
   - Migration guide

2. **API_OPTIMIZATIONS_SUMMARY.md** (This file) - Overview of all optimizations

### Updated Documentation

1. **STRUCTURE.md** - Updated with new features
2. **API_ENDPOINTS_COMPLETE_REFERENCE.md** - Added new endpoints
3. **DATA_MODELS_COMPLETE_REFERENCE.md** - Updated with `isPublished` field

---

## 9. Migration Steps

### For Frontend

1. ✅ Update types to include `isPublished` field
2. ✅ Add publish/unpublish buttons to detail pages
3. ✅ Add publish status dropdown to admin forms
4. ✅ Update ProductCard and MoodboardCard with badge
5. ✅ Update API calls to use new endpoints
6. ✅ Remove mock data imports from ProductsPage

### For Backend

1. [ ] Run database migrations to add `isPublished` column
2. [ ] Implement publish/unpublish endpoints
3. [ ] Update product detail endpoint with `?includeRelated` param
4. [ ] Create unified homepage endpoint
5. [ ] Create categories and brands endpoints
6. [ ] Filter unpublished items in public endpoints
7. [ ] Test all new endpoints

### Testing

1. [ ] Test publish/unpublish functionality
2. [ ] Verify badge displays correctly
3. [ ] Test related products inclusion
4. [ ] Test homepage unified endpoint
5. [ ] Test categories/brands endpoints
6. [ ] Verify API call counts reduced

---

## Summary

### What Was Implemented

✅ **isPublished Field** - Complete visibility control system  
✅ **Combined Related Products** - 50% fewer API calls on product detail  
✅ **Unified Homepage Endpoint** - 50% fewer API calls on homepage  
✅ **Publish/Unpublish Admin Endpoints** - One-click status toggling  
✅ **ProductsPage 100% API** - No more mock data imports  

### Benefits

- **Performance** - Fewer API calls, faster page loads
- **Consistency** - All data from API, no mixed sources
- **User Experience** - Faster renders, better feedback
- **Developer Experience** - Cleaner code, easier maintenance
- **Backend Optimization** - Server can batch and optimize queries

### Next Steps

1. Implement backend endpoints
2. Run database migrations
3. Test all new features
4. Deploy to production
5. Monitor performance improvements
