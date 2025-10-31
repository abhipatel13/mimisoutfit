export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string;
  blurhash?: string; // Low quality image placeholder hash
  affiliateUrl: string;
  purchaseType?: 'affiliate' | 'direct'; // How users can purchase: affiliate link or contact Mimi directly
  brand?: string;
  tags?: string[];
  category?: string;
  description?: string;
  isFeatured?: boolean;
  isPublished?: boolean; // Whether the product is published and visible to public (default: true)
  createdAt: string;
}

export interface Moodboard {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
  coverBlurhash?: string; // Low quality image placeholder hash
  products: Product[];
  tags?: string[];
  isFeatured?: boolean;
  isPublished?: boolean; // Whether the moodboard is published and visible to public (default: true)
  stylingTips?: string[];
  howToWear?: string;
  createdAt: string;
  updatedAt: string;
}



export interface FilterOptions {
  category?: string;
  brand?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';
  search?: string; // Search query for product name, brand, description, tags
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Product detail with optional related products
export interface ProductDetailResponse {
  product: Product;
  relatedProducts?: Product[]; // Only included if ?includeRelated=true
}

// Homepage data response
export interface HomepageData {
  featuredProducts: Product[];
  featuredMoodboards: Moodboard[];
}