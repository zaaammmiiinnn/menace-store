"use client";

import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { Marquee } from "@/components/ui/marquee";
import { FeaturedDrop } from "@/components/home/featured-drop";
import { ShopByVibe } from "@/components/home/shop-by-vibe";
import { BrandStory } from "@/components/home/brand-story";
import { UgcWall } from "@/components/home/ugc-wall";
import { BestSellers } from "@/components/home/best-sellers";
import { ReviewsSection } from "@/components/home/reviews-section";
import { SignupSection } from "@/components/home/signup-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-base-black text-off-white overflow-hidden">
      {/* 1. Hero Section with 3D Tee, typewriter tagline, drop countdown, magnetic CTA */}
      <HeroSection />

      {/* 2. Announcement Marquee */}
      <section className="w-full py-4 bg-acid-green text-base-black font-display text-lg md:text-2xl uppercase tracking-wider overflow-hidden">
        <Marquee speed={60} pauseOnHover={true}>
          <div className="flex items-center space-x-8 whitespace-nowrap">
            <span>NOT FOR EVERYONE</span>
            <span className="text-sm">•</span>
            <span>FREE SHIPPING OVER ₹1,499</span>
            <span className="text-sm">•</span>
            <span>SIZES XS–4XL</span>
            <span className="text-sm">•</span>
            <span>HEAVYWEIGHT WAFFLE KNIT</span>
            <span className="text-sm">•</span>
            <span>DROP 001 LIVE SOON</span>
            <span className="text-sm">•</span>
          </div>
        </Marquee>
      </section>

      {/* 3. Featured Drop: 3D / horizontal drag carousel of 6 tees */}
      <FeaturedDrop />

      {/* 4. Shop By Vibe: 4 interactive vibe flip tiles */}
      <ShopByVibe />

      {/* 5. Brand Story: Pinned scroll section with line-by-line reveal */}
      <BrandStory />

      {/* 6. UGC Wall: Instagram & TikTok style grid */}
      <UgcWall />

      {/* 7. Best Sellers: Animated 3D tilt product grid */}
      <BestSellers />

      {/* 8. Reviews: Infinite horizontal momentum scroll */}
      <ReviewsSection />

      {/* 9. Email + SMS Signup with confetti celebration */}
      <SignupSection />
    </div>
  );
}
