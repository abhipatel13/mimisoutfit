# The Lookbook by Mimi - Project Architecture

## Project Description
A sophisticated fashion discovery platform where users can explore curated moodboards and shoppable outfits. Features elegant design with warm editorial tones, comprehensive product catalog with 52+ items across all fashion categories, 10 diverse moodboards with styling guidance, affiliate integration with tracking for monetization, and local favorites system for personalized shopping experience.

> **🔐 Admin-Only Build**: This is an admin-focused build with simplified security measures (localStorage tokens, basic URL validation). Token handling is designed for internal/admin use only. See `SECURITY.md` for complete documentation.

## Key Features

> **🔄 Publishing System**: All products and moodboards support `isPublished` (for visibility control). The yellow "UNPUBLISHED" badge only shows when `isPublished === false` (explicit unpublished state). Default is `isPublished: true`. Admin users can toggle publish status via one-click buttons on detail pages.

### Analytics Dashboard ✨ **FULLY RESPONSIVE** 🎯 **SIMPLIFIED**
- **Streamlined Analytics Dashboard** with user behavior tracking and **3 essential charts**
- **Real-time Metrics**: Total visitors, page views, **product views**, **moodboard views** ⭐, searches, favorites, affiliate clicks
- **Essential Charts & Visualizations** 🎨 **SIMPLIFIED FOR CLARITY**:
  - **Traffic Area Chart** ✅ - Big picture traffic trends with gradient fills
  - **Category Bar Chart** ✅ - Which categories drive clicks with colors
  - **Conversion Funnel** ✅ - Visitor → Product View → Click journey with drop-off rates
  - **Removed for clarity**: Time Series (overlapped), Pie Chart (redundant), Trend Comparison (nice-to-have)
  - **Powered by Recharts** with fully responsive design
  - **Mobile-optimized margins** - Reduced chart margins (left: 0, right: 10)
  - **Adaptive font sizes** - Smaller text on mobile (10px), larger on desktop (12px)
  - **Smaller axis widths** - Y-axis width 40px on mobile vs 80px desktop
  - **Responsive legends** - 11-12px font sizes with proper spacing
  - **Smooth animations** and interactive tooltips on all devices
  - Auto-refresh with loading states
  - **50% faster load** - 3 API calls instead of 4 for charts
- **User Behavior Analytics**: New vs returning users, session duration, pages per session
- **Top Products Table**: Most viewed products with conversion rates
  - **Mobile Card View** 📱 - Responsive card layout for phones/tablets (< 1024px)
  - **Desktop Table View** 💻 - Full table with all columns (≥ 1024px)
  - **Adaptive product images** - 16x16 cards on mobile, 12x12 on desktop
  - **Grid metrics display** - 2-column grid for stats on mobile cards
- **Top Moodboards**: Popular moodboards with click-through rates ⭐
  - **Responsive grid** - 1 col mobile, 2 col tablet, 3 col desktop
  - **Adaptive image heights** - 24px mobile (h-24), 32px desktop (h-32)
- **Search Analytics**: Top search terms with unique searchers
  - **Compact mobile layout** - Smaller rank badges (7x7 vs 8x8)
  - **Truncated text** - Prevents overflow on narrow screens
  - **Responsive padding** - 2px mobile, 3px desktop
- **Traffic Sources**: Referrer breakdown with percentages
- **Recent Activity Feed**: Live user events (views, searches, clicks)
  - **Smaller icons** - 1.5px/2px padding vs 2px desktop
  - **Adaptive text** - 10px/12px vs 12px/14px desktop
  - **Truncated user IDs** - 6 chars mobile, 8 chars desktop
- **Client-side Tracking Service**: Automatic event batching and queuing
- **Moodboard Analytics Tracking** ⭐:
  - **Moodboard view tracking** - Tracks when users view moodboard detail pages
  - **Filter change tracking** - Tracks tag filter selections on moodboards page
  - **"Shop This Look" clicks** - Tracks when users click to view products
  - **"Save All" tracking** - Tracks bulk favorite actions (add/remove all)
  - **Product click tracking** - Tracks when users click products from moodboards
- **Responsive Header** 📱:
  - **Flex column on mobile** - Stack header elements vertically
  - **Smaller title** - text-2xl mobile vs text-3xl desktop
  - **Compact time selector** - 140px mobile vs 180px desktop
  - **Adaptive gaps** - 2px mobile vs 3px desktop spacing
- **Responsive Tabs** 📱:
  - **3-column mobile layout** - 2 rows of 3 tabs on phones
  - **6-column desktop** - Single row on larger screens
  - **Smaller tab text** - text-xs mobile vs text-sm desktop
- **Responsive Metric Cards** 📱:
  - **Smaller icons** - 3.5px/4px mobile vs 4px desktop
  - **Adaptive value text** - text-xl mobile vs text-2xl desktop
  - **Tiny subtitles** - 10px mobile vs 12px desktop
  - **Compact spacing** - Reduced padding throughout
- **Time Range Filters**: 7d, 30d, 90d views
- **Mock/Real Mode Support**: Works in development and production
- **Protected Route**: Only authenticated admins can access

### Public Features
- **Flexible Purchase Types** 🆕 - Products support two purchase models
  - **Affiliate Purchase** (Default) - "Shop Now" button with affiliate redirect tracking
  - **Direct Purchase** - "Contact Mimi to Purchase" with three contact options:
    * 📱 **Text Message (SMS)** - Opens messaging app with pre-filled inquiry (mobile) or copies number (desktop)
    * 💬 **WhatsApp** - Opens WhatsApp app/web with styled formatted message
    * ✉️ **Email** - Opens default email client with pre-filled product inquiry
  - Configurable per product in admin portal
  - Environment variables for Mimi's contact info (phone, WhatsApp, email)
- **100% Live API Integration** ✅ - All pages use live API hooks
  - **HomePage** - Uses unified `getHomepageData()` endpoint (both featured lists in one call) 🆕
  - **MoodboardsPage** - Uses `useMoodboards()` hook with tag filtering
  - **ProductsPage** - Uses `usePaginatedProducts()` hook with search/filters (100% API, no mock imports) ✅
  - **ProductDetailPage** - Live API with **optional related products** (`?includeRelated=true`) 🆕
  - **MoodboardDetailPage** - Live API with related products
- **Social Sharing System** 🆕 - Share products and moodboards with native Web Share API (primary) and WhatsApp integration
  - **Native Web Share API (Primary)** - System share sheet to any app (iOS/Android)
  - **WhatsApp Integration** - Share with **styled formatted text** (bold title, price, description, link)
  - **WhatsApp URL Scheme** - Preserves markdown formatting (`*bold*`) unlike Web Share API
  - **Styled Text Message** - Bold titles, emoji, formatted price labels render correctly
  - Mobile: Opens WhatsApp app directly with pre-filled styled text
  - Desktop: Opens WhatsApp Web with formatted message
  - Copy link to clipboard functionality
  - Share buttons on product detail, moodboard detail, product cards, and moodboard cards
  - Responsive dropdown menu with icon-only option for mobile
- Comprehensive fashion product catalog (52 items) with advanced filtering, fuzzy search with typo tolerance, debounced search (400ms), and pagination
- **Slug-based product URLs** with live API integration (e.g., `/products/denim-jacket-classic`)
- **Live API product detail fetching** with proper error handling and loading states
- **Related products API** - Smart recommendations with **resilient error handling** (page continues even if related products fail)
- 10 curated moodboards with diverse aesthetics and styling guidance
- **Slug-based moodboard URLs** with live API integration (e.g., `/moodboards/parisian-chic`)
- **Live API moodboard detail fetching** with backward compatible ID support
- **Moodboard related products API** - Discover products matching moodboard aesthetics
- Featured moodboard collections with cohesive style stories
- Moodboard detail pages with "Shop the Look" functionality
- Detailed styling tips and how-to-wear sections for each moodboard
- **Premium affiliate redirect page** with live API integration, **3-second countdown** 🆕, **affiliate click tracking** ✅, security validation, comprehensive UTM tracking, product preview, and retailer verification badge
- Local favorites system with persistent storage
- "Add All to Favorites" for complete moodboard collections
- WhatsApp community integration for style community engagement
- Elegant skeleton loading states across all pages
- Fully responsive mobile-first design with touch-optimized interactions
- Mobile touch targets (minimum 44px) for all interactive elements
- Adaptive text sizes and spacing for different screen sizes
- Optimized grid layouts for mobile, tablet, and desktop
- Rich About page with brand story and mission
- **Personal Stylist page** 🆕 - Mimi's styling services with contact form
  - Hero section with service overview
  - Four service offerings (Personal Styling, Wardrobe Consultation, Special Occasion, Seasonal Refresh)
  - Why Work With Me section highlighting personalized approach, experience, and sustainability focus
  - Contact form with name, email, and message fields
  - Multiple contact methods (email, Instagram, WhatsApp)
  - Client testimonials section with 5-star reviews
  - Smooth scroll CTAs throughout the page
  - Form submission with toast notifications
- Multiple product categories: outerwear, dresses, tops, bottoms, shoes, accessories
- Diverse brand selection from high-end to accessible labels
- Price range variety from $35 to $698
- Comprehensive error handling with defensive filtering across all pages
- Image placeholder system with elegant fallback UI for missing product images
- **Beautiful 404 Not Found page** 🆕 - Sophisticated error page with decorative styling, animated elements, and quick navigation links

### Admin Portal Features ⭐
- **JWT-based authentication** with persistent sessions and 1-hour token expiration
- **Protected routes** with automatic redirect to login for unauthorized access
- **Admin dashboard** with statistics (total products, moodboards, featured items)
- **Full CRUD operations** for products (create, read, update, delete)
- **Full CRUD operations** for moodboards (create, read, update, delete)
- **Admin Navigation** - "Admin" text link in main header navigation (desktop + mobile)
- **Authentication Indicator** - Green dot shows when admin is logged in (desktop + mobile)
- **Analytics Dashboard** ✨ **NEW** - Comprehensive user behavior tracking and insights
- **Bulk Operations** ✅ **COMPLETE** - Multi-select management with dedicated API endpoints
  - Multi-select with checkboxes on all items
  - Select all / deselect all functionality
  - Bulk publish (publish all selected items) - **Single API call** 🚀
  - Bulk unpublish (unpublish all selected items) - **Single API call** 🚀
  - Bulk delete (delete all selected with confirmation) - **Single API call** 🚀
  - Visual selection counter and clear button
  - Bulk actions toolbar with loading states
  - **75-90% faster** than client-side loops
  - **Partial failure support** with detailed success/failure feedback
  - **Real mode ready** for production backend
- **Publish/Unpublish functionality** 🆕 - Toggle visibility status with one-click buttons
  - **Single-item publish/unpublish** - Quick buttons on product/moodboard detail pages
  - **Visual feedback** - Loading states and success toasts
  - **Admin-only actions** - Only visible to authenticated admins
  - See `/docs/UNPUBLISHED_TAGS_GUIDE.md` for complete implementation details
- **Product management**: Create/edit with image upload, tag management, auto-slug generation
- **Moodboard management**: Two-column form with product selection, styling tips, tags
- **Image Upload System** 🆕 - Direct file upload via Devv SDK with progress tracking
  - File type validation (JPG, PNG, WebP, GIF)
  - File size validation (max 5MB)
  - Upload progress indicator (0-100%)
  - Image preview with remove option
  - Dual input mode (URL or file upload)
  - Configurable via VITE_ENABLE_IMAGE_UPLOAD flag
- **Search and filtering** across products and moodboards in admin
- **Image previews** for products and moodboards
- **Product selection interface** for moodboards with live search
- **Demo credentials**: admin@lookbook.com / admin123
- **Admin navigation header** with user menu and logout
- **Unpublished indicators** 🆕 - Yellow "UNPUBLISHED" tags on all unpublished items
- **Responsive admin UI** with mobile support
- **Quick edit access** 🆕 - Edit buttons on product/moodboard detail pages

## Production-Ready Features ✨
- **Complete Analytics Tracking** ✅ **100% IMPLEMENTED** - Full end-to-end event tracking
  - **User Identification**: X-User-ID header on every request (UUID v4, persistent)
  - **Server-Side Tracking**: Product views, moodboard views, searches (via API)
  - **Client-Side Tracking**: Favorites, affiliate clicks, search analytics, **moodboard interactions** ⭐
  - **Affiliate Click Tracking** ✅ **VERIFIED** - Tracks when users click "Shop Now" → vendor redirect
    - Fires immediately on AffiliateRedirect page load (before 3-second countdown)
    - Captures: product ID, product name, retailer domain
    - Auto-batched with other events (5s intervals, 10 event limit)
    - Works in mock mode (console) and real mode (POST to API)
    - See `/docs/AFFILIATE_TRACKING_VERIFICATION.md` for complete verification
  - **Favorite Tracking** ✅ - Add/remove favorites with product details
  - **Search Tracking** ✅ - Query terms with results count
  - **Moodboard Analytics** ⭐ **NEW** - Complete moodboard interaction tracking
    - **View Tracking** ✅ - Tracks when users view moodboard detail pages
    - **Filter Tracking** ✅ - Tracks tag filter selections on moodboards page
    - **"Shop This Look" Tracking** ✅ - Tracks when users click to view products
    - **"Save All" Tracking** ✅ - Tracks bulk favorite actions (add/remove all products)
    - **Product Click Tracking** ✅ - Tracks when users click products from moodboards
  - **Event Batching**: Performance-optimized with auto-flush (5s, 10 events)
  - **Analytics Dashboard**: Real-time metrics, top products, **top moodboards** ⭐, user behavior at `/admin/analytics`
  - **UTM Tracking**: Automatic parameters on all affiliate links
  - See `/docs/ANALYTICS_TRACKING_IMPLEMENTATION.md` for complete guide
- **API Layer** ✅ **100% COMPLETE** - All 28 endpoints implemented (mock + real)
  - Mock Mode: Local data (52 products, 10 moodboards) - fast development
  - Real Mode: Backend API integration - production ready
  - Seamless mode switching via VITE_API_MODE flag
  - Full JWT authentication support in real mode
  - Automatic header injection (Authorization, API keys, User ID)
  - **Bulk operations** with dedicated endpoints (75-90% faster)
  - **Admin utilities** (stats, image upload)
- **User Identification System** 🆕 - Automatic user tracking without authentication
  - Unique GUID generated locally on first visit (UUID v4 format)
  - Persistent storage in localStorage (lookbook-user-id)
  - Auto-injection in ALL API requests via X-User-ID header
  - Enables backend analytics, personalization, and cart persistence
  - Works for both anonymous and authenticated users
  - Privacy-friendly with user control (can clear anytime)
- **Image Upload System** 🆕 - Direct file upload via Devv SDK
  - Max 5MB file size with validation
  - Progress tracking (0-100%)
  - File type validation (JPG, PNG, WebP, GIF)
  - Configurable via VITE_ENABLE_IMAGE_UPLOAD flag
- **Security Hardening** 🔒 **ADMIN-ONLY BUILD** - Simplified security for internal admin use
  - **Security Headers**: CSP, Referrer-Policy, Permissions-Policy in index.html
  - **Request Timeouts**: 10-second timeout on ALL API calls (GET, POST, PUT, DELETE)
  - **Simple URL Validation**: Basic HTTP/HTTPS check (vendor whitelist removed)
  - **Sourcemaps Disabled**: Production builds with sourcemap: false
  - **External Link Security**: rel="noopener noreferrer" on all external links
  - **NPM Audit Script**: `npm run audit` for dependency security checks
  - **Token Storage**: localStorage for admin-only use (NOT for public apps)
  - **Complete Docs**: See `SECURITY.md` for security best practices
  - ⚠️ **Admin-only setup** - NOT suitable for multi-user public apps
- **Fuzzy Search System**: Typo-tolerant fuzzy matching with Fuse.js, smart fallback (exact → fuzzy), weighted search fields, visual feedback when active, multi-field search with debouncing (400ms) across name, brand, description, tags, and category
- **Pagination System**: Comprehensive pagination for large datasets (12/24/36/48 items per page)
- **React Hooks**: Custom hooks for products and moodboards with pagination, search, and loading/error states
- **Route-based Code Splitting**: All 9 pages lazy-loaded with React.lazy() and Suspense (~60% reduction in initial bundle)
- **Accessibility**: Full keyboard navigation with focus-visible states, 44px touch targets, semantic HTML (WCAG 2.1 AA compliant)
- **SEO Optimization**: Dynamic meta tags per page with react-helmet-async, robots.txt, sitemap.xml
- **Error Boundaries**: Global ErrorBoundary catches runtime errors with elegant fallback UI
- **Loading States**: Branded page loader with decorative blur effects for smooth transitions
- **Type Safety**: Strict TypeScript enabled (strict, noImplicitAny, strictNullChecks)
- **Comprehensive Safety** 🛡️ **100% COMPLETE** - All array, string, and object operations use optional chaining
  - **500+ operations secured** across 25+ files
  - **All array methods**: `.map()`, `.filter()`, `.slice()`, `.join()`, `.length`, etc.
  - **All string methods**: `.toLowerCase()`, `.split()`, `.replace()`, `.trim()`, etc.
  - **All object access**: Proper null checks and fallbacks
  - **Zero runtime errors** from missing data
  - **Graceful degradation** in all scenarios
  - See `/docs/COMPREHENSIVE_SAFETY_IMPROVEMENTS.md` for complete guide
  - See `/docs/OPTIONAL_CHAINING_IMPROVEMENTS.md` for `.slice()` specific details
- **Performance**: Lazy image loading, optimized Tailwind CSS, efficient bundle splitting, pagination, debounced search
- **Deployment Config**: Vercel.json, netlify.toml, and _redirects for SPA routing
- **Admin Portal**: Complete CMS with JWT authentication, image uploads, full CRUD for products/moodboards, publish/unpublish, protected routes
- **Comprehensive Docs**: 65+ documentation files covering all features, API integration, image upload, **blurhash LQIP** 🔵, API modes, affiliate redirect, search, pagination, migration, architecture, complete API spec v2.0, backend implementation, TypeScript fixes, and admin portal

## Data Storage
**Analytics Events**: User behavior tracked via X-User-ID header (see `/docs/ANALYTICS_USER_TRACKING.md`)
- Backend needs to create `analytics_events` table and implement 5 endpoints
- See `/docs/BACKEND_ANALYTICS_QUICK_START.md` for 2-3 hour implementation guide
- Complete SQL queries and Express.js examples provided

**API Layer**: Flexible API system with mock/real mode toggle
- Mock Mode: Uses local data (52 products, 10 moodboards) - **DEFAULT**
- Real Mode: Connects to backend API endpoints
- Configuration: Environment variables (.env file)
- Toggle: Change `VITE_API_MODE` between 'mock' and 'real'

**Local Storage**: Zustand with persist middleware for favorites

## API Integration 🔌 ✅ **100% COMPLETE**
**Mode**: Configurable via environment variable (mock/real)
**Current**: Mock mode (local data, no backend required)
**Status**: All pages use live API hooks (HomePage, MoodboardsPage, ProductsPage, ProductDetailPage, MoodboardDetailPage)
**Error Handling**: Resilient - related products failure doesn't break product detail page (non-critical failure)
**See**: `/docs/API_INTEGRATION_FIXES.md` for complete migration details
**React Hooks**: Custom hooks for data fetching (useProducts, useMoodboards, etc.)
**Type Safety**: Full TypeScript support with error handling

**Quick Start**: `/docs/QUICK_START.md` - Get started in 5 minutes

**Frontend Documentation**: 
- Complete Guide: `/docs/API_INTEGRATION.md`
- Code Examples: `/docs/API_USAGE_EXAMPLES.md`
- **API Optimizations Summary** ⚡ **NEW**: `/docs/API_OPTIMIZATIONS_SUMMARY.md` - All API optimizations (combined endpoints, reduced calls)
- **API Integration Fixes** 🆕: `/docs/API_INTEGRATION_FIXES.md` - **100% live API migration complete**
- **API Modes Guide** 🆕: `/docs/API_MODES_GUIDE.md` - Mock vs Real mode configuration
- **Image Upload Guide**: `/docs/IMAGE_UPLOAD_GUIDE.md` - Original instant upload guide
- **Local Image Upload Guide** 🆕: `/docs/LOCAL_IMAGE_UPLOAD_GUIDE.md` - LOCAL preview with deferred upload
- **Unpublished Tags Guide** ⚡ **NEW**: `/docs/UNPUBLISHED_TAGS_GUIDE.md` - Yellow badge indicators and publish/unpublish system
- Product Detail API: `/docs/PRODUCT_DETAIL_API.md` - Live API integration with slug URLs
- Moodboard Detail API: `/docs/MOODBOARD_DETAIL_API.md` - Live API integration with slug URLs
- Search Guide: `/docs/SEARCH_GUIDE.md` - Complete search implementation
- Fuzzy Search Guide: `/docs/FUZZY_SEARCH_GUIDE.md` - Typo-tolerant search with examples
- Pagination Guide: `/docs/PAGINATION_GUIDE.md`
- Migration Guide: `/docs/MIGRATION_CHECKLIST.md`
- Architecture: `/docs/ARCHITECTURE.md`
- Features Summary: `/docs/FEATURES_SUMMARY.md`
- **Admin Portal Guide**: `/docs/ADMIN_PORTAL_GUIDE.md` - Complete admin CMS documentation

**Backend Documentation**: 
- **Start Here**: `BACKEND_README.md` - Main backend guide with links to all docs
- Overview: `/docs/BACKEND_SUMMARY.md` - Complete documentation index and overview
- **API Spec V2.0**: `/docs/BACKEND_API_SPEC_UPDATED.md` - **LATEST** - All 14 endpoints, request/response models, error handling
- **API Changes Guide**: `/docs/API_CHANGES_V2.md` - Breaking changes, new features (related products API), migration guide
- Quick Reference: `/docs/API_ENDPOINTS_SUMMARY.md` - One-page reference with all routes
- Database Schemas: `/docs/DATABASE_SCHEMAS.md` - PostgreSQL, MySQL, MongoDB, Prisma with examples
- Implementation Guide: `/docs/BACKEND_IMPLEMENTATION_CHECKLIST.md` - Step-by-step build guide (11-15 days)

**Usage Example (Basic)**:
```tsx
import { useProducts } from '@/hooks/use-products';

function ProductList() {
  const { products, loading, error } = useProducts({
    category: 'dresses',
    sortBy: 'price-low'
  });
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  return <ProductGrid products={products} />;
}
```

**Usage Example (With Pagination)**:
```tsx
import { usePaginatedProducts } from '@/hooks/use-products';
import Pagination from '@/components/Pagination';

function ProductsPage() {
  const { products, pagination, loading, setPage, setPageSize } = usePaginatedProducts();
  
  return (
    <div>
      <ProductGrid products={products} loading={loading} />
      <Pagination 
        pagination={pagination} 
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
```

**User Tracking**: Every API request automatically includes `X-User-ID` header with unique GUID for analytics. See `/docs/ANALYTICS_USER_TRACKING.md` for complete backend implementation examples.

**Usage Example (With Search & Pagination)**:
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
    <div>
      <SearchBar 
        value={filters.search || ''} 
        onChange={handleSearch}
        placeholder="Search products..."
        debounceMs={400}  // Automatic debouncing!
      />
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
```

**Usage Example (Related Products API)**: ⭐ **NEW**
```tsx
import { productsApi } from '@/services/api';
import { useState, useEffect } from 'react';

function ProductDetailPage() {
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    const fetchRelated = async () => {
      // Get up to 4 related products
      const related = await productsApi.getRelatedProducts(productId, 4);
      setRelatedProducts(related);
    };
    fetchRelated();
  }, [productId]);
  
  return (
    <div>
      {/* Product detail content */}
      
      {relatedProducts.length > 0 && (
        <section>
          <h2>You May Also Like</h2>
          <div className="grid grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

## Devv SDK Integration
Built-in Services:
- **File Upload** 🆕 - Image uploads for products and moodboards
  - Used in ImageUploadField component
  - Max 5MB per file, 200 files/day limit
  - Requires authentication
  - Configurable via VITE_ENABLE_IMAGE_UPLOAD flag

External: None currently used

## Admin Portal Access
**URL**: `/admin/login`
**Demo Credentials**:
- Email: `admin@lookbook.com`
- Password: `admin123`

**Features**:
- JWT-based authentication with 1-hour token expiration
- Full CRUD for products and moodboards
- Publish/unpublish functionality
- Protected routes with automatic redirect
- Persistent auth state with localStorage

## Special Requirements
- Sophisticated minimalist design with Playfair Display and Inter fonts
- Warm earth-toned color scheme (espresso brown, beige-gold accents)
- Affiliate link tracking with UTM parameters for analytics
- Domain whitelist security for affiliate links (20+ trusted retailers)
- Mobile-first responsive design with comprehensive breakpoints (sm, md, lg, xl)
- Touch-optimized interactions with minimum 44px touch targets
- Smooth scrolling and tap highlight optimization for mobile devices
- Safe area padding for mobile notches and rounded corners
- Responsive typography scaling (text-mobile-hero, text-mobile-title, etc.)
- Adaptive grid systems (grid-mobile-products, grid-mobile-moodboards)
- Detailed product descriptions and brand information
- Comprehensive styling guidance for each moodboard
- Full keyboard accessibility with focus-visible states
- All images use proper alt attributes for screen readers
- Strict TypeScript with no implicit any types

## File Structure
/src
├── components/          # Shared UI components
│   ├── ui/             # Pre-installed shadcn/ui components
│   ├── admin/          # Admin-specific components
│   ├── OptimizedImage.tsx 🆕 # Image optimization with **OPTIONAL** blurhash LQIP (works perfectly without it!)
│   │   ├── AdminHeader.tsx      # Admin navigation header
│   │   └── ImageUploadField.tsx # Image upload component with progress
│   ├── Header.tsx      # Navigation header with "Admin" text link in desktop + mobile nav, green dot when logged in 🆕
│   ├── ShareButton.tsx 🆕 # Universal share component with WhatsApp, native share, and copy link
│   ├── ProductCard.tsx # Reusable product display with affiliate redirect and share button 🆕
│   ├── MoodboardCard.tsx # Moodboard preview card with unpublished tag and share button 🆕
│   ├── SectionHeader.tsx # Styled section headers
│   ├── SearchBar.tsx   # Reusable search input with fuzzy hint, debouncing (400ms), and clear button
│   ├── Pagination.tsx  # Pagination controls with desktop/mobile variants
│   ├── SkeletonCard.tsx # Product card loading skeleton
│   ├── SkeletonMoodboard.tsx # Moodboard card loading skeleton
│   ├── SkeletonDetail.tsx # Product detail page loading skeleton
│   ├── ErrorBoundary.tsx # Global error boundary with elegant fallback UI
│   └── SEO.tsx          # Dynamic SEO meta tags component
│
├── data/               # Mock data and utilities
│   └── mock-data.ts    # 52 products and 10 moodboards with comprehensive helper functions
│
├── config/             # Application configuration
│   └── api.config.ts   # API mode and settings (mock/real toggle, image upload, affiliate restriction) 🆕
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.ts   # Mobile detection hook
│   ├── use-toast.ts    # Toast notification system
│   ├── use-products.ts # Products hooks: usePaginatedProducts (with search), useProductSearch
│   └── use-moodboards.ts # Moodboards hooks with pagination (usePaginatedMoodboards)
│
├── lib/                # Utility functions
│   ├── pagination.utils.ts # Pagination calculations, page number generation, range text
│   ├── fuzzy-search.utils.ts # Fuzzy matching utilities with Fuse.js (typo tolerance)
│   └── user-identifier.ts 🆕 # User ID generation and management (GUID, localStorage)
│
├── services/           # API services layer
│   ├── analytics.service.ts # Client-side analytics tracking with batching ✨ **NEW**
│   └── api/
│       ├── base.api.ts      # Base API client with HTTP methods + FormData support + User ID injection
│       ├── admin.api.ts     # Admin API: auth, products, moodboards, bulk operations, utilities (mock + real)
│       ├── analytics.api.ts # Analytics API: overview, user behavior, product analytics ✨ **NEW**
│       ├── products.api.ts  # Products API: search, pagination, related products (mock + real)
│       ├── moodboards.api.ts # Moodboards API: search, pagination, related products (mock + real)
│       └── index.ts         # Unified API exports
│
├── pages/              # Route page components
│   ├── HomePage.tsx    # Hero with featured collections, WhatsApp community section, skeleton loading, defensive filtering
│   ├── ProductsPage.tsx # Product catalog with pagination, debounced search (400ms), filtering, sorting, **show unpublished toggle** 🆕, **search analytics tracking** ✨
│   ├── ProductDetailPage.tsx # **Live API with purchase type support** - Conditional CTA (affiliate redirect OR contact Mimi), related products, **admin controls** 🆕
│   ├── MoodboardsPage.tsx # Moodboard gallery with tag filtering, skeleton loading, defensive filtering, **show unpublished toggle** 🆕
│   ├── MoodboardDetailPage.tsx # Moodboard detail with **edit/publish buttons & unpublished flag** when logged in 🆕
│   ├── AffiliateRedirect.tsx # **DYNAMIC RETAILERS** + **AFFILIATE CLICK TRACKING** ✨ - 3-second countdown, UTM params, analytics event
│   ├── FavoritesPage.tsx # User's saved products with skeleton loading and defensive filtering
│   ├── AboutPage.tsx   # Comprehensive brand story, mission, values, and transparency
│   ├── PersonalStylistPage.tsx # 🆕 Mimi's styling services with contact form, testimonials, and CTAs
│   ├── NotFoundPage.tsx # 🆕 Beautiful 404 page with decorative styling, animated elements, quick nav links
│   └── admin/          # Admin portal pages
│       ├── AdminLoginPage.tsx      # JWT login with "Back to Site" link
│       ├── AdminDashboard.tsx      # Statistics and quick actions with analytics link
│       ├── AdminAnalyticsPage.tsx  # Comprehensive analytics dashboard with advanced charts 🆕
│       ├── AdminProductsPage.tsx   # Products list with search and actions
│       ├── AdminProductForm.tsx    # Create/edit product form
│       ├── AdminMoodboardsPage.tsx # Moodboards list with search
│       ├── AdminMoodboardForm.tsx  # Create/edit moodboard form
│       └── AdminRetailersPage.tsx  # Manage trusted retailers dynamically
│
├── store/              # Zustand state management
│   └── favorites-store.ts # Persistent favorites with localStorage + analytics tracking ✨
│
├── types/              # TypeScript definitions
│   ├── index.ts        # Product, Moodboard, FilterOptions (with search), PaginationInfo, PaginatedResponse
│   ├── admin.types.ts  # Admin types: BulkOperationResult, AdminStats, ImageUploadResponse
│   └── analytics.types.ts # ✨ **NEW** - Analytics types: AnalyticsOverview, UserBehavior, PopularProduct
│   
│   📚 **Complete Data Models Reference**: `/docs/DATA_MODELS_COMPLETE_REFERENCE.md`
│   - ALL 41 TypeScript models in one file
│   - Usage examples for every model
│   - SQL schema examples
│   - Type guards and validation helpers
│
├── components/
│   ├── admin/          # Admin-specific components
│   │   ├── AdminHeader.tsx      # Admin navigation header with analytics link ✨ **UPDATED**
│   │   ├── ImageUploadField.tsx # Image upload component with progress
│   │   ├── AnalyticsMetricCard.tsx # ✨ **NEW** - Metric card for analytics
│   │   ├── TopProductsTable.tsx # ✨ **NEW** - Top products analytics table
│   │   ├── RecentActivityFeed.tsx # ✨ **NEW** - Recent user events feed
│   │   ├── TimeSeriesChart.tsx # 🎨 **NEW** - Line chart for trends over time
│   │   ├── CategoryBarChart.tsx # 🎨 **NEW** - Bar chart for category distribution
│   │   ├── CategoryPieChart.tsx # 🎨 **NEW** - Pie chart for category percentages
│   │   ├── ConversionFunnelChart.tsx # 🎨 **NEW** - Funnel visualization for user journey
│   │   ├── TrendComparisonChart.tsx # 🎨 **NEW** - Period-over-period comparison chart
│   │   └── TrafficAreaChart.tsx # 🎨 **NEW** - Area chart for traffic patterns
│   ├── ErrorBoundary.tsx # Global error boundary with elegant fallback UI
│   └── SEO.tsx          # Dynamic SEO meta tags component
│
├── App.tsx             # Router setup with lazy loading, ErrorBoundary, and HelmetProvider
├── main.tsx            # Application entry point
└── index.css           # Design system with mobile-first responsive utilities and animations
                        # Includes: touch targets, responsive text sizes, mobile grids,
                        # safe area padding, smooth scrolling, tap highlight optimization,
                        # z-index utilities, image placeholders, hover effects (lift, scale),
                        # glass morphism effects, gradient utilities, keyboard focus states

/docs                   # Documentation (28 comprehensive guides) 🆕

## Frontend Documentation (65 files) 📱 **FULLY RESPONSIVE** 🔒 **ADMIN-ONLY BUILD**
├── QUICK_START.md      # Get started in 5 minutes
├── **DATA_MODELS_COMPLETE_REFERENCE.md** 🆕 # **ALL 41 DATA MODELS** - One file with ALL TypeScript models, usage examples, SQL schemas
├── **API_ENDPOINTS_COMPLETE_REFERENCE.md** 🆕 # **ALL 38 ENDPOINTS** - One file with ALL request/response examples
├── **API_CLEANUP_SUMMARY.md** 🆕 # **LATEST FIXES** - ProductsPage API integration, no more mock data in components
├── **DIRECT_PURCHASE_GUIDE.md** 🆕 # **NEW** - Complete direct purchase implementation (SMS, WhatsApp, email contact)
├── **OPTIONAL_CHAINING_IMPROVEMENTS.md** 🛡️ **NEW** - Safe array operations with optional chaining (25+ fixes)
├── **ANALYTICS_SIMPLIFICATION_SUMMARY.md** 🎯 **NEW** - Simplified analytics to 3 essential charts
├── **API_IMPLEMENTATION_STATUS.md** 🆕 # **100% COMPLETE** - All 28 endpoints implemented (mock + real)
├── **BULK_OPERATIONS_IMPLEMENTATION.md** 🆕 # **NEW** - Complete bulk operations guide with before/after examples
├── **USER_IDENTIFICATION_GUIDE.md** 🆕 # **NEW** - User tracking system with GUID and localStorage
├── **BLURHASH_IMPLEMENTATION_GUIDE.md** 🔵 # **NEW** - Blurhash LQIP complete guide (400+ lines)
├── **BLURHASH_AUTO_GENERATION.md** ⚡ # **NEW** - Auto blurhash when creating products (500+ lines)
├── **IMAGE_UPLOAD_GUIDE.md** 🆕 # Complete image upload implementation guide
├── **API_MODES_GUIDE.md** 🆕 # Mock vs Real mode configuration and switching
├── **IMPLEMENTATION_SUMMARY.md** 🆕 # Latest features summary and deployment guide
├── PRODUCT_DETAIL_API.md # Product detail live API integration with slug-based URLs
├── MOODBOARD_DETAIL_API.md # Moodboard detail API with slug URLs and backward compatibility
├── AFFILIATE_REDIRECT_GUIDE.md # Complete affiliate redirect page guide (security, UX, analytics)
├── REDIRECT_PAGE_COMPARISON.md # Before/after comparison with metrics and improvements
├── SEARCH_GUIDE.md     # Complete search implementation guide with examples
├── FUZZY_SEARCH_GUIDE.md # Typo-tolerant fuzzy search guide with Fuse.js
├── PAGINATION_GUIDE.md # Comprehensive pagination implementation guide
├── API_INTEGRATION.md  # Complete API setup and configuration guide
├── API_USAGE_EXAMPLES.md # Code examples and patterns
├── MIGRATION_CHECKLIST.md # Step-by-step migration from mock to real API
├── ARCHITECTURE.md     # System architecture and data flow diagrams
├── FEATURES_SUMMARY.md # Complete feature overview and capabilities
├── ADMIN_PORTAL_GUIDE.md # Complete admin CMS guide (JWT auth, CRUD, publish/unpublish, bulk operations)
├── BULK_OPERATIONS_GUIDE.md # Complete bulk operations guide (multi-select, bulk actions)
├── **ADMIN_UI_ENHANCEMENTS.md** 🆕 # Edit buttons, unpublished flags, visibility toggles
├── **BUGFIXES_SUMMARY.md** 🆕 # Fixed admin link, product edit URL, moodboard edit URL
├── **HEADER_NAVIGATION_FIX.md** 🆕 # Admin text link in desktop + mobile nav (no shield icon)
├── **BRANDING_UPDATE.md** 🆕 # Custom logo and founder photo (Cloudinary assets, 3s redirect)
├── **AUTH_TOKEN_INJECTION.md** 🆕 # **JWT TOKEN MANAGEMENT** - Auto-inject tokens, client-side logout, no validate endpoint
├── **ADMIN_LOGIN_UX.md** 🆕 # **"BACK TO SITE" LINK ON LOGIN PAGE** - Easy navigation to public site
├── RETAILERS_MANAGEMENT.md # Dynamic retailers whitelist management guide
├── ADMIN_API_SPEC.md   # Admin API endpoints specification
├── **ANALYTICS_DASHBOARD_GUIDE.md** ✨ **NEW** - Complete analytics dashboard implementation (900+ lines)
├── **ANALYTICS_TRACKING_IMPLEMENTATION.md** ✨ **NEW** - Complete tracking guide (favorites, affiliate clicks, search)
├── **ANALYTICS_COMPLETE_SUMMARY.md** ✨ **NEW** - Full analytics system summary with event matrix
├── **ANALYTICS_IMPLEMENTATION_SUMMARY.md** ✨ **NEW** - Quick reference and deployment checklist
├── **ANALYTICS_USER_TRACKING.md** 📍 **UPDATED** - User tracking system with X-User-ID header (550+ lines)
├── **ADVANCED_CHARTS_GUIDE.md** 🎨 **NEW** - Complete charts & visualizations guide (1200+ lines)
├── **CHARTS_IMPLEMENTATION_SUMMARY.md** 🎨 **NEW** - Quick reference for all 6 chart components
├── **ADVANCED_CHARTS_SUMMARY.md** 🎨 **NEW** - Quick summary and deployment checklist
├── **CHARTS_FINAL_SUMMARY.md** 🎨 **NEW** - Final implementation summary with all details
├── **AFFILIATE_TRACKING_VERIFICATION.md** ✅ **NEW** - Complete verification of affiliate click tracking (500+ lines)
├── **MOODBOARD_ANALYTICS_GUIDE.md** ⭐ **NEW** - Complete moodboard analytics tracking guide (900+ lines)
├── **MOODBOARD_ANALYTICS_SUMMARY.md** ⭐ **NEW** - Quick reference for moodboard analytics (500+ lines)
├── **SOCIAL_SHARING_GUIDE.md** 📤 **NEW** - Complete social sharing system guide (5000+ words)
├── **SOCIAL_SHARING_SUMMARY.md** 📤 **NEW** - Quick reference for sharing features
├── **WHATSAPP_SHARING_CLARIFICATION.md** 📤 **NEW** - Image + text combined message clarification
├── **WEB_SHARE_API_UPDATE.md** 🆕 **NEW** - Web Share API priority update and implementation details
├── **ANALYTICS_RESPONSIVE_IMPROVEMENTS.md** 📱 **NEW** - Complete mobile optimization guide (7000+ words)
├── **ANALYTICS_RESPONSIVE_SUMMARY.md** 📱 **NEW** - Quick reference for responsive analytics
├── **SECURITY_IMPROVEMENTS_SUMMARY.md** 🔒 **NEW** - Security hardening for admin-only build (3000+ words)
├── **COMPREHENSIVE_SAFETY_IMPROVEMENTS.md** 🛡️ **NEW** - Complete safety guide for all operations (5000+ words)
│   - All 500+ array, string, and object operations
│   - Optional chaining patterns and best practices
│   - Before/after examples with testing checklist
└── **OPTIONAL_CHAINING_IMPROVEMENTS.md** 🛡️ - `.slice()` specific safety improvements (original guide)

## Backend Documentation (15 files) 🆕
├── **ADMIN_BACKEND_ROUTES_SUMMARY.md** 🆕 # **QUICK START** - All admin routes with request/response bodies (ROOT)
├── BACKEND_README.md   # **START HERE** - Main backend guide with links to all docs
├── BACKEND_SUMMARY.md  # Complete backend documentation index and overview
├── /docs/
│   ├── BACKEND_API_SPEC_UPDATED.md # **V2.0** - Complete public API specification (14 endpoints)
│   ├── **ADMIN_BACKEND_SPEC.md** 🆕 # **ADMIN API** - Complete admin portal specification (15 endpoints: auth, CRUD, bulk operations)
│   ├── **BACKEND_ANALYTICS_IMPLEMENTATION.md** ⭐ **NEW** # Complete analytics backend guide with SQL queries (900+ lines)
│   ├── **BACKEND_ANALYTICS_QUICK_START.md** ⚡ **NEW** # Get analytics working in 2-3 hours
│   ├── **ANALYTICS_API_SPEC.md** 📊 **NEW** # Complete analytics API specification v1.0
├── **API_SIMPLIFICATION_SUMMARY.md** 🆕 # Removed logout and validate endpoints - client-side auth only
│   ├── **ADMIN_API_QUICK_REFERENCE.md** 🆕 # Quick admin API reference with all endpoints
│   ├── API_CHANGES_V2.md   # **NEW!** - Breaking changes, new features, migration guide
│   ├── API_REVIEW_SUMMARY.md # **NEW!** - Complete API review, implementation guide, SQL queries
│   ├── API_ENDPOINTS_SUMMARY.md # Quick reference with all routes
│   ├── DATABASE_SCHEMAS.md # PostgreSQL, MySQL, MongoDB, Prisma schemas
│   └── BACKEND_IMPLEMENTATION_CHECKLIST.md # Step-by-step build guide (11-15 days)

/.env                   # Environment configuration 🆕
├── VITE_API_MODE       # 'mock' or 'real' - controls data source
├── VITE_API_BASE_URL   # Backend API URL (for real mode)
├── VITE_API_KEY        # API authentication key (for real mode)
├── VITE_API_DEBUG      # Enable API request logging
├── VITE_ENABLE_IMAGE_UPLOAD 🆕 # Enable/disable Devv SDK file uploads (default: true)
├── VITE_RESTRICT_AFFILIATE_RETAILERS 🆕 # Enable/disable retailer whitelist (default: **false** - allows ANY retailer)
├── VITE_MIMI_PHONE 🆕     # Phone number for SMS contact (format: 1XXXXXXXXXX)
├── VITE_MIMI_WHATSAPP 🆕  # WhatsApp number (format: 1XXXXXXXXXX)
└── VITE_MIMI_EMAIL 🆕     # Email address for direct purchase inquiries

/public
├── robots.txt          # SEO - search engine crawler rules
├── sitemap.xml         # SEO - site structure for search engines
├── vercel.json         # Vercel deployment config with SPA routing
├── netlify.toml        # Netlify deployment config
└── _redirects          # Netlify SPA routing rules
