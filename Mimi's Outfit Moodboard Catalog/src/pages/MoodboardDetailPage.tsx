import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, ExternalLink, Edit, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import SkeletonDetail from '@/components/SkeletonDetail';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import { SEO } from '@/components/SEO';
import { moodboardsApi } from '@/services/api';
import { adminMoodboardsApi } from '@/services/api/admin.api';
import { useFavoritesStore } from '@/store/favorites-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { trackMoodboardView, analytics } from '@/services/analytics.service';
import { useState, useEffect } from 'react';
import type { Moodboard } from '@/types';

export default function MoodboardDetailPage() {
  const { id } = useParams(); // Can be ID or slug
  const navigate = useNavigate();
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const favorites = useFavoritesStore((state) => state.favorites);
  const addToFavorites = useFavoritesStore((state) => state.addToFavorites);
  const removeFromFavorites = useFavoritesStore((state) => state.removeFromFavorites);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Fetch moodboard data
  useEffect(() => {
    const fetchMoodboard = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch by slug first, then by ID if slug fails
        let data = await moodboardsApi.getMoodboardBySlug(id);
        
        if (!data) {
          // If slug lookup fails, try ID lookup (for backward compatibility)
          data = await moodboardsApi.getMoodboardById(id);
        }
        
        setMoodboard(data);
        
        // Track moodboard view
        if (data) {
          trackMoodboardView(data.id, data.title);
        }
      } catch (err) {
        console.error('Failed to fetch moodboard:', err);
        setError('Failed to load moodboard. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodboard();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO title="Loading..." />
        <div className="min-h-screen bg-background">
          <div className="border-b border-neutral-200 sticky top-14 bg-surface/95 backdrop-blur-sm z-40">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <Link 
                to="/moodboards" 
                className="inline-flex items-center text-neutral-600 hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-sm">Back to Collections</span>
              </Link>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="animate-pulse">
              {/* Hero image skeleton */}
              <div className="aspect-[16/9] md:aspect-[21/9] bg-neutral-200 rounded-lg mb-8" />
              
              {/* Stats skeleton */}
              <div className="flex gap-6 mb-12">
                <div className="h-16 bg-neutral-200 rounded w-32" />
                <div className="h-16 bg-neutral-200 rounded w-32" />
              </div>
              
              {/* Products grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-neutral-200 rounded-lg" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !moodboard) {
    return (
      <>
        <SEO title="Moodboard Not Found" />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <h1 className="font-display text-2xl text-neutral-900 mb-3">
              {error ? 'Error Loading Moodboard' : 'Moodboard Not Found'}
            </h1>
            <p className="text-neutral-600 mb-6">
              {error || "This collection doesn't exist or may have been removed."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/moodboards">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse All Looks
                </Button>
              </Link>
              {error && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Filter out any undefined products as a safety measure
  const validProducts = moodboard.products?.filter(p => p && p.id) || [];
  
  const allProductsInFavorites = validProducts.every(p => 
    favorites.some(f => f.id === p.id)
  );

  const handleAddAllToFavorites = () => {
    validProducts.forEach(product => {
      if (!favorites.some(f => f.id === product.id)) {
        addToFavorites(product);
      }
    });
    
    // Track bulk favorites action
    if (moodboard) {
      analytics.track({
        event: 'moodboard_save_all',
        resourceType: 'moodboard',
        resourceId: moodboard.id,
        metadata: { 
          moodboardTitle: moodboard.title,
          productCount: validProducts.length
        }
      });
    }
  };

  const handleRemoveAllFromFavorites = () => {
    validProducts.forEach(product => {
      if (favorites.some(f => f.id === product.id)) {
        removeFromFavorites(product.id);
      }
    });
    
    // Track bulk remove action
    if (moodboard) {
      analytics.track({
        event: 'moodboard_remove_all',
        resourceType: 'moodboard',
        resourceId: moodboard.id,
        metadata: { 
          moodboardTitle: moodboard.title,
          productCount: validProducts.length
        }
      });
    }
  };

  const handleTogglePublish = async () => {
    if (!moodboard) return;
    
    setIsPublishing(true);
    try {
      const newPublishState = !moodboard.isPublished;
      await adminMoodboardsApi.publishMoodboard(moodboard.id, newPublishState);
      
      // Update local state
      setMoodboard({
        ...moodboard,
        isPublished: newPublishState,
      });
      
      toast({
        title: 'Success',
        description: `Moodboard ${newPublishState ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update moodboard status',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    if (moodboard) {
      navigate(`/admin/moodboards/edit/${moodboard.id}`);
    }
  };

  return (
    <>
      <SEO
        title={moodboard.title}
        description={moodboard.description || `Explore the ${moodboard.title} collection featuring ${validProducts.length} curated pieces. ${moodboard.stylingTips?.[0] || ''}`}
        image={moodboard.coverImage}
        url={`https://thelookbookbymimi.com/moodboards/${moodboard.slug}`}
        type="article"
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <div className="border-b border-neutral-200 sticky top-14 bg-surface/95 backdrop-blur-sm z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link 
              to="/moodboards" 
              className="inline-flex items-center text-neutral-600 hover:text-primary transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-sm">Back to Collections</span>
            </Link>
          </div>
        </div>

      {/* Hero Image Section */}
      <section className="relative bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <div className={`absolute inset-0 bg-neutral-200 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
            <img
              src={moodboard.coverImage}
              alt={`${moodboard.title} - Curated moodboard cover featuring ${moodboard.tags?.join(', ') || 'curated'} aesthetic`}
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
            
            {/* Unpublished Badge - only show when explicitly false */}
            {moodboard.isPublished === false && (
              <div className="absolute top-6 left-6 bg-yellow-500/90 text-yellow-950 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm">
                UNPUBLISHED
              </div>
            )}
            
            {/* Admin Actions Overlay */}
            {isAuthenticated && (
              <div className="absolute top-6 right-6 flex gap-2 z-50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEdit}
                  className="bg-white/90 hover:bg-white text-foreground backdrop-blur-sm shadow-lg cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant={moodboard.isPublished === false ? 'default' : 'secondary'}
                  size="sm"
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  className={`cursor-pointer ${moodboard.isPublished !== false
                    ? "bg-white/90 hover:bg-white text-foreground backdrop-blur-sm shadow-lg" 
                    : "backdrop-blur-sm shadow-lg"}`}
                >
                  {isPublishing ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span>
                      {moodboard.isPublished === false ? 'Publishing...' : 'Unpublishing...'}
                    </span>
                  ) : moodboard.isPublished === false ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Publish
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Unpublish
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="max-w-4xl">
                {moodboard.tags && moodboard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {moodboard.tags?.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-3">
                  {moodboard.title}
                </h1>
                
                {moodboard.description && (
                  <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                    {moodboard.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-12">
          <div className="flex gap-6">
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-foreground">{validProducts.length}</div>
              <div className="text-sm text-muted-foreground">Curated Pieces</div>
            </div>
            {moodboard.tags && moodboard.tags.length > 0 && (
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-foreground">{moodboard.tags?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Style Tags</div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={allProductsInFavorites ? handleRemoveAllFromFavorites : handleAddAllToFavorites}
              variant={allProductsInFavorites ? "outline" : "default"}
              className="w-full sm:w-auto"
            >
              <Heart className={`mr-2 h-4 w-4 ${allProductsInFavorites ? 'fill-current' : ''}`} />
              {allProductsInFavorites ? 'Remove All' : 'Save All'}
            </Button>
            
            <ShareButton
              title={moodboard.title}
              description={moodboard.description}
              imageUrl={moodboard.coverImage}
              url={`${window.location.origin}/moodboards/${moodboard.slug}`}
              type="moodboard"
              variant="outline"
              size="default"
              showLabel={true}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Styling Tips */}
        {moodboard.stylingTips && moodboard.stylingTips.length > 0 && (
          <div className="mb-12 bg-secondary/30 p-6 rounded-lg">
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Styling Tips</h2>
            <ul className="space-y-2">
              {moodboard.stylingTips?.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent mr-3 mt-1">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to Wear */}
        {moodboard.howToWear && (
          <div className="mb-12 bg-accent/10 p-6 rounded-lg border border-accent/20">
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">How to Wear</h2>
            <p className="text-muted-foreground leading-relaxed">{moodboard.howToWear}</p>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">Shop This Look</h2>
          {validProducts.length > 0 ? (
            <div className="grid grid-mobile-products gap-mobile-grid">
              {validProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No products in this moodboard yet.
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
