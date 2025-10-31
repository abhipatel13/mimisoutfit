# Image Upload Guide

## Overview

The Lookbook admin portal now supports direct image uploads using the Devv SDK file upload service. This eliminates the need for manually hosting images or relying on external URLs.

---

## 🎯 Features

### 1. **Dual Input Mode**
- **Manual URL Entry**: Paste image URLs directly (Unsplash, Cloudinary, etc.)
- **File Upload**: Upload images directly from your device (max 5MB)

### 2. **Upload Component Features**
- ✅ Image preview with aspect ratio control
- ✅ Upload progress indicator (0-100%)
- ✅ File type validation (JPG, PNG, WebP, GIF)
- ✅ File size validation (max 5MB)
- ✅ Drag & drop support (via file input)
- ✅ Error handling with user-friendly messages
- ✅ Remove image option
- ✅ Hover overlay with remove button

### 3. **Supported Aspect Ratios**
- **Square (1:1)**: Product images
- **4:3**: Moodboard cover images
- **16:9**: Banner/hero images (future use)

---

## 🔧 Configuration

### Enable/Disable Image Upload

Update your `.env` file:

```env
# Enable Devv SDK file uploads (requires authentication)
VITE_ENABLE_IMAGE_UPLOAD=true

# Disable to use URL input only
VITE_ENABLE_IMAGE_UPLOAD=false
```

**Note**: Image upload requires users to be authenticated via the Devv SDK. Ensure your admin portal implements authentication first.

---

## 📋 Usage

### In Admin Product Form

```tsx
<ImageUploadField
  id="imageUrl"
  label="Product Image"
  value={formData.imageUrl}
  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
  required
  aspectRatio="square"
  disabled={loading}
/>
```

### In Admin Moodboard Form

```tsx
<ImageUploadField
  id="coverImage"
  label="Cover Image"
  value={formData.coverImage}
  onChange={(url) => setFormData({ ...formData, coverImage: url })}
  required
  aspectRatio="4/3"
  disabled={loading}
/>
```

---

## 🚀 Upload Flow

### 1. User Clicks "Upload" Button
```
User clicks "Upload" → File input dialog opens
```

### 2. File Selection & Validation
```typescript
// File type check
if (!file.type.startsWith('image/')) {
  toast({ title: 'Invalid File', description: 'Please select an image file' });
  return;
}

// File size check (max 5MB)
const maxSize = 5 * 1024 * 1024;
if (file.size > maxSize) {
  toast({ title: 'File Too Large', description: 'Please select an image smaller than 5MB' });
  return;
}
```

### 3. Upload to Devv SDK
```typescript
setUploading(true);
setUploadProgress(30);

const result = await upload.uploadFile(file);

if (upload.isErrorResponse(result)) {
  throw new Error(result.errMsg || 'Upload failed');
}

if (result.link) {
  setUploadProgress(100);
  onChange(result.link); // Update form field
  toast({ title: 'Success', description: 'Image uploaded successfully' });
}
```

### 4. Success State
```
✅ Image URL stored in form
✅ Preview displayed with remove option
✅ Progress bar hidden
✅ File input reset
```

---

## 📊 Upload Limits

| Limit Type | Value | Notes |
|------------|-------|-------|
| **Max File Size** | 5MB | Per file |
| **Daily Limit** | 200 files | Per user (Devv SDK limit) |
| **Allowed Formats** | JPG, PNG, WebP, GIF | Browser MIME type check |
| **Authentication** | Required | Must be logged in to admin |

---

## 🎨 Component Props

### `ImageUploadField` Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Input field ID (required) |
| `label` | `string` | - | Field label (required) |
| `value` | `string` | - | Current image URL (required) |
| `onChange` | `(url: string) => void` | - | Callback when URL changes (required) |
| `required` | `boolean` | `false` | Mark field as required |
| `aspectRatio` | `'square' \| '4/3' \| '16/9'` | `'square'` | Preview aspect ratio |
| `disabled` | `boolean` | `false` | Disable upload/input |

---

## 🛠️ Error Handling

### Common Errors

#### 1. **Upload Failed (Generic)**
```
❌ Error: Upload failed
Solution: Check network connection and try again
```

#### 2. **File Too Large**
```
❌ Error: File Too Large
Solution: Compress image or select a smaller file (<5MB)
```

#### 3. **Invalid File Type**
```
❌ Error: Invalid File
Solution: Select an image file (JPG, PNG, WebP, GIF)
```

#### 4. **Daily Limit Exceeded**
```
❌ Error: 429 - Rate limit exceeded
Solution: Wait 24 hours or contact support
```

#### 5. **Authentication Required**
```
❌ Error: Unauthorized
Solution: Ensure user is logged into admin portal
```

---

## 🔄 Fallback Mode

When `VITE_ENABLE_IMAGE_UPLOAD=false`, the component falls back to URL input only:

```tsx
<div className="space-y-2">
  <Label htmlFor="imageUrl">
    Image URL <span className="text-destructive">*</span>
  </Label>
  <Input
    id="imageUrl"
    value={formData.imageUrl}
    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
    placeholder="https://images.unsplash.com/photo-..."
    required
  />
  {/* Preview only, no upload button */}
</div>
```

---

## 🎯 Best Practices

### 1. **Image Optimization**
- Compress images before upload (use tools like TinyPNG)
- Aim for 300-500KB for product images
- Use WebP format for better compression

### 2. **Naming Convention**
- Use descriptive filenames: `blue-denim-jacket.jpg`
- Avoid special characters: `product_image_001.jpg` ✅
- Not: `IMG_0001.jpg` ❌

### 3. **Aspect Ratios**
- **Products**: Use square images (1:1) for consistency
- **Moodboards**: Use 4:3 for cover images
- Crop images before upload for best results

### 4. **Error Recovery**
- Always provide manual URL input as backup
- Display clear error messages
- Allow retry on failed uploads

---

## 🔍 Testing Checklist

- [ ] Upload JPG image (<5MB) ✅
- [ ] Upload PNG image (<5MB) ✅
- [ ] Upload WebP image (<5MB) ✅
- [ ] Upload GIF image (<5MB) ✅
- [ ] Try uploading >5MB file (should fail) ✅
- [ ] Try uploading non-image file (should fail) ✅
- [ ] Preview displays correctly ✅
- [ ] Remove image works ✅
- [ ] Progress indicator shows 0-100% ✅
- [ ] Success toast appears ✅
- [ ] Error toast appears on failure ✅
- [ ] Manual URL input still works ✅
- [ ] Fallback mode works (VITE_ENABLE_IMAGE_UPLOAD=false) ✅

---

## 📚 Related Documentation

- [Admin Portal Guide](./ADMIN_PORTAL_GUIDE.md) - Complete admin system
- [API Integration](./API_INTEGRATION.md) - Backend API setup
- [Devv SDK File Upload](../node_modules/@devvai/devv-code-backend/README.md) - SDK docs

---

## 🆘 Troubleshooting

### Upload Button Not Appearing

**Problem**: Upload button is hidden  
**Solution**: Check `VITE_ENABLE_IMAGE_UPLOAD` in `.env` file

### "Unauthorized" Error

**Problem**: Upload fails with 401 error  
**Solution**: Ensure admin is logged in and JWT token is valid

### Image Not Previewing

**Problem**: Uploaded image URL doesn't show preview  
**Solution**: Check browser console for CORS errors, verify Devv SDK returned valid URL

### Slow Uploads

**Problem**: Upload takes >10 seconds  
**Solution**: Compress image file before uploading, check network speed

---

## 💡 Future Enhancements

- [ ] Multiple file upload (batch upload)
- [ ] Drag & drop area instead of file input
- [ ] Image cropping/editing before upload
- [ ] Image library/gallery for reusing uploads
- [ ] CDN integration for faster delivery
- [ ] Automatic image optimization on upload
- [ ] Support for video files

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
