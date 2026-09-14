'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useUiStore } from '@/store/ui-store';

export interface ConfettiProps {
  trigger?: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'rect' | 'sticker';
  text?: string;
}

const COLORS = ['#C6FF00', '#F5F1E8', '#0A0A0A', '#8A8A8A'];
const STICKERS = ['MENANCE', 'NOT FOR EVERYONE', 'DROP 001', '★', '⚡'];

export function Confetti({ trigger: propTrigger, onComplete }: ConfettiProps = {}) {
  const storeTrigger = useUiStore((state) => state.isConfettiActive);
  const trigger = propTrigger !== undefined ? propTrigger : storeTrigger;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    
    if (shouldReduceMotion) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timeout);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }).map(() => {
      const isSticker = Math.random() > 0.85;
      return {
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        w: isSticker ? 40 : Math.random() * 8 + 4,
        h: isSticker ? 16 : Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 26,
        vy: (Math.random() - 1) * 22 - 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        type: isSticker ? 'sticker' : Math.random() > 0.5 ? 'circle' : 'rect',
        text: STICKERS[Math.floor(Math.random() * STICKERS.length)],
      };
    });

    const startTime = Date.now();
    const duration = 2400;

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const globalAlpha = 1 - (elapsed / duration);
      ctx.globalAlpha = Math.max(0, globalAlpha);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.55; // gravity
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'sticker' && p.text) {
          ctx.fillStyle = '#0A0A0A';
          ctx.strokeStyle = '#C6FF00';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-22, -9, 44, 18, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#C6FF00';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, 0, 0);
        } else if (p.type === 'circle') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, onComplete, shouldReduceMotion]);

  if (!trigger) return null;

  if (shouldReduceMotion) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-[100] bg-acid-green/20 transition-opacity duration-500" 
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

export default Confetti;
