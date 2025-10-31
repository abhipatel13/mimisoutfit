import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ExternalLink, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/services/api';
import type { Product } from '@/types';
import { SEO } from '@/components/SEO';
import { trackAffiliateClick } from '@/services/analytics.service';

// Add UTM tracking parameters to URL
function addTrackingParams(url: string, productId: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'lookbook_mimi');
    urlObj.searchParams.set('utm_medium', 'affiliate');
    urlObj.searchParams.set('utm_campaign', 'product_redirect');
    urlObj.searchParams.set('utm_content', productId);
    urlObj.searchParams.set('ref', 'lookbook');
    return urlObj.toString();
  } catch {
    return url;
  }
}

// Simple URL validation
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AffiliateRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('');

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError('Invalid product link');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try to fetch by ID first
        const data = await productsApi.getProductById(id);
        
        if (!data) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Validate affiliate URL
        if (!data.affiliateUrl) {
          setError('This product does not have a purchase link available');
          setLoading(false);
          return;
        }

        // Simple URL validation
        if (!isValidUrl(data.affiliateUrl)) {
          setError('Invalid redirect URL');
          setLoading(false);
          return;
        }

        setProduct(data);
        
        // Prepare redirect URL with tracking
        const trackedUrl = addTrackingParams(data.affiliateUrl, data.id);
        setRedirectUrl(trackedUrl);
        
        // Track affiliate click event
        try {
          const urlObj = new URL(data.affiliateUrl);
          trackAffiliateClick(data.id, data.name, urlObj.hostname);
        } catch {
          // If URL parsing fails, track with generic retailer
          trackAffiliateClick(data.id, data.name, 'unknown');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product information');
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Countdown and redirect logic
  useEffect(() => {
    if (!product || !redirectUrl || error || loading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Perform redirect
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [product, redirectUrl, error, loading]);

  // Manual redirect handler
  const handleManualRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  // Cancel redirect handler
  const handleCancel = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO 
          title="Redirecting..."
          description="Taking you to your selected product"
        />
        <div className="text-center px-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  // Error state - Security Warning
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEO 
          title="Redirect Error"
          description="Unable to complete redirect"
        />
        <div className="max-w-md w-full text-center">
          <div className="bg-surface rounded-2xl p-8 shadow-elegant">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            
            {/* Error Title */}
            <h1 className="font-display text-2xl text-neutral-900 mb-3">
              {error.includes('not found') ? 'Link Not Found' : 'Security Warning'}
            </h1>
            
            {/* Error Message */}
            <p className="text-neutral-600 mb-6 leading-relaxed">
              {error}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEO 
          title="Product Not Found"
          description="This product link is no longer available"
        />
        <div className="max-w-md w-full text-center">
          <div className="bg-surface rounded-2xl p-8 shadow-elegant">
            {/* Not Found Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-4xl">🔗</span>
            </div>
            
            <h1 className="font-display text-2xl text-neutral-900 mb-3">
              Product Not Found
            </h1>
            
            <p className="text-neutral-600 mb-6 leading-relaxed">
              This product link doesn't exist or may have been removed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Redirect in progress
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO 
        title={`Redirecting to ${product.brand} - ${product.name}`}
        description={`Taking you to purchase ${product.name} from ${product.brand}`}
      />
      
      <div className="max-w-lg w-full">
        <div className="bg-surface rounded-2xl shadow-elegant overflow-hidden">
          {/* Product Image Header */}
          <div className="relative h-64 bg-gradient-to-b from-neutral-100 to-neutral-50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content Section */}
          <div className="p-8 text-center">
            {/* Loading Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-2">
              Redirecting to {product.brand}
            </h1>
            
            {/* Product Name */}
            <p className="text-neutral-600 mb-1 leading-relaxed">
              Taking you to purchase
            </p>
            <p className="font-medium text-neutral-900 mb-6">
              {product.name}
            </p>

            {/* Countdown Circle */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30">
                <div className="text-center">
                  <div className="text-4xl font-display text-primary font-semibold">
                    {countdown}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1 justify-center">
                    <Clock className="h-3 w-3" />
                    seconds
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Controls */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={handleManualRedirect}
                className="w-full sm:w-auto min-w-[200px] h-12"
                size="lg"
              >
                Continue Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              
              <div>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Cancel & Go Back
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-center gap-6 text-sm text-neutral-600 mb-4">
                {product.price && (
                  <div>
                    <span className="text-xs uppercase tracking-wide text-neutral-500">Price</span>
                    <p className="font-semibold text-neutral-900">${product.price}</p>
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="text-xs uppercase tracking-wide text-neutral-500">Category</span>
                    <p className="font-medium text-neutral-900 capitalize">{product.category}</p>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {product.tags?.slice(0, 3)?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Affiliate Disclosure */}
            <div className="pt-6 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 leading-relaxed">
                <strong className="text-neutral-700">Affiliate Disclosure:</strong> This is an affiliate link. 
                We may earn a commission from qualifying purchases at no additional cost to you. 
                All prices and availability are subject to change by the retailer.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Below Card */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            You will be redirected to a secure external website
          </p>
        </div>
      </div>
    </div>
  );
}
