# Social Sharing System - Complete Implementation Guide

## Overview

The Lookbook by Mimi features a comprehensive social sharing system that allows users to share products and moodboards across multiple platforms with rich media support.

**Key Features:**
- ✅ **Native Web Share API (Primary)** - System share sheet to any app (iOS/Android)
- ✅ **WhatsApp Integration** - Share with formatted text and full image blobs
- ✅ **Copy Link** - Quick clipboard copy functionality
- ✅ **Fallback Support** - Graceful degradation for unsupported browsers
- ✅ **Responsive Design** - Icon-only buttons for compact layouts
- ✅ **Rich Formatting** - Bold titles, prices, descriptions in WhatsApp

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [WhatsApp Integration](#whatsapp-integration)
3. [Native Share API](#native-share-api)
4. [Implementation Locations](#implementation-locations)
5. [Usage Examples](#usage-examples)
6. [Browser Support](#browser-support)
7. [Testing Guide](#testing-guide)
8. [Customization](#customization)

---

## Component Architecture

### ShareButton Component

**Location:** `/src/components/ShareButton.tsx`

**Props:**
```typescript
interface ShareButtonProps {
  title: string;           // Main title (product name, moodboard title)
  description?: string;    // Optional description
  price?: string;          // Optional price (e.g., "$129")
  imageUrl?: string;       // Optional image URL for blob sharing
  url: string;             // Full URL to share
  type: 'product' | 'moodboard'; // Content type
  variant?: 'default' | 'outline' | 'ghost'; // Button style
  size?: 'default' | 'sm' | 'lg' | 'icon'; // Button size
  showLabel?: boolean;     // Show "Share" text (default: true)
}
```

**Features:**
- Dropdown menu with 3 share options
- Toast notifications for user feedback
- Loading states during share operations
- Automatic fallback handling
- Stop propagation to prevent card/link clicks

---

## WhatsApp Integration

### Message Formatting

The component automatically formats WhatsApp messages with rich text:

```
*Classic Trench Coat*

Timeless beige trench coat perfect for transitional weather. Features double-breasted styling and belted waist.

💰 *Price:* $298

🔗 View here: https://thelookbookbymimi.com/products/classic-trench-coat
```

**Format Rules:**
- `*Text*` = Bold text
- Line breaks for readability
- Emoji icons (💰 for price, 🔗 for link)
- Price only shown if available
- Description only shown if available

### Image Blob Sharing

**How It Works:**

1. **Check Browser Support:**
   ```javascript
   if (navigator.canShare && imageUrl) { /* proceed */ }
   ```

2. **Fetch Image as Blob:**
   ```javascript
   const response = await fetch(imageUrl);
   const blob = await response.blob();
   const file = new File([blob], 'image.jpg', { type: blob.type });
   ```

3. **Verify File Sharing Support:**
   ```javascript
   if (navigator.canShare({ files: [file] })) { /* share */ }
   ```

4. **Share with Native API (Image + Text Together):**
   ```javascript
   await navigator.share({
     files: [file],
     text: formattedMessage,
   });
   ```

**Important:** On iOS Safari and Android Chrome, when sharing to WhatsApp via the Web Share API, the image and text are combined in **ONE share action** to WhatsApp. The recipient sees them together in the same message thread.

**Fallback Chain:**

1. **Primary:** Native share with full image blob + text (iOS Safari 14+, Android Chrome 10+)
   - **Result:** Image and text shared together in ONE message to WhatsApp
2. **Secondary:** WhatsApp web link with formatted text only (Desktop browsers)
   - **Result:** Rich text with clickable link (no image)
3. **Tertiary:** Error fallback - same as secondary

### WhatsApp Link Format

**Desktop Fallback:**
```
https://wa.me/?text=ENCODED_MESSAGE
```

- Automatically encodes text with `encodeURIComponent()`
- Opens in new tab
- Works on all platforms with WhatsApp installed

---

## Native Share API (Primary Method)

### Generic Share Function

**Why Primary:**
- ✅ **System native** - Uses device's built-in share sheet
- ✅ **Universal** - Share to ANY app (WhatsApp, Instagram, Email, Messages, etc.)
- ✅ **Better UX** - Familiar interface for users
- ✅ **Image support** - Full blob sharing on iOS Safari and Android Chrome
- ✅ **No formatting limits** - Supports title, text, URL, and files

**Capabilities:**
- Shares to ANY app (not just WhatsApp)
- Supports images on compatible devices
- Title, description, and URL included
- User chooses destination app

**Example Share Data:**
```javascript
const shareData = {
  title: "Classic Trench Coat",
  text: "Timeless beige trench coat...",
  url: "https://thelookbookbymimi.com/products/...",
  files: [imageFile] // If supported
};

await navigator.share(shareData);
```

**User Experience:**
- **iOS:** Native iOS share sheet appears
- **Android:** Android share menu appears
- **Desktop:** Browser-specific share UI (Chrome/Edge)

---

## Implementation Locations

### 1. Product Detail Page

**File:** `/src/pages/ProductDetailPage.tsx`

**Location:** Action buttons row (Shop Now, Favorite, Share)

```tsx
<ShareButton
  title={`${product.brand} ${product.name}`}
  description={product.description}
  price={product.price !== null ? `$${product.price}` : undefined}
  imageUrl={product.imageUrl}
  url={`${window.location.origin}/products/${product.slug}`}
  type="product"
  variant="outline"
  size="lg"
  showLabel={false}  // Icon only
/>
```

### 2. Product Card

**File:** `/src/components/ProductCard.tsx`

**Location:** Bottom of card (Shop Now row)

```tsx
<ShareButton
  title={`${product.brand} ${product.name}`}
  description={product.description}
  price={product.price !== null ? `$${product.price}` : undefined}
  imageUrl={product.imageUrl}
  url={`${window.location.origin}/products/${product.slug}`}
  type="product"
  variant="outline"
  size="sm"
  showLabel={false}  // Icon only for compact layout
/>
```

**Interaction:**
- `stopPropagation()` prevents card link click
- Small icon button for mobile-friendly touch targets

### 3. Moodboard Detail Page

**File:** `/src/pages/MoodboardDetailPage.tsx`

**Location:** Stats & Actions section (Save All, Share, Shop This Look)

```tsx
<ShareButton
  title={moodboard.title}
  description={moodboard.description}
  imageUrl={moodboard.coverImage}
  url={`${window.location.origin}/moodboards/${moodboard.slug}`}
  type="moodboard"
  variant="outline"
  size="lg"
  showLabel={false}  // Icon only
/>
```

### 4. Moodboard Card

**File:** `/src/components/MoodboardCard.tsx`

**Location:** Bottom of card (below tags and item count)

```tsx
<ShareButton
  title={moodboard.title}
  description={moodboard.description}
  imageUrl={moodboard.coverImage}
  url={`${window.location.origin}/moodboards/${moodboard.slug}`}
  type="moodboard"
  variant="outline"
  size="sm"
  showLabel={true}  // Show "Share" text
/>
```

---

## Usage Examples

### Example 1: Product Share (With Price)

**Input:**
```tsx
<ShareButton
  title="Levi's 501 Original Fit Jeans"
  description="Classic straight leg jeans in medium wash"
  price="$98"
  imageUrl="https://example.com/jeans.jpg"
  url="https://thelookbookbymimi.com/products/501-jeans"
  type="product"
/>
```

**WhatsApp Output:**
```
*Levi's 501 Original Fit Jeans*

Classic straight leg jeans in medium wash

💰 *Price:* $98

🔗 View here: https://thelookbookbymimi.com/products/501-jeans
```

### Example 2: Moodboard Share (No Price)

**Input:**
```tsx
<ShareButton
  title="Parisian Chic"
  description="Effortless French-inspired looks with neutral tones"
  imageUrl="https://example.com/parisian.jpg"
  url="https://thelookbookbymimi.com/moodboards/parisian-chic"
  type="moodboard"
/>
```

**WhatsApp Output:**
```
*Parisian Chic*

Effortless French-inspired looks with neutral tones

🔗 View here: https://thelookbookbymimi.com/moodboards/parisian-chic
```

### Example 3: Icon-Only Button

**Usage:**
```tsx
<ShareButton
  title="Product Name"
  url="https://example.com"
  type="product"
  size="icon"
  showLabel={false}
/>
```

**Renders:** Small square button with share icon only

---

## Browser Support

### WhatsApp Image Blob Sharing

| Platform | Browser | Image Blob Support | Text-Only Fallback |
|----------|---------|-------------------|-------------------|
| iOS 14+ | Safari | ✅ Yes | ✅ Yes |
| iOS 14+ | Chrome | ✅ Yes | ✅ Yes |
| Android 10+ | Chrome | ✅ Yes | ✅ Yes |
| Android 10+ | Firefox | ❌ No | ✅ Yes |
| Windows/Mac | All Browsers | ❌ No | ✅ Yes (WhatsApp Web) |

### Native Web Share API

| Platform | Browser | Support | Notes |
|----------|---------|---------|-------|
| iOS 12.2+ | Safari | ✅ Full | Native iOS share sheet |
| iOS 14+ | Chrome | ✅ Full | Native iOS share sheet |
| Android 5+ | Chrome 61+ | ✅ Full | Native Android menu |
| Windows 10+ | Edge 93+ | ✅ Partial | Desktop share UI |
| macOS | Safari 12.1+ | ✅ Full | macOS share menu |
| Desktop | Chrome/Firefox | ❌ Limited | No native UI |

### Copy to Clipboard

| Platform | Support | Notes |
|----------|---------|-------|
| All Modern Browsers | ✅ Yes | Requires HTTPS |
| iOS 13+ | ✅ Yes | Works in all browsers |
| Android 5+ | ✅ Yes | Works in all browsers |

---

## Testing Guide

### Test Scenarios

#### 1. WhatsApp Image Share (Mobile)

**Device:** iPhone with iOS 14+ or Android with Chrome 61+

**Steps:**
1. Open product or moodboard detail page
2. Tap the share button
3. Select "Share to WhatsApp"
4. **Expected:** WhatsApp opens with image AND formatted text
5. Verify image is attached (not a preview link)
6. Verify text formatting (bold title, price, emoji)

#### 2. WhatsApp Text Share (Desktop)

**Device:** Desktop browser

**Steps:**
1. Open product or moodboard detail page
2. Click the share button
3. Select "Share to WhatsApp"
4. **Expected:** WhatsApp Web opens in new tab
5. **Expected:** Text message is pre-filled in chat input
6. Verify no image attached (desktop limitation)

#### 3. Native Share (iOS)

**Device:** iPhone with Safari

**Steps:**
1. Open product detail page
2. Tap the share button
3. Select "Share..."
4. **Expected:** iOS native share sheet appears
5. Verify product image is visible
6. Select any app (Messages, Email, etc.)
7. Verify content is shared correctly

#### 4. Copy Link

**Device:** Any device

**Steps:**
1. Open any shareable page
2. Click/tap the share button
3. Select "Copy Link"
4. **Expected:** Toast notification: "Link copied!"
5. Paste into a note or browser
6. Verify link is correct

#### 5. Product Card Share

**Steps:**
1. Open Products page
2. Click share button on any product card
3. **Expected:** Share menu opens WITHOUT navigating to product
4. Verify `stopPropagation()` is working

### Console Logging

The component logs share attempts for debugging:

```javascript
console.log('WhatsApp share initiated:', {
  title,
  hasImage: !!imageUrl,
  blobShareSupported: navigator.canShare({ files: [file] })
});
```

Check browser console for diagnostic information.

---

## Customization

### Change Button Appearance

**Icon Only (Compact):**
```tsx
<ShareButton
  {...props}
  size="icon"
  showLabel={false}
/>
```

**Full Button with Label:**
```tsx
<ShareButton
  {...props}
  size="lg"
  showLabel={true}
/>
```

**Ghost Button (Transparent):**
```tsx
<ShareButton
  {...props}
  variant="ghost"
/>
```

### Modify WhatsApp Message Format

**Edit:** `/src/components/ShareButton.tsx`

**Function:** `formatWhatsAppMessage()`

**Example - Add Category:**
```typescript
const formatWhatsAppMessage = () => {
  let message = `*${title}*\n\n`;
  
  if (description) {
    message += `${description}\n\n`;
  }
  
  // Add category (new)
  if (category) {
    message += `📁 Category: ${category}\n`;
  }
  
  if (price) {
    message += `💰 *Price:* ${price}\n\n`;
  }
  
  message += `🔗 View here: ${url}`;
  
  return message;
};
```

### Add More Share Options

**Example - Add Twitter/X:**

1. Add menu item:
```tsx
<DropdownMenuItem
  onClick={handleTwitterShare}
  className="cursor-pointer"
>
  <Twitter className="mr-2 h-4 w-4 text-blue-400" />
  <span>Share on X</span>
</DropdownMenuItem>
```

2. Implement handler:
```typescript
const handleTwitterShare = () => {
  const text = `Check out ${title}! ${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank');
};
```

### Disable Specific Share Options

**Remove WhatsApp:**
```tsx
// Comment out or remove this DropdownMenuItem
{/* <DropdownMenuItem onClick={handleWhatsAppShare}>
  <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
  <span>Share to WhatsApp</span>
</DropdownMenuItem> */}
```

---

## Performance Considerations

### Image Blob Fetching

**Optimization:**
- Images are fetched ONLY when user clicks "Share to WhatsApp"
- No preloading or caching
- Fetch happens asynchronously
- User sees loading state during fetch

**Error Handling:**
```typescript
try {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  // ... share blob
} catch (err) {
  console.error('Image fetch failed, falling back to text:', err);
  // Automatic fallback to text-only share
}
```

### Bundle Size

**Component Size:** ~4KB (minified + gzipped)
- Uses existing dependencies (React, Lucide icons)
- No additional libraries required
- Leverages native browser APIs

---

## Troubleshooting

### Issue: "Share failed" Error on Mobile

**Possible Causes:**
1. Browser doesn't support Web Share API
2. Network error fetching image
3. User cancelled share dialog

**Solution:**
- Check browser version (iOS 12.2+, Chrome 61+)
- Verify image URL is accessible
- Ensure HTTPS (required for Web Share API)

### Issue: WhatsApp Opens But No Image Attached

**Expected Behavior:** This is correct on desktop browsers

**Explanation:**
- Desktop browsers don't support file sharing via Web Share API
- Fallback to text-only is automatic and correct
- Only mobile browsers (iOS Safari, Android Chrome) support image blobs

**Verification:**
- Test on actual mobile device (not desktop emulator)
- iOS 14+ and Android 10+ have best support

### Issue: Share Button Not Visible on Product Card

**Possible Causes:**
1. Component not imported
2. `stopPropagation()` missing, causing card click
3. CSS z-index conflict

**Solution:**
```tsx
// Ensure div wrapper has stopPropagation
<div onClick={(e) => e.stopPropagation()}>
  <ShareButton {...props} />
</div>
```

### Issue: Copy Link Shows "Copy failed"

**Possible Causes:**
1. Not running on HTTPS
2. Browser doesn't support Clipboard API
3. Permission denied

**Solution:**
- Ensure site is on HTTPS (required for clipboard access)
- Check browser console for permission errors
- Test on different browser

---

## API Reference

### ShareButton Component

**Required Props:**
- `title: string` - Main title to share
- `url: string` - Full URL to share
- `type: 'product' | 'moodboard'` - Content type

**Optional Props:**
- `description?: string` - Additional description text
- `price?: string` - Formatted price (e.g., "$129")
- `imageUrl?: string` - Image URL for blob sharing
- `variant?: 'default' | 'outline' | 'ghost'` - Button style (default: 'outline')
- `size?: 'default' | 'sm' | 'lg' | 'icon'` - Button size (default: 'default')
- `showLabel?: boolean` - Show "Share" text (default: true)

### Methods

**formatWhatsAppMessage()**
- Returns: `string`
- Formats message with bold title, description, price, and link

**handleWhatsAppShare()**
- Async function
- Attempts blob share → fallback to text
- Shows toast notification

**handleNativeShare()**
- Async function
- Uses Web Share API
- Automatically includes image if supported

**handleCopyLink()**
- Async function
- Copies URL to clipboard
- Shows success/error toast

---

## Future Enhancements

### Potential Features

1. **Facebook/Instagram Integration**
   - Share to Facebook with Open Graph tags
   - Instagram story sharing (if supported)

2. **Share Analytics**
   - Track which platforms users share to
   - Count shares per product/moodboard
   - Integrate with existing analytics system

3. **QR Code Sharing**
   - Generate QR codes for products/moodboards
   - Useful for in-store displays or print materials

4. **Email Sharing**
   - "Share via Email" option
   - Pre-filled subject and body

5. **Pinterest Integration**
   - Pin products directly to boards
   - Automatic rich pin formatting

6. **SMS Sharing**
   - Direct SMS/iMessage sharing
   - Formatted for text messages

---

## Related Documentation

- **Product Detail API:** `/docs/PRODUCT_DETAIL_API.md`
- **Moodboard Detail API:** `/docs/MOODBOARD_DETAIL_API.md`
- **Analytics Tracking:** `/docs/ANALYTICS_TRACKING_IMPLEMENTATION.md`
- **Component Architecture:** `/docs/ARCHITECTURE.md`

---

## Support

For issues or questions:
- Check browser console for error messages
- Verify device/browser compatibility table
- Test on multiple devices (iOS, Android, Desktop)
- Ensure HTTPS is enabled

---

**Last Updated:** January 2025
**Component Version:** 1.0.0
**Browser Support:** iOS 12.2+, Android 5+, Desktop (limited)
