'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { ArrowRight, Check } from 'lucide-react';
import { useUiStore } from '@/store/ui-store';

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const shouldReduceMotion = useReducedMotion();
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    triggerConfetti();
    showToast('You are on the list. Stay unbothered.');
  };

  const brandLetters = "MENACE".split("");

  const footerGroups = siteConfig.footerGroups || [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/shop' },
        { label: 'Drop 001', href: '/drops' },
        { label: 'Size Guide', href: '/size-guide' },
        { label: 'Lookbook', href: '/lookbook' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Manifesto', href: '/about#manifesto' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Admin Portal', href: '/admin/login' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Shipping & Returns', href: '/shipping' },
        { label: 'Order Status', href: '/contact' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer
      ref={containerRef}
      className="bg-base-black border-t border-border pt-20 pb-12 overflow-hidden text-off-white relative"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Pull-Apart Giant Logo Animation */}
        <div className="flex justify-center mb-16 overflow-hidden py-4 select-none">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            className="flex items-center font-display text-[64px] sm:text-[110px] md:text-[160px] lg:text-[200px] tracking-tighter leading-none text-off-white"
          >
            {brandLetters.map((char, index) => (
              <motion.span
                key={index}
                initial={{
                  x: shouldReduceMotion ? 0 : (index % 2 === 0 ? -40 : 40),
                  y: shouldReduceMotion ? 0 : 30,
                  opacity: 0,
                }}
                animate={
                  isInView
                    ? {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        transition: {
                          type: 'spring',
                          stiffness: 140,
                          damping: 14,
                          delay: index * 0.08,
                        },
                      }
                    : {}
                }
                whileHover={{
                  y: -15,
                  color: '#C6FF00',
                  transition: { duration: 0.2 },
                }}
                className="inline-block transition-colors cursor-pointer"
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Links & Newsletter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16 pt-8 border-t border-border/60">
          {footerGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col space-y-3">
              <h4 className="font-display uppercase tracking-widest text-sm text-off-white">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="group relative inline-block font-sans text-xs text-muted-grey transition-colors hover:text-acid-green"
                    >
                      <span>{link.label || link.title}</span>
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-acid-green transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="col-span-2 flex flex-col space-y-3">
            <h4 className="font-display uppercase tracking-widest text-sm text-off-white">
              STAY UNBOTHERED
            </h4>
            <p className="font-sans text-xs text-muted-grey leading-relaxed">
              No spam. No lifestyle guru newsletters. Only drop dates, early passwords, and secret colorways.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-acid-green/10 border border-acid-green/30 rounded text-acid-green font-mono text-xs">
                <Check size={16} />
                <span>CONFIRMED. YOU ARE ON THE LIST.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative mt-2 flex items-center">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-border focus:border-acid-green px-4 py-2.5 rounded-l text-xs font-mono text-off-white outline-none placeholder:text-muted-grey"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-acid-green text-base-black font-display text-xs uppercase tracking-wider rounded-r hover:bg-white transition-colors cursor-pointer flex items-center"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Metadata, Socials, Payments */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border/60 pt-8 gap-6 text-xs font-mono text-muted-grey">
          {/* Social Icons */}
          <div className="flex items-center space-x-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-acid-green transition-colors uppercase"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-acid-green transition-colors uppercase"
            >
              TikTok
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-acid-green transition-colors uppercase"
            >
              X / Twitter
            </a>
          </div>

          {/* Tagline / Copyright */}
          <div className="text-center tracking-widest uppercase">
            &copy; 2026 MENACE APPAREL. NOT FOR EVERYONE.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center space-x-2 select-none">
            {['UPI', 'RAZORPAY', 'VISA', 'MASTERCARD'].map((badge) => (
              <span
                key={badge}
                className="text-[9px] font-mono tracking-widest text-muted-grey border border-border px-2 py-0.5 rounded bg-surface"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
