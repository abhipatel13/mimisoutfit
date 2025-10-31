# Retailers Management Guide

Complete guide for managing trusted affiliate retailers in The Lookbook by Mimi admin portal.

---

## 🎯 Overview

The Retailers Management system provides a **dynamic whitelist** for affiliate redirect security. Admins can add, remove, test, and manage trusted retailers without touching code or redeploying the application.

### Key Features

- **Dynamic Management**: Add/remove retailers through admin UI
- **No Code Changes**: Updates apply immediately without deployment
- **Security Enforcement**: HTTPS validation, domain whitelist checking
- **URL Testing**: Test any affiliate URL before adding to products
- **Category Organization**: Luxury, Contemporary, Fast Fashion, Marketplace
- **Activate/Deactivate**: Temporarily disable retailers without deleting
- **Statistics Dashboard**: Track total retailers, active count, by category
- **LocalStorage Sync**: Changes persist and sync to redirect page automatically

---

## 🔐 Why Whitelist Retailers?

### Security & Safety
- **Prevents phishing**: Blocks malicious redirect links
- **HTTPS enforcement**: Ensures secure connections
- **Domain validation**: Only verified retailers allowed
- **User protection**: Prevents redirect to harmful sites

### Business & Legal
- **Affiliate compliance**: Only work with legitimate partners
- **FTC compliance**: Proper affiliate disclosures
- **Commission protection**: Prevents fraud
- **Brand reputation**: Association with quality retailers only

### User Trust
- **Verified badge**: Users see "Verified Retailer" badge
- **Transparency**: Clear affiliate disclosure
- **Quality assurance**: Only reputable shopping destinations

---

## 📍 Accessing Retailers Management

### Route
`/admin/retailers`

### Navigation
1. Login to admin portal (`/admin/login`)
2. Click "Retailers" in header navigation
3. Or from Dashboard → "Retailers" → "Manage List"

---

## 📊 Dashboard Overview

### Statistics Cards

**Total Retailers**
- Count of all retailers in system
- Includes active and inactive

**Active Retailers**
- Currently whitelisted domains
- Only active retailers allow redirects

**By Category** (2 cards)
- Distribution across categories
- Helps maintain balance

### Test URL Tool

Test any affiliate URL before using:

```
Input: https://www.nordstrom.com/product/...
Output: ✓ Valid - Nordstrom
```

### Search Bar

Real-time filtering by:
- Retailer name
- Domain
- Category

---

## ➕ Adding a Retailer

### Steps

1. Click **"Add Retailer"** button (top right)
2. Fill in the form:
   - **Retailer Name*** (e.g., "Nordstrom")
   - **Domain*** (e.g., "nordstrom.com")
   - **Category*** (select from dropdown)
3. Click **"Add Retailer"**

### Validation Rules

**Domain Format**
- Must be valid domain (e.g., `example.com`)
- No protocol (don't include `https://`)
- No `www.` prefix (will be normalized)
- Lowercase only

**Duplicate Check**
- Cannot add same domain twice
- Error shown if duplicate

**Required Fields**
- Name and domain are required
- Category defaults to "Contemporary"

### Categories

| Category | Examples |
|----------|----------|
| **Luxury & Designer** | Nordstrom, Net-A-Porter, Saks |
| **Contemporary** | Shopbop, Revolve, Anthropologie |
| **Fast Fashion** | Zara, H&M, ASOS |
| **Marketplace** | Amazon, Etsy, eBay |

---

## ✏️ Managing Retailers

### Retailer Card Layout

Each retailer displays:
- **Status indicator** (green = active, gray = inactive)
- **Name** (clickable to visit site)
- **Category badge** (color-coded)
- **Domain** (with external link icon)
- **Action buttons** (Activate/Deactivate, Delete)

### Actions

**Activate/Deactivate**
- Toggle between active and inactive states
- Inactive retailers don't allow redirects
- Use for temporary disable (e.g., maintenance, issues)

**Delete**
- Permanently removes retailer
- Shows confirmation dialog
- Cannot be undone

**Visit Site**
- Click external link icon next to domain
- Opens retailer website in new tab

---

## 🧪 Testing Affiliate URLs

### Test Tool Usage

1. Paste any affiliate URL in the test field
2. Click **"Test URL"**
3. See result:
   - ✓ **Valid**: Domain is in active whitelist
   - ✗ **Not trusted**: Domain not whitelisted
   - ✗ **Invalid URL**: Malformed URL

### Example Tests

```
✓ https://www.nordstrom.com/product/123
   → Valid - Nordstrom

✗ https://www.untrustedsite.com/product/123
   → Not trusted - untrustedsite.com

✗ not-a-url
   → Invalid URL format
```

---

## 🔄 How It Works

### Data Flow

```
Admin Panel → LocalStorage → Redirect Page
   (Add/Edit)      (Persist)      (Read)
```

1. **Admin adds retailer** → Saved to `localStorage` under `trusted-retailers`
2. **LocalStorage persists** → Survives page refreshes and sessions
3. **Redirect page reads** → Uses `getTrustedRetailers()` from `trusted-retailers.ts`
4. **Validation happens** → URL checked against active whitelist

### Files Involved

**Admin Page**
- `/src/pages/admin/AdminRetailersPage.tsx` - UI for management

**Utility Library**
- `/src/lib/trusted-retailers.ts` - Core logic and helpers

**Redirect Page**
- `/src/pages/AffiliateRedirect.tsx` - Uses `isValidAffiliateUrl()`

---

## 🛠️ Technical Details

### Data Structure

```typescript
interface TrustedRetailer {
  domain: string;              // e.g., "nordstrom.com"
  name: string;                // e.g., "Nordstrom"
  category: string;            // "luxury" | "contemporary" | etc.
  addedAt: string;             // ISO date string
  isActive: boolean;           // true = allows redirects
}
```

### LocalStorage Key

```typescript
KEY: 'trusted-retailers'
VALUE: JSON string of TrustedRetailer[]
```

### Helper Functions

**`getTrustedRetailers()`**
- Loads from localStorage or returns defaults
- Returns: `TrustedRetailer[]`

**`getActiveTrustedDomains()`**
- Filters for active retailers only
- Returns: `string[]` (just domains)

**`isValidAffiliateUrl(url: string)`**
- Validates URL against whitelist
- Enforces HTTPS
- Returns: `boolean`

**`getRetailerByUrl(url: string)`**
- Gets retailer info from URL
- Returns: `TrustedRetailer | null`

---

## 🔒 Security Features

### HTTPS Enforcement

All affiliate URLs must use HTTPS:

```typescript
if (urlObj.protocol !== 'https:') {
  return false; // Blocked
}
```

### Domain Normalization

- Removes `www.` prefix automatically
- Lowercase comparison
- Subdomain protection

### Active-Only Validation

Only retailers with `isActive: true` allow redirects:

```typescript
trustedDomains = retailers
  .filter(r => r.isActive)
  .map(r => r.domain);
```

---

## 📋 Default Retailers (22)

The system ships with 22 pre-configured retailers:

### Luxury & Designer (9)
- Nordstrom
- Net-A-Porter
- Saks Fifth Avenue
- Bergdorf Goodman
- Matches Fashion
- Mytheresa
- Luisa Via Roma
- Farfetch
- SSENSE

### Contemporary (5)
- Shopbop
- Revolve
- Anthropologie
- Free People
- Urban Outfitters

### Fast Fashion (5)
- Zara
- H&M
- ASOS
- Mango
- & Other Stories

### Marketplaces (3)
- Amazon
- Etsy
- eBay

---

## 🎨 User Experience

### For Admins

1. **Easy Management**: No technical knowledge required
2. **Instant Updates**: Changes apply immediately
3. **Visual Feedback**: Clear success/error messages
4. **Search & Filter**: Find retailers quickly
5. **Category Organization**: Logical grouping

### For Site Visitors

1. **Security**: See "Verified Retailer" badge
2. **Trust**: Know they're going to legitimate sites
3. **Transparency**: Clear affiliate disclosure
4. **Performance**: Fast redirect (5 seconds with countdown)

---

## 🚨 Common Questions

### Q: Who can manage retailers?
**A:** Only authenticated admin users with access to `/admin/retailers`

### Q: Do changes require redeployment?
**A:** No! Changes are immediate via localStorage

### Q: What happens to existing products if I remove a retailer?
**A:** Their affiliate links will be blocked on redirect page

### Q: Can I temporarily disable a retailer?
**A:** Yes! Use the "Deactivate" button instead of deleting

### Q: How do I know if an affiliate URL is valid?
**A:** Use the "Test URL" tool on the retailers page

### Q: What if localStorage is cleared?
**A:** System falls back to DEFAULT_RETAILERS (the 22 pre-configured)

### Q: Can users see inactive retailers?
**A:** No, only active retailers allow redirects

### Q: Is this secure?
**A:** Yes - HTTPS enforced, domain validation, whitelist checking

---

## 🔄 Migration from Old System

### Old System (Hardcoded)

```typescript
// src/pages/AffiliateRedirect.tsx
const TRUSTED_DOMAINS = [
  'nordstrom.com',
  'zara.com',
  // ... hardcoded list
];
```

**Problems:**
- Required code changes
- Needed redeployment
- Developer-only updates

### New System (Dynamic)

```typescript
// src/lib/trusted-retailers.ts
export function getTrustedRetailers() {
  // Load from localStorage
  // Fallback to defaults
}
```

**Benefits:**
- No code changes needed
- Instant updates
- Admin UI for non-developers
- Persistent storage
- Automatic sync

---

## 📈 Best Practices

### When to Add a Retailer

✅ **Add when:**
- You have an affiliate partnership
- Retailer is reputable and established
- HTTPS is supported
- You trust the domain

❌ **Don't add:**
- Unverified or suspicious sites
- Non-HTTPS domains
- Temporary or test URLs
- Untrusted marketplaces

### Organization Tips

1. **Use categories wisely** - Helps with organization and stats
2. **Test before adding** - Use the test tool
3. **Keep names consistent** - "Nordstrom" not "Nordstrom.com"
4. **Document changes** - Keep track of why retailers were added/removed

### Maintenance

- **Monthly review**: Check for inactive partnerships
- **Test links periodically**: Ensure domains still work
- **Clean up unused**: Remove inactive retailers you won't use
- **Balance categories**: Maintain variety across luxury, contemporary, etc.

---

## 🆘 Troubleshooting

### Issue: "Retailer already exists"
**Solution:** That domain is already in the list. Search for it.

### Issue: "Invalid domain format"
**Solution:** Use format like `example.com` (no https://, no www.)

### Issue: Test URL shows "Not trusted" for added retailer
**Solution:** Check if retailer is **active** (green indicator)

### Issue: Changes not reflecting on redirect page
**Solution:** 
1. Check localStorage in browser DevTools
2. Clear cache and refresh
3. Ensure retailer is active

### Issue: Redirect page still shows old whitelist
**Solution:** The page caches retailers. Do a hard refresh (Ctrl+Shift+R)

---

## 🎓 Summary

The Retailers Management system provides:

✅ **Dynamic whitelist** management without code changes  
✅ **Security enforcement** with HTTPS and domain validation  
✅ **User-friendly interface** for non-technical admins  
✅ **Instant updates** via localStorage persistence  
✅ **Testing tools** to validate URLs before use  
✅ **Category organization** for better management  
✅ **Activate/deactivate** for temporary changes  

**Result:** Safer, more flexible, and easier to manage affiliate redirects! 🎉

---

## 📚 Related Documentation

- **Admin Portal Guide**: `/docs/ADMIN_PORTAL_GUIDE.md`
- **Affiliate Redirect Guide**: `/docs/AFFILIATE_REDIRECT_GUIDE.md`
- **API Integration**: `/docs/API_INTEGRATION.md`
- **Quick Start**: `/docs/QUICK_START.md`
