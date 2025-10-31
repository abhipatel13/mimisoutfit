# Product Detail API Integration

## Overview
The product detail page now uses **live API calls** to fetch product data by slug, providing real-time data and proper error handling.

---

## Key Features

### 1. Slug-based URLs ✅
Products are accessed via user-friendly slug URLs instead of internal IDs:
```
❌ Old: /products/prod_001
✅ New: /products/classic-trench-coat
```

### 2. Live API Integration ✅
The page fetches data from the API layer (mock or real mode) instead of direct mock data imports:
```typescript
// Uses productsApi.getProductBySlug(slug)
// Automatically works in both mock and real API modes
```

### 3. Related Products ✅
Fetches and displays related products based on:
- Same category
- Same brand
- Shared tags

### 4. Error Handling ✅
Comprehensive error states:
- Loading skeleton during data fetch
- Product not found page
- API error handling with retry message
- Graceful fallback to products page

---

## API Endpoint Used

### Get Product by Slug
```
GET /products/slug/:slug
```

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
- `404 Not Found` - Product not found (returns null)
- `401 Unauthorized` - Missing or invalid API key

---

## Implementation Details

### ProductDetailPage.tsx
```typescript
import { productsApi } from '@/services/api';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch product by slug using live API
        const fetchedProduct = await productsApi.getProductBySlug(slug);
        
        if (!fetchedProduct) {
          setError('Product not found');
        } else {
          setProduct(fetchedProduct);
          
          // Fetch related products
          const { data: allProducts } = await productsApi.getAllProducts({
            limit: 100,
          });
          
          const related = allProducts
            .filter(p => p.id !== fetchedProduct.id && (
              p.category === fetchedProduct.category || 
              p.brand === fetchedProduct.brand ||
              p.tags?.some(tag => fetchedProduct.tags?.includes(tag))
            ))
            .slice(0, 4);
          
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ... rest of component
}
```

---

## Navigation Flow

### From Product Card
```typescript
// ProductCard.tsx links to slug
<Link to={`/products/${product.slug}`}>
  {product.name}
</Link>
```

### Route Configuration
```typescript
// App.tsx
<Route path="/products/:slug" element={<ProductDetailPage />} />
```

### URL Examples
```
/products/classic-trench-coat
/products/denim-jacket-classic
/products/leather-ankle-boots
/products/silk-midi-skirt
```

---

## Benefits

### 1. SEO-Friendly URLs ✅
- Readable: `/products/classic-trench-coat`
- Descriptive: Contains product name
- Shareable: Easy to remember and share

### 2. Real-time Data ✅
- Always fetches latest product data
- Works with both mock and real API modes
- Easy to switch between data sources

### 3. Better UX ✅
- Loading skeleton during fetch
- Clear error messages
- Graceful fallback to products page
- Related products recommendation

### 4. Maintainable Code ✅
- Single source of truth (API layer)
- Consistent error handling
- Type-safe with TypeScript
- Easy to test and debug

---

## Testing

### Mock Mode (Default)
```env
VITE_API_MODE=mock
```
Uses local data from `mock-data.ts` with simulated network delay (200ms).

### Real Mode
```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key_here
```
Connects to real backend API endpoint.

### Test Scenarios
1. **Valid slug**: Should load product details
2. **Invalid slug**: Should show "Product not found" page
3. **API error**: Should show error message with retry option
4. **Loading state**: Should show skeleton during fetch
5. **Related products**: Should show 4 related items (if available)

---

## Migration Notes

### Before (Direct Mock Import)
```typescript
import { getProductBySlug } from '@/data/mock-data';

const product = getProductBySlug(slug || '');
```

### After (Live API)
```typescript
import { productsApi } from '@/services/api';

const product = await productsApi.getProductBySlug(slug);
```

### Breaking Changes
None! The API layer handles both mock and real modes transparently.

---

## Related Documentation
- **Backend API Spec**: `/docs/BACKEND_API_SPEC.md` - Complete API documentation
- **API Integration**: `/docs/API_INTEGRATION.md` - Setup and configuration
- **API Examples**: `/docs/API_USAGE_EXAMPLES.md` - Code examples
- **Quick Start**: `/docs/QUICK_START.md` - Get started in 5 minutes

---

## Future Enhancements
- [ ] Add product reviews and ratings
- [ ] Implement product variants (size, color)
- [ ] Add product availability status
- [ ] Implement product wishlist
- [ ] Add product comparison feature
- [ ] Implement product recommendations AI
