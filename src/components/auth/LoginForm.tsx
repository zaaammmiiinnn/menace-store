'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Shield, User, ExternalLink } from 'lucide-react';
import { loginSchema, magicLinkSchema, type LoginInput, type MagicLinkInput } from '@/lib/validation/auth';
import { useSignIn } from '@/lib/auth';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound, playHoverSound } from '@/lib/sound';
import { OAuthButtons } from './OAuthButtons';

interface LoginFormProps {
  defaultAdminMode?: boolean;
  forcedRedirect?: string;
}

export function LoginForm({ defaultAdminMode = false, forcedRedirect }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = forcedRedirect || searchParams.get('redirect') || '/account';
  const isQueryAdmin = defaultAdminMode || searchParams.get('mode') === 'admin' || rawRedirect.startsWith('/admin');
  const [isAdminMode, setIsAdminMode] = useState(!!isQueryAdmin);

  const redirectTarget = isAdminMode
    ? (rawRedirect.startsWith('/admin') ? rawRedirect : '/admin')
    : (rawRedirect.startsWith('/admin') ? '/account' : rawRedirect);

  const { signInWithPassword, signInWithMagicLink, isLoading } = useSignIn();
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Form hooks
  const passwordForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const magicForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  const triggerErrorShake = (msg: string) => {
    setFormError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onPasswordSubmit = async (data: LoginInput) => {
    setFormError(null);
    playClickSound();

    const res = await signInWithPassword(data.email, data.password);
    if (res.success) {
      playConfettiSound();
      triggerConfetti();
      showToast(isAdminMode ? "COCKPIT AUTHENTICATED." : "YOU'RE IN.");
      router.push(redirectTarget);
    } else if (res.needsVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else {
      triggerErrorShake(res.error || "SOMETHING'S OFF. TRY AGAIN.");
    }
  };

  const onMagicSubmit = async (data: MagicLinkInput) => {
    setFormError(null);
    playClickSound();

    const res = await signInWithMagicLink(data.email);
    if (res.success) {
      playConfettiSound();
      setMagicLinkSent(true);
      showToast("LINK SENT. CHECK YOUR INBOX.");
    } else {
      triggerErrorShake(res.error || "COULDN'T SEND LINK. TRY AGAIN.");
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Mode Selector Pill: Customer vs Admin Portal */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-base-black/70 border border-border">
        <button
          type="button"
          onClick={() => {
            setIsAdminMode(false);
            setFormError(null);
            playClickSound();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            !isAdminMode
              ? 'bg-surface text-off-white font-bold shadow-md border border-border/80'
              : 'text-muted-grey hover:text-off-white'
          }`}
        >
          <User size={13} className={!isAdminMode ? 'text-acid-green' : ''} />
          <span>Customer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAdminMode(true);
            setFormError(null);
            playClickSound();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isAdminMode
              ? 'bg-acid-green text-base-black font-bold shadow-[0_0_12px_rgba(198,255,0,0.3)]'
              : 'text-muted-grey hover:text-off-white'
          }`}
        >
          <Shield size={13} className={isAdminMode ? 'text-base-black' : 'text-acid-green'} />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Admin Mode Informational Banner */}
      {isAdminMode && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-acid-green/10 border border-acid-green/30 text-off-white font-mono text-xs space-y-2"
        >
          <div className="flex items-center gap-1.5 text-acid-green font-bold uppercase tracking-wider text-[11px]">
            <Shield size={13} />
            <span>OPERATIONS COCKPIT ACCESS</span>
          </div>
          <p className="text-muted-grey text-[11px] leading-relaxed">
            Authorized staff & admin credentials only. Authenticate with Google Workspace or your admin email.
          </p>

          {/* Dev Mode Instant Bypass Shortcut */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              router.push('/admin');
            }}
            className="w-full mt-1.5 py-2 px-3 rounded-lg bg-surface border border-acid-green/40 hover:bg-acid-green hover:text-base-black text-acid-green font-mono text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>DEV MODE: INSTANT BYPASS TO /ADMIN</span>
            <ExternalLink size={11} />
          </button>
        </motion.div>
      )}

      {/* OAuth Fast Connect (Passes dynamic redirect target and error callback) */}
      <OAuthButtons
        redirectTarget={redirectTarget}
        onStart={() => setFormError(null)}
        onError={(err) => triggerErrorShake(err)}
      />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-border w-full" />
        <span className="bg-surface px-3 font-mono text-[10px] text-muted-grey uppercase tracking-widest absolute">
          OR WITH EMAIL
        </span>
      </div>

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

      {/* Magic Link Sent Notice */}
      {magicLinkSent ? (
        <div className="text-center py-6 space-y-3 font-mono text-xs">
          <span className="w-10 h-10 rounded-full bg-acid-green/10 text-acid-green flex items-center justify-center mx-auto border border-acid-green/30">
            <Sparkles size={18} />
          </span>
          <p className="text-off-white font-bold uppercase tracking-wider text-sm">
            MAGIC LINK DISPATCHED.
          </p>
          <p className="text-muted-grey">
            We sent a sign-in link to your email. Tap it to drop right in.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-acid-green uppercase underline text-[11px] hover:text-white transition-colors cursor-pointer pt-2"
          >
            Use standard password instead
          </button>
        </div>
      ) : useMagicLink ? (
        /* Passwordless Magic Link Form */
        <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} className="space-y-6">
          <div className="relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
              {isAdminMode ? 'ADMIN EMAIL ADDRESS' : 'EMAIL ADDRESS'}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={isAdminMode ? 'admin@menance.store' : 'name@menace.com'}
                {...magicForm.register('email')}
                className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
              />
            </div>
            {magicForm.formState.errors.email && (
              <p className="font-mono text-[10px] text-red-400 mt-1">
                {magicForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-lg uppercase tracking-wider hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.2)] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1 font-mono text-xs">
                <span>SENDING LINK</span>
                <span className="animate-pulse">...</span>
              </span>
            ) : (
              <>
                <span>{isAdminMode ? 'SEND ADMIN LINK' : 'SEND MAGIC LINK'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(false);
                setFormError(null);
                playClickSound();
              }}
              className="text-xs font-mono text-muted-grey hover:text-acid-green transition-colors uppercase underline cursor-pointer"
            >
              Sign in with password instead
            </button>
          </div>
        </form>
      ) : (
        /* Standard Email + Password Form */
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="relative">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-grey mb-1">
              {isAdminMode ? 'ADMIN EMAIL ADDRESS' : 'EMAIL ADDRESS'}
            </label>
            <input
              type="email"
              placeholder={isAdminMode ? 'admin@menance.store' : 'name@menace.com'}
              {...passwordForm.register('email')}
              className="w-full bg-transparent border-b border-border py-2 text-off-white font-mono text-sm placeholder:text-muted-grey/40 focus:border-acid-green outline-none transition-colors"
            />
            {passwordForm.formState.errors.email && (
              <p className="font-mono text-[10px] text-red-400 mt-1">
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-grey">
                PASSWORD
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[10px] uppercase tracking-wider text-muted-grey hover:text-acid-green transition-colors"
              >
                FORGOT IT? HAPPENS.
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...passwordForm.register('password')}
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
            {passwordForm.formState.errors.password && (
              <p className="font-mono text-[10px] text-red-400 mt-1">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Passwordless Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...passwordForm.register('rememberMe')}
                className="w-3.5 h-3.5 accent-acid-green rounded border border-border bg-surface cursor-pointer"
              />
              <span className="font-mono text-xs text-muted-grey uppercase tracking-wider">
                STAY SIGNED IN
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setUseMagicLink(true);
                setFormError(null);
                playClickSound();
              }}
              className="text-[10px] font-mono text-muted-grey hover:text-acid-green uppercase transition-colors cursor-pointer"
            >
              PASSWORDLESS?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={playHoverSound}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.25)] hover:shadow-[0_0_25px_rgba(198,255,0,0.4)] disabled:opacity-50"
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
                <span>{isAdminMode ? 'ENTER ADMIN COCKPIT' : 'ENTER STORE'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default LoginForm;
