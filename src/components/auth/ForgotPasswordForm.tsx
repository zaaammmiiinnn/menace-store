'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation/auth';
import { useSignIn } from '@/lib/auth';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playHoverSound } from '@/lib/sound';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { sendPasswordReset, isLoading } = useSignIn();
  const showToast = useUiStore((state) => state.showToast);

  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const triggerErrorShake = (msg: string) => {
    setFormError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onSubmit = async (data: ForgotPasswordInput) => {
    setFormError(null);
    playClickSound();

    const res = await sendPasswordReset(data.email);
    if (res.success) {
      showToast('RESET CODE SENT. CHECK YOUR INBOX.');
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } else {
      triggerErrorShake(res.error || "SOMETHING'S OFF. TRY AGAIN.");
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      <p className="font-mono text-xs text-muted-grey leading-relaxed">
        Forgot your password? Enter your email and we'll dispatch a 6-digit recovery code straight to your inbox.
      </p>

      {/* Error Alert Box */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2"
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{formError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
            ACCOUNT EMAIL
          </label>
          <input
            type="email"
            placeholder="name@menace.com"
            {...register('email')}
            className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
          />
          {errors.email && (
            <p className="font-mono text-[10px] text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={playHoverSound}
          className="w-full py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] disabled:opacity-50"
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider">DISPATCHING CODE...</span>
          ) : (
            <>
              <span>SEND RESET CODE</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-grey hover:text-acid-green uppercase transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Remembered it? Back to sign in</span>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

export default ForgotPasswordForm;
