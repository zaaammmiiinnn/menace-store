"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useAnimation } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { id: 1, name: "ALEX M.", text: "Quality is insane. Best tee I own hands down.", stars: 5 },
  { id: 2, name: "SARAH K.", text: "Finally a brand that doesn't try too hard.", stars: 5 },
  { id: 3, name: "JORDAN T.", text: "The fit on the heavyweights is perfect. Sized up for oversized.", stars: 4 },
  { id: 4, name: "MARCUS R.", text: "Worth every penny. Customer for life now.", stars: 5 },
  { id: 5, name: "ELENA V.", text: "Material is thick but breathable. Love the subtle branding.", stars: 5 },
  { id: 6, name: "DAVID L.", text: "Clean. Simple. Exactly what I was looking for.", stars: 5 },
  { id: 7, name: "CHLOE S.", text: "Washed it 10 times and still looks brand new.", stars: 4 },
  { id: 8, name: "TYLER B.", text: "The packaging alone is an experience. 10/10.", stars: 5 },
];

export function ReviewsSection() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  const startAnimation = () => {
    if (shouldReduceMotion) return;
    controls.start({
      x: -width / 2, // Scroll halfway assuming content is duplicated
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    if (width > 0) {
      startAnimation();
    }
  }, [width, controls, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <section className="py-24 px-4 md:px-10 bg-[#050505]">
        <div className="text-center mb-16">
          <h2 className="font-anton text-4xl md:text-7xl text-off-white uppercase">
            DON&apos;T TAKE OUR WORD FOR IT
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {reviews.slice(0, 4).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    );
  }

  // Duplicate for infinite scroll effect
  const repeatedReviews = [...reviews, ...reviews];

  return (
    <section className="py-24 bg-[#050505] overflow-hidden">
      <div className="px-4 md:px-10 mb-16">
        <h2 className="font-anton text-4xl md:text-7xl text-off-white uppercase">
          DON&apos;T TAKE OUR WORD FOR IT
        </h2>
      </div>

      <div ref={containerRef} className="cursor-grab active:cursor-grabbing overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          animate={controls}
          onMouseEnter={() => controls.stop()}
          onMouseLeave={startAnimation}
          className="flex gap-6 px-4 md:px-10 w-max"
        >
          {repeatedReviews.map((review, index) => (
            <motion.div 
              key={`${review.id}-${index}`}
              className="w-[300px] shrink-0"
              whileTap={{ scale: 0.98 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className="bg-[#111] p-8 rounded-xl h-full flex flex-col justify-between border border-white/5">
      <div>
        <div className="flex gap-1 mb-6 text-acid-green">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < review.stars ? "fill-current" : "text-muted-grey opacity-30"}
            />
          ))}
        </div>
        <p className="font-inter text-off-white/90 text-lg leading-relaxed mb-6">
          &quot;{review.text}&quot;
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
        <span className="font-inter font-bold text-off-white">{review.name}</span>
        <span className="text-xs font-inter text-muted-grey uppercase tracking-wider flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-acid-green">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Verified
        </span>
      </div>
    </div>
  );
}
