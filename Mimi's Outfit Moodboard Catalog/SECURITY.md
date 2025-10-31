# Security Documentation

## Admin-Only Build Configuration

This is an **admin-only build** optimized for secure administrative use. Token storage and security measures are designed for internal/admin users only, not for public-facing production with multiple user types.

---

## 🔐 Authentication & Token Handling

### Token Storage
- **JWT tokens stored in `localStorage`** under `admin-auth-storage` key
- **1-hour token expiration** (configurable by backend)
- Tokens are **automatically injected** in all API requests via `Authorization` header
- Client-side logout clears token from localStorage

### Route Protection
- **ProtectedRoute component** guards admin pages
- Checks for token presence in localStorage
- Automatically redirects to `/admin/login` if unauthenticated
- No server-side validation (client-only auth check)

### Security Notes
- ✅ Token is never printed in console logs
- ✅ Token is never exposed in network error messages
- ✅ Limited-scope admin API key recommended (not root)
- ⚠️ This setup is **NOT suitable** for multi-user public apps
- ⚠️ For public-facing apps, implement server-side sessions and HttpOnly cookies

---

## 🛡️ Security Headers

The following security headers are configured in `index.html`:

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               img-src 'self' data: https:; 
               connect-src 'self' https:; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline';">

<!-- Referrer Policy -->
<meta http-equiv="Referrer-Policy" 
      content="strict-origin-when-cross-origin">

<!-- Permissions Policy -->
<meta http-equiv="Permissions-Policy" 
      content="camera=(), microphone=(), geolocation=()">
```

### What These Headers Do

**Content-Security-Policy (CSP)**:
- `default-src 'self'` - Only load resources from same origin by default
- `img-src 'self' data: https:` - Allow images from same origin, data URIs, and HTTPS
- `connect-src 'self' https:` - Allow API connections to same origin and HTTPS endpoints
- `script-src 'self'` - Only execute scripts from same origin (blocks inline scripts)
- `style-src 'self' 'unsafe-inline'` - Allow styles from same origin and inline styles (for Tailwind)

**Referrer-Policy**:
- `strict-origin-when-cross-origin` - Send full URL for same-origin requests, only origin for cross-origin HTTPS

**Permissions-Policy**:
- Blocks access to camera, microphone, and geolocation APIs

---

## 🔗 Affiliate Link Security

### Simple URL Validation
Vendor whitelist has been **removed** and replaced with basic URL validation:

```typescript
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
```

### Redirect Flow
1. User clicks "Shop Now" on product
2. Frontend validates URL format (basic check)
3. 3-second countdown with product preview
4. Redirect to external retailer with UTM tracking
5. Affiliate click event tracked for analytics

### External Link Security
- All external links have `rel="noopener noreferrer"` attribute
- Prevents reverse tabnabbing attacks
- Ensures opener doesn't gain access to referring page

---

## 🌐 API Request Security

### Request Timeouts
All API requests have a **10-second timeout** to prevent hanging:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

const response = await fetch(url, {
  signal: controller.signal,
  // ...
});

clearTimeout(timeout);
```

- Applies to GET, POST, PUT, DELETE, and FormData requests
- Returns `408 Request Timeout` error on timeout
- Prevents resource exhaustion from slow connections

### Headers Automatically Injected
- `Authorization: Bearer <token>` - JWT authentication (when logged in)
- `X-API-Key: <key>` - API key authentication (if configured)
- `X-User-ID: <guid>` - Anonymous user identifier for analytics

---

## 🏗️ Build Configuration

### Production Build Settings
**vite.config.ts**:
```typescript
export default defineConfig({
  build: {
    sourcemap: false, // Disable sourcemaps in production
  },
});
```

- **No source maps** in production builds
- Reduces bundle size by ~30-40%
- Prevents code inspection via browser DevTools
- Makes reverse engineering more difficult

### Environment Variables
Create `.env` file (never commit to Git):

```bash
# API Configuration
VITE_API_MODE=mock                    # 'mock' or 'real'
VITE_API_BASE_URL=https://api.your-domain.com
VITE_API_KEY=your_limited_scope_api_key_here
VITE_API_DEBUG=false                  # Set to true for development only

# Image Upload
VITE_ENABLE_IMAGE_UPLOAD=true         # Enable/disable image uploads

# Affiliate Security (deprecated - now uses simple URL validation)
VITE_RESTRICT_AFFILIATE_RETAILERS=false
```

**Always include `.env` in `.gitignore`!**

Provide `.env.example` for reference (with placeholder values).

---

## 📦 Dependency Auditing

### NPM Audit Script
Run security audits regularly:

```bash
npm run audit
```

This runs `npm audit --production` to check production dependencies only.

### Best Practices
- Run audit weekly or before each deployment
- Fix **high** and **critical** vulnerabilities immediately
- Review **moderate** and **low** vulnerabilities case-by-case
- Update dependencies regularly (but test thoroughly)

---

## 🚫 Removed Features

### Vendor Whitelist (Removed)
- Previously had a hardcoded list of 22+ trusted retailers
- Removed to simplify admin-only build
- Replaced with basic URL validation (HTTP/HTTPS check)
- Retailers management page kept for reference but not enforced

### Files Removed
- Vendor whitelist logic removed from `AffiliateRedirect.tsx`
- Security badge removed from redirect page UI
- Config flag `VITE_RESTRICT_AFFILIATE_RETAILERS` now ignored

---

## ✅ Security Checklist

Before deploying to production:

- [ ] Set `VITE_API_MODE=real` in production environment
- [ ] Configure limited-scope API key (not root admin key)
- [ ] Set `VITE_API_DEBUG=false` in production
- [ ] Verify `.env` is in `.gitignore`
- [ ] Run `npm run audit` and fix critical vulnerabilities
- [ ] Test that sourcemaps are disabled (`npm run build`)
- [ ] Verify CSP headers work with your backend API URLs
- [ ] Test token expiration and auto-logout behavior
- [ ] Ensure all external links have `rel="noopener noreferrer"`
- [ ] Review admin user access list (who has credentials?)

---

## 🔍 Monitoring & Logging

### What to Monitor
- Failed login attempts (multiple failed attempts = potential attack)
- API errors (frequent 401/403 = token issues)
- Request timeouts (frequent timeouts = slow backend or network issues)
- Unusual traffic patterns to admin routes

### What NOT to Log
- ❌ JWT tokens (never log tokens)
- ❌ API keys (never log in plain text)
- ❌ User passwords (never log credentials)
- ❌ Personal information (GDPR/privacy concerns)

### What to Log
- ✅ Login/logout events (timestamp, user ID)
- ✅ API errors (status code, endpoint, error message)
- ✅ Failed authentication attempts
- ✅ Admin actions (create/update/delete operations)

---

## 🆘 Incident Response

### If Token is Compromised
1. Immediately invalidate all JWT tokens on backend
2. Force all admins to re-login
3. Review API access logs for suspicious activity
4. Rotate API keys
5. Investigate how token was leaked

### If API Key is Exposed
1. Immediately rotate API key on backend
2. Update `.env` with new key
3. Review access logs for unauthorized requests
4. Check if any data was compromised
5. Audit where key might have been exposed (logs, screenshots, etc.)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## 📝 Notes

This security setup is designed for **admin-only internal tools** where:
- Limited number of trusted users (admins)
- Users understand security best practices
- Not publicly accessible (behind firewall/VPN)
- Token storage in localStorage is acceptable risk

**For public-facing apps with multiple user roles:**
- Use **HttpOnly cookies** for tokens
- Implement **server-side sessions**
- Add **CSRF protection**
- Use **refresh tokens** with short-lived access tokens
- Implement **rate limiting**
- Add **2FA/MFA** for admin accounts
