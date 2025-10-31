/**
 * Admin Portal Type Definitions
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
  expiresIn: number; // seconds
}

export interface CreateProductDto {
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string;
  blurhash?: string; // Auto-generated from imageUrl
  affiliateUrl: string;
  purchaseType?: 'affiliate' | 'direct'; // How users can purchase: affiliate link or contact Mimi directly
  brand?: string;
  tags?: string[];
  category?: string;
  description?: string;
  isFeatured?: boolean;
  isPublished?: boolean; // Whether the product is published (default: true)
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export interface CreateMoodboardDto {
  title: string;
  slug: string;
  description?: string;
  coverImage: string;
  coverBlurhash?: string; // Auto-generated from coverImage
  productIds: string[]; // Array of product IDs to include
  tags?: string[];
  isFeatured?: boolean;
  isPublished?: boolean; // Whether the moodboard is published (default: true)
  stylingTips?: string[];
  howToWear?: string;
}

export interface UpdateMoodboardDto extends Partial<CreateMoodboardDto> {
  id: string;
}

export interface PublishOptions {
  publish: boolean; // true = publish, false = unpublish
}

export interface BulkOperationResult {
  success: string[];      // IDs that succeeded
  failed: string[];       // IDs that failed
  total: number;          // Total attempted
  successCount: number;   // Number succeeded
  failedCount: number;    // Number failed
  errors?: {              // Optional error details
    [id: string]: string;
  };
}

export interface AdminStats {
  totalProducts: number;
  totalMoodboards: number;
  featuredProducts: number;
  featuredMoodboards: number;
}

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
}
