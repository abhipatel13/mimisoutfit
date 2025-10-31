import { Home, Sparkles, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center max-w-2xl mx-auto relative">
        {/* 404 Number with decorative styling */}
        <div className="mb-8 relative">
          <h1 className="text-display text-[180px] sm:text-[220px] leading-none font-bold text-primary/10 mb-0 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-accent animate-pulse" strokeWidth={1.5} />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4 mb-10">
          <h2 className="text-display text-3xl sm:text-4xl font-semibold text-primary">
            This Look Doesn't Exist
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            We couldn't find the page you're looking for. Perhaps it's been archived, 
            or the URL was mistyped.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg"
            onClick={() => handleNavigation('/')}
            className="group"
          >
            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Return Home
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => handleNavigation('/products')}
            className="group"
          >
            <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Browse Products
          </Button>
        </div>

        {/* Quick links section */}
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            Continue Your Style Journey
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleNavigation('/moodboards')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-medium text-primary transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Discover Moodboards
            </button>
            <button
              onClick={() => handleNavigation('/favorites')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-medium text-primary transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              <Heart className="w-4 h-4" />
              View Favorites
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-medium text-primary transition-colors duration-200 hover:scale-105 active:scale-95"
            >
              About The Lookbook
            </button>
          </div>
        </div>

        {/* Subtle tagline */}
        <p className="mt-12 text-xs text-muted-foreground/60 italic font-light">
          "Every great style journey has a few unexpected detours."
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;