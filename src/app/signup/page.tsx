import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — Not For Everyone',
  description: 'Create your Menace account. Early drop access, expedited checkout, and limited release notifications.',
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
      <SignupForm />
    </AuthLayout>
  );
}
