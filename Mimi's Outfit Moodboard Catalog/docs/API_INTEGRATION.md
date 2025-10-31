# API Integration Guide

This guide explains how to use the API layer with mock data or connect to real API endpoints.

## 📋 Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Mock Mode](#mock-mode)
- [Real API Mode](#real-api-mode)
- [Using the API](#using-the-api)
- [React Hooks](#react-hooks)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Migration Guide](#migration-guide)

## 🎯 Overview

The application includes a flexible API layer that supports:

- **Mock Mode**: Uses local mock data (default)
- **Real Mode**: Connects to actual API endpoints
- **Easy Switching**: Toggle between modes via environment variables
- **Type Safety**: Full TypeScript support
- **React Hooks**: Convenient hooks for data fetching
- **Pagination Support**: Built-in pagination for large datasets
- **Search Functionality**: Integrated search with debouncing
- **Error Handling**: Comprehensive error management

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
VITE_API_MODE=mock              # 'mock' or 'real'
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key_here
VITE_API_DEBUG=false            # Enable API logging
```

### API Config

The configuration is managed in `src/config/api.config.ts`:

```typescript
export const apiConfig = {
  mode: 'mock' | 'real',
  baseUrl: string,
  apiKey?: string,
  debug: boolean
};
```

## 🧪 Mock Mode

Mock mode uses the existing mock data from `src/data/mock-data.ts`.

### Features

- ✅ No backend required
- ✅ Instant responses with simulated delay
- ✅ Perfect for development and testing
- ✅ All filter and sort operations work
- ✅ 52 products and 10 moodboards included

### Enable Mock Mode

```env
VITE_API_MODE=mock
```

## 🌐 Real API Mode

Real mode connects to your backend API.

### Enable Real Mode

```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_secret_key
```

### Required API Endpoints

Your backend API should implement these endpoints:

#### Products

```
GET    /products                    - Get all products (supports filters)
GET    /products/:id                - Get product by ID
GET    /products/slug/:slug         - Get product by slug
GET    /products/featured           - Get featured products
GET    /products/categories         - Get all categories
GET    /products/brands             - Get all brands
GET    /products/tags               - Get all tags
GET    /products/search?q=query     - Search products
```

#### Moodboards

```
GET    /moodboards                  - Get all moodboards (supports filters)
GET    /moodboards/:id              - Get moodboard by ID
GET    /moodboards/featured         - Get featured moodboards
GET    /moodboards/tags             - Get all tags
GET    /moodboards/search?q=query   - Search moodboards
```

### Query Parameters

**Products Filters:**
- `category`: Filter by category
- `brand`: Filter by brand
- `tag`: Filter by tag
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sortBy`: Sort order (newest, price-low, price-high, name)

**Moodboards Filters:**
- `tag`: Filter by tag
- `featured`: Filter featured only (boolean)

## 🚀 Using the API

### Direct API Calls

```typescript
import { productsApi, moodboardsApi } from '@/services/api';

// Get all products
const products = await productsApi.getAllProducts();

// Get products with filters
const filteredProducts = await productsApi.getAllProducts({
  category: 'outerwear',
  minPrice: 100,
  maxPrice: 500,
  sortBy: 'price-low'
});

// Get product by slug
const product = await productsApi.getProductBySlug('cashmere-oversized-blazer');

// Search products
const results = await productsApi.searchProducts('leather jacket');

// Get featured moodboards
const featured = await moodboardsApi.getFeaturedMoodboards();
```

## 🪝 React Hooks

### Products Hooks

```typescript
import { 
  useProducts, 
  useProduct, 
  useFeaturedProducts,
  useProductSearch 
} from '@/hooks/use-products';

// Get all products with filters
function ProductList() {
  const { products, loading, error } = useProducts({
    category: 'dresses',
    sortBy: 'newest'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render products */}</div>;
}

// Get single product
function ProductDetail({ slug }) {
  const { product, loading, error } = useProduct(slug, 'slug');
  
  // ...
}

// Get featured products
function FeaturedSection() {
  const { products, loading, error } = useFeaturedProducts();
  
  // ...
}

// Search products with debouncing
function SearchBar() {
  const [query, setQuery] = useState('');
  const { products, loading, error } = useProductSearch(query);
  
  // ...
}
```

### Moodboards Hooks

```typescript
import { 
  useMoodboards, 
  useMoodboard, 
  useFeaturedMoodboards,
  useMoodboardSearch 
} from '@/hooks/use-moodboards';

// Get all moodboards
function MoodboardGallery() {
  const { moodboards, loading, error } = useMoodboards();
  
  // ...
}

// Get moodboards by tag
function TaggedMoodboards({ tag }) {
  const { moodboards, loading, error } = useMoodboards({ tag });
  
  // ...
}

// Get single moodboard
function MoodboardDetail({ id }) {
  const { moodboard, loading, error } = useMoodboard(id);
  
  // ...
}
```

## 📦 API Response Types

### Product Type

```typescript
interface Product {
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
  createdAt: string;
}
```

### Moodboard Type

```typescript
interface Moodboard {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  products: Product[];
  tags?: string[];
  isFeatured?: boolean;
  stylingTips?: string[];
  howToWear?: string;
  createdAt: string;
  updatedAt: string;
}
```

## ❌ Error Handling

### Using Try-Catch

```typescript
import { productsApi, ApiError } from '@/services/api';

try {
  const products = await productsApi.getAllProducts();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Data:', error.data);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Hook Error States

```typescript
const { products, loading, error } = useProducts();

if (error) {
  return (
    <div className="error-message">
      <p>Failed to load products</p>
      <p>{error.message}</p>
    </div>
  );
}
```

## 🔄 Migration Guide

### Step 1: Update Environment

```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://your-api.com
VITE_API_KEY=your_api_key
```

### Step 2: Replace Direct Mock Data Usage

**Before:**

```typescript
import { mockProducts, getProductBySlug } from '@/data/mock-data';

function MyComponent() {
  const products = mockProducts;
  const product = getProductBySlug('some-slug');
  // ...
}
```

**After:**

```typescript
import { useProducts, useProduct } from '@/hooks/use-products';

function MyComponent() {
  const { products, loading, error } = useProducts();
  const { product, loading, error } = useProduct('some-slug');
  // ...
}
```

### Step 3: Update Pages

Most pages are already set up to work with hooks. Simply ensure they're using the API hooks instead of direct mock data imports.

### Step 4: Test

1. Start with `VITE_API_MODE=mock` to ensure everything works
2. Switch to `VITE_API_MODE=real` when your API is ready
3. Monitor the console with `VITE_API_DEBUG=true`

## 🛠️ Development Tips

### Enable Debug Mode

```env
VITE_API_DEBUG=true
```

This logs all API requests to the console:

```
[API Config] Running in MOCK mode
[API] GET: /products?category=outerwear
```

### Simulated Network Delay

Mock mode includes realistic delays:
- List queries: 300ms
- Single item: 200ms
- Metadata: 100ms

Adjust in `src/services/api/products.api.ts` and `src/services/api/moodboards.api.ts`.

### Custom API Client

The base API client (`src/services/api/base.api.ts`) can be customized:

```typescript
import { apiClient } from '@/services/api';

// Custom headers
const data = await apiClient.get('/custom-endpoint', {
  headers: { 'X-Custom-Header': 'value' }
});

// Query parameters
const data = await apiClient.get('/products', {
  params: { page: 1, limit: 10 }
});
```

## 📚 Additional Resources

- **Search Guide**: See [SEARCH_GUIDE.md](./SEARCH_GUIDE.md) for search implementation
- **Pagination Guide**: See [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) for pagination details
- **API Examples**: See [API_USAGE_EXAMPLES.md](./API_USAGE_EXAMPLES.md) for more examples
- **Mock Data**: `src/data/mock-data.ts`
- **API Config**: `src/config/api.config.ts`
- **Base Client**: `src/services/api/base.api.ts`
- **Products API**: `src/services/api/products.api.ts`
- **Moodboards API**: `src/services/api/moodboards.api.ts`
- **Type Definitions**: `src/types/index.ts`

## 🤝 Contributing

When adding new API endpoints:

1. Add types to `src/types/index.ts`
2. Add mock implementation in respective API service
3. Add real implementation in respective API service
4. Create corresponding React hook if needed
5. Update this documentation

---

**Need Help?** Check the inline code comments or refer to the existing implementations as examples.
