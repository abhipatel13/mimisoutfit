import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy load public pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const MoodboardsPage = lazy(() => import('@/pages/MoodboardsPage'));
const MoodboardDetailPage = lazy(() => import('@/pages/MoodboardDetailPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PersonalStylistPage = lazy(() => import('@/pages/PersonalStylistPage'));
const AffiliateRedirect = lazy(() => import('@/pages/AffiliateRedirect'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Lazy load admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const AdminMoodboardsPage = lazy(() => import('@/pages/admin/AdminMoodboardsPage'));
const AdminMoodboardForm = lazy(() => import('@/pages/admin/AdminMoodboardForm'));
const AdminRetailersPage = lazy(() => import('@/pages/admin/AdminRetailersPage'));

// Loading fallback component with elegant design
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="relative">
        {/* Decorative background blur */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
        
        {/* Spinner */}
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
      
      {/* Loading text */}
      <p className="mt-6 text-sm text-muted-foreground font-sans">
        Loading...
      </p>
    </div>
  );
}

// Public page wrapper with header
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <TooltipProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
                <Route path="/products/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
                <Route path="/moodboards" element={<PublicLayout><MoodboardsPage /></PublicLayout>} />
                <Route path="/moodboards/:id" element={<PublicLayout><MoodboardDetailPage /></PublicLayout>} />
                <Route path="/favorites" element={<PublicLayout><FavoritesPage /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                <Route path="/stylist" element={<PublicLayout><PersonalStylistPage /></PublicLayout>} />
                <Route path="/go/:id" element={<AffiliateRedirect />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalyticsPage /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/admin/products/new" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="/admin/products/edit/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
                <Route path="/admin/moodboards" element={<ProtectedRoute><AdminMoodboardsPage /></ProtectedRoute>} />
                <Route path="/admin/moodboards/new" element={<ProtectedRoute><AdminMoodboardForm /></ProtectedRoute>} />
                <Route path="/admin/moodboards/edit/:id" element={<ProtectedRoute><AdminMoodboardForm /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
              </Routes>
            </Suspense>
            <Toaster />
          </Router>
        </TooltipProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
