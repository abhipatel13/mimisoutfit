# API Modes Guide

## Overview

The Lookbook platform supports **two API modes**: **Mock Mode** (default) and **Real Mode**. This allows you to develop and test the frontend without a backend, then seamlessly switch to a real API when ready.

---

## 🎯 API Modes

### 1. **Mock Mode (Default)**

Uses local mock data stored in `/src/data/mock-data.ts`

**Features**:
- ✅ No backend required
- ✅ Instant responses (simulated delays)
- ✅ 52 products + 10 moodboards pre-loaded
- ✅ Full CRUD operations (in-memory only)
- ✅ Perfect for development and demos

**When to use**:
- Frontend development
- UI/UX testing
- Demos and presentations
- No backend available yet

---

### 2. **Real Mode**

Connects to your actual backend API

**Features**:
- ✅ Persistent data storage
- ✅ Real authentication (JWT)
- ✅ Server-side validation
- ✅ Multi-user support
- ✅ Production-ready

**When to use**:
- Production deployment
- Backend is ready
- Need persistent data
- Multi-user collaboration

---

## 🔧 Configuration

### Environment Variables

Edit your `.env` file:

```env
# ==========================================
# API MODE CONFIGURATION
# ==========================================

# Set to 'mock' for local data, 'real' for backend API
VITE_API_MODE=mock

# ==========================================
# REAL API CONFIGURATION (only used when mode=real)
# ==========================================

# Backend API base URL
VITE_API_BASE_URL=https://api.yourdomain.com

# API authentication key (if using key-based auth)
VITE_API_KEY=your_api_key_here

# Enable API request logging in console
VITE_API_DEBUG=false

# ==========================================
# FEATURE FLAGS
# ==========================================

# Enable Devv SDK file uploads (requires authentication)
VITE_ENABLE_IMAGE_UPLOAD=true

# Restrict affiliate links to trusted retailers only
VITE_RESTRICT_AFFILIATE_RETAILERS=false
```

---

## 🚀 Switching Between Modes

### Switch to Real Mode

1. **Update `.env` file**:
   ```env
   VITE_API_MODE=real
   VITE_API_BASE_URL=https://your-backend.com
   VITE_API_KEY=your_secret_key
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Verify in console**:
   ```
   [API Config] Running in REAL mode
   ```

### Switch to Mock Mode

1. **Update `.env` file**:
   ```env
   VITE_API_MODE=mock
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Verify in console**:
   ```
   [API Config] Running in MOCK mode
   ```

---

## 📊 API Behavior Comparison

| Feature | Mock Mode | Real Mode |
|---------|-----------|-----------|
| **Data Source** | Local mock data | Backend database |
| **Response Time** | 200-500ms (simulated) | Network-dependent |
| **Authentication** | Demo credentials | Real JWT tokens |
| **Persistence** | In-memory only | Persistent database |
| **CRUD Operations** | Simulated | Real database changes |
| **Image Upload** | Devv SDK | Backend + Devv SDK |
| **Multi-user** | ❌ Single session | ✅ Multiple users |
| **Production Ready** | ❌ Development only | ✅ Yes |

---

## 🔌 Real Mode API Endpoints

When `VITE_API_MODE=real`, the following endpoints are called:

### **Authentication**
```
POST   /auth/login          - Admin login
POST   /auth/logout         - Admin logout
GET    /auth/validate       - Validate JWT token
```

### **Products (Public)**
```
GET    /products                     - Get all products (with pagination)
GET    /products/:id                 - Get product by ID
GET    /products/slug/:slug          - Get product by slug
GET    /products/:id/related         - Get related products
GET    /products/search?q=query      - Search products
```

### **Moodboards (Public)**
```
GET    /moodboards                   - Get all moodboards
GET    /moodboards/:id               - Get moodboard by ID
GET    /moodboards/slug/:slug        - Get moodboard by slug
GET    /moodboards/:id/products      - Get moodboard products
```

### **Admin - Products**
```
POST   /admin/products               - Create product
PUT    /admin/products/:id           - Update product
DELETE /admin/products/:id           - Delete product
POST   /admin/products/:id/publish   - Publish/unpublish product
```

### **Admin - Moodboards**
```
POST   /admin/moodboards             - Create moodboard
PUT    /admin/moodboards/:id         - Update moodboard
DELETE /admin/moodboards/:id         - Delete moodboard
POST   /admin/moodboards/:id/publish - Publish/unpublish moodboard
```

---

## 🔐 Authentication Flow

### Mock Mode
```typescript
// Demo credentials (hardcoded)
email: 'admin@lookbook.com'
password: 'admin123'

// Mock JWT token
token: 'mock-jwt-token-' + Date.now()

// Token validation
return token.startsWith('mock-jwt-token-');
```

### Real Mode
```typescript
// Real API call
POST /auth/login
{
  "email": "admin@lookbook.com",
  "password": "your_real_password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "123", "email": "...", "role": "admin" },
  "expiresIn": 3600
}

// Token in headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ Implementation Details

### API Configuration File

`/src/config/api.config.ts`

```typescript
export interface ApiConfig {
  mode: ApiMode;                    // 'mock' | 'real'
  baseUrl: string;                  // Backend URL
  apiKey?: string;                  // Optional API key
  debug: boolean;                   // Console logging
  enableImageUpload: boolean;       // Image upload feature flag
  restrictAffiliateRetailers: boolean; // Retailer restriction
}

export const apiConfig: ApiConfig = {
  mode: import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock',
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
  apiKey: import.meta.env.VITE_API_KEY,
  debug: import.meta.env.VITE_API_DEBUG === 'true',
  enableImageUpload: import.meta.env.VITE_ENABLE_IMAGE_UPLOAD !== 'false',
  restrictAffiliateRetailers: import.meta.env.VITE_RESTRICT_AFFILIATE_RETAILERS === 'true',
};
```

### Mode Detection

```typescript
// Check current mode
if (apiConfig.mode === 'real') {
  // Use real API
  return apiClient.post('/admin/products', data, { headers });
} else {
  // Use mock data
  await delay(500);
  return mockProduct;
}
```

---

## 📋 Migration Checklist

### Before Switching to Real Mode

- [ ] Backend API is deployed and accessible
- [ ] All endpoints are implemented (see list above)
- [ ] Database is set up with proper schemas
- [ ] Authentication system is working (JWT)
- [ ] CORS is configured for your frontend domain
- [ ] API keys are generated (if using key-based auth)
- [ ] Environment variables are set in `.env`
- [ ] SSL/HTTPS is enabled (required for production)

### Testing Real Mode

1. **Test Authentication**
   ```bash
   # Try logging in
   POST /auth/login
   ```

2. **Test Public Endpoints**
   ```bash
   # Fetch products
   GET /products?page=1&limit=12
   ```

3. **Test Admin Endpoints**
   ```bash
   # Create product (with JWT)
   POST /admin/products
   Authorization: Bearer <token>
   ```

4. **Test Error Handling**
   ```bash
   # Invalid token
   GET /admin/products
   Authorization: Bearer invalid_token
   # Should return 401 Unauthorized
   ```

---

## 🔍 Debugging

### Enable Debug Mode

```env
VITE_API_DEBUG=true
```

This logs all API requests to the console:

```
[API] GET: https://api.yourdomain.com/products?page=1&limit=12
[API] POST: https://api.yourdomain.com/admin/products
[API] POST (FormData): https://api.yourdomain.com/admin/products/123/image
```

### Common Issues

#### 1. **CORS Errors**
```
❌ Access to fetch at 'https://api.yourdomain.com/products' has been blocked by CORS policy
```

**Solution**: Configure backend CORS headers:
```javascript
// Express.js example
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));
```

#### 2. **401 Unauthorized**
```
❌ Error 401: Unauthorized
```

**Solution**: Check JWT token in localStorage, verify token expiration, re-login if expired

#### 3. **Network Error**
```
❌ Failed to fetch
```

**Solution**: Check `VITE_API_BASE_URL`, verify backend is running, check network connection

#### 4. **404 Not Found**
```
❌ Error 404: Endpoint not found
```

**Solution**: Verify endpoint exists in backend, check API route definitions

---

## 🎯 Best Practices

### 1. **Use Mock Mode for Development**
- Faster iteration without backend dependency
- Test UI/UX without network delays
- Demo to stakeholders without backend

### 2. **Switch to Real Mode for Integration Testing**
- Test real authentication flows
- Verify API contracts
- Check error handling

### 3. **Use Debug Mode During Development**
- Enable `VITE_API_DEBUG=true`
- Monitor all API calls in console
- Identify slow endpoints

### 4. **Environment-Specific Configs**
```env
# .env.development
VITE_API_MODE=mock

# .env.staging
VITE_API_MODE=real
VITE_API_BASE_URL=https://staging-api.yourdomain.com

# .env.production
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 📚 Related Documentation

- [API Integration Guide](./API_INTEGRATION.md) - Complete API setup
- [Backend API Spec](./BACKEND_API_SPEC_UPDATED.md) - Full API documentation
- [Admin Portal Guide](./ADMIN_PORTAL_GUIDE.md) - Admin features
- [Migration Checklist](./MIGRATION_CHECKLIST.md) - Step-by-step migration

---

## 🆘 Troubleshooting

### Mode Not Switching

**Problem**: Still using mock data after setting `VITE_API_MODE=real`  
**Solution**: Restart dev server (`npm run dev`)

### Environment Variables Not Loading

**Problem**: Changes to `.env` file not taking effect  
**Solution**: Restart dev server, ensure file is named exactly `.env`, check for typos

### API Calls Failing in Real Mode

**Problem**: All API calls return errors  
**Solution**: Verify `VITE_API_BASE_URL`, check backend is running, enable debug mode

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
