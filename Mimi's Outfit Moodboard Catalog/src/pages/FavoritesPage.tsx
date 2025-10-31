import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import SectionHeader from '@/components/SectionHeader';
import { useFavoritesStore } from '@/store/favorites-store';

export default function FavoritesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { favorites, clearFavorites } = useFavoritesStore();

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container-custom section-padding">
          <SectionHeader
            title="Your Favorites"
            subtitle="Loading your saved items..."
            className="mb-12"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container-custom section-padding">
          <SectionHeader
            title="Your Favorites"
            subtitle="Save items you love to create your personal wishlist"
            className="mb-12"
          />
          
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-medium text-foreground mb-3">
              No favorites yet
            </h3>
            <p className="text-muted-foreground mb-8">
              Start browsing our curated collection and click the heart icon on items you love to save them here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Products
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/moodboards">
                  Explore Moodboards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-custom section-padding">
        <SectionHeader
          title="Your Favorites"
          subtitle={`${favorites.length} item${favorites.length !== 1 ? 's' : ''} saved for later`}
          className="mb-8"
        />

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            Your curated collection of favorite pieces
          </p>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={clearFavorites}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.filter(p => p && p.id).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
