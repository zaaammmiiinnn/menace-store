'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSignIn } from '@/lib/auth';
import { playClickSound, playHoverSound } from '@/lib/sound';

interface OAuthButtonsProps {
  redirectTarget?: string;
  onStart?: () => void;
  onError?: (error: string) => void;
}

export function OAuthButtons({ redirectTarget, onStart, onError }: OAuthButtonsProps) {
  const searchParams = useSearchParams();
  const { signInWithOAuth } = useSignIn();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const destination = redirectTarget || searchParams.get('redirect') || '/account';

  const handleOAuth = async (provider: 'google' | 'apple') => {
    playClickSound();
    if (onStart) onStart();
    setLoadingProvider(provider);

    try {
      await signInWithOAuth(provider, destination);
    } catch (err: any) {
      setLoadingProvider(null);
      const msg = provider === 'apple'
        ? 'Apple sign-in is not enabled. Please sign in with Google or Email.'
        : err?.message || 'Failed to connect to Google. Please check your connection and try again.';
      if (onError) {
        onError(msg);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Google Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onMouseEnter={playHoverSound}
        onClick={() => handleOAuth('google')}
        disabled={loadingProvider !== null}
        className="w-full py-3 px-4 rounded-xl bg-surface border border-border hover:border-acid-green/60 text-off-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer group disabled:opacity-50"
      >
        {/* Google SVG */}
        <motion.svg
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="w-4 h-4 flex-shrink-0"
          viewBox="0 0 24 24"
        >
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </motion.svg>
        <span>
          {loadingProvider === 'google' ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}
        </span>
      </motion.button>

      {/* Apple Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onMouseEnter={playHoverSound}
        onClick={() => handleOAuth('apple')}
        disabled={loadingProvider !== null}
        className="w-full py-3 px-4 rounded-xl bg-surface border border-border hover:border-acid-green/60 text-off-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer group disabled:opacity-50"
      >
        {/* Apple SVG */}
        <motion.svg
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="w-4 h-4 flex-shrink-0 fill-current text-off-white"
          viewBox="0 0 24 24"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.08 1.74-.95 2.77 1.01.08 2.06-.52 2.68-1.27z" />
        </motion.svg>
        <span>
          {loadingProvider === 'apple' ? 'CONNECTING...' : 'CONTINUE WITH APPLE'}
        </span>
      </motion.button>
    </div>
  );
}

export default OAuthButtons;
