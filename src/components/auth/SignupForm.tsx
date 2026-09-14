'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';
import { useSignUp } from '@/lib/auth';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound, playHoverSound } from '@/lib/sound';
import { OAuthButtons } from './OAuthButtons';

export function SignupForm() {
  const router = useRouter();
  const { signUpWithPassword, verifyEmailCode, resendVerificationCode, isLoading } = useSignUp();
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Verification step state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const triggerErrorShake = (msg: string) => {
    setFormError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onSignupSubmit = async (data: SignupInput) => {
    setFormError(null);
    playClickSound();

    const res = await signUpWithPassword(data.email, data.password, data.firstName);
    if (res.success && res.needsVerification) {
      setUserEmail(data.email);
      setIsVerifying(true);
      showToast("CHECK YOUR INBOX. CODE DISPATCHED.");
    } else if (res.success) {
      playConfettiSound();
      triggerConfetti();
      showToast("WELCOME TO MENANCE.");
      router.push('/account');
    } else {
      triggerErrorShake(res.error || "SOMETHING'S OFF. TRY AGAIN.");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      triggerErrorShake("Code's 6 digits.");
      return;
    }
    setFormError(null);
    playClickSound();

    const res = await verifyEmailCode(verificationCode);
    if (res.success) {
      playConfettiSound();
      triggerConfetti();
      showToast("VERIFIED. YOU'RE IN.");
      router.push('/account');
    } else {
      triggerErrorShake(res.error || "INVALID CODE. CHECK AGAIN.");
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
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

      {isVerifying ? (
        /* Email Code Verification Step */
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <span className="w-10 h-10 rounded-full bg-acid-green/10 text-acid-green flex items-center justify-center mx-auto border border-acid-green/30">
              <Sparkles size={18} />
            </span>
            <p className="font-display text-2xl uppercase tracking-wider text-off-white">
              VERIFY YOUR EMAIL
            </p>
            <p className="font-mono text-xs text-muted-grey">
              We sent a 6-digit code to <span className="text-off-white font-bold">{userEmail}</span>
            </p>
          </div>

          <div className="relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1 text-center">
              ENTER 6-DIGIT CODE
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="w-full bg-transparent border-b border-border py-3 text-off-white font-mono text-2xl text-center tracking-[0.5em] placeholder:text-muted-grey/30 focus:border-acid-green outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] disabled:opacity-50"
          >
            {isLoading ? 'VERIFYING...' : 'COMPLETE SIGNUP'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                const resent = await resendVerificationCode();
                if (resent) showToast('NEW CODE SENT.');
              }}
              className="font-mono text-xs text-muted-grey hover:text-acid-green transition-colors uppercase underline cursor-pointer"
            >
              Didn't get it? Resend code
            </button>
          </div>
        </form>
      ) : (
        /* Main Signup Form */
        <>
          {/* OAuth Buttons */}
          <OAuthButtons
            onStart={() => setFormError(null)}
            onError={(err) => triggerErrorShake(err)}
          />

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-border w-full" />
            <span className="bg-surface px-3 font-mono text-[10px] text-muted-grey uppercase tracking-widest absolute">
              OR CREATE ACCOUNT
            </span>
          </div>

          <form onSubmit={handleSubmit(onSignupSubmit)} className="space-y-4">
            {/* First Name */}
            <div className="relative">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                FIRST NAME
              </label>
              <input
                type="text"
                placeholder="Alex"
                {...register('firstName')}
                className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
              />
              {errors.firstName && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="name@menance.com"
                {...register('email')}
                className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
              />
              {errors.email && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
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
              {errors.password && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{errors.password.message}</p>
              )}

              {/* Password Requirements Checklist */}
              {passwordValue && (
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-acid-green' : 'text-muted-grey'}`}>
                    <Check size={11} className={hasMinLength ? 'opacity-100' : 'opacity-40'} />
                    <span>8+ chars</span>
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? 'text-acid-green' : 'text-muted-grey'}`}>
                    <Check size={11} className={hasUppercase ? 'opacity-100' : 'opacity-40'} />
                    <span>Uppercase</span>
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-acid-green' : 'text-muted-grey'}`}>
                    <Check size={11} className={hasNumber ? 'opacity-100' : 'opacity-40'} />
                    <span>Number</span>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
                CONFIRM PASSWORD
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

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="w-3.5 h-3.5 mt-0.5 accent-acid-green rounded border border-border bg-surface cursor-pointer"
                />
                <span className="font-mono text-[11px] text-muted-grey leading-tight">
                  I agree to the Menance Terms of Service & Privacy Policy. No junk emails ever.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="font-mono text-[10px] text-red-400 mt-1">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button with Wordmark Animation */}
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={playHoverSound}
              className="w-full mt-3 py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] hover:shadow-[0_0_25px_rgba(198,255,0,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5 font-display text-sm tracking-widest animate-pulse">
                  <span>M</span>
                  <span>E</span>
                  <span>N</span>
                  <span>A</span>
                  <span>C</span>
                  <span>E</span>
                </div>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}

export default SignupForm;
