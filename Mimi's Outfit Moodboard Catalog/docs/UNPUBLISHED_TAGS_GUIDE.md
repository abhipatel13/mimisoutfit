# Unpublished Tags Guide

Complete guide to the `isPublished` feature for products and moodboards with yellow "UNPUBLISHED" badge indicators.

## Overview

Products and moodboards now support an `isPublished` field that controls visibility status. When `isPublished = false`, a yellow "UNPUBLISHED" badge is displayed on all cards and detail pages. This provides clear visual feedback for admins about draft or hidden content.

## Table of Contents

1. [Data Model Changes](#data-model-changes)
2. [UI Indicators](#ui-indicators)
3. [Admin Actions](#admin-actions)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)

---

## Data Model Changes

### Product Type

```typescript
export interface Product {
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
  isPublished: boolean;        // ✅ NEW - Controls visibility status
  blurhash?: string;
  purchaseType?: 'affiliate' | 'direct'; // Optional - defaults to 'affiliate'
}
```

### Moodboard Type

```typescript
export interface Moodboard {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  products: Product[];
  slug: string;
  tags?: string[];
  stylingTips?: string[];
  howToWear?: string;
  isPublished: boolean;        // ✅ NEW - Controls visibility status
  blurhash?: string;
}
```

### Admin DTOs

```typescript
// Create Product DTO
export interface CreateProductDto {
  name: string;
  brand: string;
  price: number;
  category: string;
  description?: string;
  imageUrl: string;
  affiliateUrl: string;
  slug: string;
  tags?: string[];
  isPublished?: boolean;       // ✅ NEW - Optional, defaults to true
  blurhash?: string;
  purchaseType?: 'affiliate' | 'direct';
}

// Update Product DTO
export interface UpdateProductDto {
  name?: string;
  brand?: string;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  affiliateUrl?: string;
  slug?: string;
  tags?: string[];
  isPublished?: boolean;       // ✅ NEW - Optional
  blurhash?: string;
  purchaseType?: 'affiliate' | 'direct';
}

// Similar changes for Moodboard DTOs
```

---

## UI Indicators

### Yellow "UNPUBLISHED" Badge

The badge appears **ONLY** when `isPublished === false`:

```typescript
// Only show badge when explicitly false
{product.isPublished === false && (
  <div className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-950 px-2 py-1 rounded text-xs font-semibold shadow-sm z-10">
    UNPUBLISHED
  </div>
)}
```

### Badge Locations

1. **ProductCard** - Top-left corner with yellow background
2. **MoodboardCard** - Top-left corner with yellow background
3. **ProductDetailPage** - Prominent badge in hero section
4. **MoodboardDetailPage** - Overlay badge on cover image

### Design Specifications

```css
/* Badge Styling */
background: rgba(234, 179, 8, 0.9);  /* yellow-500/90 */
color: rgb(66, 32, 6);               /* yellow-950 */
padding: 0.25rem 0.5rem;             /* px-2 py-1 */
border-radius: 0.25rem;              /* rounded */
font-size: 0.75rem;                  /* text-xs */
font-weight: 600;                    /* font-semibold */
box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* shadow-sm */
z-index: 10;                         /* Above image */
backdrop-filter: blur(4px);          /* For overlay badges */
```

---

## Admin Actions

### Publish/Unpublish Buttons

Admin users see publish/unpublish buttons on detail pages:

#### Product Detail Page

```tsx
{isAuthenticated && (
  <div className="flex gap-2">
    <Button
      variant="secondary"
      size="sm"
      onClick={handleEdit}
      className="cursor-pointer"
    >
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </Button>
    <Button
      variant={product.isPublished === false ? 'default' : 'secondary'}
      size="sm"
      onClick={handleTogglePublish}
      disabled={isPublishing}
      className="cursor-pointer"
    >
      {isPublishing ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⏳</span>
          {product.isPublished === false ? 'Publishing...' : 'Unpublishing...'}
        </span>
      ) : product.isPublished === false ? (
        <>
          <Eye className="w-4 h-4 mr-2" />
          Publish
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4 mr-2" />
          Unpublish
        </>
      )}
    </Button>
  </div>
)}
```

#### Moodboard Detail Page

Same pattern as product detail page, but uses `adminMoodboardsApi.publishMoodboard()`.

### Admin Forms

Both product and moodboard forms include a "Publish Status" dropdown:

```tsx
<div className="space-y-2">
  <Label htmlFor="isPublished">Publish Status</Label>
  <Select
    value={formData.isPublished === false ? 'unpublished' : 'published'}
    onValueChange={(value) =>
      setFormData((prev) => ({
        ...prev,
        isPublished: value === 'published',
      }))
    }
  >
    <SelectTrigger id="isPublished">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="published">
        Published (Visible to public)
      </SelectItem>
      <SelectItem value="unpublished">
        Unpublished (Draft/Hidden)
      </SelectItem>
    </SelectContent>
  </Select>
  <p className="text-sm text-muted-foreground">
    Unpublished items will show a yellow "UNPUBLISHED" badge and are hidden from public views.
  </p>
</div>
```

---

## API Endpoints

### Publish/Unpublish Product

**Endpoint**: `POST /admin/products/:id/publish`

**Request Body**:
```typescript
{
  isPublished: boolean  // true to publish, false to unpublish
}
```

**Response**:
```typescript
{
  id: string;
  isPublished: boolean;
  message: string;  // e.g., "Product published successfully"
}
```

**Mock Implementation**:
```typescript
// products.api.ts
publishProduct: async (id: string, isPublished: boolean): Promise<Product> => {
  if (apiConfig.isRealMode) {
    const response = await apiClient.post<Product>(
      `/admin/products/${id}/publish`,
      { isPublished }
    );
    return response;
  }
  
  // Mock mode
  const product = mockProducts.find((p) => p.id === id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  product.isPublished = isPublished;
  return product;
},
```

### Publish/Unpublish Moodboard

**Endpoint**: `POST /admin/moodboards/:id/publish`

**Request Body**:
```typescript
{
  isPublished: boolean
}
```

**Response**: Same structure as product publish endpoint.

---

## Usage Examples

### Example 1: Admin Creates Unpublished Draft Product

```typescript
const handleSubmit = async () => {
  const newProduct = {
    name: "Silk Maxi Dress",
    brand: "Reformation",
    price: 298,
    category: "dresses",
    description: "Elegant silk maxi dress",
    imageUrl: "https://example.com/dress.jpg",
    affiliateUrl: "https://shopstyle.it/...",
    slug: "silk-maxi-dress-reformation",
    tags: ["silk", "maxi", "formal"],
    isPublished: false,  // ✅ Create as draft
    purchaseType: 'affiliate',
  };
  
  await adminProductsApi.createProduct(newProduct);
  
  // Product is created but won't show in public product lists
  // Admin can see it with "UNPUBLISHED" badge
};
```

### Example 2: Admin Publishes Draft Product

```typescript
const handlePublish = async (productId: string) => {
  try {
    // Toggle publish status
    await adminProductsApi.publishProduct(productId, true);
    
    toast({
      title: 'Success',
      description: 'Product published successfully',
    });
    
    // Product now visible in public product lists
    // Yellow badge disappears
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to publish product',
      variant: 'destructive',
    });
  }
};
```

### Example 3: Backend Filter Published Products

```typescript
// Backend implementation example
app.get('/products', async (req, res) => {
  const { showUnpublished } = req.query;
  const isAdmin = req.user?.role === 'admin';
  
  let query = db.select().from(products);
  
  // Only show published products to public users
  if (!isAdmin || showUnpublished !== 'true') {
    query = query.where(eq(products.isPublished, true));
  }
  
  const results = await query;
  res.json(results);
});
```

### Example 4: Admin List View with Filter Toggle

```typescript
// Admin Products Page
const [showUnpublished, setShowUnpublished] = useState(false);

// Filter products based on publish status
const filteredProducts = allProducts.filter((product) => {
  if (!showUnpublished && product.isPublished === false) {
    return false;
  }
  return true;
});

return (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Switch
        checked={showUnpublished}
        onCheckedChange={setShowUnpublished}
      />
      <Label>Show Unpublished</Label>
    </div>
    
    <div className="grid gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
        // Shows yellow "UNPUBLISHED" badge if isPublished === false
      ))}
    </div>
  </div>
);
```

---

## Migration Guide

### Adding isPublished to Existing Database

#### PostgreSQL

```sql
-- Add isPublished column with default true
ALTER TABLE products
ADD COLUMN is_published BOOLEAN DEFAULT true NOT NULL;

ALTER TABLE moodboards
ADD COLUMN is_published BOOLEAN DEFAULT true NOT NULL;

-- Create index for filtering
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_moodboards_is_published ON moodboards(is_published);

-- Update existing data (if needed)
UPDATE products SET is_published = true WHERE is_published IS NULL;
UPDATE moodboards SET is_published = true WHERE is_published IS NULL;
```

#### MongoDB

```javascript
// Add isPublished field to all existing documents
db.products.updateMany(
  { isPublished: { $exists: false } },
  { $set: { isPublished: true } }
);

db.moodboards.updateMany(
  { isPublished: { $exists: false } },
  { $set: { isPublished: true } }
);

// Create index
db.products.createIndex({ isPublished: 1 });
db.moodboards.createIndex({ isPublished: 1 });
```

---

## Best Practices

### 1. Default to Published

When creating new products/moodboards, default `isPublished` to `true` unless explicitly creating a draft:

```typescript
const defaultFormData = {
  // ... other fields
  isPublished: true,  // ✅ Default to published
};
```

### 2. Show Badge Only When False

Check explicitly for `false` rather than falsy values:

```typescript
// ✅ Correct
{product.isPublished === false && <UnpublishedBadge />}

// ❌ Wrong - Could show for undefined
{!product.isPublished && <UnpublishedBadge />}
```

### 3. Admin-Only Actions

Only show publish/unpublish buttons to authenticated admins:

```typescript
const { isAuthenticated } = useAuthStore();

{isAuthenticated && (
  <Button onClick={handleTogglePublish}>
    {product.isPublished === false ? 'Publish' : 'Unpublish'}
  </Button>
)}
```

### 4. Backend Filtering

Filter out unpublished items in public endpoints:

```typescript
// Public endpoint - only published
app.get('/products', async (req, res) => {
  const products = await db
    .select()
    .from(products)
    .where(eq(products.isPublished, true));  // ✅ Filter
  
  res.json(products);
});

// Admin endpoint - all products
app.get('/admin/products', requireAuth, async (req, res) => {
  const products = await db.select().from(products);  // ✅ No filter
  res.json(products);
});
```

### 5. Confirmation on Unpublish

Consider adding confirmation dialog when unpublishing:

```typescript
const handleUnpublish = async () => {
  const confirmed = await confirm({
    title: 'Unpublish Product?',
    description: 'This product will be hidden from public views.',
  });
  
  if (confirmed) {
    await adminProductsApi.publishProduct(productId, false);
  }
};
```

---

## Testing Checklist

- [ ] **Badge Visibility**
  - [ ] Badge shows on unpublished products
  - [ ] Badge shows on unpublished moodboards
  - [ ] Badge does NOT show on published items
  - [ ] Badge positioning is correct on all screen sizes

- [ ] **Admin Actions**
  - [ ] Publish button works on product detail page
  - [ ] Unpublish button works on product detail page
  - [ ] Publish button works on moodboard detail page
  - [ ] Unpublish button works on moodboard detail page
  - [ ] Loading states display correctly
  - [ ] Success/error toasts show

- [ ] **Admin Forms**
  - [ ] Publish Status dropdown works in create form
  - [ ] Publish Status dropdown works in edit form
  - [ ] Default value is "Published"
  - [ ] Form submission includes isPublished field

- [ ] **API Integration**
  - [ ] POST /admin/products/:id/publish works
  - [ ] POST /admin/moodboards/:id/publish works
  - [ ] Backend filters unpublished items from public endpoints
  - [ ] Admin endpoints return all items (including unpublished)

- [ ] **Database Migration**
  - [ ] isPublished column added to products table
  - [ ] isPublished column added to moodboards table
  - [ ] Indexes created for filtering
  - [ ] Default value set to true

---

## Summary

The `isPublished` feature provides:

✅ **Visual Indicators** - Yellow "UNPUBLISHED" badge on all cards and detail pages  
✅ **Admin Controls** - One-click publish/unpublish buttons on detail pages  
✅ **Draft Support** - Create and save products/moodboards as drafts before publishing  
✅ **Public Filtering** - Backend can filter out unpublished items from public views  
✅ **Flexible Workflow** - Admins can edit and preview before publishing  

This feature enables a complete content management workflow with clear visual feedback and easy status toggling.
