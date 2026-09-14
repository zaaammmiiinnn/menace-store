"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";

interface UGCPost {
  id: number;
  handle: string;
  tagline: string;
  type: "video" | "image";
  platform: "instagram" | "tiktok";
  likes: string;
  colorHex: string;
  image: string;
}

const UGC_POSTS: UGCPost[] = [
  { id: 1, handle: "@yash.archive", tagline: "Drop shoulder is insane", type: "image", platform: "instagram", likes: "2.4k", colorHex: "#1A1A1A", image: "/images/products/quiet-menance-1.jpg" },
  { id: 2, handle: "@priya_fits", tagline: "Boxy fit that actually fits", type: "video", platform: "tiktok", likes: "14.2k", colorHex: "#C6FF00", image: "/images/products/loud-menance-1.jpg" },
  { id: 3, handle: "@devon_noise", tagline: "300 GSM thermal waffle weight test", type: "image", platform: "instagram", likes: "1.8k", colorHex: "#E8E0D0", image: "/images/products/heavy-waffle-1.jpg" },
  { id: 4, handle: "@kabir.99", tagline: "Unbothered raw-edge rotation", type: "video", platform: "tiktok", likes: "8.9k", colorHex: "#B5B5B5", image: "/images/products/raw-edge-boxy-1.jpg" },
  { id: 5, handle: "@ananya.core", tagline: "Collar will never bacon", type: "image", platform: "instagram", likes: "4.1k", colorHex: "#333333", image: "/images/products/midnight-menance-1.jpg" },
  { id: 6, handle: "@zayn.fits", tagline: "Acid Green statement piece", type: "video", platform: "tiktok", likes: "21k", colorHex: "#1F2800", image: "/images/products/acid-menance-1.jpg" },
];

export function UgcWall() {
  const shouldReduceMotion = useReducedMotion();
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = (index: number) => ({
    hidden: { 
      opacity: 0, 
      x: shouldReduceMotion ? 0 : (index % 2 === 0 ? 30 : -30) 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" as const 
      } 
    }
  });

  return (
    <section className="w-full py-24 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col items-center text-center mb-14">
        <span className="text-acid-green font-mono text-xs uppercase tracking-widest mb-2">
          COMMUNITY FIELD TESTS
        </span>
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-off-white uppercase tracking-tight">
          MENANCE IN THE WILD
        </h2>
        <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-2 max-w-md">
          Real fits. Unfiltered drapes. Tag @MENANCE on TikTok or Instagram to enter the wall.
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {UGC_POSTS.map((post, index) => (
          <motion.div
            key={post.id}
            variants={itemVariants(index)}
            whileHover={!shouldReduceMotion ? { y: -6 } : {}}
            onMouseEnter={() => setActiveItem(post.id)}
            onMouseLeave={() => setActiveItem(null)}
            className="aspect-[3/4] relative group rounded-2xl overflow-hidden bg-surface border border-border/80 cursor-pointer shadow-xl"
          >
            {/* Real Product Lookbook Photo */}
            <div className="absolute inset-0 select-none overflow-hidden">
              <img
                src={post.image}
                alt={post.tagline}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
              />
              {/* Subtle gradient overlay to keep tags and text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-base-black via-base-black/20 to-transparent opacity-85 group-hover:opacity-65 transition-opacity" />
            </div>

            {/* Top platform tag */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-off-white">
              <span className="text-acid-green">●</span>
              <span>{post.platform.toUpperCase()}</span>
            </div>

            {/* Video Play Icon if video */}
            {post.type === "video" && (
              <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-base-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-acid-green">
                <Play size={12} className="ml-0.5" />
              </div>
            )}

            {/* Hover details overlay */}
            <div className="absolute inset-0 bg-base-black/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between z-30">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-acid-green font-bold">
                  {post.handle}
                </span>
                <span className="font-mono text-[10px] text-muted-grey">
                  ♥ {post.likes}
                </span>
              </div>

              <div className="space-y-3 text-center">
                <p className="font-display text-xl sm:text-2xl uppercase text-off-white leading-tight">
                  &quot;{post.tagline}&quot;
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-acid-green uppercase tracking-wider">
                  <span>VIEW FIT POST</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>

              <div className="text-[10px] font-mono text-muted-grey text-center uppercase tracking-widest">
                VERIFIED COMMUNITY POST
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default UgcWall;
