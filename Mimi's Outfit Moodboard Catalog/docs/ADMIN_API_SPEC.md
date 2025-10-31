# Admin API Specification

Complete API specification for The Lookbook by Mimi Admin Portal backend endpoints.

---

## 🔐 Authentication

### POST /admin/auth/login

Authenticate admin user and receive JWT token.

**Request**:
```json
{
  "email": "admin@lookbook.com",
  "password": "admin123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin@lookbook.com",
    "name": "Mimi Admin",
    "role": "admin",
    "createdAt": "2025-01-21T10:00:00Z"
  },
  "expiresIn": 3600
}
```

**Response** (401):
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

### POST /admin/auth/logout

Invalidate current JWT token.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## 📦 Products Management

### POST /admin/products

Create a new product.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://images.unsplash.com/photo-...",
  "affiliateUrl": "https://nordstrom.com/...",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat perfect for all seasons.",
  "tags": ["minimalist", "classic", "versatile"],
  "isFeatured": false
}
```

**Response** (201):
```json
{
  "id": "prod_1737456789",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://images.unsplash.com/photo-...",
  "affiliateUrl": "https://nordstrom.com/...",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat perfect for all seasons.",
  "tags": ["minimalist", "classic", "versatile"],
  "isFeatured": false,
  "createdAt": "2025-01-21T10:30:00Z"
}
```

**Response** (400):
```json
{
  "error": "Validation error",
  "message": "Missing required fields: name, slug, imageUrl, affiliateUrl"
}
```

**Response** (401):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### PUT /admin/products/:id

Update an existing product.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "name": "Updated Trench Coat",
  "price": 475.00,
  "isFeatured": true
}
```

**Response** (200):
```json
{
  "id": "prod_1737456789",
  "name": "Updated Trench Coat",
  "slug": "classic-trench-coat",
  "price": 475.00,
  "imageUrl": "https://images.unsplash.com/photo-...",
  "affiliateUrl": "https://nordstrom.com/...",
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat perfect for all seasons.",
  "tags": ["minimalist", "classic", "versatile"],
  "isFeatured": true,
  "createdAt": "2025-01-21T10:30:00Z",
  "updatedAt": "2025-01-21T11:00:00Z"
}
```

**Response** (404):
```json
{
  "error": "Not found",
  "message": "Product with id prod_1737456789 not found"
}
```

### DELETE /admin/products/:id

Delete a product.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (204):
No content (successful deletion)

**Response** (404):
```json
{
  "error": "Not found",
  "message": "Product with id prod_1737456789 not found"
}
```

### PATCH /admin/products/:id/publish

Toggle product featured status (publish/unpublish).

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "publish": true
}
```

**Response** (200):
```json
{
  "id": "prod_1737456789",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "isFeatured": true,
  "updatedAt": "2025-01-21T11:00:00Z"
}
```

---

## 🎨 Moodboards Management

### POST /admin/moodboards

Create a new moodboard.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks.",
  "coverImage": "https://images.unsplash.com/photo-...",
  "productIds": ["prod_001", "prod_002", "prod_003"],
  "tags": ["french", "elegant", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair with classic pumps for a polished look",
    "Add a silk scarf for authentic French flair"
  ],
  "howToWear": "Perfect for transitional weather from day to evening."
}
```

**Response** (201):
```json
{
  "id": "mood_1737456800",
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks.",
  "coverImage": "https://images.unsplash.com/photo-...",
  "products": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "price": 450.00,
      "imageUrl": "https://images.unsplash.com/photo-...",
      "brand": "Burberry"
    }
  ],
  "tags": ["french", "elegant", "timeless"],
  "isFeatured": true,
  "stylingTips": [
    "Pair with classic pumps for a polished look",
    "Add a silk scarf for authentic French flair"
  ],
  "howToWear": "Perfect for transitional weather from day to evening.",
  "createdAt": "2025-01-21T10:30:00Z",
  "updatedAt": "2025-01-21T10:30:00Z"
}
```

**Response** (400):
```json
{
  "error": "Validation error",
  "message": "Missing required fields or invalid productIds"
}
```

### PUT /admin/moodboards/:id

Update an existing moodboard.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "title": "Updated Parisian Chic",
  "productIds": ["prod_001", "prod_002", "prod_003", "prod_004"],
  "isFeatured": true
}
```

**Response** (200):
```json
{
  "id": "mood_1737456800",
  "title": "Updated Parisian Chic",
  "slug": "parisian-chic",
  "description": "Effortlessly chic French-inspired looks.",
  "coverImage": "https://images.unsplash.com/photo-...",
  "products": [...],
  "tags": ["french", "elegant", "timeless"],
  "isFeatured": true,
  "stylingTips": [...],
  "howToWear": "Perfect for transitional weather from day to evening.",
  "createdAt": "2025-01-21T10:30:00Z",
  "updatedAt": "2025-01-21T11:30:00Z"
}
```

### DELETE /admin/moodboards/:id

Delete a moodboard.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (204):
No content (successful deletion)

**Response** (404):
```json
{
  "error": "Not found",
  "message": "Moodboard with id mood_1737456800 not found"
}
```

### PATCH /admin/moodboards/:id/publish

Toggle moodboard featured status (publish/unpublish).

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "publish": false
}
```

**Response** (200):
```json
{
  "id": "mood_1737456800",
  "title": "Parisian Chic",
  "slug": "parisian-chic",
  "isFeatured": false,
  "updatedAt": "2025-01-21T11:30:00Z"
}
```

---

## 🔑 JWT Token Details

### Token Structure

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "admin-001",
  "email": "admin@lookbook.com",
  "role": "admin",
  "iat": 1737456789,
  "exp": 1737460389
}
```

**Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Token Validation

All protected endpoints must validate:
1. Token is present in `Authorization: Bearer <token>` header
2. Token is not expired (`exp` claim)
3. Token signature is valid
4. User exists and has appropriate role

---

## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Invalid/expired token, bad credentials |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate slug or unique constraint violation |
| 500 | Internal Server Error | Server-side error |

---

## 🛡️ Security Considerations

1. **HTTPS Only**: All admin endpoints must use HTTPS
2. **Token Expiration**: JWT tokens expire after 1 hour (3600s)
3. **Rate Limiting**: Implement rate limiting on login endpoint (5 attempts per minute)
4. **Password Hashing**: Use bcrypt with minimum 10 rounds
5. **Input Validation**: Validate all input fields server-side
6. **SQL Injection**: Use parameterized queries
7. **CORS**: Whitelist admin domain only
8. **Audit Logging**: Log all CRUD operations with user/timestamp

---

## 🔍 Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Specific field validation error"
  },
  "timestamp": "2025-01-21T11:30:00Z",
  "path": "/admin/products"
}
```

---

## 📝 Data Validation Rules

### Products

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | 1-200 characters |
| slug | string | ✅ | lowercase, hyphens only, unique |
| price | number | ❌ | positive, max 2 decimals |
| imageUrl | string | ✅ | valid URL, HTTPS preferred |
| affiliateUrl | string | ✅ | valid URL, HTTPS required |
| brand | string | ❌ | 1-100 characters |
| category | string | ❌ | predefined list |
| description | string | ❌ | max 2000 characters |
| tags | array | ❌ | max 20 tags, lowercase |
| isFeatured | boolean | ❌ | default false |

### Moodboards

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | ✅ | 1-200 characters |
| slug | string | ✅ | lowercase, hyphens only, unique |
| description | string | ❌ | max 2000 characters |
| coverImage | string | ✅ | valid URL, HTTPS preferred |
| productIds | array | ✅ | min 1, max 20 valid product IDs |
| tags | array | ❌ | max 20 tags, lowercase |
| isFeatured | boolean | ❌ | default false |
| stylingTips | array | ❌ | max 10 tips, each max 500 chars |
| howToWear | string | ❌ | max 2000 characters |

---

## 🚀 Implementation Checklist

- [ ] Set up JWT authentication middleware
- [ ] Implement token generation and validation
- [ ] Create database tables for admins
- [ ] Implement password hashing (bcrypt)
- [ ] Add rate limiting on login
- [ ] Create CRUD endpoints for products
- [ ] Create CRUD endpoints for moodboards
- [ ] Add publish/unpublish endpoints
- [ ] Implement input validation
- [ ] Add error handling middleware
- [ ] Set up CORS for admin domain
- [ ] Implement audit logging
- [ ] Add database indexes for performance
- [ ] Write integration tests
- [ ] Deploy to production

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Ready for implementation
