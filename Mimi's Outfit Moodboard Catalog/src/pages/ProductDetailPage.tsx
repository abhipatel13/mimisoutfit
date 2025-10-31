import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, ArrowLeft, ShoppingBag, Edit, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import SkeletonDetail from '@/components/SkeletonDetail';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import ContactMimiButton from '@/components/ContactMimiButton';
import { SEO } from '@/components/SEO';
import { useFavoritesStore } from '@/store/favorites-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api';
import { adminProductsApi } from '@/services/api/admin.api';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Fetch product by slug using live API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('No product slug provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch product with related products in one call
        const response = await productsApi.getProductBySlug(slug, true);
        
        if (!response) {
          setError('Product not found');
          setProduct(null);
          setRelatedProducts([]);
        } else {
          setProduct(response.product);
          // Related products are optional - use empty array if not provided
          setRelatedProducts(response.relatedProducts || []);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container-custom section-padding">
          <SkeletonDetail />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-medium text-foreground mb-4">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error 
              ? 'There was an error loading the product. Please try again.' 
              : "The product you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isProductFavorite = isFavorite(product.id);

  const handleFavoriteClick = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const handleTogglePublish = async () => {
    if (!product) return;
    
    setIsPublishing(true);
    try {
      const newPublishState = !product.isPublished;
      await adminProductsApi.publishProduct(product.id, newPublishState);
      
      // Update local state
      setProduct({
        ...product,
        isPublished: newPublishState,
      });
      
      toast({
        title: 'Success',
        description: `Product ${newPublishState ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    if (product) {
      navigate(`/admin/products/edit/${product.id}`);
    }
  };

  return (
    <>
      <SEO
        title={`${product.brand} ${product.name}`}
        description={product.description || `Shop ${product.brand} ${product.name} - ${product.category}. ${product.price ? `$${product.price}` : 'Available now'}.`}
        image={product.imageUrl}
        url={`https://thelookbookbymimi.com/products/${product.slug}`}
        type="product"
      />
      <div className="min-h-screen">
        <div className="container-custom section-padding">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
        </Button>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <OptimizedImage 
            src={product.imageUrl} 
            alt={`${product.brand} ${product.name} - ${product.category} product detail view`}
            aspectRatio="3/4"
            className="rounded-lg"
            priority={true}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Admin Controls */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant={product.isPublished === false ? "default" : "outline"}
                  size="sm"
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  className="flex-1"
                >
                  {product.isPublished === false ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Unpublished Flag */}
            {product.isPublished === false && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg mb-4 text-sm font-medium w-fit">
                <EyeOff className="h-4 w-4" />
                UNPUBLISHED
              </div>
            )}

            {product.brand && (
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                {product.brand}
              </p>
            )}
            
            <h1 className="font-display text-3xl lg:text-4xl font-medium text-foreground mb-4">
              {product.name}
            </h1>

            {product.price !== null && (
              <p className="text-2xl font-medium text-accent mb-6">
                ${product.price}
              </p>
            )}

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button 
                asChild
                size="lg" 
                className="flex-1"
              >
                <Link to={`/go/${product.id}`}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Now
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleFavoriteClick}
                className="px-4"
              >
                <Heart 
                  className={`h-5 w-5 ${isProductFavorite ? 'fill-current text-red-500' : ''}`}
                />
              </Button>

              <ShareButton
                title={`${product.brand} ${product.name}`}
                description={product.description}
                price={product.price !== null ? `$${product.price}` : undefined}
                imageUrl={product.imageUrl}
                url={`${window.location.origin}/products/${product.slug}`}
                type="product"
                variant="outline"
                size="lg"
                showLabel={false}
              />
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-3">Style Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags?.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {product.category && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <p className="text-muted-foreground capitalize">{product.category}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-medium text-foreground mb-4">
                You May Also Like
              </h2>
              <p className="text-muted-foreground">
                Discover similar pieces that complement your style
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
