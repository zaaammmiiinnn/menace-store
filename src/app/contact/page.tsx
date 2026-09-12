"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useUiStore } from "@/store/ui-store";
import { Check, Mail, MessageSquare, Clock, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subject, setSubject] = useState("order");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    triggerConfetti();
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage("");
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
            <Mail size={14} className="text-acid-green" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              DIRECT DISPATCH CHANNEL
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-off-white leading-none">
            TALK TO US.
          </h1>

          <p className="font-sans text-sm sm:text-base text-muted-grey max-w-md mx-auto">
            Order questions, bulk press, or sizing advice. No automated bots. Real responses.
          </p>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-surface border border-border/80 shadow-2xl">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-16 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-acid-green/20 border border-acid-green flex items-center justify-center mx-auto text-acid-green">
                    <Check size={32} />
                  </div>
                  <h3 className="font-display text-3xl uppercase text-off-white">
                    MESSAGE LOGGED.
                  </h3>
                  <p className="font-sans text-xs text-muted-grey max-w-sm mx-auto leading-relaxed">
                    Our team in Mumbai has your ticket. We usually answer within 2-4 hours. Stay unbothered.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-muted-grey uppercase mb-1">
                        YOUR NAME
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Rohan Sharma"
                        className="w-full bg-base-black border border-border focus:border-acid-green px-4 py-3 text-xs font-mono text-off-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-muted-grey uppercase mb-1">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rohan@example.com"
                        className="w-full bg-base-black border border-border focus:border-acid-green px-4 py-3 text-xs font-mono text-off-white rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-muted-grey uppercase mb-1">
                      TOPIC / SUBJECT
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-base-black border border-border focus:border-acid-green px-4 py-3 text-xs font-mono text-off-white rounded-xl outline-none cursor-pointer"
                    >
                      <option value="order">Order Tracking / Exchange</option>
                      <option value="product">Sizing &amp; Fit Advice</option>
                      <option value="fabric">Waffle Knit Material Inquiry</option>
                      <option value="collab">Creator / Press Collaboration</option>
                      <option value="other">Something Else</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-mono text-muted-grey uppercase">
                        MESSAGE
                      </label>
                      <span className="text-[10px] font-mono text-muted-grey">
                        {message.length} / 500
                      </span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      maxLength={500}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's up..."
                      className="w-full bg-base-black border border-border focus:border-acid-green p-4 text-xs font-mono text-off-white rounded-xl outline-none resize-none"
                    />
                  </div>

                  <MagneticButton
                    variant="primary"
                    size="xl"
                    className="w-full flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    SEND MESSAGE
                  </MagneticButton>
                </form>
              )}
            </AnimatePresence>
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-3xl bg-surface border border-border/80 space-y-6">
              <h3 className="font-display text-2xl uppercase tracking-wider text-off-white">
                DIRECT CHANNELS
              </h3>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-base-black border border-border space-y-1">
                  <span className="text-muted-grey uppercase block text-[10px]">Email Dispatch</span>
                  <a href="mailto:dispatch@menance.store" className="font-display text-xl text-acid-green hover:underline">
                    dispatch@menance.store
                  </a>
                  <p className="text-muted-grey text-[11px]">Primary support queue</p>
                </div>

                <div className="p-4 rounded-xl bg-base-black border border-border space-y-1">
                  <span className="text-muted-grey uppercase block text-[10px]">Instagram DM</span>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl text-off-white hover:text-acid-green transition-colors flex items-center gap-1"
                  >
                    <span>@MENANCE.STORE</span>
                    <ArrowUpRight size={16} />
                  </a>
                  <p className="text-muted-grey text-[11px]">Drop teasers &amp; fit checks</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-acid-green/10 border border-acid-green/30 space-y-2 font-mono text-xs text-acid-green">
              <div className="flex items-center gap-2 font-bold uppercase">
                <Clock size={16} />
                <span>RESPONSE VELOCITY</span>
              </div>
              <p className="text-off-white/80 leading-relaxed text-[11px]">
                We reply within 24 hours Monday to Saturday. Sunday responses depend on how aggressively unbothered the team is.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
