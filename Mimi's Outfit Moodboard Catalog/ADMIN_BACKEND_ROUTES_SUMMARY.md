# Admin Backend Routes - Complete Summary

**All admin backend routes, request bodies, and response bodies for The Lookbook by Mimi**

This document provides a complete overview of all admin portal backend API routes based on the current frontend implementation.

---

## 📚 Documentation Links

### Complete Specifications
- **[docs/ADMIN_BACKEND_SPEC.md](./docs/ADMIN_BACKEND_SPEC.md)** - Full 11,000+ word specification with cURL examples, TypeScript interfaces, implementation checklist
- **[docs/ADMIN_API_QUICK_REFERENCE.md](./docs/ADMIN_API_QUICK_REFERENCE.md)** - Quick reference guide with all endpoints

### Frontend Implementation
- **[src/services/api/admin.api.ts](./src/services/api/admin.api.ts)** - Admin API service client
- **[src/types/admin.types.ts](./src/types/admin.types.ts)** - TypeScript type definitions

---

## 🎯 Base Configuration

**Base URL:** `https://api.thelookbookbymimi.com/v1`

**Environment Variable:**
```bash
VITE_API_BASE_URL=https://api.thelookbookbymimi.com/v1
```

**Authentication:** JWT Bearer Token
```
Authorization: Bearer <jwt_token>
```

**User Identification:** 🆕 Unique GUID (always included)
```
X-User-ID: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
```

**Demo Credentials:**
```
Email: admin@lookbook.com
Password: admin123
```

---

## 🔐 Authentication Routes (1 Endpoint)

### 1. POST /auth/login
**Purpose:** Authenticate admin user and receive JWT token

**Request Body:**
```json
{
  "email": "admin@lookbook.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin@lookbook.com",
    "name": "Mimi Admin",
    "role": "admin",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "expiresIn": 3600
}
```

**Error (401 Unauthorized):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### 2. POST /auth/logout
**Purpose:** Invalidate current JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** None (empty)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 3. GET /auth/validate
**Purpose:** Check if JWT token is still valid

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "admin-001",
    "email": "admin@lookbook.com",
    "name": "Mimi Admin",
    "role": "admin"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired"
  }
}
```

---

## 🛍️ Products CRUD Routes (5 Endpoints)

### 4. POST /admin/products
**Purpose:** Create a new product

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://cdn.example.com/trench-coat.jpg",
  "affiliateUrl": "https://partner.com/trench-coat",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat perfect for all seasons",
  "tags": ["classic", "minimalist", "timeless", "versatile"],
  "isFeatured": true
}
```

**Response (201 Created):**
```json
{
  "id": "prod_001",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://cdn.example.com/trench-coat.jpg",
  "affiliateUrl": "https://partner.com/trench-coat",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat perfect for all seasons",
  "tags": ["classic", "minimalist", "timeless", "versatile"],
  "isFeatured": true,
  "createdAt": "2024-01-21T14:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product name is required",
    "details": {
      "field": "name"
    }
  }
}
```

**Error (409 Conflict):**
```json
{
  "error": {
    "code": "DUPLICATE_SLUG",
    "message": "A product with this slug already exists"
  }
}
```

---

### 5. PUT /admin/products/{id}
**Purpose:** Update an existing product (all fields optional except id)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required) - Product ID (e.g., `prod_001`)

**Request Body:**
```json
{
  "id": "prod_001",
  "name": "Updated Trench Coat",
  "price": 420.00,
  "tags": ["classic", "sale"],
  "isFeatured": false
}
```

**Response (200 OK):**
```json
{
  "id": "prod_001",
  "name": "Updated Trench Coat",
  "slug": "classic-trench-coat",
  "price": 420.00,
  "imageUrl": "https://cdn.example.com/trench-coat.jpg",
  "affiliateUrl": "https://partner.com/trench-coat",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat...",
  "tags": ["classic", "sale"],
  "isFeatured": false,
  "createdAt": "2024-01-21T14:30:00Z"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

### 6. DELETE /admin/products/{id}
**Purpose:** Permanently delete a product

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, required) - Product ID

**Response (204 No Content):**
```
(Empty response body)
```

**Error (409 Conflict):**
```json
{
  "error": {
    "code": "PRODUCT_IN_USE",
    "message": "Cannot delete product that is used in moodboards",
    "details": {
      "moodboards": ["mood_001", "mood_003"]
    }
  }
}
```

---

### 7. POST /admin/products/{id}/publish
**Purpose:** Publish or unpublish a product (toggle featured status)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required) - Product ID

**Request Body:**
```json
{
  "publish": true
}
```

**Response (200 OK):**
```json
{
  "id": "prod_001",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://cdn.example.com/trench-coat.jpg",
  "affiliateUrl": "https://partner.com/trench-coat",
  "brand": "Burberry",
  "category": "outerwear",
  "tags": ["classic"],
  "isFeatured": true,
  "createdAt": "2024-01-21T14:30:00Z"
}
```

---

### 8. POST /admin/products/bulk/publish
**Purpose:** Publish or unpublish multiple products at once

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "publish": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated": 3,
  "failed": 0,
  "results": [
    {
      "id": "prod_001",
      "success": true
    },
    {
      "id": "prod_002",
      "success": true
    },
    {
      "id": "prod_005",
      "success": true
    }
  ]
}
```

---

### 9. POST /admin/products/bulk/delete
**Purpose:** Delete multiple products at once

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["prod_001", "prod_002", "prod_005"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "deleted": 3,
  "failed": 0,
  "results": [
    {
      "id": "prod_001",
      "success": true
    },
    {
      "id": "prod_002",
      "success": true
    },
    {
      "id": "prod_005",
      "success": true
    }
  ]
}
```

---

## 🎨 Moodboards CRUD Routes (5 Endpoints)

### 10. POST /admin/moodboards
**Purpose:** Create a new moodboard with products

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks",
  "coverImage": "https://cdn.example.com/parisian-chic.jpg",
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair the trench coat with tailored trousers",
    "Add a silk scarf for an authentic touch",
    "Keep accessories minimal"
  ],
  "howToWear": "Perfect for spring and fall transitions"
}
```

**Response (201 Created):**
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "description": "Effortlessly chic French-inspired looks",
  "coverImage": "https://cdn.example.com/parisian-chic.jpg",
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [...],
  "howToWear": "Perfect for spring and fall transitions",
  "products": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "price": 450.00,
      "imageUrl": "https://cdn.example.com/trench-coat.jpg",
      "affiliateUrl": "https://partner.com/trench-coat",
      "brand": "Burberry",
      "category": "outerwear",
      "tags": ["classic"],
      "isFeatured": true,
      "createdAt": "2024-01-21T14:30:00Z"
    }
  ],
  "createdAt": "2024-01-22T10:00:00Z",
  "updatedAt": "2024-01-22T10:00:00Z"
}
```

**Error (404 Not Found):**
```json
{
  "error": {
    "code": "INVALID_PRODUCTS",
    "message": "One or more product IDs are invalid",
    "details": {
      "invalidIds": ["prod_999"]
    }
  }
}
```

---

### 11. PUT /admin/moodboards/{id}
**Purpose:** Update an existing moodboard

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required) - Moodboard ID

**Request Body:**
```json
{
  "id": "mood_001",
  "title": "Updated Parisian Style",
  "productIds": ["prod_001", "prod_003", "prod_007"],
  "isFeatured": false
}
```

**Response (200 OK):**
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Updated Parisian Style",
  "description": "Effortlessly chic French-inspired looks",
  "coverImage": "https://cdn.example.com/parisian-chic.jpg",
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": false,
  "stylingTips": [...],
  "howToWear": "...",
  "products": [...],
  "createdAt": "2024-01-22T10:00:00Z",
  "updatedAt": "2024-01-23T15:20:00Z"
}
```

---

### 12. DELETE /admin/moodboards/{id}
**Purpose:** Permanently delete a moodboard

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (string, required) - Moodboard ID

**Response (204 No Content):**
```
(Empty response body)
```

---

### 13. POST /admin/moodboards/{id}/publish
**Purpose:** Publish or unpublish a moodboard

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required) - Moodboard ID

**Request Body:**
```json
{
  "publish": true
}
```

**Response (200 OK):**
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "coverImage": "https://cdn.example.com/parisian.jpg",
  "products": [...],
  "isFeatured": true,
  "createdAt": "2024-01-22T10:00:00Z",
  "updatedAt": "2024-01-23T16:00:00Z"
}
```

---

### 14. POST /admin/moodboards/bulk/publish
**Purpose:** Publish or unpublish multiple moodboards

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "moodboardIds": ["mood_001", "mood_002", "mood_005"],
  "publish": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated": 3,
  "failed": 0
}
```

---

### 15. POST /admin/moodboards/bulk/delete
**Purpose:** Delete multiple moodboards

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "moodboardIds": ["mood_001", "mood_002"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "deleted": 2,
  "failed": 0
}
```

---

## 📊 Utilities Routes (2 Endpoints)

### 16. GET /admin/stats
**Purpose:** Get dashboard statistics

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "products": {
    "total": 52,
    "published": 48,
    "unpublished": 4,
    "categories": 6,
    "brands": 15
  },
  "moodboards": {
    "total": 10,
    "published": 8,
    "unpublished": 2
  },
  "recent": {
    "lastProductUpdate": "2024-01-23T10:30:00Z",
    "lastMoodboardUpdate": "2024-01-22T15:45:00Z"
  }
}
```

---

### 17. POST /admin/upload/image
**Purpose:** Upload product or moodboard image

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <binary_image_data>
type: product | moodboard
```

**Response (200 OK):**
```json
{
  "url": "https://cdn.example.com/uploads/prod_12345.jpg",
  "filename": "prod_12345.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

**Constraints:**
- Max size: 5MB
- Formats: JPG, PNG, WebP, GIF
- Min dimensions: 400x400px
- Max dimensions: 4000x4000px

**Error (400 Bad Request):**
```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "File must be an image (JPG, PNG, WebP, or GIF)"
  }
}
```

**Error (413 Payload Too Large):**
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  }
}
```

---

## 📝 TypeScript Interfaces

### Authentication
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: AdminUser;
  expiresIn: number; // seconds
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}
```

### Products
```typescript
interface CreateProductDto {
  name: string;              // Required
  slug: string;              // Required (URL-friendly)
  price: number | null;      // Required
  imageUrl: string;          // Required
  affiliateUrl: string;      // Required
  brand?: string;            // Optional
  tags?: string[];           // Optional
  category?: string;         // Optional
  description?: string;      // Optional
  isFeatured?: boolean;      // Optional (default: false)
}

interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string; // Required
}
```

### Moodboards
```typescript
interface CreateMoodboardDto {
  title: string;           // Required
  slug: string;            // Required (URL-friendly)
  description?: string;    // Optional
  coverImage: string;      // Required
  productIds: string[];    // Required
  tags?: string[];         // Optional
  isFeatured?: boolean;    // Optional (default: false)
  stylingTips?: string[];  // Optional
  howToWear?: string;      // Optional
}

interface UpdateMoodboardDto extends Partial<CreateMoodboardDto> {
  id: string; // Required
}
```

### Publish
```typescript
interface PublishOptions {
  publish: boolean; // true = publish, false = unpublish
}
```

---

## 🔗 Complete Endpoints Summary

### Authentication (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/logout` | Logout (invalidate token) |
| GET | `/auth/validate` | Validate JWT token |

### Products Admin (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products` | Create new product |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |
| POST | `/admin/products/{id}/publish` | Publish/unpublish product |
| POST | `/admin/products/bulk/publish` | Bulk publish/unpublish |
| POST | `/admin/products/bulk/delete` | Bulk delete |

### Moodboards Admin (6 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/moodboards` | Create new moodboard |
| PUT | `/admin/moodboards/{id}` | Update moodboard |
| DELETE | `/admin/moodboards/{id}` | Delete moodboard |
| POST | `/admin/moodboards/{id}/publish` | Publish/unpublish moodboard |
| POST | `/admin/moodboards/bulk/publish` | Bulk publish/unpublish |
| POST | `/admin/moodboards/bulk/delete` | Bulk delete |

### Utilities (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Dashboard statistics |
| POST | `/admin/upload/image` | Upload image |

**Total: 15 Admin Endpoints**

- **Authentication:** 1 endpoint (login only)
- **Products CRUD:** 6 endpoints  
- **Moodboards CRUD:** 6 endpoints
- **Utilities:** 2 endpoints

**Note:** Logout and token validation are handled client-side only.

---

## 🚨 Error Codes Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 401 | `TOKEN_EXPIRED` | JWT token expired |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `DUPLICATE_SLUG` | Slug already exists |
| 409 | `PRODUCT_IN_USE` | Cannot delete (used in moodboards) |
| 413 | `FILE_TOO_LARGE` | Upload exceeds size limit |
| 500 | `INTERNAL_ERROR` | Server error |

---

## 🔐 Security Configuration

### JWT Token Management
- **Expiration:** 1 hour (3600 seconds)
- **Storage:** localStorage (key: `admin_token`)
- **Header Format:** `Authorization: Bearer <token>`
- **Refresh Strategy:** Redirect to login after expiration

### Rate Limiting
- **Admin Endpoints:** 300 requests per 15 minutes per token
- **Upload Endpoint:** 200 uploads per day per token
- **Login Endpoint:** 5 attempts per 15 minutes per IP

### Password Security
- **Hashing:** bcrypt (10+ rounds)
- **Demo Password:** `admin123` (change in production!)
- **Never expose:** Password hashes in API responses

### CORS Configuration
- **Admin domains only:** Restrict to authorized admin URLs
- **Credentials:** Support for cookies if needed

---

## 📚 Additional Resources

### Complete Documentation
- **[docs/ADMIN_BACKEND_SPEC.md](./docs/ADMIN_BACKEND_SPEC.md)** - Full specification (11,000+ words)
  - All endpoints with cURL examples
  - Frontend integration examples
  - Implementation checklist (7-12 days)
  - Testing strategies
  - Production deployment guide

- **[docs/ADMIN_API_QUICK_REFERENCE.md](./docs/ADMIN_API_QUICK_REFERENCE.md)** - Quick reference guide

### Frontend Implementation
- **[src/services/api/admin.api.ts](./src/services/api/admin.api.ts)** - API client implementation
- **[src/store/auth-store.ts](./src/store/auth-store.ts)** - Authentication state management
- **[docs/ADMIN_PORTAL_GUIDE.md](./docs/ADMIN_PORTAL_GUIDE.md)** - Complete admin portal guide

### Backend Implementation
- **[docs/BACKEND_IMPLEMENTATION_CHECKLIST.md](./docs/BACKEND_IMPLEMENTATION_CHECKLIST.md)** - Step-by-step build guide
- **[docs/DATABASE_SCHEMAS.md](./docs/DATABASE_SCHEMAS.md)** - Database schemas

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Current API Mode:** Mock (switch to 'real' via VITE_API_MODE environment variable)
