# API Usage Examples

Quick reference guide for using the API layer in your components.

## 🎯 Quick Start

### 1. Using React Hooks (Recommended)

The easiest way to fetch data is using the provided React hooks:

```tsx
import { useProducts } from '@/hooks/use-products';

function ProductGallery() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Direct API Calls

For more control, use the API services directly:

```tsx
import { productsApi } from '@/services/api';

async function loadProducts() {
  try {
    const products = await productsApi.getAllProducts();
    console.log(products);
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}
```

## 📦 Common Use Cases

### Filtering Products

```tsx
import { useProducts } from '@/hooks/use-products';

function DressesPage() {
  const { products, loading, error } = useProducts({
    category: 'dresses',
    minPrice: 100,
    maxPrice: 300,
    sortBy: 'price-low'
  });

  // Component renders filtered products
}
```

### Loading Single Product

```tsx
import { useProduct } from '@/hooks/use-products';
import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { slug } = useParams();
  const { product, loading, error } = useProduct(slug!, 'slug');

  if (loading) return <SkeletonDetail />;
  if (error || !product) return <NotFound />;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
    </div>
  );
}
```

### Search with Debouncing

```tsx
import { useState } from 'react';
import { useProductSearch } from '@/hooks/use-products';

function SearchBar() {
  const [query, setQuery] = useState('');
  const { products, loading } = useProductSearch(query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      
      {loading && <div>Searching...</div>}
      
      {products.length > 0 && (
        <div className="search-results">
          {products.map(product => (
            <SearchResult key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Featured Collections

```tsx
import { useFeaturedProducts, useFeaturedMoodboards } from '@/hooks/use-products';
import { useFeaturedMoodboards } from '@/hooks/use-moodboards';

function HomePage() {
  const { products: featuredProducts, loading: loadingProducts } = useFeaturedProducts();
  const { moodboards: featuredMoodboards, loading: loadingMoodboards } = useFeaturedMoodboards();

  return (
    <div>
      <section>
        <h2>Featured Products</h2>
        {loadingProducts ? (
          <SkeletonGrid />
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>

      <section>
        <h2>Featured Moodboards</h2>
        {loadingMoodboards ? (
          <SkeletonGrid />
        ) : (
          <MoodboardGrid moodboards={featuredMoodboards} />
        )}
      </section>
    </div>
  );
}
```

### Moodboard with Products

```tsx
import { useMoodboard } from '@/hooks/use-moodboards';
import { useParams } from 'react-router-dom';

function MoodboardDetailPage() {
  const { id } = useParams();
  const { moodboard, loading, error } = useMoodboard(id!);

  if (loading) return <SkeletonDetail />;
  if (error || !moodboard) return <NotFound />;

  return (
    <div>
      <h1>{moodboard.title}</h1>
      <p>{moodboard.description}</p>
      
      {moodboard.stylingTips && (
        <div>
          <h2>Styling Tips</h2>
          <ul>
            {moodboard.stylingTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="products-grid">
        {moodboard.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Error Handling with Custom UI

```tsx
import { useProducts } from '@/hooks/use-products';
import { Alert } from '@/components/ui/alert';

function ProductList() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load products</AlertTitle>
        <AlertDescription>
          {error.message}. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Advanced: Manual Refetch

```tsx
import { useState, useEffect } from 'react';
import { productsApi } from '@/services/api';
import type { Product } from '@/types';

function ProductListWithRefresh() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <button onClick={fetchProducts}>
        Refresh Products
      </button>
      
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <div className="grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔄 Switching Between Mock and Real Data

### Development (Mock Mode)

```env
VITE_API_MODE=mock
```

Your components work exactly the same way!

### Production (Real API)

```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_secret_key
```

**No code changes needed!** The API layer handles the switching automatically.

## 🎨 Custom Hook Patterns

### Combining Multiple Data Sources

```tsx
import { useFeaturedProducts } from '@/hooks/use-products';
import { useFeaturedMoodboards } from '@/hooks/use-moodboards';

function FeaturedSection() {
  const productsQuery = useFeaturedProducts();
  const moodboardsQuery = useFeaturedMoodboards();

  const isLoading = productsQuery.loading || moodboardsQuery.loading;
  const hasError = productsQuery.error || moodboardsQuery.error;

  if (isLoading) return <Loading />;
  if (hasError) return <Error />;

  return (
    <div>
      <ProductCarousel products={productsQuery.products} />
      <MoodboardGrid moodboards={moodboardsQuery.moodboards} />
    </div>
  );
}
```

### Dependent Queries

```tsx
import { useMoodboard } from '@/hooks/use-moodboards';
import { useProduct } from '@/hooks/use-products';

function RelatedProducts({ moodboardId }: { moodboardId: string }) {
  const { moodboard } = useMoodboard(moodboardId);
  
  // Only fetch product details after moodboard loads
  const firstProductSlug = moodboard?.products[0]?.slug;
  const { product } = useProduct(firstProductSlug || '', 'slug');

  // Render logic...
}
```

## 📊 TypeScript Examples

### Type-Safe Filters

```tsx
import type { FilterOptions } from '@/types';
import { useProducts } from '@/hooks/use-products';

function FilterableProducts() {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'dresses',
    sortBy: 'price-low'
  });

  const { products, loading, error } = useProducts(filters);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Full type safety!
}
```

### Custom API Wrapper

```tsx
import { productsApi } from '@/services/api';
import type { Product } from '@/types';

class ProductService {
  async getOnSaleProducts(): Promise<Product[]> {
    const products = await productsApi.getAllProducts();
    return products.filter(p => p.isFeatured); // Example filter
  }

  async getExpensiveProducts(threshold: number): Promise<Product[]> {
    return productsApi.getAllProducts({
      minPrice: threshold,
      sortBy: 'price-high'
    });
  }
}

export const productService = new ProductService();
```

## 🚨 Error Handling Best Practices

### Graceful Degradation

```tsx
function ProductShowcase() {
  const { products, error } = useProducts();

  // Still show something even if there's an error
  return (
    <div>
      {error && (
        <div className="bg-yellow-50 p-4 mb-4">
          <p>Unable to load latest products. Showing cached data.</p>
        </div>
      )}
      
      <ProductGrid products={products} />
    </div>
  );
}
```

### Retry Logic

```tsx
import { useState } from 'react';
import { productsApi } from '@/services/api';

function ProductsWithRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const { products, loading, error } = useProducts();

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (error && retryCount < 3) {
    return (
      <div>
        <p>Failed to load products</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  // Render products...
}
```

## 💡 Pro Tips

1. **Always handle loading states** - Use skeleton loaders for better UX
2. **Handle empty states** - Show helpful messages when no data
3. **Use TypeScript** - Let the types guide you
4. **Debounce searches** - The `useProductSearch` hook does this automatically
5. **Test with both modes** - Ensure your app works in mock and real modes
6. **Monitor errors** - Log API errors for debugging

---

Need more examples? Check the existing page components in `src/pages/` for real-world usage!
