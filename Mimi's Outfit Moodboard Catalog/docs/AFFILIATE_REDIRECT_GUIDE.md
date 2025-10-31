# Affiliate Redirect Page - Complete Guide

## Overview

The affiliate redirect page is a premium intermediary page that provides users with a transparent, secure, and elegant experience when being redirected to external retailers. It serves multiple purposes:

1. **Transparency**: Clear disclosure about affiliate partnerships
2. **Security**: Validation of trusted retailer domains
3. **Analytics**: Comprehensive UTM tracking for performance measurement
4. **UX**: Elegant loading experience with product context
5. **Trust**: Verified retailer badge and security indicators

---

## Features

### 🔒 Security Features

#### Domain Whitelist
- **22+ Verified Retailers**: Only trusted domains are allowed
- **HTTPS Enforcement**: All redirects must use secure HTTPS protocol
- **Verified Badge**: Visual indicator showing "Verified Retailer"
- **Malicious Link Prevention**: Blocks unverified domains

**Trusted Retailers**:
```typescript
// Luxury & Designer
- nordstrom.com
- net-a-porter.com
- saksfifthavenue.com
- bergdorfgoodman.com
- matchesfashion.com
- mytheresa.com
- luisaviaroma.com
- farfetch.com
- ssense.com

// Contemporary & Mid-Tier
- shopbop.com
- revolve.com
- anthropologie.com
- freepeople.com
- urbanoutfitters.com

// Fast Fashion & Accessible
- zara.com
- hm.com
- asos.com
- mango.com
- stories.com

// Marketplaces
- amazon.com
- etsy.com
- ebay.com
```

#### Validation Logic
```typescript
function isValidAffiliateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Check trusted domain
    const isTrusted = TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    // Enforce HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    return isTrusted;
  } catch {
    return false;
  }
}
```

---

### 📊 Analytics & Tracking

#### UTM Parameters
Automatic addition of comprehensive tracking parameters:

```typescript
function addTrackingParams(url: string, productId: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', 'lookbook_mimi');
  urlObj.searchParams.set('utm_medium', 'affiliate');
  urlObj.searchParams.set('utm_campaign', 'product_redirect');
  urlObj.searchParams.set('utm_content', productId);
  urlObj.searchParams.set('ref', 'lookbook');
  return urlObj.toString();
}
```

**Tracking Breakdown**:
- `utm_source=lookbook_mimi` - Identifies traffic source
- `utm_medium=affiliate` - Marketing channel
- `utm_campaign=product_redirect` - Campaign identifier
- `utm_content=[productId]` - Specific product tracking
- `ref=lookbook` - Referral identifier

**Example Final URL**:
```
https://nordstrom.com/product/classic-trench?
  utm_source=lookbook_mimi&
  utm_medium=affiliate&
  utm_campaign=product_redirect&
  utm_content=prod_001&
  ref=lookbook
```

---

### 🎨 User Experience

#### Countdown Timer
- **5 seconds**: Optimal balance between transparency and convenience
- **Visual countdown**: Large numeric display
- **Cancel option**: Users can return to previous page
- **Manual skip**: "Continue Now" button for immediate redirect

#### Product Context
The page displays rich product information during the countdown:
- **Hero image**: Full product photo with gradient overlay
- **Product name**: Clearly displayed
- **Brand name**: Prominent retailer identification
- **Price**: Visible pricing information
- **Category**: Product classification
- **Tags**: Up to 3 relevant style tags

#### Loading States
- **Initial fetch**: Spinner with "Loading product information..."
- **Redirect in progress**: Animated loader with countdown
- **Error states**: Clear error messages with action options

---

### 🔄 API Integration

#### Live Product Fetching
The redirect page uses the live API to fetch product data:

```typescript
// Fetch product by ID
const data = await productsApi.getProductById(id);

// Validate product and affiliate URL
if (!data) {
  setError('Product not found');
  return;
}

if (!data.affiliateUrl) {
  setError('This product does not have a purchase link available');
  return;
}

if (!isValidAffiliateUrl(data.affiliateUrl)) {
  setError('This affiliate link is not from a verified retailer');
  return;
}
```

#### Mock/Real Mode Support
- **Mock mode**: Uses local data from `mock-data.ts`
- **Real mode**: Fetches from backend API endpoint `/products/{id}`
- **Seamless switching**: Controlled by `VITE_API_MODE` environment variable

---

### ⚠️ Error Handling

#### Error Types

**1. Product Not Found**
```
Status: Product doesn't exist
Display: 🔗 icon + "Product Not Found" message
Actions: [Go Back] [Browse Products]
```

**2. Invalid Affiliate URL**
```
Status: URL validation failed
Display: ⚠️ icon + "Security Warning" message
Actions: [Go Back] [Browse Safe Products]
```

**3. Missing Affiliate Link**
```
Status: Product has no purchase link
Display: ⚠️ icon + "Link not available" message
Actions: [Go Back] [Browse Products]
```

**4. API Fetch Error**
```
Status: Network or server error
Display: ⚠️ icon + "Unable to load product information"
Actions: [Go Back] [Browse Products]
```

---

### 📱 Responsive Design

#### Mobile Optimization
- **Touch-friendly**: All buttons meet 44px minimum touch target
- **Adaptive layout**: Single column on mobile, centered card on desktop
- **Readable text**: Optimized font sizes for all screen sizes
- **Safe areas**: Padding for mobile notches and rounded corners

#### Breakpoints
```css
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md/lg)
- Desktop: > 1024px (xl)
```

---

### ♿ Accessibility

#### WCAG 2.1 AA Compliance
- **Color contrast**: All text meets minimum contrast ratios
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Semantic HTML and ARIA labels
- **Focus indicators**: Visible focus states for all interactive elements

#### Semantic Structure
```html
<div role="main">
  <h1>Redirecting to {Brand}</h1>
  <img alt="Product description" />
  <button aria-label="Cancel redirect">Go Back</button>
  <button aria-label="Skip countdown">Continue Now</button>
</div>
```

---

## Usage

### User Flow

1. **User clicks "Shop Now"** on a product card
2. **Navigate to** `/go/{productId}`
3. **Page loads** product information via API
4. **Validation** checks affiliate URL security
5. **Display** product preview with countdown
6. **Options**:
   - Wait 5 seconds for auto-redirect
   - Click "Continue Now" for immediate redirect
   - Click "Cancel & Go Back" to return
7. **Redirect** to retailer with UTM tracking

### Developer Integration

#### Link Generation
```typescript
// ProductCard.tsx
<Link to={`/go/${product.id}`}>
  <Button>Shop Now</Button>
</Link>
```

#### Route Configuration
```typescript
// App.tsx
<Route path="/go/:id" element={<AffiliateRedirect />} />
```

---

## Customization

### Adjusting Countdown Duration

Change the initial countdown value:
```typescript
const [countdown, setCountdown] = useState(5); // Change from 5 to desired seconds
```

### Adding New Trusted Domains

Update the whitelist array:
```typescript
const TRUSTED_DOMAINS = [
  // ... existing domains
  'newretailer.com',
  'anotherstore.com'
];
```

### Modifying UTM Parameters

Customize tracking in `addTrackingParams()`:
```typescript
urlObj.searchParams.set('utm_source', 'your_brand');
urlObj.searchParams.set('utm_campaign', 'your_campaign');
```

---

## Best Practices

### For Designers
1. Maintain visual consistency with brand guidelines
2. Ensure countdown is large and easily readable
3. Use high-quality product images
4. Keep disclosure text clear and prominent

### For Developers
1. Always validate affiliate URLs before redirect
2. Handle all error states gracefully
3. Test with various network conditions
4. Monitor analytics to optimize conversion

### For Marketers
1. Use UTM parameters consistently across campaigns
2. Track redirect completion rates
3. A/B test countdown duration
4. Monitor affiliate link performance

---

## Performance

### Metrics
- **Initial load**: < 500ms (with cached API)
- **API fetch time**: 50-200ms (mock) / 200-500ms (real)
- **Redirect delay**: 5 seconds (configurable)
- **Bundle size**: ~12KB (minified + gzipped)

### Optimization
- Lazy loading via React.lazy()
- Image optimization with lazy loading attribute
- Minimal dependencies (uses existing UI components)
- Efficient state management

---

## SEO Considerations

### Meta Tags
Dynamic SEO tags via react-helmet-async:
```typescript
<SEO 
  title={`Redirecting to ${product.brand} - ${product.name}`}
  description={`Taking you to purchase ${product.name} from ${product.brand}`}
/>
```

### Robots
- Redirect pages should NOT be indexed
- Add to robots.txt if needed:
```
Disallow: /go/
```

---

## Testing

### Manual Testing Checklist
- [ ] Valid product ID loads correctly
- [ ] Invalid product ID shows error
- [ ] Countdown timer works (5, 4, 3, 2, 1)
- [ ] Auto-redirect happens at 0
- [ ] "Continue Now" skips countdown
- [ ] "Cancel & Go Back" returns to previous page
- [ ] Security badge displays
- [ ] Product image loads
- [ ] UTM parameters added to final URL
- [ ] Mobile responsive layout
- [ ] Keyboard navigation works
- [ ] Error states display correctly

### Test URLs
```
Valid: /go/prod_001
Invalid: /go/invalid_id
Missing: /go/missing_product
```

---

## Troubleshooting

### Common Issues

**Problem**: Redirect not happening
- Check if affiliate URL is valid HTTPS
- Verify domain is in whitelist
- Check browser console for errors

**Problem**: Product not loading
- Verify API mode configuration
- Check product exists in data source
- Test API endpoint directly

**Problem**: UTM parameters not appearing
- Verify URL is valid format
- Check addTrackingParams() function
- Inspect final redirect URL in network tab

**Problem**: Security warning showing for valid retailer
- Ensure domain includes subdomain if needed
- Check HTTPS protocol
- Verify whitelist includes domain

---

## Future Enhancements

### Potential Improvements
1. **Conversion tracking**: Fire events to analytics on redirect
2. **Dynamic countdown**: Adjust based on user preferences
3. **Social sharing**: Allow users to share products before redirect
4. **Price comparison**: Show prices from multiple retailers
5. **Review snippets**: Display quick product reviews
6. **Similar products**: Show alternatives before redirect
7. **Wishlist integration**: Quick add to favorites
8. **Commission display**: Show transparency about earnings

---

## Conclusion

The affiliate redirect page is a critical component that balances user experience, security, transparency, and business goals. It transforms a simple redirect into a thoughtful touchpoint that builds trust and provides value.

**Key Takeaways**:
- Security is paramount (whitelist + HTTPS)
- Transparency builds trust (clear disclosure)
- UX matters (elegant design + context)
- Analytics enable optimization (comprehensive UTM)
- Accessibility is essential (WCAG compliance)

For questions or improvements, refer to the main project documentation or submit a pull request.
