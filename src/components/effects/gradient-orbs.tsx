'use client';

import React from 'react';

export function GradientOrbs() {
  return (
    <>
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(60px, -60px, 0); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-80px, 40px, 0); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(50px, 70px, 0); }
        }
        .orb-1 {
          animation: float-orb-1 25s ease-in-out infinite alternate;
          will-change: transform;
        }
        .orb-2 {
          animation: float-orb-2 22s ease-in-out infinite alternate;
          will-change: transform;
        }
        .orb-3 {
          animation: float-orb-3 28s ease-in-out infinite alternate;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-1, .orb-2, .orb-3 {
            animation: none !important;
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Acid Green Orb */}
        <div className="orb-1 absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full blur-[120px] opacity-15 bg-[#C6FF00]" />
        {/* Dark Depth Orb */}
        <div className="orb-2 absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-30 bg-[#000000]" />
        {/* Muted Green-Black Blend Orb */}
        <div className="orb-3 absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 bg-[#354300]" />
      </div>
    </>
  );
}

export default GradientOrbs;
