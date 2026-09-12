"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const storyLines = [
  "WE DIDN'T START THIS FOR YOU.",
  "WE STARTED IT BECAUSE NOTHING FIT.",
  "TOO LOUD. TOO QUIET. TOO TRYING.",
  "SO WE MADE WHAT WE WANTED TO WEAR.",
  "IF YOU GET IT, YOU GET IT."
];

export function BrandStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    
    if (!section || textRefs.current.length === 0) return;

    // Pin the section
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%", // 300vh
      pin: true,
      scrub: true,
    });

    // Animate lines sequentially based on scroll progress
    textRefs.current.forEach((el, index) => {
      if (!el) return;
      
      const startProgress = (index / storyLines.length) * 100;
      const endProgress = startProgress + (100 / storyLines.length);

      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: `top+=${startProgress}% top`,
            end: `top+=${endProgress}% top`,
            scrub: true,
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <section className="py-24 bg-base-black relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-acid-green/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col gap-8 relative z-10">
          {storyLines.map((line, i) => (
            <h2 key={i} className="font-anton text-3xl md:text-5xl lg:text-6xl text-off-white uppercase">
              {line}
            </h2>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="h-screen bg-base-black relative overflow-hidden flex items-center justify-center">
      {/* Background Noise Parallax (handled via CSS class or generic wrapper typically, simplified here) */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      {/* Pulsing Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-acid-green/5 rounded-full blur-[120px] animate-pulse"></div>

      <div ref={containerRef} className="max-w-5xl mx-auto px-4 text-center relative z-10 w-full">
        {storyLines.map((line, i) => (
          <h2
            key={i}
            ref={(el) => { textRefs.current[i] = el; }}
            className="font-anton text-3xl md:text-5xl lg:text-6xl text-off-white uppercase absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-0"
          >
            {line}
          </h2>
        ))}
      </div>
    </section>
  );
}
