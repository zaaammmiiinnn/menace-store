'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-base-black text-off-white px-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-acid-green/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-border border-t-acid-green animate-spin" />
          <div className="absolute font-display text-xs text-acid-green">M</div>
        </div>

        <div className="space-y-1.5">
          <p className="font-display text-xl uppercase tracking-wider text-off-white">
            SYNCHRONIZING SESSION
          </p>
          <p className="font-mono text-xs text-muted-grey uppercase tracking-widest">
            AUTHENTICATING WITH GOOGLE // MENACE DROP 001
          </p>
        </div>

        {/* Clerk Callback Component */}
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/account"
          signUpFallbackRedirectUrl="/account"
          continueSignUpUrl="/signup"
        />
      </div>
    </div>
  );
}
