import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import SectionHeader from '@/components/SectionHeader';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { SEO } from '@/components/SEO';
import { usePaginatedProducts } from '@/hooks/use-products';
import { productsApi } from '@/services/api';
import type { FilterOptions } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthStore } from '@/store/auth-store';
import { trackSearch } from '@/services/analytics.service';

export default function ProductsPage() {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuthStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [localFilters, setLocalFilters] = useState<Omit<FilterOptions, 'page' | 'limit'>>({
    sortBy: 'newest',
  });
  
  // Fetch categories and brands from API
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Use paginated products hook
  const {
    products: allProducts,
    pagination,
    loading,
    error,
    setPage,
    setPageSize,
    updateFilters,
  } = usePaginatedProducts(localFilters);

  // Filter products based on publish status (admin only)
  const products = useMemo(() => {
    if (!isAuthenticated || showUnpublished) {
      return allProducts;
    }
    // For non-admin or when not showing unpublished, filter out unpublished products
    return allProducts.filter(p => p.isFeatured !== false);
  }, [allProducts, isAuthenticated, showUnpublished]);

  // Load categories and brands from API on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productsApi.getCategories(),
          productsApi.getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err) {
        console.error('Failed to load filter options:', err);
        // Silently fail - filters will just be empty
      }
    };
    loadFilterOptions();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    updateFilters(updatedFilters);
  };

  // Handle search - debounced automatically by SearchBar component
  const handleSearch = (query: string) => {
    handleFilterChange({ search: query || undefined });
  };

  // Track search analytics when products load with search query
  useEffect(() => {
    if (localFilters.search && !loading && products) {
      trackSearch(localFilters.search, products.length, 'products');
    }
  }, [localFilters.search, loading, products]);

  const clearFilters = () => {
    const resetFilters = { sortBy: 'newest' as const };
    setLocalFilters(resetFilters);
    updateFilters(resetFilters);
  };

  const hasActiveFilters = localFilters.search || localFilters.category || localFilters.brand || 
    localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined;

  return (
    <>
      <SEO
        title="Shop All Products"
        description="Browse our curated collection of fashion from high-end to accessible brands. Find clothing, shoes, accessories, and more with detailed styling guides."
        url="https://thelookbookbymimi.com/products"
      />
      <div className="min-h-screen">
        <div className="container-custom mobile-container mobile-section">
          <SectionHeader
            title="All Products"
            subtitle="Discover our complete collection of curated fashion pieces"
            className="mb-8 sm:mb-12"
          />

        {/* Search and Filter Controls */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search with Debouncing */}
            <SearchBar
              value={localFilters.search || ''}
              onChange={handleSearch}
              placeholder="Search products, brands, or styles..."
              debounceMs={400}
              className="flex-1"
            />

            {/* Sort */}
            <Select 
              value={localFilters.sortBy} 
              onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
            >
              <SelectTrigger className="w-full sm:w-48 h-11 touch-target">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto touch-target h-11"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-fadeIn shadow-lg relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-base sm:text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="touch-target -mr-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Category</label>
                  <Select 
                    value={localFilters.category || 'all'} 
                    onValueChange={(value) => 
                      handleFilterChange({ category: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger className="h-10 touch-target">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Brand</label>
                  <Select 
                    value={localFilters.brand || 'all'} 
                    onValueChange={(value) => 
                      handleFilterChange({ brand: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger className="h-10 touch-target">
                      <SelectValue placeholder="All brands" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="all">All brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Min Price</label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => 
                      handleFilterChange({ 
                        minPrice: e.target.value ? Number(e.target.value) : undefined 
                      })
                    }
                    className="h-10 touch-target"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">Max Price</label>
                  <Input
                    type="number"
                    placeholder="$1000"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => 
                      handleFilterChange({ 
                        maxPrice: e.target.value ? Number(e.target.value) : undefined 
                      })
                    }
                    className="h-10 touch-target"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="w-full sm:w-auto touch-target"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-base sm:text-lg text-destructive mb-4">
              {error.message}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid-mobile-products gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <>
                <div className="grid-mobile-products gap-4 sm:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  pagination={pagination}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  showPageSize={!isMobile}
                  className="mt-8 mb-12"
                />
              </>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <p className="text-base sm:text-lg text-muted-foreground mb-4">
                  No products found matching your criteria
                </p>
                <Button variant="outline" className="btn-mobile" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
}
