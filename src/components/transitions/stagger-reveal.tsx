"use client";

import React, { ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

export function StaggerReveal({
  children,
  className,
  delay = 0,
  staggerChildren = 0.05,
  direction = "up",
  once = true,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10%" });
  const shouldReduceMotion = useReducedMotion();

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: 50, x: 0 };
      case "down":
        return { y: -50, x: 0 };
      case "left":
        return { x: 50, y: 0 };
      case "right":
        return { x: -50, y: 0 };
      default:
        return { y: 50, x: 0 };
    }
  };

  const offset = getDirectionOffset();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: shouldReduceMotion ? 0 : staggerChildren,
      },
    },
  };

  const childVariants = {
    hidden: { 
      opacity: 0, 
      x: shouldReduceMotion ? 0 : offset.x, 
      y: shouldReduceMotion ? 0 : offset.y 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      } 
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("", className)}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StaggerReveal;
