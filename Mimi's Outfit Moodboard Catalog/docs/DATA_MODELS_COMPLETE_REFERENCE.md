# Complete Data Models Reference

**The Lookbook by Mimi - All TypeScript Data Models**

This document contains **ALL data models** used throughout the application in one comprehensive reference.

---

## Table of Contents

1. [Core Domain Models](#core-domain-models)
2. [Admin Portal Models](#admin-portal-models)
3. [Analytics Models](#analytics-models)
4. [Utility Models](#utility-models)
5. [Store State Models](#store-state-models)
6. [Configuration Models](#configuration-models)

---

## Core Domain Models

### 1. Product

**Description**: Main product entity with affiliate links and metadata

```typescript
export interface Product {
  id: string;                    // Unique product identifier
  name: string;                  // Product name
  slug: string;                  // URL-friendly identifier (e.g., "denim-jacket-classic")
  price: number | null;          // Price in USD (null if price varies)
  imageUrl: string;              // Product image URL
  blurhash?: string;             // Low quality image placeholder hash (LQIP)
  affiliateUrl: string;          // External retailer link with UTM tracking
  brand?: string;                // Brand name (e.g., "Levi's", "Zara")
  tags?: string[];               // Searchable tags (e.g., ["casual", "denim"])
  category?: string;             // Product category (e.g., "outerwear", "dresses")
  description?: string;          // Detailed product description
  isFeatured?: boolean;          // Show on homepage and featured collections
  createdAt: string;             // ISO 8601 timestamp (e.g., "2024-01-15T10:30:00Z")
}
```

**Usage Example**:
```typescript
const product: Product = {
  id: "1",
  name: "Classic Denim Jacket",
  slug: "classic-denim-jacket",
  price: 89.99,
  imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
  affiliateUrl: "https://nordstrom.com/product/123?utm_source=lookbook",
  brand: "Levi's",
  tags: ["denim", "jacket", "casual"],
  category: "outerwear",
  description: "Timeless denim jacket with classic fit",
  isFeatured: true,
  createdAt: "2024-01-15T10:30:00Z"
};
```

---

### 2. Moodboard

**Description**: Curated collection of products with styling guidance

```typescript
export interface Moodboard {
  id: string;                    // Unique moodboard identifier
  slug: string;                  // URL-friendly identifier (e.g., "parisian-chic")
  title: string;                 // Moodboard title
  description?: string;          // Short description of the aesthetic
  coverImage: string;            // Cover image URL
  coverBlurhash?: string;        // Low quality cover image placeholder hash
  products: Product[];           // Array of products in this moodboard
  tags?: string[];               // Style tags (e.g., ["minimal", "elegant"])
  isFeatured?: boolean;          // Show on homepage
  stylingTips?: string[];        // Array of styling tips
  howToWear?: string;            // Detailed styling guide (markdown supported)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Usage Example**:
```typescript
const moodboard: Moodboard = {
  id: "1",
  slug: "parisian-chic",
  title: "Parisian Chic",
  description: "Effortless elegance inspired by Parisian street style",
  coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  coverBlurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
  products: [/* array of Product objects */],
  tags: ["minimal", "elegant", "timeless"],
  isFeatured: true,
  stylingTips: [
    "Layer a silk scarf for added sophistication",
    "Pair with ankle boots for a polished look"
  ],
  howToWear: "Perfect for coffee dates, gallery visits, or casual dinners. The key is to keep it simple and let the quality pieces shine.",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-02-20T14:15:00Z"
};
```

---

### 3. FilterOptions

**Description**: Query parameters for filtering and searching products/moodboards

```typescript
export interface FilterOptions {
  category?: string;                                              // Filter by category
  brand?: string;                                                 // Filter by brand
  tag?: string;                                                   // Filter by tag
  minPrice?: number;                                              // Minimum price filter
  maxPrice?: number;                                              // Maximum price filter
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';      // Sort order
  search?: string;                                                // Search query (fuzzy search enabled)
  page?: number;                                                  // Page number (1-indexed)
  limit?: number;                                                 // Items per page (default: 12)
}
```

**Usage Example**:
```typescript
// Search for dresses under $100, sorted by price
const filters: FilterOptions = {
  category: "dresses",
  maxPrice: 100,
  sortBy: "price-low",
  search: "floral",
  page: 1,
  limit: 24
};
```

---

### 4. PaginationInfo

**Description**: Pagination metadata for paginated responses

```typescript
export interface PaginationInfo {
  page: number;          // Current page (1-indexed)
  limit: number;         // Items per page
  total: number;         // Total items matching query
  totalPages: number;    // Total number of pages
  hasNextPage: boolean;  // True if there are more pages
  hasPrevPage: boolean;  // True if not on first page
}
```

**Usage Example**:
```typescript
const pagination: PaginationInfo = {
  page: 2,
  limit: 12,
  total: 52,
  totalPages: 5,
  hasNextPage: true,
  hasPrevPage: true
};
```

---

### 5. PaginatedResponse

**Description**: Generic paginated API response wrapper

```typescript
export interface PaginatedResponse<T> {
  data: T[];                   // Array of items (Product[], Moodboard[], etc.)
  pagination: PaginationInfo;  // Pagination metadata
}
```

**Usage Example**:
```typescript
// API response with products
const response: PaginatedResponse<Product> = {
  data: [/* array of products */],
  pagination: {
    page: 1,
    limit: 12,
    total: 52,
    totalPages: 5,
    hasNextPage: true,
    hasPrevPage: false
  }
};
```

---

## Admin Portal Models

### 6. AdminUser

**Description**: Admin user account information

```typescript
export interface AdminUser {
  id: string;                           // Unique admin user ID
  email: string;                        // Admin email (login credential)
  name: string;                         // Admin display name
  role: 'admin' | 'editor';             // Admin role (future: granular permissions)
  createdAt: string;                    // ISO 8601 timestamp
}
```

**Usage Example**:
```typescript
const admin: AdminUser = {
  id: "admin-1",
  email: "admin@lookbook.com",
  name: "Mimi",
  role: "admin",
  createdAt: "2024-01-01T00:00:00Z"
};
```

---

### 7. LoginCredentials

**Description**: Admin login form data

```typescript
export interface LoginCredentials {
  email: string;     // Admin email
  password: string;  // Admin password (plain text - hashed on backend)
}
```

**Usage Example**:
```typescript
const credentials: LoginCredentials = {
  email: "admin@lookbook.com",
  password: "admin123"
};
```

---

### 8. AuthResponse

**Description**: JWT authentication response from backend

```typescript
export interface AuthResponse {
  token: string;     // JWT token (store in localStorage, add to Authorization header)
  user: AdminUser;   // Authenticated admin user object
  expiresIn: number; // Token expiration time in seconds (default: 3600 = 1 hour)
}
```

**Usage Example**:
```typescript
const authResponse: AuthResponse = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "admin-1",
    email: "admin@lookbook.com",
    name: "Mimi",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z"
  },
  expiresIn: 3600 // 1 hour
};
```

---

### 9. CreateProductDto

**Description**: Data transfer object for creating new products

```typescript
export interface CreateProductDto {
  name: string;               // Product name (required)
  slug: string;               // URL slug (auto-generated or custom)
  price: number | null;       // Price in USD (null if varies)
  imageUrl: string;           // Product image URL (required)
  blurhash?: string;          // Auto-generated from imageUrl if not provided
  affiliateUrl: string;       // Retailer link (required)
  brand?: string;             // Brand name (optional)
  tags?: string[];            // Searchable tags (optional)
  category?: string;          // Product category (optional)
  description?: string;       // Product description (optional)
  isFeatured?: boolean;       // Featured status (default: false)
}
```

**Usage Example**:
```typescript
const newProduct: CreateProductDto = {
  name: "Silk Blouse",
  slug: "silk-blouse-ivory",
  price: 129.99,
  imageUrl: "https://example.com/blouse.jpg",
  affiliateUrl: "https://nordstrom.com/product/456",
  brand: "Theory",
  tags: ["blouse", "silk", "workwear"],
  category: "tops",
  description: "Elegant silk blouse with pearl buttons",
  isFeatured: false
};
```

---

### 10. UpdateProductDto

**Description**: Data transfer object for updating existing products (all fields optional except ID)

```typescript
export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;  // Product ID to update (required)
}
```

**Usage Example**:
```typescript
// Update only price and featured status
const update: UpdateProductDto = {
  id: "1",
  price: 99.99,
  isFeatured: true
};
```

---

### 11. CreateMoodboardDto

**Description**: Data transfer object for creating new moodboards

```typescript
export interface CreateMoodboardDto {
  title: string;              // Moodboard title (required)
  slug: string;               // URL slug (auto-generated or custom)
  description?: string;       // Short description (optional)
  coverImage: string;         // Cover image URL (required)
  coverBlurhash?: string;     // Auto-generated from coverImage if not provided
  productIds: string[];       // Array of product IDs to include (required)
  tags?: string[];            // Style tags (optional)
  isFeatured?: boolean;       // Featured status (default: false)
  stylingTips?: string[];     // Array of styling tips (optional)
  howToWear?: string;         // Detailed styling guide (optional, markdown supported)
}
```

**Usage Example**:
```typescript
const newMoodboard: CreateMoodboardDto = {
  title: "Parisian Chic",
  slug: "parisian-chic",
  description: "Effortless elegance inspired by Parisian street style",
  coverImage: "https://example.com/cover.jpg",
  productIds: ["1", "5", "12", "18"],
  tags: ["minimal", "elegant", "timeless"],
  isFeatured: true,
  stylingTips: [
    "Layer a silk scarf for added sophistication",
    "Pair with ankle boots for a polished look"
  ],
  howToWear: "Perfect for coffee dates or casual dinners. Keep it simple."
};
```

---

### 12. UpdateMoodboardDto

**Description**: Data transfer object for updating existing moodboards (all fields optional except ID)

```typescript
export interface UpdateMoodboardDto extends Partial<CreateMoodboardDto> {
  id: string;  // Moodboard ID to update (required)
}
```

**Usage Example**:
```typescript
// Update moodboard tags and featured status
const update: UpdateMoodboardDto = {
  id: "1",
  tags: ["minimal", "elegant", "timeless", "french"],
  isFeatured: true
};
```

---

### 13. PublishOptions

**Description**: Options for publishing/unpublishing items

```typescript
export interface PublishOptions {
  publish: boolean;  // true = publish (set isFeatured=true), false = unpublish (set isFeatured=false)
}
```

**Usage Example**:
```typescript
// Publish a product
const publishOptions: PublishOptions = {
  publish: true
};
```

---

### 14. BulkOperationResult

**Description**: Result of bulk operations (bulk publish, unpublish, delete)

```typescript
export interface BulkOperationResult {
  success: string[];         // Array of IDs that succeeded
  failed: string[];          // Array of IDs that failed
  total: number;             // Total items attempted
  successCount: number;      // Number of successful operations
  failedCount: number;       // Number of failed operations
  errors?: {                 // Optional detailed error messages
    [id: string]: string;    // Map of ID to error message
  };
}
```

**Usage Example**:
```typescript
const result: BulkOperationResult = {
  success: ["1", "2", "5"],
  failed: ["3"],
  total: 4,
  successCount: 3,
  failedCount: 1,
  errors: {
    "3": "Product not found"
  }
};
```

---

### 15. AdminStats

**Description**: Dashboard statistics summary

```typescript
export interface AdminStats {
  totalProducts: number;       // Total products in database
  totalMoodboards: number;     // Total moodboards in database
  featuredProducts: number;    // Number of featured products
  featuredMoodboards: number;  // Number of featured moodboards
}
```

**Usage Example**:
```typescript
const stats: AdminStats = {
  totalProducts: 52,
  totalMoodboards: 10,
  featuredProducts: 12,
  featuredMoodboards: 4
};
```

---

### 16. ImageUploadResponse

**Description**: Response from image upload API (Devv SDK)

```typescript
export interface ImageUploadResponse {
  url: string;       // Public URL of uploaded image
  filename: string;  // Original filename
  size: number;      // File size in bytes
}
```

**Usage Example**:
```typescript
const uploadResponse: ImageUploadResponse = {
  url: "https://cdn.example.com/uploads/product-123.jpg",
  filename: "silk-blouse.jpg",
  size: 245760 // 240 KB
};
```

---

## Analytics Models

### 17. AnalyticsEventType

**Description**: All trackable event types in the application

```typescript
export type AnalyticsEventType =
  | 'page_view'                   // User views any page
  | 'product_view'                // User views product detail page
  | 'moodboard_view'              // User views moodboard detail page
  | 'moodboard_filter'            // User filters moodboards by tag
  | 'moodboard_shop_click'        // User clicks "Shop This Look" button
  | 'moodboard_save_all'          // User saves all products from moodboard
  | 'moodboard_remove_all'        // User removes all moodboard products from favorites
  | 'moodboard_product_click'     // User clicks product within moodboard
  | 'search'                      // User performs search
  | 'favorite_add'                // User adds product to favorites
  | 'favorite_remove'             // User removes product from favorites
  | 'affiliate_click'             // User clicks "Shop Now" (affiliate redirect)
  | 'filter_change'               // User changes product filters
  | 'sort_change';                // User changes sort order
```

---

### 18. AnalyticsEvent

**Description**: Client-side analytics event object (sent to backend)

```typescript
export interface AnalyticsEvent {
  event: AnalyticsEventType;              // Event type
  resourceType?: 'product' | 'moodboard'; // Type of resource (if applicable)
  resourceId?: string;                    // ID of resource (product/moodboard)
  metadata?: Record<string, any>;         // Additional event data
}
```

**Usage Example**:
```typescript
// Track product view
const event: AnalyticsEvent = {
  event: 'product_view',
  resourceType: 'product',
  resourceId: '1',
  metadata: {
    productName: 'Silk Blouse',
    brand: 'Theory',
    price: 129.99
  }
};

// Track search
const searchEvent: AnalyticsEvent = {
  event: 'search',
  metadata: {
    query: 'denim jacket',
    resultsCount: 12
  }
};

// Track affiliate click
const affiliateEvent: AnalyticsEvent = {
  event: 'affiliate_click',
  resourceType: 'product',
  resourceId: '1',
  metadata: {
    productName: 'Silk Blouse',
    retailerDomain: 'nordstrom.com'
  }
};
```

---

### 19. AnalyticsOverview

**Description**: Complete analytics dashboard overview data

```typescript
export interface AnalyticsOverview {
  metrics: {
    totalVisitors: number;          // Unique users (COUNT DISTINCT user_id)
    totalPageViews: number;         // Total page views
    totalProductViews: number;      // Total product detail views
    totalMoodboardViews: number;    // Total moodboard detail views
    totalSearches: number;          // Total search queries
    totalFavorites: number;         // Total favorite adds
    totalAffiliateClicks: number;   // Total affiliate clicks
    avgSessionDuration: number;     // Average session duration in seconds
  };
  topProducts: PopularProduct[];        // Most popular products
  topMoodboards: PopularMoodboard[];    // Most popular moodboards
  topSearchTerms: SearchTerm[];         // Most searched terms
  recentEvents: AnalyticsEventRecord[]; // Recent user activity
}
```

**Usage Example**:
```typescript
const overview: AnalyticsOverview = {
  metrics: {
    totalVisitors: 1523,
    totalPageViews: 8945,
    totalProductViews: 3421,
    totalMoodboardViews: 876,
    totalSearches: 567,
    totalFavorites: 234,
    totalAffiliateClicks: 189,
    avgSessionDuration: 245 // seconds
  },
  topProducts: [/* PopularProduct array */],
  topMoodboards: [/* PopularMoodboard array */],
  topSearchTerms: [/* SearchTerm array */],
  recentEvents: [/* AnalyticsEventRecord array */]
};
```

---

### 20. PopularProduct

**Description**: Product analytics with engagement metrics

```typescript
export interface PopularProduct {
  id: string;                  // Product ID
  name: string;                // Product name
  slug: string;                // Product slug
  imageUrl: string;            // Product image URL
  brand?: string;              // Brand name
  viewCount: number;           // Total views
  uniqueViewers: number;       // Unique viewers (COUNT DISTINCT user_id)
  favoriteCount: number;       // Times added to favorites
  clickCount: number;          // Affiliate link clicks
  conversionRate: number;      // (clickCount / viewCount) * 100
}
```

**Usage Example**:
```typescript
const popularProduct: PopularProduct = {
  id: "1",
  name: "Classic Denim Jacket",
  slug: "classic-denim-jacket",
  imageUrl: "https://example.com/jacket.jpg",
  brand: "Levi's",
  viewCount: 245,
  uniqueViewers: 189,
  favoriteCount: 45,
  clickCount: 67,
  conversionRate: 27.35 // 67/245 * 100
};
```

---

### 21. PopularMoodboard

**Description**: Moodboard analytics with engagement metrics

```typescript
export interface PopularMoodboard {
  id: string;                  // Moodboard ID
  title: string;               // Moodboard title
  slug: string;                // Moodboard slug
  coverImage: string;          // Cover image URL
  viewCount: number;           // Total views
  uniqueViewers: number;       // Unique viewers (COUNT DISTINCT user_id)
  clickThroughRate: number;    // (product clicks / views) * 100
}
```

**Usage Example**:
```typescript
const popularMoodboard: PopularMoodboard = {
  id: "1",
  title: "Parisian Chic",
  slug: "parisian-chic",
  coverImage: "https://example.com/cover.jpg",
  viewCount: 156,
  uniqueViewers: 123,
  clickThroughRate: 42.3 // (66 product clicks / 156 views) * 100
};
```

---

### 22. SearchTerm

**Description**: Search analytics for popular queries

```typescript
export interface SearchTerm {
  term: string;                // Search query text
  count: number;               // Number of times searched
  uniqueSearchers: number;     // Unique users who searched this (COUNT DISTINCT user_id)
  avgResultsCount: number;     // Average number of results returned
}
```

**Usage Example**:
```typescript
const searchTerm: SearchTerm = {
  term: "denim jacket",
  count: 45,
  uniqueSearchers: 38,
  avgResultsCount: 12.5
};
```

---

### 23. AnalyticsEventRecord

**Description**: Stored analytics event with timestamp (backend database model)

```typescript
export interface AnalyticsEventRecord {
  id: string;                                 // Event ID (auto-generated)
  userId: string;                             // User GUID from X-User-ID header
  eventType: AnalyticsEventType;              // Type of event
  resourceType?: 'product' | 'moodboard';     // Resource type (if applicable)
  resourceId?: string;                        // Resource ID (if applicable)
  resourceName?: string;                      // Resource name (for display)
  metadata?: Record<string, any>;             // Additional event data (JSON)
  createdAt: string;                          // ISO 8601 timestamp
}
```

**Usage Example**:
```typescript
const eventRecord: AnalyticsEventRecord = {
  id: "evt-123",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  eventType: "product_view",
  resourceType: "product",
  resourceId: "1",
  resourceName: "Classic Denim Jacket",
  metadata: {
    brand: "Levi's",
    price: 89.99
  },
  createdAt: "2024-01-15T14:32:15Z"
};
```

---

### 24. UserBehavior

**Description**: User behavior analytics (sessions, journeys, referrers)

```typescript
export interface UserBehavior {
  newUsers: number;                   // First-time visitors
  returningUsers: number;             // Returning visitors
  avgPagesPerSession: number;         // Average pages viewed per session
  avgSessionDuration: number;         // Average session duration in seconds
  topReferrers: ReferrerData[];       // Traffic sources
  userJourneys: JourneyData[];        // Common user paths
}
```

**Usage Example**:
```typescript
const userBehavior: UserBehavior = {
  newUsers: 1245,
  returningUsers: 278,
  avgPagesPerSession: 4.2,
  avgSessionDuration: 245, // seconds
  topReferrers: [
    { source: "google.com", count: 567, percentage: 42.3 },
    { source: "instagram.com", count: 345, percentage: 25.7 }
  ],
  userJourneys: [
    { path: ["/", "/products", "/products/1"], count: 123, percentage: 15.2 }
  ]
};
```

---

### 25. ReferrerData

**Description**: Traffic source analytics

```typescript
export interface ReferrerData {
  source: string;      // Referrer domain (e.g., "google.com", "instagram.com")
  count: number;       // Number of visits from this source
  percentage: number;  // Percentage of total traffic
}
```

---

### 26. JourneyData

**Description**: User navigation path analytics

```typescript
export interface JourneyData {
  path: string[];      // Array of page paths (e.g., ["/", "/products", "/products/1"])
  count: number;       // Number of users who followed this path
  percentage: number;  // Percentage of total users
}
```

---

### 27. ProductAnalytics

**Description**: Detailed analytics for a specific product

```typescript
export interface ProductAnalytics {
  productId: string;
  metrics: {
    views: number;               // Total views
    uniqueViewers: number;       // Unique viewers
    favorites: number;           // Times favorited
    clicks: number;              // Affiliate clicks
    conversionRate: number;      // (clicks / views) * 100
  };
  viewsByDay: DailyMetric[];       // Daily view counts
  clicksByDay: DailyMetric[];      // Daily click counts
  viewerLocations?: LocationData[]; // Geographic data (optional)
}
```

---

### 28. DailyMetric

**Description**: Time-series data point

```typescript
export interface DailyMetric {
  date: string;    // YYYY-MM-DD format
  count: number;   // Metric count for that day
}
```

**Usage Example**:
```typescript
const dailyMetrics: DailyMetric[] = [
  { date: "2024-01-15", count: 45 },
  { date: "2024-01-16", count: 52 },
  { date: "2024-01-17", count: 38 }
];
```

---

### 29. LocationData

**Description**: Geographic analytics

```typescript
export interface LocationData {
  country: string;     // Country name or code
  count: number;       // Number of users from this location
  percentage: number;  // Percentage of total users
}
```

---

### 30. TimeRange

**Description**: Time range filter for analytics

```typescript
export type TimeRange = '7d' | '30d' | '90d';
```

---

### 31. AnalyticsFilters

**Description**: Filters for analytics queries

```typescript
export interface AnalyticsFilters {
  timeRange: TimeRange;                       // Time period to analyze
  eventType?: AnalyticsEventType;             // Filter by event type (optional)
  resourceType?: 'product' | 'moodboard';     // Filter by resource type (optional)
}
```

**Usage Example**:
```typescript
const filters: AnalyticsFilters = {
  timeRange: '30d',
  eventType: 'product_view'
};
```

---

### 32. TimeSeriesData

**Description**: Chart data for time-series visualizations (line/area charts)

```typescript
export interface TimeSeriesData {
  date: string;         // YYYY-MM-DD format
  views?: number;       // Views on that date (optional)
  clicks?: number;      // Clicks on that date (optional)
  searches?: number;    // Searches on that date (optional)
  favorites?: number;   // Favorites on that date (optional)
  visitors?: number;    // Unique visitors on that date (optional)
}
```

**Usage Example**:
```typescript
const timeSeries: TimeSeriesData[] = [
  { date: "2024-01-15", views: 234, clicks: 45, visitors: 156 },
  { date: "2024-01-16", views: 267, clicks: 52, visitors: 189 }
];
```

---

### 33. CategoryDistribution

**Description**: Chart data for category breakdown (bar/pie charts)

```typescript
export interface CategoryDistribution {
  category: string;     // Category name
  count: number;        // Number of items/events in this category
  percentage: number;   // Percentage of total
}
```

**Usage Example**:
```typescript
const distribution: CategoryDistribution[] = [
  { category: "Outerwear", count: 145, percentage: 28.5 },
  { category: "Dresses", count: 123, percentage: 24.2 },
  { category: "Tops", count: 98, percentage: 19.3 }
];
```

---

### 34. ConversionFunnel

**Description**: Chart data for conversion funnel visualization

```typescript
export interface ConversionFunnel {
  stage: string;              // Funnel stage name (e.g., "Visitors", "Product Views", "Clicks")
  count: number;              // Number of users at this stage
  conversionRate: number;     // Percentage who converted from previous stage
  dropOffRate: number;        // Percentage who dropped off
}
```

**Usage Example**:
```typescript
const funnel: ConversionFunnel[] = [
  { stage: "Visitors", count: 1523, conversionRate: 100, dropOffRate: 0 },
  { stage: "Product Views", count: 856, conversionRate: 56.2, dropOffRate: 43.8 },
  { stage: "Affiliate Clicks", count: 234, conversionRate: 27.3, dropOffRate: 72.7 }
];
```

---

### 35. TrendData

**Description**: Period-over-period comparison data

```typescript
export interface TrendData {
  metric: string;             // Metric name (e.g., "Total Visitors")
  current: number;            // Current period value
  previous: number;           // Previous period value
  change: number;             // Absolute change (current - previous)
  changePercentage: number;   // Percentage change
  trend: 'up' | 'down' | 'stable'; // Trend direction
}
```

**Usage Example**:
```typescript
const trend: TrendData = {
  metric: "Total Visitors",
  current: 1523,
  previous: 1234,
  change: 289,
  changePercentage: 23.4,
  trend: "up"
};
```

---

## Utility Models

### 36. TrustedRetailer

**Description**: Whitelisted affiliate retailer for security validation

```typescript
export interface TrustedRetailer {
  domain: string;                                               // Retailer domain (e.g., "nordstrom.com")
  name: string;                                                 // Display name (e.g., "Nordstrom")
  category: 'luxury' | 'contemporary' | 'fast-fashion' | 'marketplace'; // Retailer category
  addedAt: string;                                              // ISO 8601 timestamp
  isActive: boolean;                                            // Enable/disable without deleting
}
```

**Usage Example**:
```typescript
const retailer: TrustedRetailer = {
  domain: "nordstrom.com",
  name: "Nordstrom",
  category: "luxury",
  addedAt: "2024-01-01T00:00:00Z",
  isActive: true
};
```

---

### 37. BlurhashOptions

**Description**: Configuration for blurhash generation

```typescript
export interface BlurhashOptions {
  componentX?: number;      // Horizontal blur components (1-9, default: 4)
  componentY?: number;      // Vertical blur components (1-9, default: 3)
  showProgress?: boolean;   // Show progress notifications (default: true)
}
```

**Usage Example**:
```typescript
// High detail blurhash for hero images
const options: BlurhashOptions = {
  componentX: 6,
  componentY: 4,
  showProgress: true
};
```

---

## Store State Models

### 38. AuthState (Zustand Store)

**Description**: Admin authentication state

```typescript
interface AuthState {
  token: string | null;                                  // JWT token (stored in localStorage)
  user: AdminUser | null;                                // Authenticated admin user
  isAuthenticated: boolean;                              // Authentication status
  
  // Actions
  setAuth: (token: string, user: AdminUser) => void;    // Set authenticated state
  logout: () => void;                                    // Clear auth state
  updateUser: (user: AdminUser) => void;                 // Update user info
}
```

**Usage Example**:
```typescript
import { useAuthStore } from '@/store/auth-store';

function LoginPage() {
  const { setAuth, isAuthenticated } = useAuthStore();
  
  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await adminApi.login(credentials);
    setAuth(response.token, response.user);
  };
}
```

---

### 39. FavoritesState (Zustand Store)

**Description**: User favorites state with persistence

```typescript
interface FavoritesState {
  favorites: Product[];                             // Array of favorited products
  addToFavorites: (product: Product) => void;       // Add product to favorites
  removeFromFavorites: (productId: string) => void; // Remove product from favorites
  isFavorite: (productId: string) => boolean;       // Check if product is favorited
  clearFavorites: () => void;                       // Clear all favorites
}
```

**Usage Example**:
```typescript
import { useFavoritesStore } from '@/store/favorites-store';

function ProductCard({ product }: { product: Product }) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore();
  const isLiked = isFavorite(product.id);
  
  const handleToggle = () => {
    if (isLiked) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };
}
```

---

## Configuration Models

### 40. ApiMode

**Description**: API mode configuration (mock or real)

```typescript
export type ApiMode = 'mock' | 'real';
```

---

### 41. ApiConfig

**Description**: API configuration object

```typescript
export interface ApiConfig {
  mode: ApiMode;                    // 'mock' or 'real'
  baseUrl: string;                  // Backend API URL (for real mode)
  apiKey: string;                   // API authentication key (for real mode)
  debug: boolean;                   // Enable request logging
  enableImageUpload: boolean;       // Enable Devv SDK file uploads
  restrictAffiliateRetailers: boolean; // Enable retailer whitelist validation
}
```

**Usage Example**:
```typescript
const config: ApiConfig = {
  mode: 'mock',
  baseUrl: 'https://api.thelookbook.com',
  apiKey: 'your-api-key',
  debug: false,
  enableImageUpload: true,
  restrictAffiliateRetailers: false
};
```

---

## Backend Database Schemas

### Products Table

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  blurhash VARCHAR(255),
  affiliate_url TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  tags TEXT[], -- PostgreSQL array
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_brand (brand),
  INDEX idx_featured (is_featured),
  INDEX idx_created_at (created_at)
);
```

---

### Moodboards Table

```sql
CREATE TABLE moodboards (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT NOT NULL,
  cover_blurhash VARCHAR(255),
  tags TEXT[], -- PostgreSQL array
  is_featured BOOLEAN DEFAULT FALSE,
  styling_tips TEXT[], -- PostgreSQL array
  how_to_wear TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_featured (is_featured),
  INDEX idx_created_at (created_at)
);
```

---

### Moodboard Products Junction Table

```sql
CREATE TABLE moodboard_products (
  id BIGSERIAL PRIMARY KEY,
  moodboard_id BIGINT NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(moodboard_id, product_id),
  INDEX idx_moodboard_id (moodboard_id),
  INDEX idx_product_id (product_id)
);
```

---

### Analytics Events Table

```sql
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL, -- GUID from X-User-ID header
  event_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(20), -- 'product' or 'moodboard'
  resource_id BIGINT,
  resource_name VARCHAR(255),
  metadata JSONB, -- Flexible event data
  session_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Critical composite index for performance
  INDEX idx_composite (event_type, created_at, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at)
);
```

---

### Admin Users Table

```sql
CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'editor', -- 'admin' or 'editor'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email)
);
```

---

## Quick Reference: Most Common Models

### Frontend CRUD Operations

**Create Product**:
```typescript
const newProduct: CreateProductDto = {
  name: "Product Name",
  slug: "product-name",
  price: 99.99,
  imageUrl: "https://...",
  affiliateUrl: "https://...",
  brand: "Brand Name",
  category: "category",
  description: "Description",
  tags: ["tag1", "tag2"],
  isFeatured: false
};
await adminApi.createProduct(newProduct);
```

**Update Product**:
```typescript
const update: UpdateProductDto = {
  id: "1",
  price: 89.99,
  isFeatured: true
};
await adminApi.updateProduct(update);
```

**Filter Products**:
```typescript
const filters: FilterOptions = {
  category: "dresses",
  maxPrice: 100,
  sortBy: "price-low",
  search: "floral",
  page: 1,
  limit: 24
};
const response = await productsApi.getProducts(filters);
```

**Track Analytics Event**:
```typescript
const event: AnalyticsEvent = {
  event: 'product_view',
  resourceType: 'product',
  resourceId: '1',
  metadata: { productName: 'Silk Blouse' }
};
trackEvent(event);
```

---

## Model Relationships

```
Product (1) ←→ (N) MoodboardProducts (N) ←→ (1) Moodboard
Product (1) ←→ (N) FavoritesState
Product (1) ←→ (N) AnalyticsEvents
Moodboard (1) ←→ (N) AnalyticsEvents
AdminUser (1) ←→ (N) Products (via created_by, future)
AdminUser (1) ←→ (N) Moodboards (via created_by, future)
```

---

## Type Guards and Validation

```typescript
// Check if product has valid price
function hasValidPrice(product: Product): product is Product & { price: number } {
  return product.price !== null && product.price > 0;
}

// Validate filter options
function validateFilters(filters: FilterOptions): boolean {
  if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
    return false;
  }
  if (filters.page && filters.page < 1) {
    return false;
  }
  return true;
}

// Check if URL is valid affiliate URL
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
```

---

## Summary

**Total Models**: 41 TypeScript interfaces/types

**Categories**:
- Core Domain: 5 models (Product, Moodboard, Filters, Pagination)
- Admin Portal: 11 models (Auth, CRUD DTOs, Bulk Operations)
- Analytics: 19 models (Events, Metrics, Charts)
- Utilities: 2 models (Retailers, Blurhash)
- Stores: 2 models (Auth, Favorites)
- Config: 2 models (API Config)

**Key Features**:
✅ Full TypeScript support with strict types
✅ Comprehensive JSDoc comments
✅ Backward compatibility (optional fields)
✅ Flexible metadata with `Record<string, any>`
✅ SQL schema examples for backend
✅ Usage examples for every model
✅ Type guards and validation helpers

---

**Last Updated**: January 28, 2025
**Version**: 1.0.0
**Project**: The Lookbook by Mimi
