'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, AdaptiveDpr, Html, PerformanceMonitor } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import TeeModel from './tee-model';
import TeeFallback from './tee-fallback';
import { playClickSound, playSwitchSound } from '@/lib/sound';

export interface TeeSceneProps {
  color?: string;
  scale?: number;
  interactive?: boolean;
  className?: string;
  showHint?: boolean;
  productName?: string;
  onInteraction?: () => void;
}

function WebGLChecker({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === null) return null;
  if (!hasWebGL) return <>{fallback}</>;
  return <>{children}</>;
}

export function TeeScene({
  color = '#F5F1E8',
  scale = 1,
  interactive = true,
  className = '',
  showHint = true,
  productName = 'Menance Tee',
  onInteraction,
}: TeeSceneProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  const [interacting, setInteracting] = useState(false);
  const [hintVisible, setHintVisible] = useState(showHint);
  const [enableShadows, setEnableShadows] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileQuery.matches);
    if (mobileQuery.matches) {
      setDpr([1, 1.25]);
      setEnableShadows(false);
    } else {
      setDpr([1, 2]);
      setEnableShadows(true);
    }

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setEnableShadows(!e.matches);
    };
    mobileQuery.addEventListener('change', handler);
    return () => mobileQuery.removeEventListener('change', handler);
  }, []);

  const handleInteractionStart = () => {
    setInteracting(true);
    if (hintVisible) setHintVisible(false);
    if (onInteraction) onInteraction();
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
  };

  const handleInteractionEnd = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setInteracting(false);
    }, 5000);
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      playClickSound();
    }
  };

  const toggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
    playSwitchSound();
  };

  useEffect(() => {
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[280px] sm:min-h-[380px] md:min-h-[460px] ${className}`}>
      <WebGLChecker
        fallback={<TeeFallback productName={productName} color={color} />}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: isMobile ? 40 : 35 }}
          dpr={dpr}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          shadows={enableShadows}
          aria-label={`Interactive 3D model of ${productName}`}
        >
          <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
          <AdaptiveDpr pixelated />

          <Suspense fallback={
            <Html center>
              <div className="w-7 h-7 border-3 border-muted-grey/40 border-t-acid-green rounded-full animate-spin" />
            </Html>
          }>
            <TeeModel color={color} scale={scale} onInteraction={handleInteractionStart} />
            
            {/* Environment & Lighting */}
            <Environment preset="studio" environmentIntensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
            <directionalLight position={[-5, 3, -5]} intensity={0.8} color="#e6f2ff" />
            <directionalLight position={[-3, -2, 3]} intensity={0.4} />
            <ambientLight intensity={0.35} />

            {/* Contact Shadows */}
            {enableShadows && (
              <ContactShadows
                position={[0, -1.5, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
                resolution={256}
                color="#000000"
              />
            )}

            {interactive && (
              <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                autoRotate={autoRotate && !interacting}
                autoRotateSpeed={0.6}
                onStart={handleInteractionStart}
                onEnd={handleInteractionEnd}
                touches={{
                  ONE: 1, // TOUCH.ROTATE
                  TWO: 0, // TOUCH.DOLLY DISABLED to allow smooth page scroll
                }}
              />
            )}
          </Suspense>
        </Canvas>

        {/* 360 Degree Indicator */}
        {interactive && (
          <>
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-black/70 border border-white/15 backdrop-blur-md pointer-events-none select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-acid-green animate-pulse" />
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-off-white uppercase">
                360° INTERACTIVE
              </span>
            </div>

            {/* Studio Control Dock (Bottom Right on desktop, hidden on tiny mobile) */}
            <div className="hidden sm:flex absolute bottom-3 right-3 z-20 items-center gap-2">
              <button
                type="button"
                onClick={toggleAutoRotate}
                className="px-2.5 py-1 text-[10px] font-mono rounded bg-base-black/80 hover:bg-base-black border border-white/15 text-off-white hover:text-acid-green transition-all backdrop-blur-md cursor-pointer flex items-center gap-1.5 shadow-lg"
                title={autoRotate ? 'Pause 3D rotation' : 'Resume auto rotation'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoRotate ? 'bg-acid-green animate-pulse' : 'bg-muted-grey'}`} />
                <span>{autoRotate ? 'SPIN' : 'PAUSED'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-[10px] font-mono rounded bg-base-black/80 hover:bg-base-black border border-white/15 text-off-white hover:text-acid-green transition-all backdrop-blur-md cursor-pointer shadow-lg"
                title="Reset camera perspective"
              >
                RESET
              </button>
            </div>
          </>
        )}

        {/* DRAG TO SPIN Hint Overlay */}
        {hintVisible && interactive && (
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-500"
            style={{ opacity: hintVisible ? 1 : 0 }}
          >
            <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 text-acid-green"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-acid-green font-bold uppercase bg-base-black/90 px-2 py-0.5 rounded border border-white/10">
              Drag to spin
            </span>
          </div>
        )}
      </WebGLChecker>
    </div>
  );
}

export default TeeScene;
