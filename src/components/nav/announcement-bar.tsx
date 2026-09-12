'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { siteConfig } from '@/../site.config';
import { Marquee } from '@/components/ui/marquee';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative flex h-8 items-center bg-[#C6FF00] text-[#0A0A0A] overflow-hidden">
      <div className="flex-1 overflow-hidden h-full">
        <Marquee className="flex items-center h-full" pauseOnHover={true} speed={40}>
          {siteConfig.announcementMessages?.map((msg: any, i: number) => {
            const text = typeof msg === 'string' ? msg : msg?.text || '';
            return (
              <div key={i} className="flex items-center whitespace-nowrap mx-4 h-full">
                <span className="font-inter text-xs uppercase tracking-widest font-medium">
                  {text}
                </span>
                <span className="mx-4 text-[10px]">•</span>
              </div>
            );
          })}
        </Marquee>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2 z-10 p-1 hover:opacity-70 transition-opacity bg-[#C6FF00]"
        aria-label="Dismiss announcement"
      >
        <X size={14} className="text-[#0A0A0A]" />
      </button>
    </div>
  );
}
