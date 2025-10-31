# User Identification System Guide

## Overview

The Lookbook implements a **unique user identification system** that automatically generates and manages a persistent GUID for each visitor. This identifier is sent with every API request, enabling backend analytics, personalization, and tracking without requiring authentication.

## Key Features

✅ **Automatic GUID Generation** - Creates UUID v4 on first visit  
✅ **Persistent Storage** - Stored in localStorage (`lookbook-user-id`)  
✅ **Auto-Injection** - Sent with every API request via `X-User-ID` header  
✅ **No Authentication Required** - Works for anonymous users  
✅ **Privacy-Friendly** - User can clear identifier anytime  
✅ **Fallback Support** - Generates temporary ID if localStorage unavailable  

---

## How It Works

### 1. First Visit Flow

```
User visits site
    ↓
getUserIdentifier() called
    ↓
No ID in localStorage
    ↓
Generate new GUID: "a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b"
    ↓
Store in localStorage
    ↓
Return GUID
```

### 2. Subsequent Visits

```
User returns to site
    ↓
getUserIdentifier() called
    ↓
ID exists in localStorage
    ↓
Return existing GUID
```

### 3. API Request Flow

```
User action (view product, search, etc.)
    ↓
API request triggered
    ↓
base.api.ts buildHeaders()
    ↓
getUserIdentifier() → "a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b"
    ↓
Add X-User-ID header
    ↓
Request sent to backend with identifier
```

---

## Implementation Details

### User Identifier Utility

**Location**: `/src/lib/user-identifier.ts`

#### Core Functions

**`getUserIdentifier(): string`**
- Gets existing ID from localStorage OR generates new one
- Automatically stores new ID in localStorage
- Returns GUID string (always succeeds)

**`clearUserIdentifier(): void`**
- Removes user ID from localStorage
- Useful for testing or privacy

**`getExistingUserIdentifier(): string | null`**
- Gets ID without creating new one
- Returns null if no ID exists

#### GUID Format

Uses **UUID v4** standard:
```
Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
Example: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
```

### Base API Integration

**Location**: `/src/services/api/base.api.ts`

#### Automatic Header Injection

Every API request includes:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key',          // If configured
  'X-User-ID': 'a3f8c921-...',          // ✅ Always sent
  'Authorization': 'Bearer token...'    // If authenticated
}
```

#### All HTTP Methods Supported

- ✅ **GET** requests
- ✅ **POST** requests (JSON body)
- ✅ **POST** requests (FormData - image uploads)
- ✅ **PUT** requests
- ✅ **DELETE** requests

---

## Backend Integration

### Receiving User Identifier

The backend receives the user identifier in the `X-User-ID` header of every request.

#### Example: Express.js Middleware

```javascript
// middleware/user-identifier.js
export const extractUserIdentifier = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (userId) {
    req.userId = userId;
    console.log(`[User ID] ${userId} - ${req.method} ${req.path}`);
  } else {
    console.warn('[User ID] Missing user identifier in request');
  }
  
  next();
};

// app.js
app.use(extractUserIdentifier);
```

#### Example: FastAPI (Python)

```python
from fastapi import Request, Header
from typing import Optional

async def get_user_identifier(x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        return x_user_id
    return None

@app.get("/products")
async def get_products(user_id: str = Depends(get_user_identifier)):
    print(f"[User ID] {user_id} - GET /products")
    # Your logic here
```

---

## Use Cases

### 1. Analytics & Tracking

**Track user behavior without authentication:**

```javascript
// Backend analytics
const analytics = {
  userId: req.userId,
  action: 'view_product',
  productId: req.params.id,
  timestamp: new Date()
};

await db.analytics.create(analytics);
```

**Example queries:**
- How many products did user A view?
- What's the user journey from search to purchase?
- Which users abandoned cart?

### 2. Personalization

**Personalized recommendations:**

```javascript
// Get user's viewing history
const history = await db.productViews.findMany({
  where: { userId: req.userId },
  orderBy: { timestamp: 'desc' },
  take: 10
});

// Recommend similar products
const recommendations = await getRecommendations(history);
```

### 3. Shopping Cart (Without Auth)

**Anonymous cart persistence:**

```javascript
// Save cart items by user ID
POST /cart/items
Headers: { X-User-ID: "a3f8c921-..." }
Body: { productId: "123", quantity: 2 }

// Retrieve cart
GET /cart
Headers: { X-User-ID: "a3f8c921-..." }
Response: { items: [...], total: 150.00 }
```

### 4. Session Recovery

**Restore user session across devices:**

```javascript
// User clears localStorage
// Next visit generates new ID
// Backend can link IDs via email verification
```

---

## Frontend Usage Examples

### Accessing User Identifier

```typescript
import { getUserIdentifier, clearUserIdentifier } from '@/lib/user-identifier';

// Get current user ID
const userId = getUserIdentifier();
console.log('Current user:', userId);
// Output: "Current user: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b"

// Clear user ID (for testing)
clearUserIdentifier();
```

### API Requests (Automatic)

No changes needed! User ID is automatically included in all API requests:

```typescript
// Products API - X-User-ID automatically included
const products = await productsApi.getProducts({ category: 'dresses' });

// Moodboards API - X-User-ID automatically included
const moodboards = await moodboardsApi.getMoodboards();

// Admin API - X-User-ID automatically included
const stats = await adminApi.getDashboardStats();
```

### Manual Header Inspection

```typescript
// Check headers being sent (for debugging)
const userId = getUserIdentifier();
console.log('X-User-ID header:', userId);

// Verify in Network tab:
// Request Headers:
//   X-User-ID: a3f8c921-4d2e-4f1a-8b3c-9e2f5d7a6c1b
//   Authorization: Bearer eyJhbGc...
//   X-API-Key: your-api-key
```

---

## Database Schema Examples

### Analytics Table (PostgreSQL)

```sql
CREATE TABLE user_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- UUID from X-User-ID header
    action VARCHAR(50) NOT NULL,   -- 'view_product', 'add_to_cart', etc.
    resource_type VARCHAR(20),     -- 'product', 'moodboard', etc.
    resource_id VARCHAR(100),      -- ID of viewed/interacted item
    metadata JSONB,                -- Additional context
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);
```

### User Profile Table

```sql
CREATE TABLE user_profiles (
    user_id VARCHAR(36) PRIMARY KEY,  -- From X-User-ID header
    email VARCHAR(255) UNIQUE,        -- Optional (if user registers)
    preferences JSONB,                -- User preferences
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP,
    
    INDEX idx_email (email)
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
    
    UNIQUE(user_id, product_id),
    INDEX idx_user_id (user_id)
);
```

---

## Example Backend Queries

### 1. User Activity Timeline

```javascript
// Get all actions for a specific user
const activity = await db.query(`
    SELECT action, resource_type, resource_id, timestamp
    FROM user_analytics
    WHERE user_id = $1
    ORDER BY timestamp DESC
    LIMIT 50
`, [userId]);
```

### 2. Popular Products by Unique Users

```javascript
// Count unique users who viewed each product
const popularProducts = await db.query(`
    SELECT resource_id AS product_id, COUNT(DISTINCT user_id) AS unique_viewers
    FROM user_analytics
    WHERE action = 'view_product'
    GROUP BY resource_id
    ORDER BY unique_viewers DESC
    LIMIT 10
`);
```

### 3. User Cart Retrieval

```javascript
// Get cart items for anonymous user
const cartItems = await db.query(`
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.image
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
`, [userId]);
```

---

## Privacy Considerations

### GDPR Compliance

**User Rights:**
- Users can clear their identifier anytime
- Data is pseudonymous (no PII until user registers)
- Comply with "right to be forgotten"

**Implementation:**

```typescript
// Privacy settings page
function PrivacySettings() {
  const handleClearData = () => {
    // Clear local identifier
    clearUserIdentifier();
    
    // Request backend data deletion
    await fetch('/api/users/delete-data', {
      method: 'DELETE',
      headers: { 'X-User-ID': getUserIdentifier() }
    });
    
    toast.success('Your data has been cleared');
  };
  
  return (
    <Button onClick={handleClearData}>
      Clear My Data
    </Button>
  );
}
```

### Cookie Alternative

This system uses **localStorage instead of cookies**, which:
- ✅ No cookie consent banner needed (in many jurisdictions)
- ✅ Not sent to third-party domains
- ✅ User has full control (can clear in browser settings)
- ✅ More storage space (10MB vs 4KB)

---

## Testing

### Test User Identifier Generation

```typescript
import { getUserIdentifier, clearUserIdentifier, getExistingUserIdentifier } from '@/lib/user-identifier';

describe('User Identifier', () => {
  beforeEach(() => {
    clearUserIdentifier();
  });

  test('generates new ID on first call', () => {
    const id = getUserIdentifier();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('returns same ID on subsequent calls', () => {
    const id1 = getUserIdentifier();
    const id2 = getUserIdentifier();
    expect(id1).toBe(id2);
  });

  test('clears identifier', () => {
    getUserIdentifier();
    clearUserIdentifier();
    const existing = getExistingUserIdentifier();
    expect(existing).toBeNull();
  });
});
```

### Test API Header Injection

```typescript
import { apiClient } from '@/services/api/base.api';

describe('API User Identifier', () => {
  test('includes X-User-ID header in GET request', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    });
    global.fetch = mockFetch;

    await apiClient.get('/products');

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['X-User-ID']).toBeDefined();
    expect(headers['X-User-ID']).toMatch(/^[0-9a-f]{8}-/);
  });
});
```

---

## Troubleshooting

### Issue: User ID not being sent

**Check:**
1. Is `getUserIdentifier()` being called?
2. Check Network tab → Headers → `X-User-ID`
3. Verify localStorage has `lookbook-user-id` key

**Solution:**
```typescript
// Force regeneration
import { clearUserIdentifier, getUserIdentifier } from '@/lib/user-identifier';
clearUserIdentifier();
const newId = getUserIdentifier();
console.log('New ID:', newId);
```

### Issue: Different ID on each request

**Cause:** localStorage being cleared or `clearUserIdentifier()` being called

**Solution:**
```typescript
// Check if ID persists
const id1 = getUserIdentifier();
console.log('ID 1:', id1);

// Wait 1 second
setTimeout(() => {
  const id2 = getUserIdentifier();
  console.log('ID 2:', id2);
  console.log('Match:', id1 === id2); // Should be true
}, 1000);
```

### Issue: localStorage unavailable (private browsing)

**Behavior:** Generates temporary ID for each request

**Detection:**
```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (e) {
  console.warn('localStorage unavailable - using temporary IDs');
}
```

---

## Migration & Rollout

### Gradual Rollout

```javascript
// Backend can handle both with and without user ID
app.get('/products', (req, res) => {
  const userId = req.headers['x-user-id'];
  
  if (userId) {
    // Track analytics
    trackUserView(userId, 'products_page');
  }
  
  // Return products (works with or without ID)
  const products = await getProducts();
  res.json(products);
});
```

### Data Migration

If you already have user data, you can link old sessions to new IDs:

```javascript
// Link by email when user logs in
POST /auth/link-sessions
Body: { email: "user@example.com", userId: "a3f8c921-..." }

// Backend merges all data
const oldSessions = await findSessionsByEmail(email);
await mergeAnalytics(oldSessions, newUserId);
```

---

## Summary

✅ **Automatic** - No developer action needed for API calls  
✅ **Persistent** - Survives browser refresh and revisits  
✅ **Privacy-Friendly** - User has full control  
✅ **Analytics-Ready** - Track user behavior without auth  
✅ **Flexible** - Works for anonymous and authenticated users  
✅ **Scalable** - UUID v4 supports billions of unique IDs  

The user identification system enables powerful analytics and personalization while maintaining user privacy and simplicity.
