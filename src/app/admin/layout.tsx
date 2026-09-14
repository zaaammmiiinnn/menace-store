import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MENACE Admin Operations',
  description: 'Operations cockpit for MENACE Apparel.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
