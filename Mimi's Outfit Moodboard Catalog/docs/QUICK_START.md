# Quick Start Guide

Get up and running with the API layer in 5 minutes!

## 🚀 What You Get

A **complete API layer** that works with both **mock data** (local) and **real API** (backend) - no code changes needed to switch between them!

```
┌─────────────┐         ┌─────────────┐
│  Mock Mode  │   OR    │  Real Mode  │
│  (Default)  │         │ (Production)│
└─────────────┘         └─────────────┘
      │                       │
      └───────────┬───────────┘
                  │
            Your App Works!
```

## ⚡ 3-Step Setup

### 1. Environment Configuration

The project already has `.env` configured for mock mode:

```env
VITE_API_MODE=mock  # ← Already set for you!
```

**That's it! You're ready to develop.** 🎉

### 2. Using the API in Your Components

Import and use the hooks:

```tsx
import { useProducts } from '@/hooks/use-products';

function MyComponent() {
  const { products, loading, error } = useProducts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  
  return <div>{products.map(p => ...)}</div>;
}
```

### 3. Run Your App

```bash
npm run dev
```

**Done!** Your app is fetching data using the API layer (currently from mock data).

## 📖 Documentation At a Glance

| Document | What It Covers | When to Read |
|----------|----------------|--------------|
| [API_INTEGRATION.md](./API_INTEGRATION.md) | Full setup, configuration, all features | Before connecting to real API |
| [API_USAGE_EXAMPLES.md](./API_USAGE_EXAMPLES.md) | Code examples, patterns, best practices | When building features |
| [SEARCH_GUIDE.md](./SEARCH_GUIDE.md) | Search implementation with pagination | Implementing search features |
| [PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md) | Pagination setup and customization | Handling large datasets |
| [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) | Step-by-step migration to real API | When backend is ready |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, diagrams | For understanding internals |

## 🎯 Common Tasks

### Task: Fetch All Products

```tsx
import { useProducts } from '@/hooks/use-products';

const { products, loading, error } = useProducts();
```

### Task: Filter Products

```tsx
const { products } = useProducts({
  category: 'dresses',
  minPrice: 100,
  maxPrice: 500,
  sortBy: 'price-low'
});
```

### Task: Get Single Product

```tsx
import { useProduct } from '@/hooks/use-products';

const { product } = useProduct('product-slug', 'slug');
```

### Task: Search Products

```tsx
import { useProductSearch } from '@/hooks/use-products';
const [query, setQuery] = useState('');

const { products } = useProductSearch(query); // Auto-debounced!
```

### Task: Get Moodboards

```tsx
import { useMoodboards } from '@/hooks/use-moodboards';

const { moodboards } = useMoodboards();
```

## 🔄 When You're Ready for Real API

1. **Update `.env`:**
   ```env
   VITE_API_MODE=real
   VITE_API_BASE_URL=https://api.yourdomain.com
   VITE_API_KEY=your_api_key
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **That's it!** No code changes needed. 🎊

## 🧪 Testing Both Modes

Switch between modes anytime:

```env
# Development with mock data
VITE_API_MODE=mock

# Testing with real API
VITE_API_MODE=real
```

Restart your dev server after changing.

## 💡 Pro Tips

1. **Mock mode is fast** - Perfect for development
2. **All hooks return same structure** - Loading, error, data
3. **TypeScript helps** - Full type safety included
4. **Debug mode available** - Set `VITE_API_DEBUG=true`
5. **Mock data is realistic** - 52 products, 10 moodboards

## 🎓 Learning Path

**Beginner?** Start here:
1. ✅ Read this file (you're here!)
2. Try using `useProducts()` in a component
3. Look at `API_USAGE_EXAMPLES.md` for more patterns

**Intermediate?** Check out:
1. Direct API calls with `productsApi`
2. Custom filtering and sorting
3. Error handling patterns

**Advanced?** Deep dive into:
1. `ARCHITECTURE.md` for system design
2. `base.api.ts` for HTTP client internals
3. Creating custom API methods

## 🆘 Need Help?

### Issue: "Cannot find module '@/hooks/use-products'"

**Solution:** The `@` alias points to `src/`. Make sure TypeScript paths are configured (they are by default).

### Issue: "Products not loading"

**Check:**
1. Is `VITE_API_MODE=mock` in your `.env`?
2. Did you restart the dev server after changing `.env`?
3. Check console for errors

### Issue: "Want to see API calls in console"

**Solution:**
```env
VITE_API_DEBUG=true
```

## 📦 What's Included

- ✅ **52 products** across all categories
- ✅ **10 moodboards** with styling tips
- ✅ **Filtering** by category, brand, price, tags
- ✅ **Sorting** by newest, price, name
- ✅ **Search** with debouncing (multi-field search)
- ✅ **Pagination** support (12/24/36/48 per page)
- ✅ **Error handling** built-in
- ✅ **Loading states** automatic
- ✅ **TypeScript** full support

## 🚢 Ready to Deploy?

Mock mode works great for production demos! When you're ready for real data:

1. Follow [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
2. Set production environment variables
3. Deploy as usual

## 🎉 You're All Set!

The API layer is already working. Just use the hooks in your components and you're good to go!

**Questions?** Check the full docs:
- 📖 [Complete API Guide](./API_INTEGRATION.md)
- 💡 [Code Examples](./API_USAGE_EXAMPLES.md)
- 🏗️ [Architecture](./ARCHITECTURE.md)

---

**Happy coding!** 🚀
