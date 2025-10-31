# Fuzzy Search Examples

Quick reference for testing typo-tolerant search functionality.

---

## 🎯 Product Search Examples

### Common Typos

Try these search queries to test fuzzy matching:

| You Type | System Finds | Notes |
|----------|--------------|-------|
| `cashmre` | Cashmere products | Missing 'e' |
| `everlne` | Everlane brand | Transposed letters |
| `blazr` | Blazer products | Missing 'e' |
| `lether` | Leather items | Transposed 'e' and 't' |
| `maxmara` | Max Mara brand | Missing space |
| `trnch coat` | Trench coat | Missing 'e' |
| `maxi dres` | Maxi dress | Missing 's' |
| `cashmeer` | Cashmere | Extra 'e' |
| `blazzor` | Blazer | Wrong consonants |
| `reformation` | Reformation | Exact (still works!) |

### Brand Searches

Test brand name fuzzy matching:

```
"evrlane"     → Everlane
"zimmerman"   → Zimmermann  
"reformtion"  → Reformation
"aritzia"     → Aritzia (exact)
"maxmarra"    → Max Mara
"allsaints"   → AllSaints
```

### Category Searches

Search by category with typos:

```
"outwear"     → outerwear
"accesories"  → accessories
"botoms"      → bottoms
"dreses"      → dresses
```

### Tag Searches

Find products by tags (even with typos):

```
"minimlist"   → minimal
"cashmre"     → cashmere
"summr"       → summer
"elegnt"      → elegant
"oversizd"    → oversized
```

---

## 🎨 Moodboard Search Examples

### Moodboard Titles

Test moodboard fuzzy search:

```
"minimlist"           → "Minimal Essentials"
"parisian chic"       → "Parisian Chic" (exact)
"bohemian"            → Bohemian moodboards
"coastal grandmothr"  → "Coastal Grandmother"
"dark acedemia"       → "Dark Academia"
```

### Style Tags

Search moodboards by style:

```
"minimlist"   → Minimal moodboards
"parisian"    → Parisian style
"boho"        → Bohemian
"vintge"      → Vintage
```

---

## 💡 How It Works

### Exact vs Fuzzy

The system uses **smart search** that automatically falls back to fuzzy:

```typescript
// 1. Try exact search first (faster)
const exactResults = searchExact("cashmere");
// Returns: 8 products

// 2. If <3 results, use fuzzy search
const exactResults = searchExact("cashmre");  // Only 0 results
const fuzzyResults = searchFuzzy("cashmre");   // Returns: 8 products
```

### Field Weighting

Not all fields are equal - some matter more:

| Field | Weight | Example |
|-------|--------|---------|
| Name | 3.0x | "Cashmere Blazer" |
| Brand | 2.0x | "Everlane" |
| Category | 1.5x | "outerwear" |
| Tags | 1.5x | ["minimal", "elegant"] |
| Description | 1.0x | "Effortlessly chic..." |

This means searching for "everlne" (brand typo) will rank Everlane products higher than products that just mention "everlane" in the description.

### Visual Feedback

The SearchBar shows a hint when fuzzy search is active:

```
┌────────────────────────────────────────┐
│  🔍 cashmre                         ✕  │
└────────────────────────────────────────┘
  ✨ Using smart search to find similar matches
```

---

## 🧪 Testing Tips

### 1. Test Real Typos

Use typos you'd actually make:
- Transposed letters: "lether" → "leather"
- Missing letters: "blazr" → "blazer"
- Extra letters: "cashmeer" → "cashmere"
- Wrong vowels: "cashmire" → "cashmere"

### 2. Test Combinations

Combine filters with fuzzy search:
```
Search: "cashmre"
Category: outerwear
Sort: price-low
```

### 3. Test Edge Cases

```
Single char:    "c"        → Returns all (too short)
Two chars:      "ca"       → Returns cashmere, camel, etc.
Exact match:    "cashmere" → Uses exact search (faster)
Total garbage:  "xyz123"   → Returns empty (no matches)
```

### 4. Performance Testing

Search with varying result counts:
- Many results (>20): "dress"
- Few results (3-10): "leather trench"
- Single result: "Cashmere Oversized Blazer"
- No results: "nonexistent product xyz"

---

## 📊 Similarity Scores

Behind the scenes, Fuse.js calculates similarity:

```typescript
import { calculateSimilarity } from '@/lib/fuzzy-search.utils';

calculateSimilarity('cashmere', 'cashmere');  // 100% (exact)
calculateSimilarity('cashmere', 'cashmre');   // ~88%  (missing 'e')
calculateSimilarity('cashmere', 'cashmeer');  // ~88%  (extra 'e')
calculateSimilarity('blazer', 'blazr');       // ~83%  (missing 'e')
calculateSimilarity('leather', 'lether');     // ~85%  (transposed)
calculateSimilarity('everlane', 'everlne');   // ~87%  (missing 'a')
```

Threshold is set at **0.4** (60% similarity required).

---

## 🎯 Code Examples

### Basic Usage

```tsx
import { fuzzySearchProducts } from '@/lib/fuzzy-search.utils';

const products = [...]; // Your products
const results = fuzzySearchProducts(products, 'cashmre');
// Returns products sorted by relevance
```

### With Hooks

```tsx
import { useProducts } from '@/hooks/use-products';

function SearchDemo() {
  const [query, setQuery] = useState('');
  const { products } = useProducts({ search: query });
  
  // Fuzzy search happens automatically!
  return <SearchBar value={query} onChange={setQuery} />;
}
```

### Manual Smart Search

```tsx
import { smartSearch } from '@/lib/fuzzy-search.utils';

const products = [...];
const { results, searchType } = smartSearch(products, 'cashmre', 3);

console.log(searchType); // 'fuzzy' (because exact had <3 results)
console.log(results.length); // 8 cashmere products
```

### Get Suggestions

```tsx
import { getSearchSuggestions } from '@/lib/fuzzy-search.utils';

const products = [...];
const suggestions = getSearchSuggestions(products, 'cashmre', 5);

console.log(suggestions);
// ["cashmere", "cash", "cashmere blazer", ...]
```

---

## 🚀 Advanced Testing

### Multi-Word Queries

```
"cashmere blazer"     → Exact match products
"cashmre blazr"       → Fuzzy finds same products
"oversized lether"    → Finds "oversized leather"
"max mara coat"       → Finds Max Mara coats
```

### Partial Matches

```
"cash"        → Finds "cashmere"
"blaz"        → Finds "blazer"
"leath"       → Finds "leather"
"reform"      → Finds "Reformation"
```

### Case Insensitive

```
"CASHMERE"    → cashmere products
"CaShMeRe"    → cashmere products
"cashmere"    → cashmere products
```

---

## 📖 See Also

- **Full Guide**: `/docs/FUZZY_SEARCH_GUIDE.md`
- **Search Guide**: `/docs/SEARCH_GUIDE.md`
- **API Reference**: `/src/lib/fuzzy-search.utils.ts`
- **Fuse.js Docs**: https://fusejs.io/

---

**Pro Tip**: The fuzzy search works best with 3+ character queries. For shorter queries, it falls back to exact search for better performance! 🎯
