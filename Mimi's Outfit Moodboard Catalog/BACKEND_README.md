# Backend API Documentation

**The Lookbook by Mimi - Complete Backend Guide**

This repository contains a complete specification for building the backend API for The Lookbook by Mimi fashion platform.

---

## 🎯 What You Get

✅ **Complete API Specification** - All endpoints, models, and examples  
✅ **Database Schemas** - PostgreSQL, MySQL, MongoDB, Prisma  
✅ **Implementation Guide** - Step-by-step checklist (9-15 days)  
✅ **Code Examples** - Node.js, PostgreSQL, Redis examples  
✅ **Production Ready** - Security, caching, rate limiting, monitoring  

---

## 📚 Documentation Files

### Start Here
📄 **[BACKEND_SUMMARY.md](docs/BACKEND_SUMMARY.md)** - Overview of all documentation

### Core Documentation
📄 **[BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md)** - Complete API specification (all endpoints, models, errors)  
📄 **[API_ENDPOINTS_SUMMARY.md](docs/API_ENDPOINTS_SUMMARY.md)** - Quick reference table  
📄 **[DATABASE_SCHEMAS.md](docs/DATABASE_SCHEMAS.md)** - Database schemas for PostgreSQL, MySQL, MongoDB, Prisma  
📄 **[BACKEND_IMPLEMENTATION_CHECKLIST.md](docs/BACKEND_IMPLEMENTATION_CHECKLIST.md)** - Step-by-step build guide  
📄 **[USER_ID_IMPLEMENTATION.md](docs/USER_ID_IMPLEMENTATION.md)** 🆕 - User identification system technical details  

### Analytics Backend ⭐ **NEW**
📄 **[BACKEND_ANALYTICS_COMPLETE_SUMMARY.md](docs/BACKEND_ANALYTICS_COMPLETE_SUMMARY.md)** 📊 - **START HERE** - Complete analytics overview  
📄 **[BACKEND_ANALYTICS_QUICK_START.md](docs/BACKEND_ANALYTICS_QUICK_START.md)** ⚡ - Get analytics working in 2-3 hours  
📄 **[ANALYTICS_API_SPEC.md](docs/ANALYTICS_API_SPEC.md)** 📋 - Complete analytics API specification v1.0  
📄 **[BACKEND_ANALYTICS_IMPLEMENTATION.md](docs/BACKEND_ANALYTICS_IMPLEMENTATION.md)** 📖 - Deep dive: SQL queries, optimization, testing (900+ lines)  

### Frontend Integration
📄 **[API_INTEGRATION.md](docs/API_INTEGRATION.md)** - Frontend setup guide  
📄 **[USER_IDENTIFICATION_GUIDE.md](docs/USER_IDENTIFICATION_GUIDE.md)** 🆕 - Complete user tracking guide  
📄 **[ANALYTICS_USER_TRACKING.md](docs/ANALYTICS_USER_TRACKING.md)** 🆕 - Backend analytics with X-User-ID header (middleware examples)  
📄 **[MIGRATION_CHECKLIST.md](docs/MIGRATION_CHECKLIST.md)** - Migration from mock to real API  

---

## 🚀 Quick Start (3 Steps)

### Step 1: Choose Your Stack
```bash
# Example: Node.js + PostgreSQL
npm init -y
npm install express pg cors dotenv compression express-rate-limit
```

### Step 2: Set Up Database
```sql
-- PostgreSQL
createdb lookbook_db
psql -d lookbook_db < schema.sql
```

See [DATABASE_SCHEMAS.md](docs/DATABASE_SCHEMAS.md) for complete schemas.

### Step 3: Implement API
Follow [BACKEND_IMPLEMENTATION_CHECKLIST.md](docs/BACKEND_IMPLEMENTATION_CHECKLIST.md) for detailed steps.

---

## 📋 API Overview

### Base URL
```
https://api.yourdomain.com
```

### Authentication
```
Authorization: Bearer YOUR_API_KEY
```

### 13 Endpoints

**Products (8 endpoints)**
- `GET /products` - Get all products (with filters, search, pagination)
- `GET /products/:id` - Get product by ID
- `GET /products/slug/:slug` - Get product by slug
- `GET /products/featured` - Get featured products
- `GET /products/categories` - Get all categories
- `GET /products/brands` - Get all brands
- `GET /products/tags` - Get all tags
- `GET /products/search?q=query` - Search products

**Moodboards (5 endpoints)**
- `GET /moodboards` - Get all moodboards (with filters, pagination)
- `GET /moodboards/:id` - Get moodboard by ID
- `GET /moodboards/featured` - Get featured moodboards
- `GET /moodboards/tags` - Get all tags
- `GET /moodboards/search?q=query` - Search moodboards

See [API_ENDPOINTS_SUMMARY.md](docs/API_ENDPOINTS_SUMMARY.md) for complete list.

---

## 🗄️ Data Models

### Product
```typescript
{
  id: string;
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
  createdAt: string;
}
```

### Moodboard
```typescript
{
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  products: Product[];
  tags?: string[];
  isFeatured?: boolean;
  stylingTips?: string[];
  howToWear?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Paginated Response
```typescript
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

See [BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md) for complete models.

---

## 🏗️ Database Schemas

### PostgreSQL (Recommended)
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_tags (
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (product_id, tag)
);

-- More tables: moodboards, moodboard_tags, moodboard_styling_tips, moodboard_products
```

### MongoDB
```javascript
// products collection
{
  id: "prod_001",
  name: "Classic Trench Coat",
  slug: "classic-trench-coat",
  price: 450.00,
  imageUrl: "https://...",
  affiliateUrl: "https://...",
  brand: "Burberry",
  tags: ["outerwear", "classic"],
  category: "outerwear",
  description: "...",
  isFeatured: true,
  createdAt: ISODate("2024-01-15T10:30:00Z")
}

// moodboards collection with nested products
```

See [DATABASE_SCHEMAS.md](docs/DATABASE_SCHEMAS.md) for complete schemas including MySQL and Prisma.

---

## ⚡ Key Features

### 1. Search
Multi-field search across name, brand, description, tags, category
```bash
GET /products?search=trench%20coat
```

### 2. Pagination
All list endpoints support pagination
```bash
GET /products?page=1&limit=12
```

### 3. Filtering
Filter by category, brand, tags, price range
```bash
GET /products?category=dresses&minPrice=50&maxPrice=200
```

### 4. Sorting
Sort by newest, price-low, price-high, name
```bash
GET /products?sortBy=price-low
```

---

## 🔐 Security

✅ **API Key Authentication** - Required for all requests  
✅ **Rate Limiting** - 100/min, 1000/hour per API key  
✅ **Input Validation** - All parameters validated  
✅ **SQL Injection Prevention** - Parameterized queries only  
✅ **CORS Configuration** - Restrict to your frontend domain  

---

## 📈 Performance

✅ **Database Indexes** - On category, brand, price, featured, created_at  
✅ **Caching** - Redis for featured products, categories, tags  
✅ **Compression** - Gzip response compression  
✅ **Connection Pooling** - Database connection pooling  

---

## 🧪 Testing

### Unit Tests
- Pagination logic
- Filter logic
- Search functionality
- Error handling

### Integration Tests
- All endpoints
- Authentication
- Rate limiting
- Error responses

### Load Tests
```bash
ab -n 1000 -c 100 -H "Authorization: Bearer test_key" http://localhost:3000/products
```

---

## 📦 Deployment

### Recommended Platforms
- **Heroku** - Easy, quick start
- **Railway** - Modern, simple
- **AWS** - Full control, scalable
- **DigitalOcean** - VPS option

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/lookbook_db
API_KEY=your_secure_api_key_here
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://localhost:6379
```

---

## 🔗 Frontend Integration

After backend is ready:

1. Update frontend `.env`:
```bash
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_api_key_here
```

2. Test connection:
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.yourdomain.com/products?limit=5
```

3. Frontend automatically switches from mock to real data

---

## 📖 Example API Requests

### Get Products with Filters
```bash
GET /products?category=dresses&sortBy=price-low&page=1&limit=12

Authorization: Bearer YOUR_API_KEY
```

Response:
```json
{
  "data": [
    {
      "id": "prod_001",
      "name": "Classic Trench Coat",
      "slug": "classic-trench-coat",
      "price": 450,
      "imageUrl": "https://...",
      "affiliateUrl": "https://...",
      "brand": "Burberry",
      "tags": ["outerwear", "classic"],
      "category": "outerwear",
      "description": "...",
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 52,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Search Products
```bash
GET /products/search?q=trench%20coat

Authorization: Bearer YOUR_API_KEY
```

### Get Moodboard by ID
```bash
GET /moodboards/mood_001

Authorization: Bearer YOUR_API_KEY
```

Response includes nested products, tags, and styling tips.

---

## ⏱️ Implementation Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1-2 | Setup & Database | 1-2 days |
| 3-4 | Core API (13 endpoints) | 3-5 days |
| 5-6 | Optimization & Security | 1-2 days |
| 7 | Testing | 2-3 days |
| 8-9 | Deployment & Docs | 1-2 days |
| 10 | Frontend Integration | 1 day |

**Total: 9-15 days** for complete production-ready backend

---

## ✅ Pre-Launch Checklist

- [ ] All 13 endpoints implemented
- [ ] Database indexes created
- [ ] Authentication working
- [ ] Rate limiting enforced
- [ ] Search functionality tested
- [ ] Pagination working
- [ ] Error handling correct
- [ ] Caching implemented
- [ ] CORS configured
- [ ] SSL certificate installed
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Load testing passed
- [ ] Frontend connected
- [ ] Documentation complete

---

## 📞 Support

### Issues or Questions?
1. Check [BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md) for complete API details
2. Review [BACKEND_IMPLEMENTATION_CHECKLIST.md](docs/BACKEND_IMPLEMENTATION_CHECKLIST.md) for implementation steps
3. See [DATABASE_SCHEMAS.md](docs/DATABASE_SCHEMAS.md) for database setup

### All Documentation
```
/docs/
├── BACKEND_API_SPEC.md                      # Complete API specification
├── API_ENDPOINTS_SUMMARY.md                 # Quick reference
├── DATABASE_SCHEMAS.md                      # Database schemas
├── BACKEND_IMPLEMENTATION_CHECKLIST.md      # Build guide
├── BACKEND_SUMMARY.md                       # Documentation overview
├── API_INTEGRATION.md                       # Frontend setup
└── MIGRATION_CHECKLIST.md                   # Mock to real migration
```

---

## 🎉 Ready to Build!

You have everything needed:
- ✅ Complete API specification
- ✅ Database schemas for multiple databases
- ✅ Step-by-step implementation guide
- ✅ Code examples
- ✅ Security best practices
- ✅ Testing strategies
- ✅ Deployment guidelines

**Start here:** [BACKEND_SUMMARY.md](docs/BACKEND_SUMMARY.md)

**Good luck! 🚀**

---

**Project:** The Lookbook by Mimi  
**Version:** 1.0.0  
**Last Updated:** January 2025
