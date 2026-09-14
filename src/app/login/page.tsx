import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — Not For Everyone',
  description: 'Sign into your Menace account. Drop 001 order tracking, wishlist, and VIP drop alerts.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      headline="BACK FOR MORE."
      subheadline="DROP 001 // EXCLUSIVE ACCESS"
      footerPrompt={{
        text: "NOT A MEMBER YET?",
        actionText: "GET IN",
        href: "/signup",
      }}
    >
      <Suspense fallback={<div className="font-mono text-xs text-muted-grey py-8 text-center">INITIALIZING...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
