# Admin API - Quick Reference Guide

**Quick access to all admin backend routes, request/response bodies**

Full documentation: [ADMIN_BACKEND_SPEC.md](./ADMIN_BACKEND_SPEC.md)

---

## 🔐 Authentication

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "admin@lookbook.com",
  "password": "admin123"
}
```

**Response:**
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

### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

### Validate Token
```
GET /auth/validate
Authorization: Bearer <token>
```

---

## 🛍️ Products Admin

### Create Product
```
POST /admin/products
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://cdn.example.com/trench.jpg",
  "affiliateUrl": "https://partner.com/trench",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat...",
  "tags": ["classic", "minimalist", "timeless"],
  "isFeatured": true
}
```

**Response:** `201 Created` - Returns created product with ID

### Update Product
```
PUT /admin/products/{id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "id": "prod_001",
  "price": 420.00,
  "isFeatured": false
}
```

**Response:** `200 OK` - Returns updated product

### Delete Product
```
DELETE /admin/products/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Publish/Unpublish Product
```
POST /admin/products/{id}/publish
Authorization: Bearer <token>
```

**Request:**
```json
{
  "publish": true
}
```

**Response:** `200 OK` - Returns updated product

---

## 🎨 Moodboards Admin

### Create Moodboard
```
POST /admin/moodboards
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks...",
  "coverImage": "https://cdn.example.com/parisian.jpg",
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "tags": ["elegant", "french", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair the trench coat with tailored trousers",
    "Add a silk scarf for an authentic touch"
  ],
  "howToWear": "Perfect for spring and fall transitions..."
}
```

**Response:** `201 Created` - Returns created moodboard with products

### Update Moodboard
```
PUT /admin/moodboards/{id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "id": "mood_001",
  "title": "Updated Parisian Style",
  "productIds": ["prod_001", "prod_003"],
  "isFeatured": false
}
```

**Response:** `200 OK` - Returns updated moodboard

### Delete Moodboard
```
DELETE /admin/moodboards/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Publish/Unpublish Moodboard
```
POST /admin/moodboards/{id}/publish
Authorization: Bearer <token>
```

**Request:**
```json
{
  "publish": true
}
```

**Response:** `200 OK` - Returns updated moodboard

---

## 📦 Bulk Operations

### Bulk Publish Products
```
POST /admin/products/bulk/publish
Authorization: Bearer <token>
```

**Request:**
```json
{
  "productIds": ["prod_001", "prod_002", "prod_005"],
  "publish": true
}
```

**Response:**
```json
{
  "success": true,
  "updated": 3,
  "failed": 0
}
```

### Bulk Delete Products
```
POST /admin/products/bulk/delete
Authorization: Bearer <token>
```

**Request:**
```json
{
  "productIds": ["prod_001", "prod_002"]
}
```

**Response:**
```json
{
  "success": true,
  "deleted": 2,
  "failed": 0
}
```

---

## 📊 Dashboard

### Get Statistics
```
GET /admin/stats
Authorization: Bearer <token>
```

**Response:**
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
  }
}
```

---

## 📸 Image Upload

### Upload Image
```
POST /admin/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <binary_image_data>
type: product | moodboard
```

**Response:**
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
  expiresIn: number;
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

interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}
```

### Moodboards
```typescript
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

interface UpdateMoodboardDto extends Partial<CreateMoodboardDto> {
  id: string;
}
```

### Publish
```typescript
interface PublishOptions {
  publish: boolean;
}
```

---

## 🚨 Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Missing/invalid token |
| 401 | TOKEN_EXPIRED | JWT expired |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 404 | NOT_FOUND | Resource doesn't exist |
| 409 | DUPLICATE_SLUG | Slug already exists |
| 409 | PRODUCT_IN_USE | Can't delete (used in moodboards) |
| 413 | FILE_TOO_LARGE | Upload exceeds 5MB |
| 500 | INTERNAL_ERROR | Server error |

---

## 🔗 All Endpoints Summary

### Authentication (3)
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/validate` - Validate token

### Products (5)
- `POST /admin/products` - Create
- `PUT /admin/products/{id}` - Update
- `DELETE /admin/products/{id}` - Delete
- `POST /admin/products/{id}/publish` - Publish/unpublish
- `POST /admin/products/bulk/publish` - Bulk publish
- `POST /admin/products/bulk/delete` - Bulk delete

### Moodboards (5)
- `POST /admin/moodboards` - Create
- `PUT /admin/moodboards/{id}` - Update
- `DELETE /admin/moodboards/{id}` - Delete
- `POST /admin/moodboards/{id}/publish` - Publish/unpublish
- `POST /admin/moodboards/bulk/publish` - Bulk publish
- `POST /admin/moodboards/bulk/delete` - Bulk delete

### Utilities (2)
- `GET /admin/stats` - Dashboard statistics
- `POST /admin/upload/image` - Upload image

**Total: 15 Admin Endpoints**

---

## 🔐 Security Notes

- **JWT Expiration:** 1 hour (3600 seconds)
- **Rate Limiting:** 300 requests per 15 minutes
- **Upload Limit:** 200 files per day
- **Password Hashing:** bcrypt (10+ rounds)
- **Token Storage:** localStorage or httpOnly cookie
- **CORS:** Restrict to authorized admin domains

---

**Full Documentation:** [ADMIN_BACKEND_SPEC.md](./ADMIN_BACKEND_SPEC.md) (11,000+ words, complete with cURL examples, frontend integration, implementation checklist)
