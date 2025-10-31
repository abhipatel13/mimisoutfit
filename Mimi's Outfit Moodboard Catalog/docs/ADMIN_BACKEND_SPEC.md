# Admin Portal Backend API Specification

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Base URL:** `https://api.thelookbookbymimi.com/v1`

---

## Overview

This document provides the complete REST API specification for the admin portal backend. All admin endpoints require JWT authentication via Bearer token in the Authorization header.

### Authentication Header

All admin endpoints (except login) require:

```
Authorization: Bearer <jwt_token>
```

### Response Format

**Success Response:**
```json
{
  "data": {...}  // Single object or array
}
```

**Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional
  }
}
```

---

## Authentication Endpoints

### 1. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate admin user and receive JWT token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@lookbook.com",
  "password": "admin123"
}
```

**TypeScript Interface:**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Response:** `200 OK`
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

**TypeScript Interface:**
```typescript
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
    createdAt: string;
  };
  expiresIn: number; // seconds (3600 = 1 hour)
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid credentials
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

- `400 Bad Request` - Missing fields
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lookbook.com",
    "password": "admin123"
  }'
```

---

### 2. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate current JWT token (optional - frontend can just delete token).

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** None (empty body)

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Validate Token

**Endpoint:** `GET /auth/validate`

**Description:** Check if JWT token is still valid.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
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

**Error Response:** `401 Unauthorized`
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired"
  }
}
```

---

## Products CRUD Endpoints

### 4. Create Product

**Endpoint:** `POST /admin/products`

**Description:** Create a new product.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
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
  "description": "Timeless beige trench coat perfect for spring and fall. Features classic double-breasted design with belted waist.",
  "tags": ["classic", "minimalist", "timeless", "versatile"],
  "isFeatured": true
}
```

**TypeScript Interface:**
```typescript
interface CreateProductDto {
  name: string;              // Required
  slug: string;              // Required (URL-friendly)
  price: number | null;      // Required (null if price not available)
  imageUrl: string;          // Required
  affiliateUrl: string;      // Required
  brand?: string;            // Optional
  tags?: string[];           // Optional
  category?: string;         // Optional
  description?: string;      // Optional
  isFeatured?: boolean;      // Optional (default: false)
}
```

**Response:** `201 Created`
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
  "description": "Timeless beige trench coat...",
  "tags": ["classic", "minimalist", "timeless", "versatile"],
  "isFeatured": true,
  "createdAt": "2024-01-21T14:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
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

- `409 Conflict` - Slug already exists
```json
{
  "error": {
    "code": "DUPLICATE_SLUG",
    "message": "A product with this slug already exists"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/admin/products \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic Trench Coat",
    "slug": "classic-trench-coat",
    "price": 450.00,
    "imageUrl": "https://cdn.example.com/trench-coat.jpg",
    "affiliateUrl": "https://partner.com/trench-coat",
    "brand": "Burberry",
    "category": "outerwear",
    "tags": ["classic", "minimalist"],
    "isFeatured": true
  }'
```

---

### 5. Update Product

**Endpoint:** `PUT /admin/products/{id}`

**Description:** Update an existing product. All fields are optional except `id`.

**Path Parameters:**
- `id` (string, required) - Product ID (e.g., `prod_001`)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

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

**TypeScript Interface:**
```typescript
interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string; // Required
}
```

**Response:** `200 OK`
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

**Error Responses:**

- `404 Not Found` - Product doesn't exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

- `409 Conflict` - Slug already exists (if slug is being changed)
```json
{
  "error": {
    "code": "DUPLICATE_SLUG",
    "message": "Another product with this slug already exists"
  }
}
```

**Example cURL:**
```bash
curl -X PUT https://api.thelookbookbymimi.com/v1/admin/products/prod_001 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prod_001",
    "price": 420.00,
    "isFeatured": false
  }'
```

---

### 6. Delete Product

**Endpoint:** `DELETE /admin/products/{id}`

**Description:** Permanently delete a product.

**Path Parameters:**
- `id` (string, required) - Product ID (e.g., `prod_001`)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** None

**Response:** `204 No Content`
```
(Empty response body)
```

**Error Responses:**

- `404 Not Found` - Product doesn't exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

- `409 Conflict` - Product is used in moodboards
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

**Example cURL:**
```bash
curl -X DELETE https://api.thelookbookbymimi.com/v1/admin/products/prod_001 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 7. Publish/Unpublish Product

**Endpoint:** `POST /admin/products/{id}/publish`

**Description:** Toggle product featured status (publish/unpublish).

**Path Parameters:**
- `id` (string, required) - Product ID

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "publish": true
}
```

**TypeScript Interface:**
```typescript
interface PublishOptions {
  publish: boolean; // true = publish, false = unpublish
}
```

**Response:** `200 OK`
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

**Example cURL:**
```bash
# Publish product
curl -X POST https://api.thelookbookbymimi.com/v1/admin/products/prod_001/publish \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"publish": true}'

# Unpublish product
curl -X POST https://api.thelookbookbymimi.com/v1/admin/products/prod_001/publish \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"publish": false}'
```

---

## Moodboards CRUD Endpoints

### 8. Create Moodboard

**Endpoint:** `POST /admin/moodboards`

**Description:** Create a new moodboard with products.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks that capture the essence of Parisian style.",
  "coverImage": "https://cdn.example.com/parisian-chic.jpg",
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair the trench coat with tailored trousers",
    "Add a silk scarf for an authentic touch",
    "Keep accessories minimal"
  ],
  "howToWear": "Perfect for spring and fall transitions. Layer the trench over simple basics for an elevated everyday look."
}
```

**TypeScript Interface:**
```typescript
interface CreateMoodboardDto {
  title: string;           // Required
  slug: string;            // Required (URL-friendly)
  description?: string;    // Optional
  coverImage: string;      // Required
  productIds: string[];    // Required (array of product IDs)
  tags?: string[];         // Optional
  isFeatured?: boolean;    // Optional (default: false)
  stylingTips?: string[];  // Optional
  howToWear?: string;      // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Parisian Chic",
  "description": "Effortlessly chic French-inspired looks...",
  "coverImage": "https://cdn.example.com/parisian-chic.jpg",
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair the trench coat with tailored trousers",
    "Add a silk scarf for an authentic touch",
    "Keep accessories minimal"
  ],
  "howToWear": "Perfect for spring and fall transitions...",
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

**Error Responses:**

- `400 Bad Request` - Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Moodboard title is required"
  }
}
```

- `404 Not Found` - Invalid product IDs
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

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/admin/moodboards \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Parisian Chic",
    "slug": "parisian-chic",
    "coverImage": "https://cdn.example.com/parisian.jpg",
    "productIds": ["prod_001", "prod_002"],
    "tags": ["elegant"],
    "isFeatured": true
  }'
```

---

### 9. Update Moodboard

**Endpoint:** `PUT /admin/moodboards/{id}`

**Description:** Update an existing moodboard. All fields optional except `id`.

**Path Parameters:**
- `id` (string, required) - Moodboard ID (e.g., `mood_001`)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "mood_001",
  "title": "Updated Parisian Style",
  "productIds": ["prod_001", "prod_003", "prod_007"],
  "isFeatured": false
}
```

**TypeScript Interface:**
```typescript
interface UpdateMoodboardDto extends Partial<CreateMoodboardDto> {
  id: string; // Required
}
```

**Response:** `200 OK`
```json
{
  "id": "mood_001",
  "slug": "parisian-chic",
  "title": "Updated Parisian Style",
  "description": "Effortlessly chic French-inspired looks...",
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

**Error Responses:**

- `404 Not Found` - Moodboard doesn't exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Moodboard not found"
  }
}
```

**Example cURL:**
```bash
curl -X PUT https://api.thelookbookbymimi.com/v1/admin/moodboards/mood_001 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mood_001",
    "isFeatured": false
  }'
```

---

### 10. Delete Moodboard

**Endpoint:** `DELETE /admin/moodboards/{id}`

**Description:** Permanently delete a moodboard.

**Path Parameters:**
- `id` (string, required) - Moodboard ID

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** None

**Response:** `204 No Content`
```
(Empty response body)
```

**Error Responses:**

- `404 Not Found` - Moodboard doesn't exist
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Moodboard not found"
  }
}
```

**Example cURL:**
```bash
curl -X DELETE https://api.thelookbookbymimi.com/v1/admin/moodboards/mood_001 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 11. Publish/Unpublish Moodboard

**Endpoint:** `POST /admin/moodboards/{id}/publish`

**Description:** Toggle moodboard featured status.

**Path Parameters:**
- `id` (string, required) - Moodboard ID

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "publish": true
}
```

**Response:** `200 OK`
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

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/admin/moodboards/mood_001/publish \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"publish": true}'
```

---

## Bulk Operations Endpoints (Optional)

### 12. Bulk Publish Products

**Endpoint:** `POST /admin/products/bulk/publish`

**Description:** Publish or unpublish multiple products at once.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "publish": true
}
```

**Response:** `200 OK`
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

### 13. Bulk Delete Products

**Endpoint:** `POST /admin/products/bulk/delete`

**Description:** Delete multiple products at once.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productIds": ["prod_001", "prod_002", "prod_005"]
}
```

**Response:** `200 OK`
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

## Admin Statistics Endpoints

### 14. Get Dashboard Statistics

**Endpoint:** `GET /admin/stats`

**Description:** Get overview statistics for admin dashboard.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
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

## Image Upload Endpoint

### 15. Upload Image

**Endpoint:** `POST /admin/upload/image`

**Description:** Upload product or moodboard image.

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: <binary_image_data>
type: product | moodboard
```

**Response:** `200 OK`
```json
{
  "url": "https://cdn.example.com/uploads/prod_12345.jpg",
  "filename": "prod_12345.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

**Validation:**
- Max file size: 5MB
- Allowed types: JPG, PNG, WebP, GIF
- Image dimensions: Min 400x400px, Max 4000x4000px

**Error Responses:**

- `400 Bad Request` - Invalid file
```json
{
  "error": {
    "code": "INVALID_FILE",
    "message": "File must be an image (JPG, PNG, WebP, or GIF)"
  }
}
```

- `413 Payload Too Large` - File too big
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://api.thelookbookbymimi.com/v1/admin/upload/image \
  -H "Authorization: Bearer <jwt_token>" \
  -F "file=@/path/to/image.jpg" \
  -F "type=product"
```

---

## Complete API Endpoints Summary

### Authentication (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/logout` | Logout (invalidate token) |
| GET | `/auth/validate` | Validate JWT token |

### Products Admin (5 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products` | Create new product |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |
| POST | `/admin/products/{id}/publish` | Publish/unpublish product |
| POST | `/admin/products/bulk/publish` | Bulk publish/unpublish |
| POST | `/admin/products/bulk/delete` | Bulk delete |

### Moodboards Admin (5 endpoints)
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

---

## Error Codes Reference

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

## Security & Best Practices

### JWT Token Management
- **Token Expiration:** 1 hour (3600 seconds)
- **Refresh Strategy:** Frontend should refresh token before expiry or redirect to login
- **Storage:** Store token in localStorage or httpOnly cookie
- **Header Format:** `Authorization: Bearer <token>`

### Rate Limiting
- **Admin Endpoints:** 300 requests per 15 minutes per token
- **Upload Endpoint:** 200 uploads per day per token

### CORS Configuration
- Admin endpoints should only accept requests from authorized admin domains
- Proper CORS headers for preflight requests

### Input Validation
- All text inputs sanitized to prevent XSS
- SQL injection prevention with parameterized queries
- File upload validation (type, size, dimensions)

### Password Security
- Passwords hashed with bcrypt (10 rounds minimum)
- Never return password hashes in API responses
- Implement rate limiting on login endpoint (5 attempts per 15 min)

---

## Implementation Checklist

### Phase 1: Authentication (1-2 days)
- [ ] Implement JWT generation and verification
- [ ] Create admin user table in database
- [ ] Build login endpoint with bcrypt password hashing
- [ ] Build token validation middleware
- [ ] Implement logout (optional - token blacklist)
- [ ] Add rate limiting on login endpoint

### Phase 2: Products CRUD (2-3 days)
- [ ] Create product endpoints (POST, PUT, DELETE)
- [ ] Implement publish/unpublish endpoint
- [ ] Add validation for all product fields
- [ ] Handle duplicate slug errors
- [ ] Check product usage before deletion
- [ ] Implement bulk operations (optional)

### Phase 3: Moodboards CRUD (2-3 days)
- [ ] Create moodboard endpoints (POST, PUT, DELETE)
- [ ] Implement product relationship handling
- [ ] Implement publish/unpublish endpoint
- [ ] Add validation for all moodboard fields
- [ ] Implement bulk operations (optional)

### Phase 4: Image Upload (1-2 days)
- [ ] Set up image storage (S3 or CDN)
- [ ] Implement multipart/form-data handling
- [ ] Add file validation (type, size, dimensions)
- [ ] Generate unique filenames
- [ ] Implement image optimization (optional)

### Phase 5: Testing & Documentation (1-2 days)
- [ ] Unit tests for all endpoints
- [ ] Integration tests
- [ ] Postman collection
- [ ] API documentation
- [ ] Error handling tests

**Total Timeline:** 7-12 days

---

## Testing with cURL

### Full Authentication Flow
```bash
# 1. Login
TOKEN=$(curl -s -X POST https://api.thelookbookbymimi.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lookbook.com", "password": "admin123"}' \
  | jq -r '.token')

# 2. Create Product
curl -X POST https://api.thelookbookbymimi.com/v1/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "price": 100,
    "imageUrl": "https://example.com/image.jpg",
    "affiliateUrl": "https://example.com/buy",
    "isFeatured": true
  }'

# 3. Validate Token
curl -X GET https://api.thelookbookbymimi.com/v1/auth/validate \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST https://api.thelookbookbymimi.com/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Integration Example

```typescript
// Admin API Client
import axios from 'axios';

const API_BASE_URL = 'https://api.thelookbookbymimi.com/v1';

class AdminApiClient {
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    this.token = response.data.token;
    localStorage.setItem('admin_token', this.token);
    return response.data;
  }

  async createProduct(data: CreateProductDto) {
    return axios.post(`${API_BASE_URL}/admin/products`, data, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  async publishProduct(id: string, publish: boolean) {
    return axios.post(
      `${API_BASE_URL}/admin/products/${id}/publish`,
      { publish },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }
}

export const adminApi = new AdminApiClient();
```

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Maintained by:** The Lookbook Backend Team
