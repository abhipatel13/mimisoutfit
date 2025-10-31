# Fuzzy Search Guide

**Complete guide to typo-tolerant search implementation**

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Features](#features)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Testing Typo Tolerance](#testing-typo-tolerance)
7. [Customization](#customization)
8. [Performance Considerations](#performance-considerations)
9. [Backend Integration](#backend-integration)
10. [Advanced Features](#advanced-features)

---

## Overview

The Lookbook implements **fuzzy search** with typo tolerance using [Fuse.js](https://fusejs.io/), a powerful lightweight fuzzy-search library. This allows users to find products and moodboards even when they make spelling mistakes or typos.

### Why Fuzzy Search?

- **User-Friendly**: Users don't need perfect spelling
- **Better Results**: More matches = better user experience
- **Intelligent**: Weighted search prioritizes important fields (name > brand > description)
- **Fast**: Optimized for real-time search with debouncing

---

## How It Works

### 1. Smart Search Algorithm

The system uses a **smart search** strategy that automatically falls back to fuzzy matching:

```typescript
// Step 1: Try exact search first
const exactResults = products.filter(p => 
  p.name.includes(query) || 
  p.brand.includes(query)
);

// Step 2: If few results (<3), use fuzzy search
if (exactResults.length < 3) {
  return fuzzySearchProducts(products, query);
}

return exactResults;
```

### 2. Fuzzy Matching Parameters

- **Threshold**: `0.4` (moderate tolerance)
  - `0.0` = exact match only
  - `1.0` = match anything
  
- **Distance**: `100` (max character distance for fuzzy match)
- **Min Match Length**: `2` characters minimum

### 3. Weighted Search Fields

Fields are prioritized by importance:

| Field | Weight | Example |
|-------|--------|---------|
| Product Name | 3.0x | "Cashmere Blazer" |
| Brand | 2.0x | "Everlane" |
| Category | 1.5x | "outerwear" |
| Tags | 1.5x | ["blazer", "cashmere"] |
| Description | 1.0x | "Effortlessly chic..." |

---

## Features

### ✅ Typo Tolerance

Common typos are automatically handled:

| User Types | System Finds |
|------------|--------------|
| "cashmre" | "cashmere" |
| "everlne" | "Everlane" |
| "blazr" | "blazer" |
| "lether" | "leather" |
| "maxmara" | "Max Mara" |
| "trech coat" | "trench coat" |

### ✅ Smart Fallback

- **Good results?** → Use exact search (faster)
- **Few results?** → Use fuzzy search (more forgiving)

### ✅ Visual Feedback

The SearchBar component shows a hint when fuzzy search is active:

```tsx
<SearchBar 
  value={searchQuery}
  onChange={setSearchQuery}
  showFuzzyHint={true}  // Shows "Using smart search" hint
/>
```

### ✅ Multi-Field Search

Search across all relevant fields simultaneously:
- Product name
- Brand name
- Category
- Tags
- Description
- Moodboard title and styling tips

---

## Configuration

### Adjusting Fuzzy Tolerance

Edit `/src/lib/fuzzy-search.utils.ts`:

```typescript
const PRODUCT_SEARCH_OPTIONS: Fuse.IFuseOptions<Product> = {
  threshold: 0.4,  // ⬅️ Adjust this (0-1)
  // 0.3 = stricter (fewer typos allowed)
  // 0.5 = more lenient (more typos allowed)
  distance: 100,
  minMatchCharLength: 2,
  // ... other options
};
```

### Changing Field Weights

Prioritize different fields:

```typescript
keys: [
  {
    name: 'name',
    weight: 3,  // ⬅️ Most important (3x)
  },
  {
    name: 'brand',
    weight: 2,  // ⬅️ Second priority (2x)
  },
  {
    name: 'description',
    weight: 1,  // ⬅️ Least important (1x)
  },
]
```

### Disabling Fuzzy Search

To use only exact search:

```typescript
// In products.api.ts
// Replace this:
const { results } = smartSearch(products, filters.search, 3);

// With this:
const results = products.filter(p => 
  p.name.toLowerCase().includes(filters.search.toLowerCase())
);
```

---

## Usage Examples

### Basic Product Search

```tsx
import { useProducts } from '@/hooks/use-products';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const { products, loading } = useProducts({ search: query });

  return (
    <div>
      <SearchBar 
        value={query}
        onChange={setQuery}
        placeholder="Search products..."
      />
      {/* Products automatically filtered with fuzzy matching */}
      <ProductGrid products={products} />
    </div>
  );
}
```

### Moodboard Search

```tsx
import { useMoodboards } from '@/hooks/use-moodboards';

function MoodboardSearch() {
  const [query, setQuery] = useState('');
  const { moodboards, loading } = useMoodboards({ search: query });

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <MoodboardGrid moodboards={moodboards} />
    </div>
  );
}
```

### Manual Fuzzy Search

```tsx
import { fuzzySearchProducts } from '@/lib/fuzzy-search.utils';

function ManualSearch() {
  const allProducts = [...]; // Your products
  const query = 'cashmre blazr'; // User's typo-filled query
  
  const results = fuzzySearchProducts(allProducts, query);
  // Returns products sorted by relevance
}
```

### Search Suggestions

```tsx
import { getSearchSuggestions } from '@/lib/fuzzy-search.utils';

function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const allProducts = [...]; // Your products
  
  const suggestions = getSearchSuggestions(allProducts, query, 5);
  
  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      {suggestions.length > 0 && (
        <div className="suggestions">
          <p>Did you mean:</p>
          {suggestions.map(suggestion => (
            <button onClick={() => setQuery(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Testing Typo Tolerance

### Common Test Cases

Try these searches to test fuzzy matching:

#### Product Searches
| Query | Expected Results |
|-------|------------------|
| "cashmre" | Cashmere products |
| "everlne" | Everlane brand items |
| "blazr" | Blazers |
| "lether" | Leather items |
| "trnch coat" | Trench coats |
| "maxi dres" | Maxi dresses |

#### Moodboard Searches
| Query | Expected Results |
|-------|------------------|
| "minimlist" | Minimalist moodboard |
| "parisian chic" | Parisian Chic moodboard |
| "bohemian" | Bohemian moodboards |

### Similarity Testing

```typescript
import { calculateSimilarity } from '@/lib/fuzzy-search.utils';

// Test string similarity
console.log(calculateSimilarity('cashmere', 'cashmre'));  // ~88%
console.log(calculateSimilarity('blazer', 'blazr'));      // ~83%
console.log(calculateSimilarity('leather', 'lether'));    // ~85%
```

### Checking for Typos

```typescript
import { hasPotentialTypos } from '@/lib/fuzzy-search.utils';

console.log(hasPotentialTypos('cashmere'));  // false
console.log(hasPotentialTypos('cashmre'));   // true (missing vowel)
console.log(hasPotentialTypos('blazr'));     // true (missing vowel)
```

---

## Customization

### Creating Custom Search Functions

```typescript
import Fuse from 'fuse.js';

// Custom fuzzy search for specific use case
export function customFuzzySearch<T>(
  items: T[],
  query: string,
  keys: string[],
  threshold: number = 0.4
): T[] {
  const fuse = new Fuse(items, {
    keys,
    threshold,
    includeScore: true,
    ignoreLocation: true,
  });

  const results = fuse.search(query);
  return results.map(r => r.item);
}

// Usage
const results = customFuzzySearch(
  products,
  'cashmre',
  ['name', 'brand'],
  0.3  // Stricter matching
);
```

### Advanced Fuse.js Options

```typescript
const advancedOptions: Fuse.IFuseOptions<Product> = {
  // Matching threshold (0.0 = exact, 1.0 = anything)
  threshold: 0.4,
  
  // Character distance for fuzzy match
  distance: 100,
  
  // Ignore location in string
  ignoreLocation: true,
  
  // Enable extended search patterns
  useExtendedSearch: true,
  
  // Return relevance scores
  includeScore: true,
  
  // Include matched character indices
  includeMatches: true,
  
  // Minimum characters to match
  minMatchCharLength: 2,
  
  // Find all matches (not just first)
  findAllMatches: false,
  
  // Sort by score
  shouldSort: true,
  
  // Custom scoring function
  getFn: (obj, path) => {
    // Custom field getter
    return obj[path];
  },
};
```

---

## Performance Considerations

### Optimization Tips

1. **Debouncing** (Already implemented)
   ```tsx
   <SearchBar 
     debounceMs={400}  // Wait 400ms before searching
   />
   ```

2. **Minimum Query Length**
   ```typescript
   if (query.length < 2) {
     return allProducts; // Skip search for 1 char
   }
   ```

3. **Pagination**
   ```typescript
   // Search operates on filtered results before pagination
   const filtered = fuzzySearchProducts(products, query);
   const paginated = filtered.slice(offset, offset + limit);
   ```

4. **Memoization**
   ```tsx
   import { useMemo } from 'react';
   
   const searchResults = useMemo(() => {
     return fuzzySearchProducts(products, query);
   }, [products, query]);
   ```

### Performance Metrics

- **Small dataset** (<100 items): <10ms
- **Medium dataset** (100-1000 items): 10-50ms  
- **Large dataset** (1000+ items): 50-200ms

### Bundle Size

- **Fuse.js**: ~15KB gzipped
- **Fuzzy utilities**: ~2KB gzipped
- **Total impact**: ~17KB added to bundle

---

## Backend Integration

### API Endpoint (Real Mode)

When using real API mode, pass the search query to your backend:

```typescript
// Frontend request
const response = await fetch('/api/products?search=cashmre');

// Backend receives: "cashmre"
// Backend should implement fuzzy search server-side
```

### Backend Implementation Examples

#### Node.js with Fuse.js

```javascript
const Fuse = require('fuse.js');

app.get('/api/products', (req, res) => {
  const { search } = req.query;
  let products = getAllProducts();
  
  if (search) {
    const fuse = new Fuse(products, {
      keys: ['name', 'brand', 'description'],
      threshold: 0.4,
    });
    products = fuse.search(search).map(r => r.item);
  }
  
  res.json(products);
});
```

#### PostgreSQL Full-Text Search

```sql
-- Create GIN index for fuzzy search
CREATE INDEX products_search_idx ON products 
USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || description));

-- Query with fuzzy matching
SELECT * FROM products
WHERE to_tsvector('english', name || ' ' || brand || ' ' || description) 
@@ to_tsquery('english', 'cashmere:* | cashmre:*')
LIMIT 20;
```

#### Elasticsearch

```json
{
  "query": {
    "multi_match": {
      "query": "cashmre",
      "fields": ["name^3", "brand^2", "description"],
      "fuzziness": "AUTO",
      "prefix_length": 2
    }
  }
}
```

---

## Advanced Features

### 1. Search Highlighting

Highlight matched characters:

```tsx
import Fuse from 'fuse.js';

function highlightMatches(text: string, indices: [number, number][]) {
  let result = '';
  let lastIndex = 0;
  
  indices.forEach(([start, end]) => {
    result += text.substring(lastIndex, start);
    result += `<mark>${text.substring(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  });
  
  result += text.substring(lastIndex);
  return result;
}

// Usage with Fuse.js
const fuse = new Fuse(products, { 
  includeMatches: true,
  keys: ['name'] 
});
const results = fuse.search('cashmre');

results.forEach(result => {
  const matches = result.matches[0].indices;
  const highlighted = highlightMatches(result.item.name, matches);
  console.log(highlighted); // "Cashes<mark>me</mark>re Blazer"
});
```

### 2. Search Analytics

Track which searches use fuzzy matching:

```typescript
import { smartSearch } from '@/lib/fuzzy-search.utils';

function trackSearch(query: string) {
  const { results, searchType } = smartSearch(products, query);
  
  // Log analytics
  analytics.track('search', {
    query,
    searchType,  // 'exact' or 'fuzzy'
    resultCount: results.length,
    timestamp: new Date(),
  });
  
  return results;
}
```

### 3. Multi-Language Support

Add support for other languages:

```typescript
const multiLangOptions: Fuse.IFuseOptions<Product> = {
  threshold: 0.4,
  keys: [
    'name',
    'name_fr',  // French name
    'name_es',  // Spanish name
    'name_de',  // German name
  ],
};
```

### 4. Custom Scoring

Implement custom relevance scoring:

```typescript
function customScore(results: Fuse.FuseResult<Product>[]) {
  return results.map(result => ({
    ...result,
    customScore: calculateCustomScore(result),
  })).sort((a, b) => b.customScore - a.customScore);
}

function calculateCustomScore(result: Fuse.FuseResult<Product>) {
  let score = 1 - (result.score || 0);
  
  // Boost featured products
  if (result.item.isFeatured) score *= 1.5;
  
  // Boost recent products
  const age = Date.now() - new Date(result.item.createdAt).getTime();
  if (age < 30 * 24 * 60 * 60 * 1000) score *= 1.2; // <30 days
  
  // Boost high-priced items (quality indicator)
  if (result.item.price > 300) score *= 1.1;
  
  return score;
}
```

---

## Troubleshooting

### No Results Found

**Problem**: Fuzzy search returns no results

**Solutions**:
1. Check minimum match length (default: 2 chars)
2. Increase threshold (try 0.5 or 0.6)
3. Verify data fields are populated
4. Check console for Fuse.js errors

### Too Many Irrelevant Results

**Problem**: Fuzzy search returns too many unrelated items

**Solutions**:
1. Decrease threshold (try 0.3 or 0.2)
2. Increase minimum match length to 3
3. Adjust field weights (prioritize name/brand)
4. Add minimum score filter

```typescript
const results = fuse.search(query).filter(r => (r.score || 0) < 0.5);
```

### Slow Performance

**Problem**: Search feels sluggish

**Solutions**:
1. Increase debounce delay (try 500ms)
2. Implement result caching
3. Use pagination to limit results
4. Move search to Web Worker for large datasets

```tsx
<SearchBar debounceMs={500} /> {/* Longer debounce */}
```

---

## Best Practices

### ✅ Do's

- ✅ Use debouncing (300-500ms)
- ✅ Set minimum query length (2-3 chars)
- ✅ Weight important fields higher
- ✅ Show loading states during search
- ✅ Provide clear button for easy reset
- ✅ Test with real typos from users
- ✅ Log search analytics

### ❌ Don'ts

- ❌ Don't use fuzzy search for <10 items (overkill)
- ❌ Don't set threshold too high (>0.7)
- ❌ Don't search on every keystroke (use debounce)
- ❌ Don't forget to handle empty results
- ❌ Don't ignore mobile touch targets (44px min)

---

## Summary

The Lookbook's fuzzy search implementation provides:

1. **Typo Tolerance**: Handles common spelling mistakes automatically
2. **Smart Fallback**: Uses exact search when possible, fuzzy when needed
3. **Weighted Search**: Prioritizes important fields (name > brand > description)
4. **Visual Feedback**: Shows hint when fuzzy search is active
5. **Fast Performance**: Optimized with debouncing and smart algorithms
6. **Easy Integration**: Works seamlessly with existing hooks and components
7. **Customizable**: Adjust threshold, weights, and behavior to your needs

**Result**: Better user experience with more forgiving, intelligent search! 🎯✨
