# Migration Checklist: Mock → Real API

Use this checklist when you're ready to connect your application to a real backend API.

## ✅ Pre-Migration Checklist

### 1. Backend API Ready
- [ ] Backend API is deployed and accessible
- [ ] All required endpoints are implemented (see API_INTEGRATION.md)
- [ ] API authentication is configured
- [ ] CORS is properly configured for your frontend domain
- [ ] API documentation is available

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `VITE_API_MODE=real`
- [ ] Set `VITE_API_BASE_URL` to your API URL
- [ ] Set `VITE_API_KEY` if required
- [ ] Test environment variables are loading correctly

### 3. API Compatibility
- [ ] Backend returns data in the expected format (Product, Moodboard types)
- [ ] All required fields are present in responses
- [ ] Filtering parameters match what the frontend sends
- [ ] Sort parameters work correctly
- [ ] Error responses follow standard format

## 🔧 Migration Steps

### Step 1: Enable Debug Mode

```env
VITE_API_DEBUG=true
VITE_API_MODE=mock
```

This helps you see what requests would be made without actually making them yet.

### Step 2: Verify Data Types

Compare your API response format with the expected types:

**Expected Product Type:**
```typescript
interface Product {
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

**Expected Moodboard Type:**
```typescript
interface Moodboard {
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

### Step 3: Test Individual Endpoints

Test each endpoint one by one:

```typescript
// In browser console or a test file
import { productsApi, moodboardsApi } from '@/services/api';

// Test products
const products = await productsApi.getAllProducts();
console.log('Products:', products);

const featured = await productsApi.getFeaturedProducts();
console.log('Featured:', featured);

const product = await productsApi.getProductBySlug('test-slug');
console.log('Single product:', product);

// Test moodboards
const moodboards = await moodboardsApi.getAllMoodboards();
console.log('Moodboards:', moodboards);
```

### Step 4: Switch to Real Mode

```env
VITE_API_MODE=real
VITE_API_DEBUG=true
```

Restart your dev server and monitor the console for API requests.

### Step 5: Test Core Flows

Test these critical user flows:

- [ ] **Homepage loads** with featured products and moodboards
- [ ] **Products page** displays all products
- [ ] **Filtering works** (category, brand, price, tags)
- [ ] **Sorting works** (newest, price-low, price-high, name)
- [ ] **Product detail** page loads correctly
- [ ] **Search functionality** returns results
- [ ] **Moodboards page** displays all moodboards
- [ ] **Moodboard detail** shows products
- [ ] **Error states** display properly when API fails
- [ ] **Loading states** show during requests

### Step 6: Error Handling

Test error scenarios:

- [ ] Invalid product slug returns 404
- [ ] Invalid moodboard ID returns 404
- [ ] Network errors show user-friendly messages
- [ ] API rate limiting is handled gracefully
- [ ] Timeout scenarios are handled

### Step 7: Performance Check

- [ ] Initial page load is fast
- [ ] Subsequent navigations are smooth
- [ ] Images load progressively
- [ ] No unnecessary API calls
- [ ] Caching is working (if implemented)

## 🐛 Common Issues & Solutions

### Issue: CORS Errors

**Symptom:** Console shows "Access-Control-Allow-Origin" errors

**Solution:**
```javascript
// Backend needs to set CORS headers
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
```

### Issue: 401 Unauthorized

**Symptom:** All requests fail with 401 status

**Solutions:**
1. Verify `VITE_API_KEY` is set correctly
2. Check API key is being sent in headers
3. Verify backend is receiving the API key

### Issue: Different Data Format

**Symptom:** TypeScript errors or missing data in UI

**Solution:** Create adapter functions:

```typescript
// src/services/api/adapters.ts
export function adaptProduct(apiProduct: any): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    price: apiProduct.price,
    imageUrl: apiProduct.image_url, // Adapt snake_case to camelCase
    affiliateUrl: apiProduct.affiliate_url,
    brand: apiProduct.brand,
    // ... map other fields
  };
}
```

### Issue: Slow API Responses

**Symptom:** Long loading times

**Solutions:**
1. Implement pagination
2. Add caching
3. Optimize backend queries
4. Use CDN for images

### Issue: Missing Required Fields

**Symptom:** UI breaks or shows undefined values

**Solution:** Add default values in adapter:

```typescript
export function adaptProduct(apiProduct: any): Product {
  return {
    id: apiProduct.id || 'unknown',
    name: apiProduct.name || 'Unnamed Product',
    price: apiProduct.price ?? null,
    imageUrl: apiProduct.image_url || '/placeholder.jpg',
    // ...
  };
}
```

## 📊 Testing Checklist

### Manual Testing

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile device
- [ ] Test with slow network (Chrome DevTools → Network → Slow 3G)
- [ ] Test with offline mode
- [ ] Test with API errors (temporarily break API key)

### Automated Testing (Optional)

```typescript
// Example test
describe('Products API', () => {
  it('should fetch all products', async () => {
    const products = await productsApi.getAllProducts();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });

  it('should filter products by category', async () => {
    const products = await productsApi.getAllProducts({ category: 'dresses' });
    products.forEach(p => expect(p.category).toBe('dresses'));
  });
});
```

## 🚀 Deployment

### Environment Variables

Make sure these are set in your hosting platform:

**Vercel:**
```bash
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your_production_key
VITE_API_DEBUG=false
```

**Netlify:**
```bash
# Same as Vercel
```

### Build Configuration

Verify your build works:

```bash
npm run build
npm run preview
```

Test the production build locally before deploying.

## 🔄 Rollback Plan

If something goes wrong, quickly rollback:

1. **Change environment variable:**
   ```env
   VITE_API_MODE=mock
   ```

2. **Redeploy** or restart dev server

3. **Debug** the issue in development

4. **Fix and re-migrate**

## 📈 Post-Migration

### Monitoring

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Monitor user feedback

### Optimization

- [ ] Implement caching strategy
- [ ] Add pagination for large lists
- [ ] Optimize image delivery
- [ ] Add request retry logic
- [ ] Implement offline support (PWA)

### Documentation

- [ ] Update team documentation
- [ ] Document API endpoints used
- [ ] Create troubleshooting guide
- [ ] Update environment setup guide

## 💡 Best Practices

1. **Migrate gradually** - Test one endpoint at a time
2. **Keep mock mode working** - Useful for development and demos
3. **Use feature flags** - Can switch modes per feature if needed
4. **Monitor everything** - Set up logging and monitoring
5. **Have a rollback plan** - Know how to quickly revert
6. **Test thoroughly** - Don't skip testing!
7. **Communicate changes** - Let team know about the migration

## 📚 Resources

- **API Documentation**: `/docs/API_INTEGRATION.md`
- **Usage Examples**: `/docs/API_USAGE_EXAMPLES.md`
- **Type Definitions**: `/src/types/index.ts`
- **API Services**: `/src/services/api/`

## ✅ Final Verification

Before going live, verify:

- [ ] All pages load correctly
- [ ] No console errors
- [ ] All features work as expected
- [ ] Error handling is graceful
- [ ] Loading states are smooth
- [ ] Performance is acceptable
- [ ] Mobile experience is good
- [ ] SEO tags are correct
- [ ] Analytics is tracking
- [ ] Monitoring is active

---

**Ready to migrate?** Follow this checklist step by step, and you'll have a smooth transition! 🚀

**Need help?** Review the mock API implementation in `/src/services/api/` as a reference for what your backend should return.
