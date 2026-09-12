import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MENANCE Admin Operations',
  description: 'Operations cockpit for MENANCE Apparel.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
