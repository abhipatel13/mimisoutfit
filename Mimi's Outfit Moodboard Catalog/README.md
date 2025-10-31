# The Lookbook by Mimi

A sophisticated fashion discovery platform featuring curated moodboards and shoppable outfits with elegant, editorial design.

> **⚠️ Admin-Only Build**: This is an admin-focused build with simplified security measures (localStorage tokens, basic URL validation). Token handling is designed for internal/admin use only. For production public-facing apps, implement HttpOnly cookies and server-side sessions. See [SECURITY.md](SECURITY.md) for details.

## ✨ Features

- 📦 **52 Premium Products** across all fashion categories
- 🎨 **10 Curated Moodboards** with styling guidance
- 🔍 **Smart Search** with debouncing and multi-field matching ⭐ NEW
- 📄 **Pagination** with flexible page sizes (12/24/36/48 per page)
- 🔗 **Affiliate Integration** with tracking and UTM parameters
- ❤️ **Favorites System** with persistent local storage
- 📱 **Mobile-First Design** with touch-optimized interactions
- 🔐 **Security** with domain whitelist for affiliate links
- ♿ **Accessibility** with keyboard navigation and WCAG 2.1 AA compliance
- 🚀 **Performance** with route-based code splitting and lazy loading
- 🎯 **SEO Optimized** with dynamic meta tags and sitemap

## 🔌 API Integration

The application includes a **flexible API layer** that supports both mock and real data:

- **Mock Mode** (Default): Uses local data, perfect for development
- **Real Mode**: Connects to your backend API
- **Easy Toggle**: Switch modes via environment variable
- **Type-Safe**: Full TypeScript support with error handling

### ⚡ Quick Start

The API layer is **already configured** and ready to use! 

```tsx
import { useProducts } from '@/hooks/use-products';

function MyComponent() {
  const { products, loading, error } = useProducts();
  // That's it! Currently using mock data.
}
```

**Want to switch to real API?** Just update `.env`:

```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key
```

No code changes needed!

### 📚 Documentation

- ⚡ **[Quick Start](docs/QUICK_START.md)** - Get started in 5 minutes
- 📖 **[API Integration Guide](docs/API_INTEGRATION.md)** - Complete setup and configuration
- 🔍 **[Search Guide](docs/SEARCH_GUIDE.md)** - Search implementation ⭐ NEW
- 📄 **[Pagination Guide](docs/PAGINATION_GUIDE.md)** - Pagination setup and customization
- 💡 **[Usage Examples](docs/API_USAGE_EXAMPLES.md)** - Code examples and patterns  
- ✅ **[Migration Checklist](docs/MIGRATION_CHECKLIST.md)** - Step-by-step migration guide
- 🏗️ **[Architecture](docs/ARCHITECTURE.md)** - System design and data flow
- 📊 **[Features Summary](docs/FEATURES_SUMMARY.md)** - Complete feature overview

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run security audit
npm run audit
```

## 📁 Project Structure

```
src/
├── config/              # App configuration (API settings)
├── services/api/        # API layer (mock + real implementations)
├── hooks/               # React hooks (useProducts, useMoodboards)
├── components/          # Reusable UI components
├── pages/               # Route pages
├── data/                # Mock data
├── store/               # Zustand state management
└── types/               # TypeScript definitions

docs/
├── API_INTEGRATION.md   # API setup guide
├── API_USAGE_EXAMPLES.md # Code examples
└── MIGRATION_CHECKLIST.md # Migration guide
```

## 🎨 Design System

- **Fonts**: Playfair Display (headings), Inter (body)
- **Colors**: Warm earth tones with espresso brown and beige-gold accents
- **Style**: Sophisticated minimalism with editorial elegance
- **Responsive**: Mobile-first with breakpoints at sm, md, lg, xl

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State**: Zustand with persist
- **Icons**: Lucide React
- **SEO**: react-helmet-async

## 📦 API Usage Examples

### Using React Hooks (Recommended)

```tsx
import { useProducts } from '@/hooks/use-products';

function ProductGallery() {
  const { products, loading, error } = useProducts({
    category: 'dresses',
    sortBy: 'price-low'
  });

  if (loading) return <Loading />;
  if (error) return <Error />;

  return <ProductGrid products={products} />;
}
```

### With Search and Pagination ⭐ NEW

```tsx
import { usePaginatedProducts } from '@/hooks/use-products';
import SearchBar from '@/components/SearchBar';

function ProductsPage() {
  const [filters, setFilters] = useState({ sortBy: 'newest' });
  const { products, pagination, loading, updateFilters } = usePaginatedProducts(filters);
  
  const handleSearch = (search: string) => {
    const updated = { ...filters, search: search || undefined };
    setFilters(updated);
    updateFilters(updated);
  };
  
  return (
    <>
      <SearchBar 
        value={filters.search || ''} 
        onChange={handleSearch}
        debounceMs={400}  // Automatic debouncing!
      />
      <ProductGrid products={products} loading={loading} />
      <Pagination pagination={pagination} />
    </>
  );
}
```

### Direct API Calls

```tsx
import { productsApi } from '@/services/api';

const products = await productsApi.getAllProducts();
const product = await productsApi.getProductBySlug('cashmere-blazer');
const results = await productsApi.searchProducts('leather');
```

## 🔒 Security Features

- **Content Security Policy** headers for XSS protection
- **Referrer Policy** and **Permissions Policy** headers
- **10-second request timeouts** on all API calls
- Secure API key management via environment variables
- Simple URL validation for affiliate redirects
- No sensitive data in client-side code
- Production builds with **sourcemaps disabled**
- `rel="noopener noreferrer"` on all external links

> 📖 See [SECURITY.md](SECURITY.md) for complete security documentation

## ♿ Accessibility

- Full keyboard navigation support
- 44px minimum touch targets
- WCAG 2.1 AA compliant color contrast
- Semantic HTML structure
- Screen reader friendly
- Focus-visible states on all interactive elements

## 📈 Performance

- Route-based code splitting (~60% bundle reduction)
- Lazy image loading
- Optimized Tailwind CSS
- Efficient state management
- Skeleton loading states

## 🚢 Deployment

The project includes deployment configurations for:

- **Vercel**: `vercel.json`
- **Netlify**: `netlify.toml` and `_redirects`

Both support SPA routing and environment variables.

### Environment Variables for Production

```env
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_production_api_key
VITE_API_DEBUG=false
```

## 📄 License

This is a portfolio/demo project. All rights reserved.

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## 📞 Support

- 📖 Check the [API Integration Guide](docs/API_INTEGRATION.md)
- 💡 See [Usage Examples](docs/API_USAGE_EXAMPLES.md)
- ✅ Follow the [Migration Checklist](docs/MIGRATION_CHECKLIST.md)

---

**Made with ❤️ using React, TypeScript, and Tailwind CSS**
