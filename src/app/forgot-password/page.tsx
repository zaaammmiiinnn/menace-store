import type { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — Menace',
  description: 'Recover access to your Menace storefront account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      headline="FORGOT IT? HAPPENS."
      subheadline="ACCOUNT RECOVERY // CODE DISPATCH"
      footerPrompt={{
        text: "REMEMBERED YOUR PASSWORD?",
        actionText: "SIGN IN",
        href: "/login",
      }}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
