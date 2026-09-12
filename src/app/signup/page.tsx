import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — Not For Everyone',
  description: 'Create your Menance account. Early drop access, expedited checkout, and limited release notifications.',
};

export default function SignupPage() {
  return (
    <AuthLayout
      headline="GET IN."
      subheadline="LIMITED MEMBERSHIP // ZERO SPAM"
      footerPrompt={{
        text: "ALREADY ONE OF US?",
        actionText: "SIGN IN",
        href: "/login",
      }}
    >
      <Suspense fallback={<div className="font-mono text-xs text-muted-grey py-8 text-center animate-pulse">INITIALIZING...</div>}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
