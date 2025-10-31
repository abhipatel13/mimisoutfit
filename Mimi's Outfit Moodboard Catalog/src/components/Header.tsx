import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/store/favorites-store';
import { useAuthStore } from '@/store/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { favorites } = useFavoritesStore();
  const { isAuthenticated } = useAuthStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Moodboards', href: '/moodboards' },
    { name: 'Personal Stylist', href: '/stylist' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm safe-area-top">
      <nav className="container-custom mobile-container py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 touch-target group">
            <img 
              src="https://res.cloudinary.com/dcqlvobvk/image/upload/v1761090266/file_00000000df6c61f8b512fc9603e86d5b_3_nj6zcj.png" 
              alt="The Lookbook" 
              className="h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110 object-contain"
            />
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-primary">
              The Lookbook
            </h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-all px-4 py-2 rounded-lg touch-target ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Link in Desktop Nav */}
              <Link
                to={isAuthenticated ? "/admin" : "/admin/login"}
                className="relative text-sm font-medium transition-all px-4 py-2 rounded-lg touch-target text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                Admin
                {isAuthenticated && (
                  <span className="absolute top-1 right-1 bg-green-500 rounded-full h-2 w-2 shadow-sm" />
                )}
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative touch-target h-11 w-11 hover:bg-accent/10 transition-all"
              asChild
            >
              <Link to="/favorites">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden touch-target h-11 w-11"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border animate-fadeIn">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium py-3 px-2 rounded-lg transition-smooth touch-target ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Link in Mobile Nav */}
              <Link
                to={isAuthenticated ? "/admin" : "/admin/login"}
                onClick={() => setIsMenuOpen(false)}
                className="relative text-base font-medium py-3 px-2 rounded-lg transition-smooth touch-target text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                Admin
                {isAuthenticated && (
                  <span className="absolute top-3 right-2 bg-green-500 rounded-full h-2 w-2 shadow-sm" />
                )}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}