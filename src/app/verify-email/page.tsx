'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useSignUp } from '@/lib/auth';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound } from '@/lib/sound';
import { Sparkles, AlertCircle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { verifyEmailCode, resendVerificationCode, isLoading } = useSignUp();
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Code's 6 digits.");
      return;
    }
    setError(null);
    playClickSound();

    const res = await verifyEmailCode(code);
    if (res.success) {
      playConfettiSound();
      triggerConfetti();
      showToast("VERIFIED. WELCOME IN.");
      router.push('/account');
    } else {
      setError(res.error || "INVALID CODE. CHECK AGAIN.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center space-y-2">
        <span className="w-10 h-10 rounded-full bg-acid-green/10 text-acid-green flex items-center justify-center mx-auto border border-acid-green/30">
          <Sparkles size={18} />
        </span>
        <p className="font-mono text-xs text-muted-grey">
          We sent a 6-digit confirmation code {email ? <>to <span className="text-off-white font-bold">{email}</span></> : 'to your inbox'}.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1 text-center">
            ENTER 6-DIGIT CODE
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
            className="w-full bg-transparent border-b border-border py-3 text-off-white font-mono text-2xl text-center tracking-[0.5em] placeholder:text-muted-grey/30 focus:border-acid-green outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] disabled:opacity-50"
        >
          {isLoading ? 'VERIFYING...' : 'CONFIRM CODE'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={async () => {
              const resent = await resendVerificationCode();
              if (resent) showToast('FRESH CODE DISPATCHED.');
            }}
            className="font-mono text-xs text-muted-grey hover:text-acid-green transition-colors uppercase underline cursor-pointer"
          >
            Didn't get it? Send another
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      headline="CHECK INBOX."
      subheadline="ONE MORE STEP TO ENTER"
      footerPrompt={{
        text: "WRONG EMAIL?",
        actionText: "BACK TO SIGN UP",
        href: "/signup",
      }}
    >
      <Suspense fallback={<div className="font-mono text-xs text-muted-grey py-8 text-center">LOADING...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
