import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/lib/i18n';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  productData?: {
    name: string;
    price: string;
    currency: string;
    image: string;
    availability: string;
    description: string;
  };
  breadcrumbs?: { name: string; item: string }[];
}

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  productData,
  breadcrumbs,
}: SEOProps) {
  const { language } = useLanguage();
  const siteName = language === 'ar' ? 'فستان - متجر فساتين زفاف وسهرة' : 'Fustan - Bridal & Evening Dresses Store';
  const defaultDesc = language === 'ar' 
    ? 'اكتشفي أرقى فساتين الزفاف والسهرة في فستان. خيارات متنوعة، جودة عالية، وتجربة تسوق فريدة.' 
    : 'Discover the finest wedding and evening dresses at Fustan. Diverse options, high quality, and a unique shopping experience.';
  const defaultImage = '/logo-social.png'; // Should be absolute URL in production
  const siteUrl = 'https://fustan.cloud'; // Updated to user's domain

  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDesc;
  const seoImage = image || `${siteUrl}${defaultImage}`;
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;

  // JSON-LD Structured Data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      "https://facebook.com/fustan",
      "https://instagram.com/fustan"
    ]
  };

  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "image": productData.image,
    "description": productData.description,
    "offers": {
      "@type": "Offer",
      "url": seoUrl,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": productData.availability === 'in_stock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.item}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
