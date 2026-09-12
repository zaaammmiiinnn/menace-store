'use client';
import React from 'react';

export function GrainOverlay() {
  return (
    <>
      <style>{`
        @keyframes grain-animation {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
        .grain-overlay {
          position: fixed;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.04;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        @media (prefers-reduced-motion: no-preference) {
          .grain-overlay {
            animation: grain-animation 8s steps(10) infinite;
          }
        }
      `}</style>
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
}
