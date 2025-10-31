import { useState, useMemo } from 'react';
import SectionHeader from '@/components/SectionHeader';
import MoodboardCard from '@/components/MoodboardCard';
import SkeletonMoodboard from '@/components/SkeletonMoodboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SEO } from '@/components/SEO';
import { useMoodboards } from '@/hooks/use-moodboards';
import { useAuthStore } from '@/store/auth-store';
import { trackFilterChange } from '@/services/analytics.service';

const filterTags = ['all', 'parisian', 'minimalist', 'luxe', 'chic', 'modern'];

export default function MoodboardsPage() {
  const [selectedTag, setSelectedTag] = useState('all');
  const [showUnpublished, setShowUnpublished] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Use live API hook for moodboards
  const { moodboards: allMoodboards, loading: isLoading } = useMoodboards({
    tag: selectedTag === 'all' ? undefined : selectedTag,
  });

  const filteredMoodboards = useMemo(() => {
    // Filter out invalid moodboards
    let moodboards = allMoodboards.filter(m => m && m.id);

    // Filter by publish status (admin only)
    if (!isAuthenticated || showUnpublished) {
      return moodboards;
    }
    // For non-admin or when not showing unpublished, filter out unpublished moodboards
    return moodboards.filter(m => m.isFeatured !== false);
  }, [allMoodboards, isAuthenticated, showUnpublished]);

  // Track filter changes
  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    
    // Track analytics
    trackFilterChange({ 
      page: 'moodboards', 
      filter: 'tag', 
      value: tag
    });
  };

  return (
    <>
      <SEO
        title="Moodboards & Style Collections"
        description="Explore curated fashion moodboards featuring diverse aesthetics from Parisian chic to minimalist modern. Get inspired with complete shoppable looks."
        url="https://thelookbookbymimi.com/moodboards"
      />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative mobile-section mobile-container">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-mobile-hero text-neutral-900 mb-4 sm:mb-6">
            Curated Looks
          </h1>
          <p className="text-mobile-body text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Discover thoughtfully curated moodboards that capture the essence of modern style. 
            Each collection tells a story through carefully selected pieces.
          </p>
        </div>
      </section>

      {/* Filter Tags */}
      <section className="mobile-container mb-8 sm:mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {filterTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagChange(tag)}
                className={`capitalize transition-all duration-200 touch-target ${
                  selectedTag === tag 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'border-neutral-300 hover:border-primary hover:text-primary'
                }`}
              >
                {tag === 'all' ? 'All Looks' : `#${tag}`}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Moodboards Grid */}
      <section className="mobile-container pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Editorial Collections" 
            subtitle={isLoading ? "Loading..." : `${filteredMoodboards.length} curated looks`}
          />
          
          {isLoading ? (
            <div className="grid-mobile-moodboards gap-4 sm:gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <SkeletonMoodboard key={i} />
              ))}
            </div>
          ) : filteredMoodboards.length > 0 ? (
            <div className="grid-mobile-moodboards gap-4 sm:gap-6 md:gap-8">
              {filteredMoodboards.map((moodboard) => (
                <MoodboardCard key={moodboard.id} moodboard={moodboard} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">✨</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl text-neutral-900 mb-2">
                No looks found
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-6">
                Try adjusting your filter or browse all collections
              </p>
              <Button className="btn-mobile" onClick={() => setSelectedTag('all')}>
                View All Looks
              </Button>
            </div>
          )}
        </div>
      </section>
      </div>
    </>
  );
}
