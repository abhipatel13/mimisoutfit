import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import SkeletonMoodboard from '@/components/SkeletonMoodboard';
import SectionHeader from '@/components/SectionHeader';
import OptimizedImage from '@/components/OptimizedImage';
import { useFeaturedProducts } from '@/hooks/use-products';
import { useFeaturedMoodboards } from '@/hooks/use-moodboards';

export default function HomePage() {
  // Use live API hooks for featured data
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts();
  const { moodboards: featuredMoodboards, loading: moodboardsLoading } = useFeaturedMoodboards();
  
  const isLoading = productsLoading || moodboardsLoading;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom mobile-container mobile-section py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-mobile-hero font-medium text-primary mb-4 sm:mb-6 leading-tight">
              Curated Fashion
              <br />
              <span className="text-accent">Discovered Daily</span>
            </h1>
            <p className="text-mobile-body text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Discover beautiful, shoppable outfits and moodboards curated by Mimi. 
              Each collection highlights a cohesive aesthetic for effortless style inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" className="btn-mobile w-full sm:w-auto" asChild>
                <Link to="/products">
                  Shop Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="btn-mobile w-full sm:w-auto" asChild>
                <Link to="/moodboards">
                  Explore Moodboards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Moodboards Section */}
      <section className="mobile-section bg-background">
        <div className="container-custom mobile-container">
          <SectionHeader
            title="Featured Collections"
            subtitle="Carefully curated moodboards that capture the essence of modern style"
            className="mb-8 sm:mb-12"
          />
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <SkeletonMoodboard />
              <SkeletonMoodboard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {featuredMoodboards?.slice(0, 2)?.map((moodboard) => (
                <Link
                  key={moodboard.id}
                  to={`/moodboards/${moodboard.slug}`}
                  className="group block touch-target"
                >
                  <div className="relative card-mobile overflow-hidden shadow-elegant group-hover:shadow-elegant-hover transition-smooth">
                    <div className="aspect-[4/5] bg-muted">
                      <img
                        src={moodboard.coverImage}
                        alt={`${moodboard.title} - Curated fashion moodboard featuring ${moodboard.tags?.slice(0, 2)?.join(', ') || 'curated'} styles`}
                        loading="lazy"
                        className="img-responsive object-cover group-hover:scale-105 transition-smooth"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="font-display text-xl sm:text-2xl font-medium text-white mb-1 sm:mb-2">
                        {moodboard.title}
                      </h3>
                      <p className="text-white/90 text-sm mb-3 sm:mb-4 line-clamp-2">
                        {moodboard.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {moodboard.tags?.slice(0, 3)?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-white/20 text-white rounded-full backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button variant="outline" className="btn-mobile w-full sm:w-auto" asChild>
              <Link to="/moodboards">
                View All Moodboards
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mobile-section bg-secondary/20">
        <div className="container-custom mobile-container">
          <SectionHeader
            title="Shop the Edit"
            subtitle="Hand-picked pieces that define contemporary elegance"
            className="mb-8 sm:mb-12"
          />
          
          {isLoading ? (
            <div className="grid-mobile-products gap-4 sm:gap-6 mb-6 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid-mobile-products gap-4 sm:gap-6 mb-6 sm:mb-8">
              {featuredProducts?.slice(0, 4)?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button className="btn-mobile w-full sm:w-auto" asChild>
              <Link to="/products">
                Shop All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="mobile-section bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom mobile-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 mx-auto">
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            
            <h2 className="font-display text-mobile-subtitle font-medium mb-4">
              Join Our Style Community
            </h2>
            
            <p className="text-mobile-body mb-8 text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Get exclusive styling tips, early access to new collections, and connect with a community 
              of fashion enthusiasts. Join our WhatsApp group for daily inspiration and member-only perks.
            </p>
            
            <a
              href="https://chat.whatsapp.com/HVqKxP9LJ7Y8kN5mD3wT2R"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button 
                size="lg" 
                variant="secondary"
                className="btn-mobile bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all gap-3 group font-medium text-base px-8"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Join WhatsApp Group
              </Button>
            </a>
            
            <p className="text-sm text-primary-foreground/70 mt-6">
              Limited spots available • Free to join • Exclusive content
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}