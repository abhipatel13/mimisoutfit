# User Identification System - Implementation Summary

## Overview

The Lookbook now includes a **comprehensive user identification system** that automatically tracks every user with a unique GUID, enabling powerful analytics and personalization without requiring authentication.

---

## What Was Implemented

### 1. User Identifier Utility
**File**: `/src/lib/user-identifier.ts`

**Core Functions**:
- `getUserIdentifier()` - Get or create user ID (always succeeds)
- `clearUserIdentifier()` - Remove user ID from localStorage
- `getExistingUserIdentifier()` - Check if ID exists without creating

**GUID Format**: UUID v4 standard
```
Example: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
Format:  xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

**Storage**: 
- localStorage key: `lookbook-user-id`
- Persists across browser sessions
- User can clear anytime

### 2. Base API Integration
**File**: `/src/services/api/base.api.ts`

**Automatic Header Injection**:
Every API request now includes:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key',          // If configured
  'X-User-ID': 'a3f8c921-...',          // ✅ Always included
  'Authorization': 'Bearer token...'    // If authenticated
}
```

**All HTTP Methods**:
- ✅ GET requests
- ✅ POST requests (JSON)
- ✅ POST requests (FormData)
- ✅ PUT requests
- ✅ DELETE requests

### 3. Comprehensive Documentation
**File**: `/docs/USER_IDENTIFICATION_GUIDE.md`

**Contents**:
- Complete implementation guide
- Backend integration examples (Express.js, FastAPI)
- Use cases (analytics, personalization, cart)
- Database schema examples
- Testing strategies
- Privacy considerations (GDPR compliance)
- Troubleshooting guide

---

## How It Works

### First Visit Flow
```
User visits site
    ↓
getUserIdentifier() called
    ↓
No ID in localStorage
    ↓
Generate new GUID
    ↓
Store in localStorage
    ↓
Return GUID
```

### API Request Flow
```
User action (view product, search)
    ↓
API request triggered
    ↓
base.api.ts buildHeaders()
    ↓
getUserIdentifier()
    ↓
Add X-User-ID header
    ↓
Backend receives user identifier
```

---

## Use Cases

### 1. Analytics & Tracking
Track user behavior without authentication:
- Product views
- Search queries
- Cart interactions
- Moodboard favorites
- User journey analysis

**Backend Example**:
```javascript
// Track product view
app.get('/products/:id', (req, res) => {
  const userId = req.headers['x-user-id'];
  
  await db.analytics.create({
    userId,
    action: 'view_product',
    productId: req.params.id,
    timestamp: new Date()
  });
  
  // Return product
});
```

### 2. Personalization
Personalized recommendations without login:
- View history
- Style preferences
- Favorite brands
- Price range

**Backend Example**:
```javascript
// Get user's viewing history
const history = await db.productViews.findMany({
  where: { userId: req.headers['x-user-id'] },
  orderBy: { timestamp: 'desc' }
});

// Recommend similar products
const recommendations = await getRecommendations(history);
```

### 3. Anonymous Cart
Shopping cart without authentication:
```javascript
// Save cart items
POST /cart/items
Headers: { X-User-ID: "a3f8c921-..." }
Body: { productId: "123", quantity: 2 }

// Retrieve cart
GET /cart
Headers: { X-User-ID: "a3f8c921-..." }
Response: { items: [...], total: 150.00 }
```

### 4. Session Recovery
Merge data when user registers:
```javascript
// User logs in with email
// Backend links anonymous sessions to account
const oldSessions = await findSessionsByUserId(userId);
await mergeToAccount(userEmail, oldSessions);
```

---

## Backend Integration

### Express.js Middleware
```javascript
// middleware/user-identifier.js
export const extractUserIdentifier = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (userId) {
    req.userId = userId;
    console.log(`[User ${userId}] ${req.method} ${req.path}`);
  }
  
  next();
};

// app.js
app.use(extractUserIdentifier);
```

### FastAPI (Python)
```python
from fastapi import Header

async def get_user_id(x_user_id: str = Header(None)):
    return x_user_id

@app.get("/products")
async def get_products(user_id: str = Depends(get_user_id)):
    print(f"[User {user_id}] GET /products")
    # Your logic
```

---

## Database Schema Examples

### Analytics Table (PostgreSQL)
```sql
CREATE TABLE user_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- UUID from X-User-ID
    action VARCHAR(50) NOT NULL,   -- 'view_product', 'add_to_cart'
    resource_type VARCHAR(20),     -- 'product', 'moodboard'
    resource_id VARCHAR(100),      -- ID of item
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action)
);
```

### Cart Table
```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);
```

### User Profile
```sql
CREATE TABLE user_profiles (
    user_id VARCHAR(36) PRIMARY KEY,  -- From X-User-ID
    email VARCHAR(255) UNIQUE,        -- Optional
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Privacy & GDPR Compliance

### User Rights
✅ Users can clear their identifier anytime  
✅ Data is pseudonymous (no PII until registration)  
✅ Complies with "right to be forgotten"  

### Implementation
```typescript
// Privacy settings
function PrivacySettings() {
  const handleClearData = async () => {
    // Clear local identifier
    clearUserIdentifier();
    
    // Request backend deletion
    await fetch('/api/users/delete-data', {
      method: 'DELETE',
      headers: { 'X-User-ID': getUserIdentifier() }
    });
    
    toast.success('Your data has been cleared');
  };
}
```

### Cookie Alternative
- ✅ No cookie consent banner needed
- ✅ Not sent to third-party domains
- ✅ User has full control
- ✅ More storage (10MB vs 4KB)

---

## Key Benefits

### For Users
✅ **No Registration Required** - Personalization without login  
✅ **Privacy Control** - Can clear identifier anytime  
✅ **Seamless Experience** - Cart/favorites persist across sessions  
✅ **No Cookies** - Uses localStorage instead  

### For Business
✅ **Analytics** - Track user behavior without authentication  
✅ **Personalization** - Recommend products based on history  
✅ **Conversion** - Persistent cart increases purchases  
✅ **Insights** - Understand user journey and drop-off points  

### For Developers
✅ **Automatic** - No manual header injection needed  
✅ **Consistent** - Same mechanism across all endpoints  
✅ **Flexible** - Works for anonymous and authenticated users  
✅ **Scalable** - UUID v4 supports billions of IDs  

---

## Testing

### Verify User ID Generation
```typescript
import { getUserIdentifier } from '@/lib/user-identifier';

// First call generates new ID
const id1 = getUserIdentifier();
console.log('User ID:', id1);
// Output: "a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b"

// Second call returns same ID
const id2 = getUserIdentifier();
console.log('Same ID:', id1 === id2);
// Output: true
```

### Verify Header Injection
Open browser DevTools → Network tab:
```
Request Headers:
  X-User-ID: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
  X-API-Key: your-api-key
  Authorization: Bearer eyJhbGc...
```

---

## Files Modified

1. ✅ `/src/lib/user-identifier.ts` - **NEW** - User ID utility
2. ✅ `/src/services/api/base.api.ts` - Added X-User-ID header injection
3. ✅ `/docs/USER_IDENTIFICATION_GUIDE.md` - **NEW** - Complete documentation
4. ✅ `/.devv/STRUCTURE.md` - Updated with new feature
5. ✅ `/USER_IDENTIFICATION_SUMMARY.md` - **NEW** - This summary

---

## What Backend Developers Need to Know

### 1. Receive User Identifier
Every request includes `X-User-ID` header:
```javascript
const userId = req.headers['x-user-id'];
// Example: "a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b"
```

### 2. Store Analytics
Track user actions with the ID:
```javascript
await db.analytics.create({
  userId: req.headers['x-user-id'],
  action: 'view_product',
  productId: req.params.id,
  timestamp: new Date()
});
```

### 3. Return Personalized Data
Use ID to fetch user-specific data:
```javascript
const history = await db.views.findMany({
  where: { userId: req.headers['x-user-id'] }
});
const recommendations = getRecommendations(history);
```

### 4. Handle Cart
Store cart items by user ID:
```javascript
const cart = await db.cart.findMany({
  where: { userId: req.headers['x-user-id'] }
});
```

---

## Example Queries

### User Activity Timeline
```sql
SELECT action, resource_id, timestamp
FROM user_analytics
WHERE user_id = 'a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b'
ORDER BY timestamp DESC
LIMIT 50;
```

### Popular Products by Unique Users
```sql
SELECT resource_id AS product_id, COUNT(DISTINCT user_id) AS viewers
FROM user_analytics
WHERE action = 'view_product'
GROUP BY resource_id
ORDER BY viewers DESC
LIMIT 10;
```

### Cart Retrieval
```sql
SELECT ci.*, p.name, p.price, p.image
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = 'a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b';
```

---

## Next Steps for Backend

1. **Add Middleware** - Extract `x-user-id` header
2. **Create Tables** - Analytics, cart, profiles
3. **Track Events** - Product views, searches, actions
4. **Build Endpoints** - Cart API, recommendations
5. **Test Integration** - Verify header reception

---

## Summary

✅ **Automatic** - No developer action needed for API calls  
✅ **Persistent** - Survives browser refresh and revisits  
✅ **Privacy-Friendly** - User has full control  
✅ **Analytics-Ready** - Track behavior without auth  
✅ **Flexible** - Works for anonymous and authenticated users  
✅ **Scalable** - UUID v4 supports billions of IDs  

The user identification system enables powerful analytics and personalization while maintaining user privacy and simplicity.

---

## Quick Reference

**Get User ID**:
```typescript
import { getUserIdentifier } from '@/lib/user-identifier';
const userId = getUserIdentifier();
```

**Clear User ID**:
```typescript
import { clearUserIdentifier } from '@/lib/user-identifier';
clearUserIdentifier();
```

**Backend Access**:
```javascript
const userId = req.headers['x-user-id'];
```

**Documentation**: `/docs/USER_IDENTIFICATION_GUIDE.md`
