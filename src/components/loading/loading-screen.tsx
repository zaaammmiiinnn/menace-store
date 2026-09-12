"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUiStore } from "@/store/ui-store";

const letters = ["M", "E", "N", "A", "C", "E"];

export function LoadingScreen() {
  const isLoading = useUiStore((state) => state.isLoading);
  const setLoading = useUiStore((state) => state.setLoading);
  const shouldReduceMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Safety timeout to dismiss loading screen if animations stall
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (!isMounted) return null;

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.7,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  const letterVariants = {
    hidden: { 
      y: shouldReduceMotion ? 0 : 100, 
      opacity: shouldReduceMotion ? 1 : 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
      }
    },
  };

  return (
    <AnimatePresence onExitComplete={() => window.scrollTo(0, 0)}>
      {isLoading && (
        <motion.div
          key="loading-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A] text-[#F5F1E8] overflow-hidden select-none"
        >
          <div className="flex overflow-hidden">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="font-display text-[70px] sm:text-[110px] md:text-[150px] leading-none tracking-tight uppercase text-off-white"
              >
                {letter}
              </motion.span>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-6 font-mono text-xs md:text-sm tracking-[0.35em] text-acid-green uppercase font-bold"
          >
            Not for everyone.
          </motion.div>

          <div className="absolute bottom-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-acid-green animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-muted-grey uppercase">
              INITIALIZING DROP 001
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default LoadingScreen;
