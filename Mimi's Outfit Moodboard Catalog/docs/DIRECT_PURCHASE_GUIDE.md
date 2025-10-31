# Direct Purchase System - Complete Implementation Guide

## 📋 Overview

The Lookbook by Mimi now supports **two purchase types** for products:

1. **Affiliate Purchase** (Default) - Users click "Shop Now" and are redirected to retailer with tracking
2. **Direct Purchase** (New) - Users click "Contact Mimi to Purchase" with three contact options

This guide covers the complete implementation, configuration, and usage of the direct purchase system.

---

## 🎯 Features

### ContactMimiButton Component
A sophisticated dropdown button that provides three contact methods:

**📱 Text Message (SMS)**
- **Mobile**: Opens default messaging app with pre-filled inquiry
- **Desktop**: Copies phone number to clipboard with toast notification
- Includes product details, price, and link in message

**💬 WhatsApp**
- **Mobile**: Opens WhatsApp app with styled formatted message
- **Desktop**: Opens WhatsApp Web with pre-filled message
- Uses bold formatting for product name and price labels
- Includes product details and inquiry question

**✉️ Email**
- Opens default email client (Outlook, Gmail, Apple Mail, etc.)
- Pre-filled subject line with product name
- Detailed email body with product info and link
- Professional format ready to send

---

## 🚀 Implementation Details

### 1. Type System Changes

**Product Interface** (`src/types/index.ts`):
```typescript
export interface Product {
  id: string;
  name: string;
  // ... other fields
  purchaseType?: 'affiliate' | 'direct'; // NEW FIELD
  // 'affiliate' = Show "Shop Now" button (default)
  // 'direct' = Show "Contact Mimi to Purchase" button
}
```

**Admin DTO** (`src/types/admin.types.ts`):
```typescript
export interface CreateProductDto {
  // ... other fields
  purchaseType?: 'affiliate' | 'direct'; // NEW FIELD
}
```

---

### 2. ContactMimiButton Component

**Location**: `src/components/ContactMimiButton.tsx`

**Features**:
- Dropdown menu with three contact options
- Mobile/desktop detection for optimal UX
- Pre-filled messages with product details
- Environment variable configuration
- Loading states and toast notifications
- Fully accessible with keyboard navigation

**Usage Example**:
```tsx
import ContactMimiButton from '@/components/ContactMimiButton';

<ContactMimiButton 
  product={product} 
  variant="default"
  size="lg"
  className="flex-1"
/>
```

---

### 3. ProductDetailPage Integration

**Conditional CTA Logic**:
```tsx
{/* Action Buttons */}
<div className="flex gap-4 mb-8">
  {/* Conditional: Affiliate OR Direct */}
  {product.purchaseType === 'direct' ? (
    <ContactMimiButton product={product} className="flex-1" />
  ) : (
    <Button asChild size="lg" className="flex-1">
      <Link to={`/go/${product.id}`}>
        <ShoppingBag className="mr-2 h-4 w-4" />
        Shop Now
      </Link>
    </Button>
  )}
  {/* ... Favorite and Share buttons */}
</div>
```

**Behavior**:
- If `purchaseType === 'direct'`: Show ContactMimiButton
- If `purchaseType === 'affiliate'` or undefined: Show Shop Now button (default)

---

### 4. Admin Product Form

**Location**: `src/pages/admin/AdminProductForm.tsx`

**New Field**: Purchase Type dropdown with two options:
- **Affiliate Link (Default)** - Standard affiliate redirect flow
- **Direct Purchase (Contact Mimi)** - Show contact options

**UI Implementation**:
```tsx
<div className="space-y-2">
  <Label htmlFor="purchaseType">Purchase Type</Label>
  <Select
    value={formData.purchaseType || 'affiliate'}
    onValueChange={(value: 'affiliate' | 'direct') => 
      setFormData({ ...formData, purchaseType: value })
    }
  >
    <SelectTrigger id="purchaseType">
      <SelectValue placeholder="Select purchase type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="affiliate">
        Affiliate Link (Default)
      </SelectItem>
      <SelectItem value="direct">
        Direct Purchase (Contact Mimi)
      </SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Affiliate: Show "Shop Now" button with affiliate link<br />
    Direct: Show "Contact Mimi" button with text/WhatsApp/email options
  </p>
</div>
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env` file:

```bash
# Mimi's Contact Information (for direct purchases)
# Used in ContactMimiButton component when purchaseType is 'direct'
VITE_MIMI_PHONE=15551234567           # Phone number for SMS (format: 1XXXXXXXXXX)
VITE_MIMI_WHATSAPP=15551234567        # WhatsApp number (format: 1XXXXXXXXXX)
VITE_MIMI_EMAIL=hello@thelookbookbymimi.com  # Email address
```

**Important**: Replace with actual contact information before deployment!

---

## 📱 User Experience

### Mobile Flow (iPhone/Android)

**1. User views direct purchase product**
   - Product detail page shows "Contact Mimi to Purchase" button

**2. User clicks button**
   - Dropdown menu appears with three options
   - Icons indicate each contact method (blue SMS, green WhatsApp, accent email)

**3. User selects Text Message**
   - iOS/Android messaging app opens
   - Pre-filled message with:
     * Greeting: "Hi Mimi! 👋"
     * Product name (bold formatted)
     * Description
     * Price
     * Product link
     * Inquiry question
   - User can edit message before sending

**4. User selects WhatsApp**
   - WhatsApp app opens
   - Styled message with markdown formatting preserved
   - Product details formatted with bold text and emojis
   - User can send immediately or edit

**5. User selects Email**
   - Default email app opens (Gmail, Outlook, Apple Mail)
   - Subject: "Inquiry: [Brand] [Product Name]"
   - Body pre-filled with professional format
   - User can send or customize

---

### Desktop Flow (Windows/Mac)

**1. User views direct purchase product**
   - Product detail page shows "Contact Mimi to Purchase" button

**2. User clicks button**
   - Dropdown menu appears

**3. User selects Text Message**
   - Phone number copied to clipboard
   - Toast notification: "Phone Number Copied! Text Mimi at: 15551234567"
   - User can manually text the number

**4. User selects WhatsApp**
   - WhatsApp Web opens in new tab
   - Pre-filled styled message ready to send
   - User logged into WhatsApp Web can send immediately

**5. User selects Email**
   - Default email client opens (Outlook desktop, Thunderbird, Apple Mail)
   - Pre-filled professional email ready to send

---

## 🎨 Message Templates

### SMS/WhatsApp Message Format

```
Hi Mimi! 👋

I'm interested in purchasing from your collection:

*[Brand] [Product Name]*

[Product Description]

💰 *Price:* $[Price]

🔗 Product link: [URL]

Is this item currently available? 💼
```

**Example**:
```
Hi Mimi! 👋

I'm interested in purchasing from your collection:

*Burberry Classic Trench Coat*

Timeless beige trench coat perfect for all seasons. Features iconic check lining and tailored fit.

💰 *Price:* $450.00

🔗 Product link: https://thelookbookbymimi.com/products/classic-trench-coat

Is this item currently available? 💼
```

---

### Email Template

**Subject**: `Inquiry: [Brand] [Product Name]`

**Body**:
```
Hi Mimi,

I'm interested in purchasing the following item from your collection:

Product: [Brand] [Product Name]
Price: $[Price]
Description: [Product Description]
Product Link: [URL]

Is this item currently available? I'd love to know more about it.

Thank you!
```

**Example**:
```
Subject: Inquiry: Burberry Classic Trench Coat

Hi Mimi,

I'm interested in purchasing the following item from your collection:

Product: Burberry Classic Trench Coat
Price: $450.00
Description: Timeless beige trench coat perfect for all seasons. Features iconic check lining and tailored fit.
Product Link: https://thelookbookbymimi.com/products/classic-trench-coat

Is this item currently available? I'd love to know more about it.

Thank you!
```

---

## 🔒 Backend Integration

### Database Schema Update

Add `purchase_type` field to products table:

**PostgreSQL**:
```sql
ALTER TABLE products 
ADD COLUMN purchase_type VARCHAR(20) DEFAULT 'affiliate' 
CHECK (purchase_type IN ('affiliate', 'direct'));
```

**MySQL**:
```sql
ALTER TABLE products 
ADD COLUMN purchase_type ENUM('affiliate', 'direct') DEFAULT 'affiliate';
```

**MongoDB**:
```javascript
// Add to product schema
{
  purchaseType: {
    type: String,
    enum: ['affiliate', 'direct'],
    default: 'affiliate'
  }
}
```

---

### API Response Update

Ensure backend includes `purchaseType` field in product responses:

**Example Response**:
```json
{
  "id": "prod-123",
  "name": "Classic Trench Coat",
  "slug": "classic-trench-coat",
  "price": 450.00,
  "imageUrl": "https://...",
  "affiliateUrl": "https://nordstrom.com/...",
  "purchaseType": "direct",  // NEW FIELD
  "brand": "Burberry",
  "category": "outerwear",
  "description": "Timeless beige trench coat...",
  "tags": ["classic", "outerwear", "minimalist"],
  "isFeatured": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## 📊 Admin Portal Workflow

### Creating a Direct Purchase Product

1. **Navigate to Admin Portal**
   - Log in at `/admin/login`
   - Go to Products → New Product

2. **Fill Product Details**
   - Name, Brand, Price, Category, Description
   - Upload product image
   - Add tags

3. **Set Purchase Type**
   - Click "Purchase Type" dropdown
   - Select "Direct Purchase (Contact Mimi)"
   - Note: Affiliate URL still required for data consistency

4. **Save Product**
   - Click "Create Product"
   - Product now shows "Contact Mimi to Purchase" on detail page

---

### Converting Affiliate to Direct Purchase

1. **Edit Existing Product**
   - Go to Admin → Products
   - Click "Edit" on desired product

2. **Change Purchase Type**
   - Scroll to "Purchase Type" dropdown
   - Change from "Affiliate Link (Default)" to "Direct Purchase (Contact Mimi)"

3. **Update Product**
   - Click "Update Product"
   - CTA button updates immediately on frontend

---

## 🧪 Testing Checklist

### Functional Testing

**Mobile (iOS)**:
- [ ] Text Message opens Messages app with pre-filled text
- [ ] WhatsApp opens app with styled message
- [ ] Email opens Mail app with pre-filled inquiry
- [ ] All product details correctly formatted

**Mobile (Android)**:
- [ ] Text Message opens default SMS app
- [ ] WhatsApp opens app correctly
- [ ] Email opens Gmail/default email app
- [ ] Message formatting preserved

**Desktop**:
- [ ] Text Message copies phone to clipboard + toast
- [ ] WhatsApp opens Web with pre-filled message
- [ ] Email opens default client
- [ ] All links and formatting work

**Admin Portal**:
- [ ] Purchase type dropdown shows both options
- [ ] Default value is "affiliate"
- [ ] Can save direct purchase products
- [ ] Can edit and change purchase type
- [ ] Changes reflect immediately on frontend

---

### Visual Testing

- [ ] ContactMimiButton matches site design system
- [ ] Dropdown menu appears correctly
- [ ] Icons display for each option (SMS blue, WhatsApp green, Email accent)
- [ ] Loading states work properly
- [ ] Toast notifications appear
- [ ] Responsive on all screen sizes

---

## 🚀 Deployment Checklist

Before going live:

1. **Update Environment Variables**
   - [ ] Set `VITE_MIMI_PHONE` to actual phone number
   - [ ] Set `VITE_MIMI_WHATSAPP` to actual WhatsApp number
   - [ ] Set `VITE_MIMI_EMAIL` to actual email address

2. **Backend Updates**
   - [ ] Add `purchase_type` field to database
   - [ ] Update API responses to include `purchaseType`
   - [ ] Test API with both purchase types

3. **Frontend Verification**
   - [ ] Build production bundle: `npm run build`
   - [ ] Test on mobile devices (iOS + Android)
   - [ ] Test on desktop browsers (Chrome, Safari, Firefox)
   - [ ] Verify contact methods work correctly

4. **Content Migration**
   - [ ] Identify products for direct purchase
   - [ ] Update products in admin portal
   - [ ] Verify CTA buttons updated

---

## 📈 Analytics Considerations

### Tracking Direct Purchases

Currently, the system does NOT track contact button clicks (unlike affiliate clicks which are fully tracked).

**To Add Tracking** (Optional Enhancement):

1. **Update ContactMimiButton.tsx**:
```typescript
import { analyticsService } from '@/services/analytics.service';

const handleTextMessage = () => {
  // Track contact method selection
  analyticsService.trackEvent({
    event_type: 'contact_initiated',
    event_data: {
      method: 'sms',
      product_id: product.id,
      product_name: product.name,
    },
  });
  
  // ... existing SMS logic
};
```

2. **Create Backend Analytics Event**:
```sql
INSERT INTO analytics_events (
  user_id,
  event_type,
  event_data,
  product_id
) VALUES (
  'user-guid',
  'contact_initiated',
  '{"method": "sms", "product_name": "..."}',
  'prod-123'
);
```

3. **Add Analytics Dashboard Metrics**:
   - Total contact button clicks
   - Breakdown by method (SMS, WhatsApp, Email)
   - Conversion rate: views → contacts
   - Most contacted products

---

## 🔮 Future Enhancements

### Potential Improvements

1. **In-App Messaging**
   - Replace external contact methods with built-in chat
   - Real-time messaging with Mimi
   - Message history and notifications

2. **Inquiry Forms**
   - Modal form instead of dropdown
   - Collect additional info (size preference, color, shipping address)
   - Save inquiries to database

3. **Automated Responses**
   - AI-powered instant replies
   - Availability status from inventory system
   - Estimated delivery times

4. **Lead Management**
   - Admin dashboard for all inquiries
   - Track inquiry → purchase conversion
   - CRM integration

5. **Multi-Language Support**
   - Translate pre-filled messages
   - Detect user language preference
   - Localized contact methods

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Text Message doesn't open on mobile
- **Solution**: Ensure `VITE_MIMI_PHONE` format is correct (1XXXXXXXXXX)
- **Note**: Some Android devices may not support SMS URIs with pre-filled body

**Issue**: WhatsApp opens but message is empty
- **Solution**: Check URL encoding - special characters may break formatting
- **Note**: WhatsApp Web requires user to be logged in

**Issue**: Email opens but body is blank
- **Solution**: Check for mailto URL length limit (2000 chars)
- **Solution**: Ensure product description doesn't have special characters

**Issue**: Desktop SMS shows number but won't copy
- **Solution**: Check browser permissions for clipboard access
- **Fallback**: Show modal with copyable phone number

**Issue**: Purchase type not saved in admin
- **Solution**: Verify backend accepts `purchaseType` field
- **Check**: API payload includes the field in POST/PUT requests

---

## 📚 Related Documentation

- **API Endpoints Reference**: `/docs/API_ENDPOINTS_COMPLETE_REFERENCE.md`
- **Data Models Reference**: `/docs/DATA_MODELS_COMPLETE_REFERENCE.md`
- **Admin Portal Guide**: `/docs/ADMIN_PORTAL_GUIDE.md`
- **Social Sharing Guide**: `/docs/SOCIAL_SHARING_GUIDE.md`

---

## 💡 Key Takeaways

1. **Two Purchase Models** - Affiliate (default) and Direct (new)
2. **Three Contact Methods** - SMS, WhatsApp, Email
3. **Mobile/Desktop Optimized** - Different behaviors for best UX
4. **Easy Configuration** - Simple environment variables
5. **Admin Friendly** - Dropdown in product form
6. **Type Safe** - Full TypeScript support
7. **Extensible** - Easy to add more contact methods

---

**Questions or Issues?** Check the main `STRUCTURE.md` or other documentation files for additional details!
