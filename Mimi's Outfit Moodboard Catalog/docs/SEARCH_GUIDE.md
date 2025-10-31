# Search Functionality Guide

Complete guide to implementing and using the search functionality with pagination support.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [How It Works](#how-it-works)
4. [Implementation Details](#implementation-details)
5. [Usage Examples](#usage-examples)
6. [Customization](#customization)
7. [Performance Optimization](#performance-optimization)
8. [API Integration](#api-integration)

---

## Overview

The search functionality provides real-time search across products and moodboards with:
- **Debounced input** (400ms default) to reduce API calls
- **Integrated pagination** - search results are paginated
- **Multi-field search** - searches across name, brand, description, tags, and category
- **Clear button** - quick reset of search query
- **Responsive design** - optimized for mobile and desktop

---

## Features

### 🔍 Product Search
Search across multiple fields:
- Product name
- Brand name
- Description
- Tags
- Category

### 🎨 Moodboard Search
Search across:
- Moodboard title
- Description
- Tags

### ⚡ Performance Features
- **Debouncing**: 400ms delay before search executes
- **Pagination**: Search results are paginated (12/24/36/48 per page)
- **Clear button**: Quickly reset search
- **Loading states**: Visual feedback during search
- **Error handling**: Graceful error display

---

## How It Works

### Search Flow

```
User types → Debounce (400ms) → Update filters → API call → Display results
```

### Integration with Filters

Search works seamlessly with other filters:
- Category filter
- Brand filter
- Price range filter
- Sort options

All filters can be combined with search for precise results.

---

## Implementation Details

### 1. SearchBar Component

**Location**: `src/components/SearchBar.tsx`

**Props**:
```typescript
interface SearchBarProps {
  value?: string;           // Current search value
  onChange: (value: string) => void; // Callback when search changes
  placeholder?: string;     // Placeholder text
  debounceMs?: number;      // Debounce delay (default: 300ms)
  className?: string;       // Additional CSS classes
  showClearButton?: boolean; // Show/hide clear button (default: true)
}
```

**Features**:
- Automatic debouncing
- Clear button
- Accessible (ARIA labels)
- Touch-optimized (44px targets)

### 2. API Layer

**Products API** (`src/services/api/products.api.ts`):
```typescript
// Search is integrated into getAllProducts with filters
const filters: FilterOptions = {
  search: 'leather jacket',
  category: 'outerwear',
  minPrice: 100,
  page: 1,
  limit: 12
};

const response = await productsApi.getAllProducts(filters);
```

**Moodboards API** (`src/services/api/moodboards.api.ts`):
```typescript
const filters: MoodboardFilters = {
  search: 'minimal aesthetic',
  tag: 'capsule',
  page: 1,
  limit: 12
};

const response = await moodboardsApi.getAllMoodboards(filters);
```

### 3. Search Algorithm (Mock Mode)

**Multi-field matching**:
```typescript
const searchLower = 'leather jacket'.toLowerCase();

products.filter(p => {
  return p.name.toLowerCase().includes(searchLower) ||
         p.brand?.toLowerCase().includes(searchLower) ||
         p.description?.toLowerCase().includes(searchLower) ||
         p.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
         p.category?.toLowerCase().includes(searchLower);
});
```

---

## Usage Examples

### Example 1: Basic Search in ProductsPage

**Already Implemented** in `src/pages/ProductsPage.tsx`:

```tsx
import SearchBar from '@/components/SearchBar';
import { usePaginatedProducts } from '@/hooks/use-products';

function ProductsPage() {
  const [localFilters, setLocalFilters] = useState({
    sortBy: 'newest'
  });

  const {
    products,
    pagination,
    loading,
    updateFilters
  } = usePaginatedProducts(localFilters);

  const handleSearch = (query: string) => {
    const updatedFilters = { 
      ...localFilters, 
      search: query || undefined 
    };
    setLocalFilters(updatedFilters);
    updateFilters(updatedFilters);
  };

  return (
    <div>
      <SearchBar
        value={localFilters.search || ''}
        onChange={handleSearch}
        placeholder="Search products, brands, or styles..."
        debounceMs={400}
      />
      
      {/* Products grid with pagination */}
      <ProductGrid products={products} loading={loading} />
      <Pagination pagination={pagination} />
    </div>
  );
}
```

### Example 2: Custom Search Component

Create your own search implementation:

```tsx
import { useState } from 'react';
import { useProductSearch } from '@/hooks/use-products';
import SearchBar from '@/components/SearchBar';

function CustomSearch() {
  const [query, setQuery] = useState('');
  const { products, loading, error } = useProductSearch(query);

  return (
    <div>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search products..."
        debounceMs={500}
      />
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div className="results">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Search with Advanced Filters

Combine search with other filters:

```tsx
const [filters, setFilters] = useState({
  search: '',
  category: 'dresses',
  minPrice: 50,
  maxPrice: 200,
  sortBy: 'price-low',
  page: 1,
  limit: 24
});

const { products, pagination } = usePaginatedProducts(filters);

// Update search while keeping other filters
const handleSearch = (search: string) => {
  setFilters(prev => ({ ...prev, search, page: 1 }));
};

// Clear all filters including search
const clearFilters = () => {
  setFilters({
    sortBy: 'newest',
    page: 1,
    limit: 24
  });
};
```

### Example 4: Instant Search (No Debouncing)

For instant search results without debouncing:

```tsx
<SearchBar
  value={searchQuery}
  onChange={handleSearch}
  placeholder="Instant search..."
  debounceMs={0} // No debouncing
/>
```

---

## Customization

### Change Debounce Delay

```tsx
// Faster response (200ms)
<SearchBar debounceMs={200} ... />

// Slower response (save API calls - 600ms)
<SearchBar debounceMs={600} ... />

// Instant (0ms - use with caution)
<SearchBar debounceMs={0} ... />
```

### Custom Placeholder

```tsx
<SearchBar
  placeholder="Find your perfect outfit..."
  ...
/>
```

### Hide Clear Button

```tsx
<SearchBar
  showClearButton={false}
  ...
/>
```

### Custom Styling

```tsx
<SearchBar
  className="w-full max-w-2xl mx-auto"
  ...
/>
```

---

## Performance Optimization

### 1. Debouncing Strategy

**Current Implementation** (400ms):
- Good balance between responsiveness and API efficiency
- User types → Wait 400ms → Execute search
- If user keeps typing, timer resets

**Adjust based on your needs**:
- **Instant feel**: 200ms (more API calls)
- **API efficiency**: 600ms (fewer API calls)
- **Real-time**: 0ms (use only with local data)

### 2. Pagination Integration

Search results are automatically paginated:
- Reduces data transfer
- Improves render performance
- Better UX for large result sets

```typescript
// Search returns paginated results
const response = await productsApi.getAllProducts({
  search: 'jacket',
  page: 1,
  limit: 12 // Only load 12 items
});

// Response structure
{
  data: Product[],        // 12 products
  pagination: {
    page: 1,
    limit: 12,
    total: 87,           // Total search results
    totalPages: 8,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

### 3. Loading States

Show loading feedback during search:

```tsx
{loading && (
  <div className="grid-mobile-products gap-4">
    {[...Array(12)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}
```

### 4. Empty States

Handle no results gracefully:

```tsx
{!loading && products.length === 0 && (
  <div className="text-center py-12">
    <p>No products found matching "{searchQuery}"</p>
    <Button onClick={clearFilters}>Clear Search</Button>
  </div>
)}
```

---

## API Integration

### Mock Mode (Current)

Search is handled client-side with local data:

```typescript
// In products.api.ts - mockApi
if (filters?.search) {
  const searchLower = filters.search.toLowerCase().trim();
  products = products.filter(p => {
    return p.name.toLowerCase().includes(searchLower) ||
           p.brand?.toLowerCase().includes(searchLower) ||
           // ... other fields
  });
}
```

**Pros**:
- Instant results
- No server required
- Perfect for development

**Cons**:
- Limited to local dataset
- Not scalable for large datasets

### Real API Mode

When connecting to real backend:

**Backend endpoint expectations**:
```
GET /api/products?search=leather&page=1&limit=12

Response:
{
  "data": [...products],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 87,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Backend implementation recommendations**:
1. Use database full-text search (PostgreSQL, Elasticsearch)
2. Index searchable fields for performance
3. Support fuzzy matching for typos
4. Return relevance scores
5. Implement search analytics

**Switch to real API**:
```env
# .env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Best Practices

### 1. Search UX

✅ **Do**:
- Show loading state immediately
- Display search term in results ("Showing results for X")
- Provide clear button
- Keep previous results visible while loading new ones
- Show result count

❌ **Don't**:
- Clear results while loading
- Show error without retry option
- Use very short debounce (<200ms) with API calls

### 2. Combining with Filters

```tsx
// ✅ Good: Reset page when search changes
const handleSearch = (search: string) => {
  setFilters(prev => ({ ...prev, search, page: 1 }));
};

// ❌ Bad: Keep old page number
const handleSearch = (search: string) => {
  setFilters(prev => ({ ...prev, search })); // page stays at 5
};
```

### 3. Clear All Functionality

```tsx
// ✅ Good: Clear search AND other filters
const clearAll = () => {
  setFilters({ sortBy: 'newest', page: 1, limit: 12 });
};

// ❌ Bad: Clear only search, keep other filters
const clearSearch = () => {
  setFilters(prev => ({ ...prev, search: undefined }));
};
```

### 4. URL Sync (Advanced)

Keep search in URL for bookmarking:

```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();
const searchQuery = searchParams.get('search') || '';

const handleSearch = (query: string) => {
  if (query) {
    searchParams.set('search', query);
  } else {
    searchParams.delete('search');
  }
  setSearchParams(searchParams);
};
```

---

## Troubleshooting

### Search not working

1. **Check debounce**: Wait 400ms after typing
2. **Check API mode**: Verify `.env` file settings
3. **Check filters**: Ensure search filter is passed to API
4. **Check console**: Look for API errors

### Search too slow

1. **Reduce debounce**: Set to 200-300ms
2. **Optimize mock data**: Reduce product count for testing
3. **Add indexes**: For real API, index search fields

### Search too sensitive

1. **Increase debounce**: Set to 500-600ms
2. **Implement min length**: Only search after 2-3 characters

```tsx
const handleSearch = (query: string) => {
  if (query.length >= 3 || query.length === 0) {
    updateFilters({ search: query });
  }
};
```

---

## Related Documentation

- [Pagination Guide](./PAGINATION_GUIDE.md) - Complete pagination implementation
- [API Integration](./API_INTEGRATION.md) - API setup and configuration
- [API Usage Examples](./API_USAGE_EXAMPLES.md) - More code examples
- [Quick Start](./QUICK_START.md) - Get started quickly

---

## Summary

✅ **Implemented Features**:
- Debounced search input (400ms)
- Multi-field search (name, brand, description, tags)
- Integrated pagination
- Clear button functionality
- Loading and error states
- Mock and real API support
- Mobile-optimized UI

🎯 **Key Benefits**:
- Reduced API calls via debouncing
- Better UX with pagination
- Flexible and reusable SearchBar component
- Works with all existing filters
- Production-ready performance

📝 **Next Steps**:
1. Test search with various queries
2. Monitor search performance
3. Consider adding search analytics
4. Implement advanced features (autocomplete, suggestions)
