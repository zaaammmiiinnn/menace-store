import React from 'react';
import { getProducts, getDrop001 } from '@/lib/products/queries';
import { DropsViewClient } from './DropsViewClient';

export const metadata = {
  title: 'DROP 001 // RADAR — MENANCE',
  description: 'First collection of 240 GSM heavyweight waffle knit silhouettes. Countdown timer, preview catalog, and early access sign-up.',
  openGraph: {
    title: 'DROP 001 // RADAR — MENANCE',
    description: 'Get early access to DROP 001. 8 custom waffle knit silhouettes.',
    images: ['/products/the-henley-black/front.jpg'],
  },
};

export default async function DropsPage() {
  const products = await getProducts();
  const drop = await getDrop001();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <DropsViewClient products={products} drop={drop} />
    </div>
  );
}
