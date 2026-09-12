"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Reduced motion variants
  if (shouldReduceMotion) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>

        {/* Acid green wipe effect */}
        <motion.div
          initial={{ scaleX: 1, transformOrigin: "right" }}
          animate={{ scaleX: 0, transformOrigin: "right" }}
          exit={{ scaleX: 1, transformOrigin: "left" }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="fixed inset-0 z-50 bg-[#C6FF00] pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}
