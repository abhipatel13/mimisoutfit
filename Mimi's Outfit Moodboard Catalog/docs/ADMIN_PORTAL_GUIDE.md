# Admin Portal Guide

Complete guide for The Lookbook by Mimi Admin Portal with JWT authentication and full CRUD operations.

---

## 🎯 Overview

The admin portal provides a comprehensive content management system for products and moodboards with:

- **JWT-based authentication** with persistent sessions
- **Full CRUD operations** for products and moodboards
- **Publish/Unpublish functionality** to control content visibility
- **Image preview** and product selection
- **Search and filtering** across all content
- **Protected routes** with automatic redirect to login
- **Responsive design** for desktop and mobile management

---

## 🔐 Authentication

### Login System

**Route**: `/admin/login`

**Demo Credentials**:
- Email: `admin@lookbook.com`
- Password: `admin123`

**Features**:
- JWT token generation and storage
- Persistent authentication with Zustand + localStorage
- Automatic token validation
- Secure logout with token invalidation

**Implementation Details**:
```typescript
// Login API call
const response = await authApi.login({ email, password });
// Returns: { token: string, user: AdminUser, expiresIn: number }

// Token stored in Zustand with persistence
setAuth(response.token, response.user);
```

### Protected Routes

All admin routes except `/admin/login` require authentication:

```typescript
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

If user is not authenticated, they are automatically redirected to `/admin/login`.

### JWT Token Management

**Storage**: LocalStorage via Zustand persist middleware  
**Key**: `admin-auth-storage`  
**Expiry**: 1 hour (3600 seconds)  
**Auto-attach**: Token automatically attached to all admin API calls

```typescript
// Token is attached to requests automatically
const token = useAuthStore.getState().token;
headers: { Authorization: `Bearer ${token}` }
```

---

## 📊 Dashboard

**Route**: `/admin`

### Features:
- **Statistics Overview**: Total products, moodboards, featured items
- **Quick Actions**: Create new products and moodboards
- **Navigation**: Easy access to all admin sections
- **View Site**: Direct link to public website

### Stats Display:
- Total Products: Count of all products
- Total Moodboards: Count of all moodboards
- Featured Items: Combined featured count
- Site Views: Coming soon (placeholder)

---

## 📦 Products Management

### Products List Page

**Route**: `/admin/products`

**Features**:
- **Bulk Operations** ⭐ NEW
  - Multi-select products with checkboxes
  - Select all / deselect all
  - Bulk publish (publish all selected)
  - Bulk unpublish (unpublish all selected)
  - Bulk delete (delete all selected with confirmation)
  - Visual selection counter and clear button
- Grid view with product images
- Search by name, brand, or category
- Quick actions: Edit, View, Publish/Unpublish, Delete
- Product count display
- Hover actions for quick access

**Search**:
- Real-time filtering
- Searches: name, brand, category
- Case-insensitive

**Actions**:
- **Edit**: Open product form
- **View**: Preview on public site
- **Publish/Unpublish**: Toggle featured status
- **Delete**: Remove product (with confirmation)

### Create Product

**Route**: `/admin/products/new`

**Required Fields** (marked with *):
- Product Name*
- Slug* (auto-generated from name)
- Image URL*
- Affiliate URL*

**Optional Fields**:
- Brand
- Price ($)
- Category
- Description
- Tags (multiple)
- Featured checkbox

**Slug Generation**:
```typescript
// Automatic slug from name
"Classic Trench Coat" → "classic-trench-coat"
```

**Tag Management**:
- Add tags by typing and pressing Enter or clicking "Add"
- Remove tags by clicking × on tag badge
- Tags stored as lowercase

**Image Preview**:
- Live preview when URL is entered
- Fallback image on error

### Edit Product

**Route**: `/admin/products/edit/:id`

- Pre-populated form with existing data
- Same validation as create
- Slug is editable (manual override)
- Update button instead of create

### Publish/Unpublish

**Toggle Featured Status**:
- Published products appear in featured sections
- Unpublished products are hidden from featured lists
- Products remain searchable even when unpublished

---

## 🎨 Moodboards Management

### Moodboards List Page

**Route**: `/admin/moodboards`

**Features**:
- **Bulk Operations** ⭐ NEW
  - Multi-select moodboards with checkboxes
  - Select all / deselect all
  - Bulk publish (publish all selected)
  - Bulk unpublish (unpublish all selected)
  - Bulk delete (delete all selected with confirmation)
  - Visual selection counter and clear button
- Grid view with cover images
- Search by title, description, or tags
- Product count display
- Tag preview (first 3 tags)
- Quick actions menu

**Actions**:
- **Edit**: Open moodboard form
- **View**: Preview on public site
- **Publish/Unpublish**: Toggle featured status
- **Delete**: Remove moodboard (with confirmation)

### Create Moodboard

**Route**: `/admin/moodboards/new`

**Layout**: Two-column form
- Left: Moodboard details
- Right: Product selection

**Required Fields** (marked with *):
- Title*
- Slug* (auto-generated)
- Cover Image URL*
- At least 1 product selected*

**Optional Fields**:
- Description
- How to Wear
- Tags (multiple)
- Styling Tips (multiple)
- Featured checkbox

**Product Selection**:
- Search products by name or brand
- Click to add/remove products
- Visual selection indicator
- Selected products shown in separate panel
- Limit 20 products shown at once (search to find more)

**Styling Tips**:
- Add multiple tips
- Each tip can be removed individually
- Press Enter or click "Add" to add tip
- Tips displayed as bullet points on moodboard detail page

**Cover Image**:
- Live preview when URL entered
- 4:3 aspect ratio recommended

### Edit Moodboard

**Route**: `/admin/moodboards/edit/:id`

- Pre-populated with existing data
- Product selection preserved
- Can add/remove products
- Update button instead of create

---

## 🛡️ Retailers Management

### Retailers List Page

**Route**: `/admin/retailers`

**Features**:
- Dynamic whitelist for affiliate redirect security
- Add/remove trusted retailers without code changes
- Test affiliate URLs for validation
- Activate/deactivate retailers
- Category organization (luxury, contemporary, fast-fashion, marketplace)
- LocalStorage persistence with automatic sync
- Statistics dashboard (total, active, by category)

**Actions**:
- **Add Retailer**: Opens dialog to add new trusted domain
- **Test URL**: Validate any affiliate URL against whitelist
- **Activate/Deactivate**: Toggle retailer status
- **Delete**: Remove retailer (with confirmation)
- **Visit Site**: Open retailer website

### Add Retailer

**Required Fields**:
- **Retailer Name** (e.g., "Nordstrom")
- **Domain** (e.g., "nordstrom.com" - no protocol or www)
- **Category** (luxury, contemporary, fast-fashion, marketplace)

**Validation**:
- Domain format checking
- Duplicate prevention
- HTTPS enforcement on redirect
- Automatic domain normalization

**Security**:
- Only HTTPS URLs allowed for redirects
- Domain whitelist checking
- Active-only validation
- Verified retailer badge on redirect page

For complete details, see: `/docs/RETAILERS_MANAGEMENT.md`

---

## 🔄 Bulk Operations

### Overview

Bulk operations allow you to perform actions on multiple items simultaneously, saving time when managing large catalogs.

### Available for:
- ✅ Products
- ✅ Moodboards

### Actions:
1. **Select Multiple Items**
   - Click checkbox on any product/moodboard card
   - Or use "Select all" to select all visible items
   - Selection persists while filtering/searching

2. **Bulk Publish**
   - Publishes all selected items (sets `isFeatured: true`)
   - Items appear on homepage and featured collections
   - Success toast shows count: "X items published successfully"

3. **Bulk Unpublish**
   - Unpublishes all selected items (sets `isFeatured: false`)
   - Removes from homepage but keeps in catalog
   - Success toast shows count: "X items unpublished successfully"

4. **Bulk Delete**
   - Deletes all selected items permanently
   - Confirmation dialog shows count
   - Cannot be undone (⚠️ use with caution)
   - Success toast shows count: "X items deleted successfully"

### UI Features:

**Bulk Actions Toolbar** (appears when items selected):
- Shows selection count badge
- Clear button to deselect all
- Action buttons with loading states
- Responsive layout (stacks on mobile)

**Selection Control**:
- "Select all" checkbox above grid
- Shows "X selected" when partial selection
- Visual indicator on selected items
- Checkboxes visible on card hover

**Loading States**:
- Spinner on action buttons during operation
- Disabled state prevents duplicate operations
- Operation runs in parallel for speed

### Best Practices:

1. **Filter First**: Use search to narrow down items before bulk selecting
2. **Preview**: Verify selection count before bulk delete
3. **Small Batches**: For large operations (100+ items), consider smaller batches
4. **Test First**: Try actions on single item to verify behavior

### Example Workflows:

**Publish New Collection**:
1. Search for items by tag or brand
2. Click "Select all"
3. Click "Publish All"
4. Clear selection

**Seasonal Cleanup**:
1. Search for outdated items
2. Select items to remove
3. Click "Unpublish All" or "Delete All"
4. Confirm action

**Feature Toggle**:
1. Select all featured items
2. Click "Unpublish All" 
3. Select new items
4. Click "Publish All"

---

## 🔗 API Endpoints

### Authentication Endpoints

```typescript
POST /admin/auth/login
Body: { email: string, password: string }
Returns: { token: string, user: AdminUser, expiresIn: number }

POST /admin/auth/logout
Headers: { Authorization: Bearer <token> }
Returns: void
```

### Product Endpoints

```typescript
// Create
POST /admin/products
Headers: { Authorization: Bearer <token> }
Body: CreateProductDto
Returns: Product

// Update
PUT /admin/products/:id
Headers: { Authorization: Bearer <token> }
Body: UpdateProductDto
Returns: Product

// Delete
DELETE /admin/products/:id
Headers: { Authorization: Bearer <token> }
Returns: void

// Publish/Unpublish
PATCH /admin/products/:id/publish
Headers: { Authorization: Bearer <token> }
Body: { publish: boolean }
Returns: Product
```

### Moodboard Endpoints

```typescript
// Create
POST /admin/moodboards
Headers: { Authorization: Bearer <token> }
Body: CreateMoodboardDto
Returns: Moodboard

// Update
PUT /admin/moodboards/:id
Headers: { Authorization: Bearer <token> }
Body: UpdateMoodboardDto
Returns: Moodboard

// Delete
DELETE /admin/moodboards/:id
Headers: { Authorization: Bearer <token> }
Returns: void

// Publish/Unpublish
PATCH /admin/moodboards/:id/publish
Headers: { Authorization: Bearer <token> }
Body: { publish: boolean }
Returns: Moodboard
```

---

## 🛠 Technical Implementation

### File Structure

```
src/
├── types/
│   └── admin.types.ts              # Admin-specific TypeScript types
├── store/
│   └── auth-store.ts               # Zustand auth state with persistence
├── services/
│   └── api/
│       └── admin.api.ts            # Admin API service (auth, CRUD)
├── lib/
│   └── trusted-retailers.ts        # Retailers management utilities
├── components/
│   └── admin/
│       ├── ProtectedRoute.tsx      # Route protection HOC
│       └── AdminHeader.tsx         # Admin navigation header
└── pages/
    └── admin/
        ├── AdminLoginPage.tsx      # Login form
        ├── AdminDashboard.tsx      # Stats and overview
        ├── AdminProductsPage.tsx   # Products list
        ├── AdminProductForm.tsx    # Create/edit product
        ├── AdminMoodboardsPage.tsx # Moodboards list
        ├── AdminMoodboardForm.tsx  # Create/edit moodboard
        └── AdminRetailersPage.tsx  # Trusted retailers management
```

### State Management

**Auth Store** (`auth-store.ts`):
```typescript
interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
  updateUser: (user: AdminUser) => void;
}
```

**Persistence**:
- Uses Zustand persist middleware
- Stores in localStorage under `admin-auth-storage`
- Auto-hydrates on page refresh

### Type Definitions

**Admin Types** (`admin.types.ts`):
```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

interface CreateProductDto {
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string;
  affiliateUrl: string;
  brand?: string;
  tags?: string[];
  category?: string;
  description?: string;
  isFeatured?: boolean;
}

interface CreateMoodboardDto {
  title: string;
  slug: string;
  description?: string;
  coverImage: string;
  productIds: string[];
  tags?: string[];
  isFeatured?: boolean;
  stylingTips?: string[];
  howToWear?: string;
}
```

---

## 🔒 Security Features

1. **JWT Authentication**
   - Secure token-based authentication
   - Token expiration (1 hour)
   - Automatic logout on expiry

2. **Protected Routes**
   - All admin routes require authentication
   - Automatic redirect to login if not authenticated
   - Token validation on protected route access

3. **HTTPS Enforcement**
   - All admin API calls use HTTPS
   - Secure token transmission

4. **CORS Configuration**
   - Backend should whitelist admin domains
   - Token validation on every request

5. **Input Validation**
   - Required field validation
   - URL validation for images and affiliate links
   - Slug format validation

---

## 📱 Responsive Design

**Mobile Support**:
- Touch-optimized buttons (≥44px)
- Responsive grid layouts
- Mobile-friendly forms
- Hamburger menu for navigation (coming soon)

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎨 UI Components

**Used shadcn/ui Components**:
- Button
- Input
- Textarea
- Label
- Card
- Checkbox
- Badge
- Dropdown Menu
- Toast notifications

**Custom Components**:
- AdminHeader (navigation)
- ProtectedRoute (auth wrapper)

---

## 🚀 Getting Started

### 1. Access Admin Portal

Navigate to: `https://yourdomain.com/admin/login`

### 2. Login

Use demo credentials:
- Email: `admin@lookbook.com`
- Password: `admin123`

### 3. Create Your First Product

1. Go to Dashboard → Products → "New Product"
2. Fill in required fields (name, slug, image, affiliate URL)
3. Add optional details (brand, price, category, description, tags)
4. Check "Featured" if you want it on homepage
5. Click "Create Product"

### 4. Create Your First Moodboard

1. Go to Dashboard → Moodboards → "New Moodboard"
2. Enter title, slug, cover image
3. Add description and styling tips
4. Search and select products (right panel)
5. Add tags for discoverability
6. Click "Create Moodboard"

### 5. Publish Content

- Toggle featured status using the dropdown menu
- Published items appear in featured sections on homepage
- Unpublished items are hidden from featured but remain searchable

---

## 🔄 Real API Integration

### Current Status: Mock Mode

The admin portal currently uses **mock implementations** for demonstration.

### To Enable Real API:

1. **Update API endpoints** in `admin.api.ts`:
   ```typescript
   // Replace mock implementations with:
   return apiClient.post<Product>('/admin/products', data, {
     headers: { Authorization: `Bearer ${token}` }
   });
   ```

2. **Configure backend URLs** in `.env`:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

3. **Implement backend endpoints** (see API spec):
   - POST `/admin/auth/login`
   - POST `/admin/products`
   - PUT `/admin/products/:id`
   - DELETE `/admin/products/:id`
   - PATCH `/admin/products/:id/publish`
   - POST `/admin/moodboards`
   - PUT `/admin/moodboards/:id`
   - DELETE `/admin/moodboards/:id`
   - PATCH `/admin/moodboards/:id/publish`

4. **JWT token verification** on backend:
   - Validate token on every protected route
   - Return 401 if invalid/expired
   - Extract user info from token

---

## 🎯 Best Practices

1. **Content Creation**
   - Use high-quality images (Unsplash recommended)
   - Write SEO-friendly descriptions
   - Use relevant tags for discoverability
   - Set appropriate categories

2. **Moodboard Curation**
   - Select 4-8 products per moodboard
   - Choose products with cohesive aesthetic
   - Write detailed styling tips
   - Use descriptive titles

3. **Publishing Strategy**
   - Feature your best content on homepage
   - Rotate featured items regularly
   - Keep unpublished drafts for preparation
   - Preview before publishing

4. **SEO Optimization**
   - Use descriptive slugs
   - Write compelling descriptions
   - Add relevant tags
   - Include brand names

---

## 🐛 Troubleshooting

### Cannot Login
- Check demo credentials are correct
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### Token Expired
- Login again to get new token
- Token expires after 1 hour

### Products Not Saving
- Ensure all required fields are filled
- Check image URLs are valid
- Check affiliate URLs are valid
- View console for validation errors

### Images Not Loading
- Verify image URL is accessible
- Use HTTPS URLs only
- Test URL in browser first
- Check CORS policy

---

## 📈 Future Enhancements

**Completed Features**:
- [x] **Bulk operations** (multi-select, bulk publish/unpublish/delete) ✅
- [x] **Image upload to cloud storage** (Devv SDK) ✅
- [x] **Auto blurhash generation** (client-side, automatic) ✅

**Planned Features**:
- [ ] User roles (admin, editor, viewer)
- [ ] Audit logs for all changes
- [ ] Analytics dashboard
- [ ] Draft/published workflow
- [ ] Version history
- [ ] Scheduled publishing
- [ ] Media library
- [ ] Content preview mode

---

## 📞 Support

For technical issues or questions:
- Check browser console for errors
- Review API responses in Network tab
- Verify JWT token is being sent
- Check backend logs for auth failures

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Admin Portal**: Production Ready ✅
