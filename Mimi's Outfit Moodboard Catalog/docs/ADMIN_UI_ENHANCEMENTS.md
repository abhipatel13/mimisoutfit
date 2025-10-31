# Admin UI Enhancements Guide

Complete guide to admin-only UI features including edit buttons, unpublished indicators, and visibility controls.

---

## Overview

The admin interface includes several UI enhancements that appear only when an admin user is logged in:

1. **Edit & Publish Buttons** - Quick access to admin actions on detail pages
2. **Unpublished Status Indicators** - Visual badges showing publish status
3. **Show Unpublished Toggle** - Filter control to show/hide unpublished items

All these features are powered by the `useAuthStore` hook which tracks authentication status.

---

## 1. Edit & Publish Buttons on Detail Pages

### Product Detail Page

**Location**: Top of product info section (before brand name)

**Components**:
```tsx
{isAuthenticated && (
  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
    <Button variant="outline" size="sm" onClick={handleEdit} className="flex-1">
      <Edit className="h-4 w-4 mr-2" />
      Edit Product
    </Button>
    <Button
      variant={product.isFeatured ? "outline" : "default"}
      size="sm"
      onClick={handleTogglePublish}
      disabled={isPublishing}
      className="flex-1"
    >
      {product.isFeatured ? (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Publish
        </>
      )}
    </Button>
  </div>
)}
```

**Features**:
- Edit button navigates to `/admin/products/{id}/edit`
- Publish/Unpublish toggle with visual feedback
- Loading state during API call (disabled button)
- Toast notifications on success/error
- Border separator from main content

### Moodboard Detail Page

**Location**: Overlay on hero image (top-right corner)

**Components**:
```tsx
{isAuthenticated && (
  <div className="absolute top-6 right-6 flex gap-2">
    <Button variant="secondary" size="sm" onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
    <Button
      variant={moodboard.isFeatured ? "secondary" : "default"}
      size="sm"
      onClick={handleTogglePublish}
      disabled={isPublishing}
    >
      {moodboard.isFeatured ? (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Publish
        </>
      )}
    </Button>
  </div>
)}
```

**Features**:
- Positioned over hero image with backdrop blur effect
- Secondary variant for better visibility on images
- Same publish/unpublish logic as products
- Navigates to `/admin/moodboards/{id}/edit`

---

## 2. Unpublished Status Indicators

### Product Card (Listing Pages)

**Location**: Top-left corner of product card

**Style**:
```tsx
{!product.isFeatured && (
  <div className="absolute top-2 left-2 z-10 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold">
    UNPUBLISHED
  </div>
)}
```

**Design**:
- Small badge (text-xs)
- Yellow color scheme (bg-yellow-100, text-yellow-800)
- Positioned absolutely over product image
- z-index 10 for visibility

### Moodboard Card (Listing Pages)

**Location**: Top-left corner of moodboard card

**Style**:
```tsx
{!moodboard.isFeatured && (
  <div className="absolute top-3 left-3 z-10 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-semibold">
    UNPUBLISHED
  </div>
)}
```

**Design**:
- Medium badge (text-sm)
- Same yellow color scheme
- Slightly larger padding for moodboards

### Product Detail Page

**Location**: Below admin controls, above brand name

**Style**:
```tsx
{!product.isFeatured && (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg mb-4 text-sm font-medium w-fit">
    <EyeOff className="h-4 w-4" />
    UNPUBLISHED
  </div>
)}
```

**Design**:
- Icon + text badge
- Inline-flex with auto width (w-fit)
- Rounded corners (rounded-lg)
- Eye-off icon for clear meaning

### Moodboard Detail Page

**Location**: Overlay on hero image (top-left corner)

**Style**:
```tsx
{!moodboard.isFeatured && (
  <div className="absolute top-6 left-6 bg-yellow-500/90 text-yellow-950 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
    UNPUBLISHED
  </div>
)}
```

**Design**:
- Prominent badge on hero image
- Stronger yellow (bg-yellow-500/90, text-yellow-950)
- Backdrop blur for readability on images
- Shadow for depth

---

## 3. Show Unpublished Filter Toggle

### Products Page

**Location**: Inside filter panel, above category filters

**Implementation**:
```tsx
// State
const { isAuthenticated } = useAuthStore();
const [showUnpublished, setShowUnpublished] = useState(false);

// Filter logic
const products = useMemo(() => {
  if (!isAuthenticated || showUnpublished) {
    return allProducts;
  }
  // Hide unpublished by default
  return allProducts.filter(p => p.isFeatured !== false);
}, [allProducts, isAuthenticated, showUnpublished]);

// UI Component
{isAuthenticated && (
  <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20 mb-4">
    <Checkbox
      id="show-unpublished"
      checked={showUnpublished}
      onCheckedChange={(checked) => setShowUnpublished(checked as boolean)}
    />
    <label htmlFor="show-unpublished" className="text-sm font-medium cursor-pointer flex-1">
      Show unpublished products
    </label>
  </div>
)}
```

**Features**:
- Only visible when admin is logged in
- Checkbox with label
- Accent background (bg-accent/10)
- Border for prominence
- State does NOT persist (resets on page refresh)

### Moodboards Page

**Location**: Below tag filters, centered

**Implementation**:
```tsx
// State
const { isAuthenticated } = useAuthStore();
const [showUnpublished, setShowUnpublished] = useState(false);

// Filter logic with useMemo
const filteredMoodboards = useMemo(() => {
  let moodboards = (selectedTag === 'all' 
    ? mockMoodboards
    : mockMoodboards.filter(m => m.tags?.includes(selectedTag))
  ).filter(m => m && m.id);

  // Filter by publish status
  if (!isAuthenticated || showUnpublished) {
    return moodboards;
  }
  return moodboards.filter(m => m.isFeatured !== false);
}, [selectedTag, isAuthenticated, showUnpublished]);

// UI Component
{isAuthenticated && (
  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20 max-w-sm mx-auto">
    <Checkbox
      id="show-unpublished-moodboards"
      checked={showUnpublished}
      onCheckedChange={(checked) => setShowUnpublished(checked as boolean)}
    />
    <label htmlFor="show-unpublished-moodboards" className="text-sm font-medium cursor-pointer flex-1">
      Show unpublished moodboards
    </label>
  </div>
)}
```

**Features**:
- Centered below tag filters
- Max-width constraint (max-w-sm)
- Combines with tag filtering
- Uses useMemo for performance

---

## Implementation Details

### Authentication Check

All admin UI features use the `useAuthStore` hook:

```tsx
import { useAuthStore } from '@/store/auth-store';

const { isAuthenticated } = useAuthStore();
```

This hook returns:
- `isAuthenticated`: Boolean - true when JWT token exists and is valid
- `user`: User object with email/name
- `login()`: Function to authenticate
- `logout()`: Function to clear auth state

### Publish/Unpublish API Calls

Products:
```tsx
import { adminProductsApi } from '@/services/api/admin.api';

const handleTogglePublish = async () => {
  await adminProductsApi.publishProduct(productId, { 
    publish: !product.isFeatured 
  });
};
```

Moodboards:
```tsx
import { adminMoodboardsApi } from '@/services/api/admin.api';

const handleTogglePublish = async () => {
  await adminMoodboardsApi.publishMoodboard(moodboardId, { 
    publish: !moodboard.isFeatured 
  });
};
```

### Navigation to Edit Forms

Products:
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
const handleEdit = () => {
  navigate(`/admin/products/${productId}/edit`);
};
```

Moodboards:
```tsx
const handleEdit = () => {
  navigate(`/admin/moodboards/${moodboardId}/edit`);
};
```

---

## Design Specifications

### Color Palette

**Unpublished Indicators**:
- Light backgrounds: `bg-yellow-100` (RGB: 254, 249, 195)
- Dark backgrounds: `bg-yellow-500/90` (RGB: 234, 179, 8 with 90% opacity)
- Text on light: `text-yellow-800` (RGB: 133, 77, 14)
- Text on dark: `text-yellow-950` (RGB: 66, 32, 6)

**Filter Toggles**:
- Background: `bg-accent/10` (10% opacity accent color)
- Border: `border-accent/20` (20% opacity accent color)

### Typography

- Card badges: `text-xs` (12px) or `text-sm` (14px)
- Detail page badges: `text-sm` (14px)
- Filter labels: `text-sm` (14px) with `font-medium`

### Spacing

- Card badges: `px-2 py-0.5` (small) or `px-3 py-1` (medium)
- Detail badges: `px-3 py-1.5` or `px-4 py-2`
- Filter toggles: `p-3` (12px padding)

### Positioning

- Card badges: `top-2 left-2` or `top-3 left-3`
- Hero image badges: `top-6 left-6` or `top-6 right-6`
- Z-index: `z-10` for cards, implicit for absolute positioned

---

## User Experience Flow

### Admin Workflow

1. **Login** → Navigate to `/admin/login`
2. **Browse Public Site** → Header shows green dot on admin icon
3. **View Product** → See "Edit Product" and "Publish/Unpublish" buttons
4. **Toggle Filters** → Enable "Show unpublished products" to see all items
5. **Quick Edit** → Click "Edit Product" to jump to admin form
6. **Publish** → Toggle publish status without leaving detail page

### Visual Feedback

- **Loading States**: Spinner in publish button, disabled state
- **Success**: Toast notification with green checkmark
- **Error**: Toast notification with red alert icon
- **Status Change**: Immediate UI update (badge appears/disappears)

---

## Best Practices

### Performance

1. **Use useMemo** for filtered arrays:
```tsx
const filtered = useMemo(() => {
  return items.filter(item => showUnpublished || item.isFeatured);
}, [items, showUnpublished]);
```

2. **Avoid unnecessary re-renders** with selective state:
```tsx
// Only update when authentication changes
const { isAuthenticated } = useAuthStore();
```

### Accessibility

1. **Checkbox labels** are clickable and associated with input:
```tsx
<label htmlFor="show-unpublished" className="cursor-pointer">
  Show unpublished products
</label>
```

2. **Button states** clearly indicate loading:
```tsx
<Button disabled={isPublishing}>
  {isPublishing ? 'Publishing...' : 'Publish'}
</Button>
```

### Error Handling

1. **Try-catch blocks** for API calls:
```tsx
try {
  await adminProductsApi.publishProduct(id, { publish: true });
  toast({ title: 'Success' });
} catch (error) {
  toast({ title: 'Error', variant: 'destructive' });
}
```

2. **Optimistic UI updates** with rollback:
```tsx
// Update UI immediately
setProduct({ ...product, isFeatured: true });

try {
  await api.publish();
} catch {
  // Rollback on error
  setProduct({ ...product, isFeatured: false });
}
```

---

## Testing Checklist

### Admin Login State

- [ ] Admin controls appear when logged in
- [ ] Admin controls disappear when logged out
- [ ] Filter toggles only visible to admins
- [ ] Unpublished badges visible to all users

### Publish/Unpublish

- [ ] Toggle changes button variant (outline ↔ default)
- [ ] Loading state disables button during API call
- [ ] Success toast appears on completion
- [ ] Error toast appears on failure
- [ ] UI updates immediately after success

### Filter Toggle

- [ ] Default: Unpublished items hidden (even for admins)
- [ ] Enabled: All items visible
- [ ] Works with other filters (category, brand, search)
- [ ] State resets on page refresh

### Visual Consistency

- [ ] Yellow badges consistent across all pages
- [ ] Icon placement correct (left for badges, left/right for buttons)
- [ ] Touch targets meet 44px minimum (mobile)
- [ ] Hover states work on desktop

---

## Future Enhancements

### Potential Improvements

1. **Bulk Publish/Unpublish** - Select multiple items and toggle all at once
2. **Scheduled Publishing** - Set a future date/time to auto-publish
3. **Draft Status** - Add a "draft" state separate from "unpublished"
4. **Revision History** - Track publish/unpublish events with timestamps
5. **Persist Filter State** - Save "show unpublished" preference in localStorage
6. **Keyboard Shortcuts** - Alt+E to edit, Alt+P to publish

### Accessibility Enhancements

1. **Screen Reader Announcements** - Announce publish status changes
2. **Focus Management** - Return focus to trigger button after modal close
3. **High Contrast Mode** - Test yellow badges in high contrast mode
4. **Reduced Motion** - Skip animations for users who prefer reduced motion

---

## Related Documentation

- **Admin Portal Guide**: `/docs/ADMIN_PORTAL_GUIDE.md`
- **Unpublished Tags Guide**: `/docs/UNPUBLISHED_TAGS_GUIDE.md`
- **Bulk Operations Guide**: `/docs/BULK_OPERATIONS_GUIDE.md`
- **API Spec**: `/docs/BACKEND_API_SPEC_UPDATED.md`

---

## Changelog

**v1.0.0** - Initial admin UI enhancements
- Edit & publish buttons on detail pages
- Unpublished status indicators across all views
- Show unpublished filter toggle for admins
- 3-second affiliate redirect countdown
- Custom hanger logo and favicon

---

**Summary**: The admin UI enhancements provide seamless access to admin functions without leaving the public site. Clear visual indicators show publish status, and filter toggles give admins control over what they see. All features are protected by authentication and provide immediate feedback through loading states and toast notifications.
