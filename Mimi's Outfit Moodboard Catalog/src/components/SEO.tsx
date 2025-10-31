import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export function SEO({
  title = 'The Lookbook by Mimi - Curated Fashion & Style Inspiration',
  description = 'Discover curated moodboards, shoppable outfits, and style inspiration from The Lookbook by Mimi. Explore fashion from high-end to accessible brands.',
  image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=630&fit=crop',
  url = 'https://thelookbookbymimi.com',
  type = 'website'
}: SEOProps) {
  const fullTitle = title.includes('Lookbook') ? title : `${title} - The Lookbook by Mimi`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
