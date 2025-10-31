import { Link } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/store/favorites-store';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showFavoriteButton?: boolean;
  className?: string;
}

export default function ProductCard({ 
  product, 
  showFavoriteButton = true, 
  className = '' 
}: ProductCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoritesStore();
  const isProductFavorite = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProductFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Price on request';
    return `$${price}`;
  };

  return (
    <div className={`product-card group hover-lift ${className}`}>
      <div className="relative">
        <Link to={`/products/${product.slug}`} className="touch-target">
          <div className="relative overflow-hidden card-mobile group/image">
            <OptimizedImage
              src={product.imageUrl}
              alt={`${product.brand} ${product.name} - ${product.category} ${product.price ? `$${product.price}` : 'Fashion item'}`}
              blurhash={product.blurhash}
              aspectRatio="3/4"
              className="group-hover/image:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            
            {/* Unpublished Badge - only show when explicitly unpublished */}
            {product.isPublished === false && (
              <div className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-950 px-2 py-1 rounded text-xs font-semibold z-10">
                UNPUBLISHED
              </div>
            )}
          </div>
        </Link>
        
        {showFavoriteButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-smooth touch-target h-10 w-10 sm:h-11 sm:w-11 ${
              isProductFavorite 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Heart 
              className="h-4 w-4 sm:h-5 sm:w-5" 
              fill={isProductFavorite ? 'currentColor' : 'none'} 
            />
          </Button>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <Link to={`/products/${product.slug}`} className="block touch-target">
          <h3 className="font-display text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-smooth line-clamp-2">
            {product.name}
          </h3>
          
          {product.brand && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {product.brand}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-base sm:text-lg font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-1">
                {product.tags?.slice(0, 2)?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
        
        {/* Action Buttons */}
        <div className="mt-3 sm:mt-4 flex gap-2">
          <Link
            to={`/go/${product.id}`}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              size="sm" 
              variant="outline"
              className="w-full hover:bg-primary hover:text-white transition-colors touch-target h-10"
            >
              Shop Now
            </Button>
          </Link>
          
          <div onClick={(e) => e.stopPropagation()}>
            <ShareButton
              title={`${product.brand} ${product.name}`}
              description={product.description}
              price={product.price !== null ? `$${product.price}` : undefined}
              imageUrl={product.imageUrl}
              url={`${window.location.origin}/products/${product.slug}`}
              type="product"
              variant="outline"
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}