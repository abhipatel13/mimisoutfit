import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import ShareButton from '@/components/ShareButton';
import type { Moodboard } from '@/types';

interface MoodboardCardProps {
  moodboard: Moodboard;
}

export default function MoodboardCard({ moodboard }: MoodboardCardProps) {
  // Filter out any undefined products as a safety measure
  const validProductCount = moodboard.products?.filter(p => p && p.id).length || 0;
  
  return (
    <Link 
      to={`/moodboards/${moodboard.slug}`}
      className="group block touch-target"
    >
      <div className="bg-surface card-mobile overflow-hidden shadow-elegant hover-lift">
        {/* Cover Image */}
        <div className="relative overflow-hidden group/image">
          <OptimizedImage
            src={moodboard.coverImage}
            alt={`${moodboard.title} - Fashion moodboard with ${validProductCount} curated pieces featuring ${moodboard.tags?.slice(0, 2)?.join(' and ') || 'curated'} styles`}
            blurhash={moodboard.coverBlurhash}
            aspectRatio="4/5"
            className="group-hover/image:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Unpublished Badge - only show when explicitly unpublished */}
          {moodboard.isPublished === false && (
            <div className="absolute top-3 left-3 bg-yellow-500/90 text-yellow-950 px-2.5 py-1.5 rounded text-xs font-semibold z-10">
              UNPUBLISHED
            </div>
          )}
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        
        {/* Content */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="font-display text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 font-medium">
              {moodboard.title}
            </h3>
            {moodboard.isFeatured && (
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border border-accent/30 text-xs shrink-0 font-medium">
                Featured
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
            {moodboard.description}
          </p>
          
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 flex-wrap">
                {moodboard.tags?.slice(0, 2)?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-secondary/50 text-secondary-foreground rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground font-medium shrink-0">
                {validProductCount} pieces
              </div>
            </div>
            
            {/* Share Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButton
                title={moodboard.title}
                description={moodboard.description}
                imageUrl={moodboard.coverImage}
                url={`${window.location.origin}/moodboards/${moodboard.slug}`}
                type="moodboard"
                variant="outline"
                size="sm"
                showLabel={true}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}