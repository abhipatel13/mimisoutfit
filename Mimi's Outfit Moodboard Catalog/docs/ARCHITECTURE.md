# Architecture Overview

Visual guide to understanding the API layer architecture.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  Pages (UI Layer)                   │    │
│  │  HomePage | ProductsPage | MoodboardsPage | etc.   │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         │ uses                               │
│                         ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Custom React Hooks                     │    │
│  │   useProducts | useMoodboards | useProduct | etc.  │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         │ calls                              │
│                         ▼                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │               API Services Layer                    │    │
│  │       productsApi | moodboardsApi                   │    │
│  │                                                      │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │   Mode Switcher (apiConfig.mode)           │   │    │
│  │  │                                              │   │    │
│  │  │  ┌──────────────┐    ┌──────────────┐     │   │    │
│  │  │  │  Mock Mode   │    │  Real Mode   │     │   │    │
│  │  │  │              │    │              │     │   │    │
│  │  │  │ Local Data   │    │ HTTP Client  │     │   │    │
│  │  │  │ + Delay      │    │ + Auth       │     │   │    │
│  │  │  └──────┬───────┘    └──────┬───────┘     │   │    │
│  │  │         │                    │              │   │    │
│  │  └─────────┼────────────────────┼──────────────┘   │    │
│  └────────────┼────────────────────┼──────────────────┘    │
│               │                    │                        │
└───────────────┼────────────────────┼────────────────────────┘
                │                    │
                ▼                    ▼
         ┌──────────────┐    ┌──────────────┐
         │  Mock Data   │    │  Backend API │
         │  (52 items)  │    │  (Your API)  │
         └──────────────┘    └──────────────┘
```

## 🔄 Data Flow

### Mock Mode Flow

```
User Action
    │
    ▼
Page Component
    │
    ▼
useProducts() Hook
    │
    ▼
productsApi.getAllProducts()
    │
    ▼
mockApi.getAllProducts() ──┐
    │                       │
    │ 300ms delay          │
    │                       │
    ▼                       │
mock-data.ts (local)        │
    │                       │
    ▼                       │
Return Product[]            │
    │                       │
    ▼                       │
Update Hook State           │
    │                       │
    ▼                       │
Re-render Component         │
    │                       │
    ▼                       │
Display Products ◄──────────┘
```

### Real Mode Flow

```
User Action
    │
    ▼
Page Component
    │
    ▼
useProducts() Hook
    │
    ▼
productsApi.getAllProducts()
    │
    ▼
realApi.getAllProducts()
    │
    ▼
apiClient.get('/products')
    │
    ├─ Add API Key Header
    ├─ Add Query Params
    └─ Build URL
    │
    ▼
fetch() ──────────────────────┐
    │                          │
    │ Network Request          │
    │                          │
    ▼                          │
Backend API                    │
    │                          │
    ▼                          │
Database Query                 │
    │                          │
    ▼                          │
Return JSON Response           │
    │                          │
    ▼                          │
Parse Response                 │
    │                          │
    ▼                          │
Validate Types                 │
    │                          │
    ▼                          │
Error Handling                 │
    │                          │
    ▼                          │
Return Product[]               │
    │                          │
    ▼                          │
Update Hook State              │
    │                          │
    ▼                          │
Re-render Component            │
    │                          │
    ▼                          │
Display Products ◄─────────────┘
```

## 📂 File Organization

```
src/
├── config/
│   └── api.config.ts           # 🔧 Central configuration
│       ├── API mode (mock/real)
│       ├── Base URL
│       ├── API key
│       └── Debug flag
│
├── services/api/
│   ├── base.api.ts             # 🌐 HTTP Client
│   │   ├── GET/POST/PUT/DELETE methods
│   │   ├── Error handling
│   │   ├── URL building
│   │   └── Header management
│   │
│   ├── products.api.ts         # 📦 Products API
│   │   ├── mockApi {}
│   │   │   ├── getAllProducts()
│   │   │   ├── getProductBySlug()
│   │   │   ├── searchProducts()
│   │   │   └── ... (uses mock-data.ts)
│   │   │
│   │   ├── realApi {}
│   │   │   ├── getAllProducts()
│   │   │   ├── getProductBySlug()
│   │   │   ├── searchProducts()
│   │   │   └── ... (uses apiClient)
│   │   │
│   │   └── export: apiConfig.mode === 'mock' ? mockApi : realApi
│   │
│   ├── moodboards.api.ts       # 🎨 Moodboards API
│   │   └── (same structure as products.api.ts)
│   │
│   └── index.ts                # 📤 Unified exports
│
├── hooks/
│   ├── use-products.ts         # 🪝 Products Hooks
│   │   ├── useProducts(filters?)
│   │   ├── useProduct(slug)
│   │   ├── useFeaturedProducts()
│   │   └── useProductSearch(query)
│   │
│   └── use-moodboards.ts       # 🪝 Moodboards Hooks
│       ├── useMoodboards(filters?)
│       ├── useMoodboard(id)
│       ├── useFeaturedMoodboards()
│       └── useMoodboardSearch(query)
│
├── data/
│   └── mock-data.ts            # 💾 Local Mock Data
│       ├── mockProducts[]      (52 items)
│       ├── mockMoodboards[]    (10 items)
│       └── Helper functions
│
└── pages/
    ├── HomePage.tsx            # Uses useFeaturedProducts()
    ├── ProductsPage.tsx        # Uses useProducts(filters)
    ├── ProductDetailPage.tsx   # Uses useProduct(slug)
    └── ... other pages
```

## 🎛️ Configuration Layers

```
Environment Variables (.env)
    │
    ├─ VITE_API_MODE=mock|real
    ├─ VITE_API_BASE_URL
    ├─ VITE_API_KEY
    └─ VITE_API_DEBUG
    │
    ▼
API Config (api.config.ts)
    │
    ├─ Parse env variables
    ├─ Set defaults
    └─ Export apiConfig object
    │
    ▼
API Services (*.api.ts)
    │
    ├─ Check apiConfig.mode
    ├─ Choose mockApi or realApi
    └─ Export unified interface
    │
    ▼
React Hooks (use-*.ts)
    │
    ├─ Call API service
    ├─ Manage loading state
    ├─ Handle errors
    └─ Return data
    │
    ▼
Components
```

## 🔌 API Interface

Both mock and real implementations follow the same interface:

```typescript
interface ProductsApi {
  getAllProducts(filters?: FilterOptions): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByTag(tag: string): Promise<Product[]>;
  getCategories(): Promise<string[]>;
  getBrands(): Promise<string[]>;
  getTags(): Promise<string[]>;
  searchProducts(query: string): Promise<Product[]>;
}
```

This ensures **seamless switching** between mock and real data!

## 🔄 Mode Switching

```typescript
// In api.config.ts
const mode = import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock';

// In products.api.ts
export const productsApi = apiConfig.mode === 'mock' ? mockApi : realApi;

// In your component
const { products } = useProducts(); // Works with both modes!
```

## 🚦 Request Lifecycle

### Mock Mode Request

```
useProducts() called
    ↓
productsApi.getAllProducts()
    ↓
mockApi.getAllProducts()
    ↓
await delay(300ms)      ← Simulate network
    ↓
Filter mockProducts[]   ← Apply filters
    ↓
Sort results           ← Apply sorting
    ↓
Return Product[]       ← Return immediately
    ↓
Update React state
    ↓
Re-render component
```

### Real Mode Request

```
useProducts() called
    ↓
productsApi.getAllProducts()
    ↓
realApi.getAllProducts()
    ↓
apiClient.get('/products')
    ↓
Build URL with params
    ↓
Add headers (API key)
    ↓
fetch() network request  ← Real HTTP call
    ↓
Wait for response       ← Network time
    ↓
Parse JSON
    ↓
Validate response
    ↓
Handle errors
    ↓
Return Product[]
    ↓
Update React state
    ↓
Re-render component
```

## 🎯 Benefits of This Architecture

### 1. **Separation of Concerns**
- UI components don't know about data source
- API layer handles all data fetching
- Easy to test and maintain

### 2. **Flexibility**
- Switch between mock and real with one env variable
- No code changes needed
- Perfect for development and production

### 3. **Type Safety**
- Full TypeScript support
- Same interface for both modes
- Compile-time error checking

### 4. **Developer Experience**
- React hooks for easy data fetching
- Automatic loading and error states
- Consistent API across all pages

### 5. **Scalability**
- Easy to add new endpoints
- Simple to extend functionality
- Clear structure for growing codebase

## 📊 Performance Considerations

### Mock Mode
- **Pros**: Instant responses (with simulated delay)
- **Cons**: All data loaded in bundle
- **Best for**: Development, demos, testing

### Real Mode
- **Pros**: Only fetch what you need, up-to-date data
- **Cons**: Network latency, requires backend
- **Best for**: Production, real users

## 🔍 Debugging

Enable debug mode to see API calls:

```env
VITE_API_DEBUG=true
```

Console output:
```
[API Config] Running in MOCK mode
[API] GET: /products?category=dresses&sortBy=price-low
```

## 🎓 Learning Path

1. **Start**: Understand the mock data structure (`mock-data.ts`)
2. **Next**: Learn the API interface (`products.api.ts`)
3. **Then**: Use React hooks in components (`use-products.ts`)
4. **Finally**: Configure for real API (`api.config.ts`)

## 📚 Related Documentation

- [API Integration Guide](./API_INTEGRATION.md) - Setup and configuration
- [Usage Examples](./API_USAGE_EXAMPLES.md) - Code examples
- [Migration Checklist](./MIGRATION_CHECKLIST.md) - Moving to production

---

**This architecture gives you the best of both worlds: rapid development with mock data and seamless transition to real APIs!** 🚀
