'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  headline: string;
  subheadline?: string;
  footerPrompt?: {
    text: string;
    actionText: string;
    href: string;
  };
}

export function AuthLayout({
  children,
  headline,
  subheadline,
  footerPrompt,
}: AuthLayoutProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-base-black text-off-white overflow-hidden selection:bg-acid-green selection:text-base-black px-4 sm:px-6 py-8 md:py-12">
      {/* Drifting Ambient Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-96 md:w-[600px] h-96 md:h-[600px] rounded-full bg-acid-green/10 blur-[130px]"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            x: [0, -60, 40, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 -right-32 w-96 md:w-[600px] h-96 md:h-[600px] rounded-full bg-white/5 blur-[140px]"
        />
        {/* Fine Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>BACK TO STORE</span>
        </Link>

        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-2xl tracking-widest text-off-white group-hover:text-acid-green transition-colors">
            MENACE
          </span>
          <span className="text-[9px] font-mono tracking-widest text-muted-grey border border-muted-grey/30 px-1.5 py-0.5 rounded uppercase">
            AUTH
          </span>
        </Link>
      </header>

      {/* Main Centered Form Container */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {/* Header Typography */}
          <motion.div variants={itemVariants} className="mb-8 text-center sm:text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-off-white leading-none">
              {headline}
            </h1>
            {subheadline && (
              <p className="font-mono text-xs sm:text-sm text-muted-grey uppercase tracking-widest mt-2">
                {subheadline}
              </p>
            )}
          </motion.div>

          {/* Form Content */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-surface/40 backdrop-blur-xl border border-border/80 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          >
            {children}
          </motion.div>

          {/* Footer Prompt */}
          {footerPrompt && (
            <motion.div
              variants={itemVariants}
              className="mt-6 text-center font-mono text-xs text-muted-grey"
            >
              <span>{footerPrompt.text} </span>
              <Link
                href={footerPrompt.href}
                className="text-acid-green hover:underline font-bold uppercase tracking-wider transition-colors ml-1"
              >
                {footerPrompt.actionText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Bottom Footer Credits & Legal */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-border/40 text-[10px] font-mono text-muted-grey uppercase tracking-widest">
        <span>© MENACE {new Date().getFullYear()} // ALL RIGHTS RESERVED</span>
        <div className="flex items-center space-x-4">
          <Link href="/privacy" className="hover:text-acid-green transition-colors">
            PRIVACY
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-acid-green transition-colors">
            TERMS
          </Link>
          <span>•</span>
          <Link href="/faq" className="hover:text-acid-green transition-colors">
            HELP
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
