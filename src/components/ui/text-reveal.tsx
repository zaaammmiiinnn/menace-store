"use client";

import { FC, ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

export const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });
  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[140vh] w-full bg-base-black", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-screen max-w-5xl items-center justify-center bg-transparent px-4"
        }
      >
        <p
          className={
            "flex flex-wrap items-center justify-center text-center p-4 text-3xl font-display uppercase tracking-tight text-white/15 sm:text-4xl md:text-6xl lg:text-7xl leading-tight"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1.5 sm:mx-2.5">
      <span className="opacity-15 text-white">{children}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-acid-green drop-shadow-[0_0_25px_rgba(198,255,0,0.5)]"
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextRevealByWord;
