import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  slug: string;
}

export function generateProductSchema(product: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || siteConfig.description,
    url: `${siteConfig.url}/shop/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/shop/${product.slug}`,
    },
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
  };
}

export function generateProductMetadata(product: Product): Metadata {
  return {
    title: `${product.name} | ${siteConfig.name}`,
    description: product.description || siteConfig.description,
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description || siteConfig.description,
      url: `${siteConfig.url}/shop/${product.slug}`,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description || siteConfig.description,
    },
  };
}

export function generatePageMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const url = `${siteConfig.url}${path}`;
  
  return {
    title: fullTitle,
    description: description,
    openGraph: {
      title: fullTitle,
      description: description,
      url: url,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
    },
  };
}
