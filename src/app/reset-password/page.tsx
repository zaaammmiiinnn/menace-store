import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — Menace',
  description: 'Set a new password for your Menace account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      headline="YOU'RE BACK."
      subheadline="SET NEW CREDENTIALS"
      footerPrompt={{
        text: "NEVER MIND?",
        actionText: "BACK TO SIGN IN",
        href: "/login",
      }}
    >
      <Suspense fallback={<div className="font-mono text-xs text-muted-grey py-8 text-center">LOADING...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
