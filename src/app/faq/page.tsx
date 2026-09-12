"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface FAQItem {
  category: 'sizing' | 'fabric' | 'shipping' | 'drops';
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    category: "sizing",
    q: "How oversized are Menace tees?",
    a: "Our silhouettes feature a true 90s drop-shoulder and wide boxy chest with high armholes. If you want the intended streetwear volume, buy your standard size. If you want a more tailored daily look, size down.",
  },
  {
    category: "sizing",
    q: "What if the size doesn't fit when it arrives?",
    a: "We offer a 7-day doorstep exchange with zero friction. Initiate your exchange online, and the courier will hand you the new size while picking up the old one.",
  },
  {
    category: "sizing",
    q: "Do you cater to plus sizes?",
    a: "Yes. All Menace releases are graded from XS to 4XL. Every single size maintains proportional boxiness rather than just getting longer.",
  },
  {
    category: "fabric",
    q: "What makes 280 GSM waffle knit superior to jersey?",
    a: "Standard jersey clings to skin and distorts after 5 washes. Our micro-honeycomb thermal weave creates natural architectural rigidity that stays boxy, breathes in high humidity, and feels substantial in hand.",
  },
  {
    category: "fabric",
    q: "Will the collar bacon or stretch out?",
    a: "Never. We use high-density 1.25-inch 1x1 ribbed cotton with reinforced spandex threading in the neckline. It remains crisp wash after wash.",
  },
  {
    category: "fabric",
    q: "How should I wash and care for my tees?",
    a: "Machine wash cold inside out with like colors. Hang dry or tumble dry low. Do not iron directly on graphic prints.",
  },
  {
    category: "shipping",
    q: "What are your shipping rates and timelines?",
    a: "All orders over ₹1,499 ship free across India. Orders under ₹1,499 ship for a flat ₹99. Metro deliveries typically arrive within 24 to 48 hours; all other pin codes in 2 to 4 business days.",
  },
  {
    category: "shipping",
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, COD is available nationwide at checkout. You can also pay via instant UPI QR code with zero processing fees.",
  },
  {
    category: "drops",
    q: "When is Drop 001 launching?",
    a: "Drop 001 is officially live. Once a specific colorway or size sells out, we do not guarantee restocks. We archive drops to keep production focused.",
  },
  {
    category: "drops",
    q: "Will you release hoodies and caps?",
    a: "Yes. Phase 02 includes 500 GSM waffle-lined hoodies and heavyweight unstructured caps scheduled for Winter 2026/2027.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', label: 'ALL QUESTIONS' },
    { id: 'sizing', label: 'SIZING & FIT' },
    { id: 'fabric', label: 'WAFFLE FABRIC' },
    { id: 'shipping', label: 'SHIPPING & EXCHANGES' },
    { id: 'drops', label: 'DROPS & ROADMAP' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
            <HelpCircle size={14} className="text-acid-green" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              ANSWERS // ZERO CORPORATE JARGON
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-off-white leading-none">
            FREQUENTLY ASKED.
          </h1>

          <p className="font-sans text-sm sm:text-base text-muted-grey max-w-md mx-auto">
            Everything you need to know about our fits, waffle fabric, shipping, and drop cadence.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-grey" />
          <input
            type="text"
            placeholder="Search questions (e.g. sizing, wash care, exchange)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border focus:border-acid-green rounded-xl text-xs font-mono text-off-white outline-none shadow-xl"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-acid-green text-base-black border-acid-green font-bold shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                  : 'bg-surface text-muted-grey border-border hover:border-white/30 hover:text-off-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-border rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-2xl">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center text-muted-grey font-mono text-xs">
              No answers found matching &quot;{searchQuery}&quot;. Ask us directly below.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="transition-colors hover:bg-white/[0.02]">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center p-6 text-left cursor-pointer gap-4"
                  >
                    <span className="font-display text-lg sm:text-xl uppercase tracking-wide text-off-white">
                      {faq.q}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-base-black border border-border flex items-center justify-center text-acid-green shrink-0">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 font-sans text-xs sm:text-sm text-muted-grey leading-relaxed border-t border-border/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still Got Questions? */}
        <div className="p-8 rounded-2xl bg-surface border border-acid-green/30 text-center space-y-4">
          <MessageSquare size={24} className="mx-auto text-acid-green" />
          <h3 className="font-display text-2xl uppercase text-off-white">
            STILL HAVE AN UNANSWERED QUESTION?
          </h3>
          <p className="font-sans text-xs text-muted-grey max-w-sm mx-auto">
            Drop our dispatch crew a message. We answer everything without fluff.
          </p>
          <div className="pt-2">
            <MagneticButton href="/contact" variant="secondary" size="md">
              CONTACT MENACE TEAM
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
