# Local Image Upload Guide

## Overview

The image upload system has been enhanced to keep images **local** until the form is saved. This prevents unnecessary API calls and gives users control over when images are uploaded.

---

## How It Works

### 1. **Image Selection**
- User clicks "Upload" button or drags file
- File is validated (type, size)
- Local preview is generated using `FileReader`
- No API call is made yet

### 2. **Local Preview**
- Image displays immediately in preview
- File reference stored in component state
- URL field shows `[LOCAL_FILE]:filename.jpg`

### 3. **Form Save**
- When user clicks "Save" or "Update"
- **THEN** the image is uploaded to server
- Upload progress shown with toast notification
- Final URL replaces local reference

---

## Implementation Details

### ImageUploadField Component

```tsx
<ImageUploadField
  id="imageUrl"
  label="Product Image"
  value={formData.imageUrl}
  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
  onFileSelect={(file) => setSelectedFile(file)}  // New callback
  required
  aspectRatio="square"
  disabled={loading}
/>
```

**Key Props:**
- `onFileSelect` - Callback fired when file is selected (doesn't upload)
- `value` - Can be URL or `[LOCAL_FILE]:filename`

### Form Submit Handler

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setLoading(true);
  
  try {
    let finalImageUrl = formData.imageUrl;
    
    // If local file selected, upload now
    if (selectedFile && formData.imageUrl.startsWith('[LOCAL_FILE]:')) {
      toast({ title: 'Uploading...', description: 'Uploading image to server' });
      
      const result = await upload.uploadFile(selectedFile);
      
      if (upload.isErrorResponse(result)) {
        throw new Error(result.errMsg || 'Upload failed');
      }
      
      finalImageUrl = result.link;
    }
    
    // Save with final URL
    await adminProductsApi.createProduct({ ...formData, imageUrl: finalImageUrl });
    
    toast({ title: 'Success', description: 'Product created successfully' });
    navigate('/admin/products');
  } catch (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

---

## User Experience

### Before Save
```
1. Click "Upload"
2. Select image file
3. See preview immediately
4. See: "[LOCAL_FILE]:my-image.jpg (450 KB) - Will upload on save"
5. Continue editing form
```

### On Save
```
1. Click "Save Product"
2. Toast: "Uploading... Uploading image to server"
3. Progress indicator (internal)
4. Upload completes
5. Product saved with uploaded URL
6. Toast: "Success - Product created successfully"
7. Redirect to products list
```

---

## Benefits

### 1. **No Wasted Uploads**
- User might cancel form → no wasted upload
- User might change image → only final one uploaded
- Reduces API calls and storage usage

### 2. **Better UX**
- Instant preview without waiting
- User can review before committing
- Clear indicator of pending upload

### 3. **Error Handling**
- Upload errors caught at save time
- User can retry or change image
- No orphaned files on server

---

## File Validation

### Size Limit
- **Maximum:** 5MB per file
- **Message:** "Please select an image smaller than 5MB"

### File Types
- **Allowed:** JPG, PNG, WebP, GIF
- **Validation:** `file.type.startsWith('image/')`
- **Message:** "Please select an image file"

---

## State Management

### Component State
```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [formData, setFormData] = useState({
  imageUrl: '',  // Can be URL or [LOCAL_FILE]:filename
  // ... other fields
});
```

### File Reference
```tsx
// When file selected
onChange(`[LOCAL_FILE]:${file.name}`);
setSelectedFile(file);

// On save
if (formData.imageUrl.startsWith('[LOCAL_FILE]:')) {
  // Upload file
  const result = await upload.uploadFile(selectedFile);
  finalImageUrl = result.link;
}
```

---

## Error Scenarios

### 1. File Too Large
```
Error: "File Too Large"
Description: "Please select an image smaller than 5MB"
```

### 2. Invalid File Type
```
Error: "Invalid File"
Description: "Please select an image file"
```

### 3. Upload Failed
```
Error: "Error"
Description: "Image upload failed: [reason]"
Action: Form not saved, user can retry
```

---

## Configuration

### Enable/Disable Upload
```env
# .env file
VITE_ENABLE_IMAGE_UPLOAD=true  # Default: true
```

### Fallback to URL Input
If disabled, component shows URL input only:
```tsx
{apiConfig.enableImageUpload ? (
  <ImageUploadField ... />
) : (
  <Input type="text" placeholder="https://..." />
)}
```

---

## Technical Details

### FileReader API
```tsx
const reader = new FileReader();
reader.onloadend = () => {
  const result = reader.result as string;  // Base64 data URL
  setLocalPreview(result);  // Show preview
};
reader.readAsDataURL(file);
```

### Devv SDK Upload
```tsx
import { upload } from '@devvai/devv-code-backend';

const result = await upload.uploadFile(file);

if (upload.isErrorResponse(result)) {
  throw new Error(result.errMsg);
}

const uploadedUrl = result.link;
```

---

## Usage in Forms

### AdminProductForm
- Image field: `imageUrl`
- Aspect ratio: `square` (1:1)
- Used for: Product photos

### AdminMoodboardForm
- Image field: `coverImage`
- Aspect ratio: `4/3` (landscape)
- Used for: Moodboard cover images

---

## Best Practices

1. **Always validate** before showing preview
2. **Show upload status** to user
3. **Handle errors gracefully** with clear messages
4. **Store file reference** separately from URL
5. **Clean up** file input after upload/cancel

---

## Future Enhancements

- Multiple image upload
- Image cropping/editing
- Drag-and-drop interface
- Progress bar for upload
- Image optimization (resize, compress)
