# Pagination Guide

Complete guide for implementing and using pagination in The Lookbook by Mimi.

## 🎯 Overview

The application now includes comprehensive pagination support for handling large product and moodboard datasets efficiently. This improves performance and user experience when dealing with extensive catalogs.

## ✨ Features

- **Flexible Page Sizes**: 12, 24, 36, or 48 items per page
- **Smart Navigation**: Previous, Next, First, and Last page buttons
- **Page Numbers**: Intelligent ellipsis for large page counts
- **Mobile Optimized**: Simplified controls for mobile devices
- **URL State** (optional): Persist pagination in URL parameters
- **Type-Safe**: Full TypeScript support

## 🏗️ Architecture

### Core Components

1. **Types** (`src/types/index.ts`)
   - `PaginationInfo`: Page metadata (page, limit, total, etc.)
   - `PaginatedResponse<T>`: Standardized paginated API response

2. **Utilities** (`src/lib/pagination.utils.ts`)
   - `calculatePagination()`: Client-side pagination logic
   - `getPageNumbers()`: Generate page number display
   - `getPageRangeText()`: Format "Showing X-Y of Z" text

3. **UI Component** (`src/components/Pagination.tsx`)
   - Full-featured pagination control
   - Responsive design with mobile variant

4. **React Hooks** (`src/hooks/use-products.ts`, `src/hooks/use-moodboards.ts`)
   - `usePaginatedProducts()`: Products with pagination
   - `usePaginatedMoodboards()`: Moodboards with pagination

## 📖 Usage

### Basic Implementation

```tsx
import { usePaginatedProducts } from '@/hooks/use-products';
import Pagination from '@/components/Pagination';

function ProductsPage() {
  const {
    products,
    pagination,
    loading,
    error,
    setPage,
    setPageSize,
    updateFilters,
  } = usePaginatedProducts();

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
```

### With Filters

```tsx
function FilteredProducts() {
  const {
    products,
    pagination,
    setPage,
    updateFilters,
  } = usePaginatedProducts({ sortBy: 'newest' });

  const handleCategoryChange = (category: string) => {
    updateFilters({ category, sortBy: 'newest' });
  };

  return (
    <div>
      <CategoryFilter onChange={handleCategoryChange} />
      
      <ProductGrid products={products} />
      
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Mobile-Optimized

```tsx
import { useIsMobile } from '@/hooks/use-mobile';
import { SimplePagination } from '@/components/Pagination';

function ResponsivePagination({ pagination, onPageChange }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SimplePagination
        pagination={pagination}
        onPageChange={onPageChange}
      />
    );
  }

  return (
    <Pagination
      pagination={pagination}
      onPageChange={onPageChange}
      showPageSize={true}
    />
  );
}
```

## 🎨 UI Components

### Pagination Component

**Full-Featured Version:**
```tsx
<Pagination
  pagination={pagination}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  showPageSize={true}
  className="mt-8"
/>
```

**Props:**
- `pagination: PaginationInfo` - Pagination state
- `onPageChange: (page: number) => void` - Page change handler
- `onPageSizeChange?: (size: number) => void` - Page size handler (optional)
- `showPageSize?: boolean` - Show page size selector (default: true)
- `className?: string` - Additional CSS classes

**SimplePagination (Mobile):**
```tsx
<SimplePagination
  pagination={pagination}
  onPageChange={handlePageChange}
/>
```

## 🔧 API Integration

### Mock Mode

Pagination works seamlessly with mock data:

```typescript
// src/services/api/products.api.ts
const mockApi = {
  async getAllProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    // Apply filters and sorting
    let products = applyFilters(mockProducts, filters);
    
    // Calculate pagination
    const { paginatedData, pagination } = calculatePagination(
      products,
      filters?.page ?? 1,
      filters?.limit ?? 12
    );

    return {
      data: paginatedData,
      pagination,
    };
  },
};
```

### Real API Mode

When connecting to a real backend:

```typescript
// Backend should return this format:
{
  "data": [...products...],
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

**Backend Implementation Example (Node.js):**

```javascript
// Express.js endpoint
app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  // Query database with pagination
  const [products, total] = await Promise.all([
    db.products.findMany({
      skip: offset,
      take: limit,
      where: buildFilters(req.query),
      orderBy: buildSorting(req.query)
    }),
    db.products.count({ where: buildFilters(req.query) })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});
```

## 🎯 Advanced Features

### URL State Persistence

Persist pagination in URL for shareable links:

```tsx
import { useSearchParams } from 'react-router-dom';

function ProductsWithURLState() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const { products, pagination, setPage, setPageSize } = usePaginatedProducts({
    page,
    limit
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), limit: limit.toString() });
    setPage(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setSearchParams({ page: '1', limit: newLimit.toString() });
    setPageSize(newLimit);
  };

  return (
    <div>
      <ProductGrid products={products} />
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
```

### Custom Page Size Options

Modify available page sizes:

```typescript
// src/lib/pagination.utils.ts
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48]; // Customize as needed
```

### Loading States

Handle loading during page changes:

```tsx
function ProductsWithLoading() {
  const { products, pagination, loading, setPage } = usePaginatedProducts();
  const [isChangingPage, setIsChangingPage] = useState(false);

  const handlePageChange = async (page: number) => {
    setIsChangingPage(true);
    await setPage(page);
    setIsChangingPage(false);
  };

  return (
    <div>
      {isChangingPage && <LoadingOverlay />}
      <ProductGrid products={products} loading={loading} />
      <Pagination pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
}
```

## 📊 Performance Tips

### 1. Virtual Scrolling (For Large Datasets)

For datasets with 1000+ items, consider virtual scrolling:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualProductList() {
  const { products } = usePaginatedProducts({ limit: 100 });
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(item => (
          <ProductCard key={products[item.index].id} product={products[item.index]} />
        ))}
      </div>
    </div>
  );
}
```

### 2. Prefetching Next Page

Improve perceived performance:

```tsx
function ProductsWithPrefetch() {
  const { products, pagination, setPage } = usePaginatedProducts();

  // Prefetch next page
  useEffect(() => {
    if (pagination.hasNextPage) {
      productsApi.getAllProducts({ 
        page: pagination.page + 1,
        limit: pagination.limit 
      });
    }
  }, [pagination.page, pagination.hasNextPage]);

  return (
    <div>
      <ProductGrid products={products} />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
```

### 3. Debounced Filtering

Avoid excessive API calls:

```tsx
import { useDebouncedValue } from '@/hooks/use-debounce';

function FilteredProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 500);

  const { products, pagination, setPage } = usePaginatedProducts({
    search: debouncedQuery
  });

  return (
    <div>
      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <ProductGrid products={products} />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
```

## 🧪 Testing

### Example Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { usePaginatedProducts } from '@/hooks/use-products';

describe('usePaginatedProducts', () => {
  it('should handle pagination correctly', async () => {
    const { result } = renderHook(() => usePaginatedProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(12);
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.totalPages).toBeGreaterThan(1);

    // Change page
    result.current.setPage(2);

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(2);
    });
  });
});
```

## 🎨 Styling

The Pagination component uses Tailwind CSS and supports dark mode:

```css
/* Custom pagination styles (optional) */
.pagination-container {
  @apply flex items-center justify-between gap-4;
  @apply border-t border-border pt-6 mt-8;
}

.pagination-button {
  @apply touch-target transition-all;
  @apply hover:scale-105 active:scale-95;
}

.pagination-button-active {
  @apply bg-primary text-primary-foreground;
  @apply shadow-lg pointer-events-none;
}
```

## 🔍 Troubleshooting

### Issue: Pagination resets when filtering

**Solution:** Ensure `updateFilters` is called instead of modifying filters directly:

```tsx
// ❌ Wrong
setFilters({ ...filters, category: 'dresses' });

// ✅ Correct
updateFilters({ category: 'dresses' });
```

### Issue: Scroll position not resetting

**Solution:** The `setPage` function includes auto-scroll. Adjust if needed:

```typescript
const setPage = useCallback((page: number) => {
  setFilters(prev => ({ ...prev, page }));
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Customize this
}, []);
```

### Issue: Page size selector not showing

**Solution:** Pass `onPageSizeChange` handler:

```tsx
<Pagination
  pagination={pagination}
  onPageChange={setPage}
  onPageSizeChange={setPageSize} // Required for page size selector
  showPageSize={true}
/>
```

## 📚 Additional Resources

- [React Hook Patterns](https://usehooks.com/)
- [Tanstack Virtual](https://tanstack.com/virtual/latest) - For virtual scrolling
- [React Router](https://reactrouter.com/) - For URL state management
- [Tailwind CSS](https://tailwindcss.com/) - For styling

## 🎉 Summary

Pagination is now fully integrated into the application:

- ✅ Type-safe pagination types
- ✅ Reusable pagination utilities
- ✅ Beautiful UI component (desktop + mobile)
- ✅ React hooks with pagination controls
- ✅ Mock and real API support
- ✅ Performance optimizations
- ✅ Comprehensive documentation

For questions or feature requests, refer to the main [API Integration Guide](./API_INTEGRATION.md).
