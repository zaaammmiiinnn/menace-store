import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getDrop001, getDropById } from '@/lib/products/queries';
import { ProductDetailView } from './ProductDetailView';

export const revalidate = 60;

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

  const drop = product.dropId ? await getDropById(product.dropId) : await getDrop001();
  const isBuyNowEnabled = product.purchaseMode !== 'notify_only';
  const isDropUpcoming = drop?.status === 'upcoming';
  const isDropLive = isBuyNowEnabled && !isDropUpcoming;

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
      availability: isDropLive ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
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
      <ProductDetailView product={product} isDropLive={isDropLive} />
    </>
  );
}
