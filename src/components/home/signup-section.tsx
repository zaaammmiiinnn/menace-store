"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

export function SignupSection() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) return;
    
    // Simulate API call
    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
      setPhone("");
    }, 4000);
  };

  return (
    <section className="py-32 px-4 md:px-10 bg-base-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-acid-green/5 via-base-black to-base-black pointer-events-none" />

      <motion.div 
        className="max-w-2xl mx-auto text-center relative z-10"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 50 }}
        whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-anton text-6xl md:text-8xl text-off-white uppercase mb-4">
          JOIN THE MENACE
        </h2>
        <p className="font-inter text-muted-grey text-lg md:text-xl mb-12">
          First access to drops. No spam. Unsubscribe whenever.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md mx-auto">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL"
              className="w-full bg-transparent border-b-2 border-muted-grey py-4 px-2 font-inter text-off-white uppercase placeholder:text-muted-grey/50 focus:outline-none focus:border-acid-green transition-colors"
            />
          </div>
          
          <div className="relative group">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="YOUR NUMBER (OPTIONAL)"
              className="w-full bg-transparent border-b-2 border-muted-grey py-4 px-2 font-inter text-off-white uppercase placeholder:text-muted-grey/50 focus:outline-none focus:border-acid-green transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === "success"}
            className="mt-6 bg-acid-green text-base-black font-anton text-xl py-4 px-8 uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Get Access</span>
            <ArrowRight size={24} />
          </button>
        </form>

        <AnimatePresence>
          {status === "success" && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-base-black z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!shouldReduceMotion && <Confetti />}
              <h3 className="font-anton text-5xl md:text-7xl text-acid-green uppercase drop-shadow-lg">
                YOU&apos;RE IN.
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
