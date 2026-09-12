'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation/auth';
import { useSignIn } from '@/lib/auth';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound, playHoverSound } from '@/lib/sound';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const { resetPassword, isLoading } = useSignIn();
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const triggerErrorShake = (msg: string) => {
    setFormError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    playClickSound();

    const res = await resetPassword(data.code, data.newPassword);
    if (res.success) {
      playConfettiSound();
      triggerConfetti();
      showToast("YOU'RE BACK.");
      router.push('/account');
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
        {initialEmail ? (
          <>
            Enter the 6-digit code sent to <span className="text-off-white font-bold">{initialEmail}</span> and choose a new password.
          </>
        ) : (
          "Enter your 6-digit reset code and set your new password."
        )}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 6-digit Code */}
        <div className="relative">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
            6-DIGIT CODE
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            {...register('code')}
            className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-lg tracking-[0.3em] placeholder:text-muted-grey/30 focus:border-acid-green outline-none transition-colors"
          />
          {errors.code && (
            <p className="font-mono text-[10px] text-red-400 mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="relative">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
            NEW PASSWORD
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              className="w-full bg-transparent border-b border-border py-2 pr-10 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-2.5 text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="font-mono text-[10px] text-red-400 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="relative">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
            CONFIRM NEW PASSWORD
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
          />
          {errors.confirmPassword && (
            <p className="font-mono text-[10px] text-red-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={playHoverSound}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] disabled:opacity-50"
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider">UPDATING PASSWORD...</span>
          ) : (
            <>
              <span>RESET & ENTER</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center pt-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-grey hover:text-acid-green uppercase transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Cancel and back to sign in</span>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

export default ResetPasswordForm;
