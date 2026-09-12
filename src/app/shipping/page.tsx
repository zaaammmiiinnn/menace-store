"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, RefreshCw, ShieldAlert, Check, MapPin, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function ShippingPage() {
  const [pincode, setPincode] = useState('');
  const [estimateResult, setEstimateResult] = useState<string | null>(null);

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    const cleanPin = pincode.trim();
    if (cleanPin.startsWith('400') || cleanPin.startsWith('110') || cleanPin.startsWith('560')) {
      setEstimateResult('Metro Tier 1: Delivery in 24-48 hours via Bluedart Express.');
    } else {
      setEstimateResult('Tier 2 / All-India: Delivery in 3-4 business days with live SMS tracking.');
    }
  };

  const steps = [
    {
      step: "01",
      title: "DISPATCHED WITHIN 24 HOURS",
      desc: "Every order placed before 3:00 PM IST is packed and dispatched same-day from our climate-controlled fulfillment hub in Mumbai.",
    },
    {
      step: "02",
      title: "FREE EXPRESS OVER ₹1,499",
      desc: "Orders over ₹1,499 ship free across all 28 states and 8 union territories in India. Under ₹1,499 is a flat ₹99 fee.",
    },
    {
      step: "03",
      title: "7-DAY DOORSTEP EXCHANGE",
      desc: "Fit too boxy or want more drape? Initiate an exchange within 7 days. Our courier picks up the original and hands you the new size right at your door.",
    },
    {
      step: "04",
      title: "DEADPAN RETURNS",
      desc: "If you don't love it, return it unworn with tags attached for a 100% refund back to your original payment method or UPI.",
    },
  ];

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
            <Truck size={14} className="text-acid-green" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              DELIVERY &amp; RETURNS PROTOCOL
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-off-white leading-none">
            FAST &amp; UNBOTHERED.
          </h1>

          <p className="font-sans text-sm sm:text-base text-muted-grey max-w-xl mx-auto">
            Zero hidden fees. Doorstep exchanges. Air express transit across India and select international destinations.
          </p>
        </div>

        {/* Live Pincode Estimator Tool */}
        <div className="p-8 rounded-3xl bg-surface border border-border shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-acid-green">
            <MapPin size={16} />
            <span>CHECK YOUR DELIVERY TIMELINE</span>
          </div>

          <form onSubmit={checkPincode} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 6-digit PIN code (e.g. 400050, 560001)"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                setEstimateResult(null);
              }}
              maxLength={6}
              className="flex-1 bg-base-black border border-border focus:border-acid-green px-4 py-3 text-xs font-mono text-off-white rounded-xl outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-acid-green text-base-black font-display text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors cursor-pointer"
            >
              ESTIMATE
            </button>
          </form>

          {estimateResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-acid-green/10 border border-acid-green/30 text-xs font-mono text-acid-green flex items-start gap-2"
            >
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{estimateResult}</span>
            </motion.div>
          )}
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="p-8 rounded-2xl bg-surface border border-border/80 space-y-3 hover:border-acid-green/30 transition-colors"
            >
              <span className="font-display text-3xl text-acid-green block">
                {step.step}
              </span>
              <h3 className="font-display text-xl uppercase tracking-wide text-off-white">
                {step.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted-grey leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Exchange Policy Details */}
        <div className="p-8 rounded-3xl bg-surface border border-border space-y-6">
          <h2 className="font-display text-3xl uppercase text-off-white">
            HOW DOORSTEP SIZE EXCHANGES WORK
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs text-muted-grey">
            <div className="space-y-2 p-4 rounded-xl bg-base-black border border-border">
              <span className="text-acid-green font-bold block">STEP A</span>
              <p className="text-off-white">Initiate online</p>
              <p>Go to your order confirmation or WhatsApp support and enter your requested new size.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-base-black border border-border">
              <span className="text-acid-green font-bold block">STEP B</span>
              <p className="text-off-white">Courier pickup</p>
              <p>Our courier arrives within 48 hours to collect the item. Keep tags attached.</p>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-base-black border border-border">
              <span className="text-acid-green font-bold block">STEP C</span>
              <p className="text-off-white">New size delivered</p>
              <p>Your replacement ships express instantly upon pickup notification.</p>
            </div>
          </div>
        </div>

        {/* Contact Support Link */}
        <div className="text-center space-y-4">
          <p className="font-mono text-xs text-muted-grey uppercase tracking-widest">
            HAVE A QUESTION ABOUT AN EXISTING DISPATCH?
          </p>
          <MagneticButton href="/contact" variant="secondary" size="md">
            CONTACT DISPATCH TEAM
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
