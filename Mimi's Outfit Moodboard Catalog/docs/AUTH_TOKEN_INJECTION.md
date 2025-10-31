# Authentication & Token Management

**Project:** The Lookbook by Mimi  
**Updated:** January 2025

---

## 🔐 Overview

This document explains how authentication and JWT token management works in The Lookbook by Mimi admin portal.

---

## Authentication Flow

### 1. Login Process
1. Admin enters credentials on `/admin/login`
2. Frontend calls `POST /auth/login` with email and password
3. Backend validates credentials and returns JWT token + user data
4. Frontend stores token in localStorage via Zustand persist
5. Frontend redirects to `/admin` dashboard

### 2. Token Storage
- **Storage Method:** localStorage via Zustand persist middleware
- **Storage Key:** `admin-auth-storage`
- **Expiration:** 1 hour (3600 seconds)
- **Auto-Persist:** Zustand automatically saves/loads token

**Stored Data:**
```typescript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "admin-001",
    email: "admin@lookbook.com",
    name: "Mimi Admin",
    role: "admin",
    createdAt: "2024-01-15T10:00:00Z"
  },
  isAuthenticated: true
}
```

### 3. Token Injection
Every authenticated API request automatically includes the JWT token in the `Authorization` header.

**Implementation:**
```typescript
// src/services/api/admin.api.ts
const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Unauthorized');
  return { Authorization: `Bearer ${token}` };
};

// Used in all protected endpoints:
const headers = getAuthHeaders();
apiClient.post('/admin/products', data, { headers });
```

**HTTP Request Example:**
```http
POST /admin/products HTTP/1.1
Host: api.thelookbookbymimi.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Classic Trench Coat",
  "price": 299.99
}
```

### 4. Logout Process (Client-Side Only)
**No backend API call is made for logout.** The process is entirely client-side:

1. Admin clicks "Logout" in dropdown menu
2. Frontend calls `logout()` from Zustand store
3. Store clears token, user data, and authentication state
4. Frontend redirects to `/admin/login`
5. localStorage is automatically updated by Zustand

**Implementation:**
```typescript
// src/store/auth-store.ts
logout: () => {
  set({
    token: null,
    user: null,
    isAuthenticated: false,
  });
}

// src/components/admin/AdminHeader.tsx
const handleLogout = () => {
  // Clear token and redirect (no API call needed)
  logout();
  navigate('/admin/login');
};
```

**Why No Backend Call?**
- JWT tokens are stateless - the server doesn't track active sessions
- Token expiration is handled by the token's built-in `exp` claim
- Client-side logout is sufficient for security (token is removed from browser)
- Reduces unnecessary API calls and server load

---

## Protected Routes

All admin routes require authentication except `/admin/login`.

**Route Guard:**
```typescript
// Protected routes wrapper
{isAuthenticated ? (
  <Routes>
    <Route path="/" element={<AdminDashboard />} />
    <Route path="/products" element={<AdminProductsPage />} />
    <Route path="/moodboards" element={<AdminMoodboardsPage />} />
  </Routes>
) : (
  <Navigate to="/admin/login" replace />
)}
```

**Protected API Endpoints:**
- `POST /admin/products` - Create product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product
- `POST /admin/products/:id/publish` - Publish/unpublish product
- `POST /admin/products/bulk/publish` - Bulk publish
- `POST /admin/products/bulk/delete` - Bulk delete
- `POST /admin/moodboards` - Create moodboard
- `PUT /admin/moodboards/:id` - Update moodboard
- `DELETE /admin/moodboards/:id` - Delete moodboard
- `POST /admin/moodboards/:id/publish` - Publish/unpublish moodboard
- `POST /admin/moodboards/bulk/publish` - Bulk publish
- `POST /admin/moodboards/bulk/delete` - Bulk delete
- `GET /admin/stats` - Dashboard statistics
- `POST /admin/upload/image` - Image upload

---

## Token Validation

**No validate endpoint is used.** Token validation happens implicitly:

1. **On Page Load:** Zustand loads token from localStorage
2. **On API Call:** Backend validates token when processing requests
3. **On Error:** If token is invalid/expired, backend returns 401
4. **Frontend Handling:** 401 response triggers redirect to login

**Error Handling:**
```typescript
// src/services/api/base.api.ts
if (response.status === 401) {
  // Token expired or invalid
  useAuthStore.getState().logout();
  window.location.href = '/admin/login';
}
```

---

## Security Features

### 1. Token Expiration
- **Duration:** 1 hour (3600 seconds)
- **Handling:** Backend validates `exp` claim on every request
- **Frontend:** Shows "Session expired" message on 401 errors

### 2. HTTPS Only (Production)
- All API calls require HTTPS in production
- Prevents token interception via man-in-the-middle attacks

### 3. HTTP-Only Cookies (Optional Backend Enhancement)
While the current implementation uses localStorage, consider upgrading to HTTP-only cookies for enhanced security:
- Prevents XSS attacks from accessing tokens
- Automatic inclusion in requests
- Requires backend cookie management

### 4. CORS Configuration
Backend must whitelist frontend origin:
```
Access-Control-Allow-Origin: https://thelookbookbymimi.com
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

## Environment Variables

```bash
# API Configuration
VITE_API_MODE=real              # 'mock' or 'real'
VITE_API_BASE_URL=https://api.thelookbookbymimi.com/v1
VITE_API_KEY=your_api_key_here  # Optional API key
VITE_API_DEBUG=false            # Enable request logging
```

---

## Demo Credentials

**Email:** `admin@lookbook.com`  
**Password:** `admin123`

**Mock Token:** `mock-jwt-token-1234567890`

---

## API Mode Behavior

### Mock Mode (Development)
- No real authentication required
- Demo credentials always work
- Tokens are prefixed with `mock-jwt-token-`
- No backend server needed

### Real Mode (Production)
- Actual JWT validation
- Backend must implement `/auth/login`
- Backend validates token on every protected request
- Tokens expire after 1 hour

---

## Troubleshooting

### Token Not Being Sent
**Symptoms:** API returns 401 even though user is logged in

**Solutions:**
1. Check localStorage: `admin-auth-storage` key should exist
2. Check token format: `Bearer <token>` in Authorization header
3. Verify `getAuthHeaders()` is called before API requests
4. Check browser console for errors

### Token Expired
**Symptoms:** User gets logged out unexpectedly

**Solutions:**
1. Check token expiration time (1 hour default)
2. Implement token refresh mechanism (optional)
3. Show warning before token expires (optional)

### CORS Errors
**Symptoms:** "CORS policy blocked" in console

**Solutions:**
1. Add frontend origin to backend CORS whitelist
2. Include `Authorization` in `Access-Control-Allow-Headers`
3. Set credentials: `true` if using cookies

---

## Future Enhancements

1. **Token Refresh:** Auto-refresh tokens before expiration
2. **Remember Me:** Longer expiration for trusted devices
3. **Multi-Factor Auth:** SMS or email verification
4. **Session Management:** Track active sessions in backend
5. **HTTP-Only Cookies:** Store tokens in secure cookies instead of localStorage

---

## Related Documentation

- [ADMIN_BACKEND_ROUTES_SUMMARY.md](../ADMIN_BACKEND_ROUTES_SUMMARY.md) - All admin API routes
- [docs/ADMIN_BACKEND_SPEC.md](./ADMIN_BACKEND_SPEC.md) - Complete backend specification
- [docs/ADMIN_PORTAL_GUIDE.md](./ADMIN_PORTAL_GUIDE.md) - Admin portal user guide
