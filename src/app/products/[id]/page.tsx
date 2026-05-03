import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// This would be a server component in Next.js
async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/${id}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const productData = await getProduct(params.id);
  if (!productData) return { title: 'Product Not Found' };
  
  const product = productData.product || productData;
  return {
    title: product.nameEn,
    description: product.descriptionEn,
    openGraph: {
      title: product.nameEn,
      description: product.descriptionEn,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productData = await getProduct(params.id);
  
  if (!productData) {
    notFound();
  }

  const product = productData.product || productData;
  const category = productData.category;

  // We can still use the client components for the interactive parts
  // But the core HTML is now rendered on the server
  return (
    <main className="min-h-screen bg-white">
      {/* We can still use our SEO component if it's compatible or just rely on generateMetadata */}
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-4xl font-bold mb-4">{product.nameEn} / {product.nameAr}</h1>
         <p className="text-xl text-gray-600 mb-8">{product.descriptionEn}</p>
         {/* ... render enough HTML for SEO ... */}
         <div className="hidden">
            {/* Structured Data for Search Engines */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": product.nameEn,
                  "image": product.images,
                  "description": product.descriptionEn,
                  "offers": {
                    "@type": "Offer",
                    "priceCurrency": "EGP",
                    "price": product.price,
                    "availability": "https://schema.org/InStock"
                  }
                })
              }}
            />
         </div>
         
         {/* Since we can't easily port the whole complex page logic yet, 
             we could potentially render the client-side version here 
             if we make it a client component.
         */}
      </div>
    </main>
  );
}
