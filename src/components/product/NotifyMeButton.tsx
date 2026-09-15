'use client';

import React, { useState } from 'react';
import { Bell, Check, ShoppingBag, Lock } from 'lucide-react';

interface NotifyMeButtonProps {
  productName: string;
  selectedSize: string;
  isDropLive?: boolean;
}

export function NotifyMeButton({
  productName,
  selectedSize,
  isDropLive = false,
}: NotifyMeButtonProps) {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setEmail('');
    }, 2500);
  };

  if (isDropLive) {
    return (
      <button
        type="button"
        className="w-full py-4 px-6 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer font-bold"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>ADD TO BAG // {selectedSize}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Primary Action Button: Notify Me */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2.5 cursor-pointer font-bold shadow-[0_0_20px_rgba(198,255,0,0.2)]"
      >
        <Bell className="w-4 h-4 text-[#0A0A0A]" />
        <span>NOTIFY ME WHEN LIVE // {selectedSize}</span>
      </button>

      {/* Disabled Add to Cart placeholder showing locked status */}
      <button
        type="button"
        disabled
        className="w-full py-3 px-6 bg-[#141414] text-[#8A8A8A] border border-[#1C1C1C] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <Lock className="w-3.5 h-3.5 text-[#8A8A8A]" />
        <span>DROP 001 NOT LIVE YET — CART LOCKED</span>
      </button>

      {/* Email Capture Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0E0E0E] border border-[#1C1C1C] p-6 shadow-2xl relative">
            <div className="text-center space-y-2 mb-5">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#C6FF00]">
                EARLY ACCESS PRIORITY
              </span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-[#F5F1E8]">
                JOIN DROP 001 RADAR
              </h3>
              <p className="text-xs font-mono text-[#8A8A8A] leading-relaxed">
                Be the first to know when <strong className="text-[#F5F1E8]">{productName}</strong> ({selectedSize}) goes live. Stock is strictly limited.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00] flex items-center justify-center text-[#C6FF00]">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-display text-base text-[#F5F1E8] uppercase tracking-wide">
                  RADAR LOCKED
                </h4>
                <p className="text-xs font-mono text-[#8A8A8A]">
                  You will receive SMS / Email priority 15 minutes before public drop.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1C1C1C] focus:border-[#C6FF00] text-xs font-mono text-[#F5F1E8] outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  SET DROP 001 ALERT
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-center font-mono text-[11px] text-[#8A8A8A] hover:text-[#F5F1E8] uppercase tracking-wider cursor-pointer"
                >
                  DISMISS
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotifyMeButton;
