import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products/queries';
import { ProductDetailView } from './ProductDetailView';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found — MENANCE',
    };
  }

  const title = `${product.name} — MENANCE`;
  const description = `Heavyweight waffle knit. Boxy oversized fit. '${product.backQuote}'. Not for everyone.`;
  const ogImage = product.images[0] || '/products/placeholder.svg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
      type: 'website',
      siteName: 'MENANCE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for Google & rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `Heavyweight waffle knit. Boxy oversized fit. '${product.backQuote}'. Not for everyone.`,
    image: product.images.map((img) =>
      img.startsWith('http') ? img : `https://menance.store${img}`
    ),
    brand: {
      '@type': 'Brand',
      name: 'MENANCE',
    },
    sku: product.variants[0]?.sku || `MENANCE-${product.slug.toUpperCase()}`,
    offers: {
      '@type': 'Offer',
      price: product.priceInr,
      priceCurrency: 'INR',
      availability: 'https://schema.org/PreOrder',
      url: `https://menance.store/shop/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'MENANCE',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
