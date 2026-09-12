'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, ArrowRight, LogOut } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/auth';
import { playClickSound, playHoverSound } from '@/lib/sound';

export default function AdminLoginPage() {
  const { user, isAuthenticated, signOut, isLoading } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-base-black text-off-white overflow-hidden selection:bg-acid-green selection:text-base-black px-4 sm:px-6 py-8 md:py-12 relative">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 md:w-[600px] h-96 md:h-[600px] rounded-full bg-acid-green/10 blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-96 md:w-[600px] h-96 md:h-[600px] rounded-full bg-white/5 blur-[150px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>RETURN TO STOREFRONT</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-acid-green/10 border border-acid-green/30 text-acid-green font-mono text-[10px] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-acid-green animate-ping" />
            <span>OPERATIONS TERMINAL</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="flex flex-col">
          {/* Header Typography */}
          <div className="mb-6 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface border border-border text-muted-grey font-mono text-[10px] uppercase tracking-widest mb-2">
              <Shield size={12} className="text-acid-green" />
              <span>SECURITY LEVEL 4</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white leading-none">
              ADMIN LOGIN.
            </h1>
            <p className="font-mono text-xs text-muted-grey uppercase tracking-widest">
              MENANCE OPERATIONS COCKPIT // AUTHORIZED ACCESS
            </p>
          </div>

          {/* If already authenticated as Admin */}
          {isAuthenticated && user?.isAdmin ? (
            <div className="w-full bg-surface/50 backdrop-blur-xl border border-acid-green/40 rounded-2xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-acid-green text-base-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(198,255,0,0.4)]">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="font-display text-xl uppercase tracking-wide text-off-white">
                    CLEARANCE ACTIVE
                  </p>
                  <p className="font-mono text-xs text-muted-grey">
                    Signed in as <span className="text-acid-green font-bold">{user.email}</span>
                  </p>
                </div>
              </div>

              <Link
                href="/admin"
                onClick={playClickSound}
                onMouseEnter={playHoverSound}
                className="w-full py-4 px-4 rounded-xl bg-acid-green text-base-black font-display text-xl uppercase tracking-wider hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(198,255,0,0.3)] hover:shadow-[0_0_30px_rgba(198,255,0,0.5)] block text-center"
              >
                <span>OPEN ADMIN COCKPIT</span>
                <ArrowRight size={20} />
              </Link>

              <div className="pt-2 text-center border-t border-border/40">
                <button
                  type="button"
                  onClick={signOut}
                  className="font-mono text-xs text-muted-grey hover:text-red-400 uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Switch account / Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Form Card */
            <div className="w-full bg-surface/50 backdrop-blur-xl border border-border/90 rounded-2xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.8)] border-t-acid-green/40">
              <Suspense fallback={<div className="font-mono text-xs text-muted-grey py-8 text-center animate-pulse">CONNECTING TO SECURE COCKPIT...</div>}>
                <LoginForm defaultAdminMode={true} forcedRedirect="/admin" />
              </Suspense>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 text-center font-mono text-[11px] text-muted-grey">
            <span>Customer looking for order tracking? </span>
            <Link
              href="/login"
              className="text-acid-green hover:underline uppercase tracking-wider transition-colors ml-1"
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-border/40 text-[10px] font-mono text-muted-grey uppercase tracking-widest">
        <span>© MENANCE {new Date().getFullYear()} // INTERNAL ADMIN PORTAL</span>
        <span className="text-muted-grey/60">STAFF & ADMIN ROLE RESTRICTED</span>
      </footer>
    </div>
  );
}
