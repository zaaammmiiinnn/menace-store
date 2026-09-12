import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { siteConfig } from "@/config/site";
import { AppShell } from "@/components/app-shell";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.seo.description,
  metadataBase: new URL(siteConfig.seo.siteUrl),
  openGraph: {
    title: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
    description: siteConfig.seo.description,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.brand.name,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`,
    description: siteConfig.seo.description,
    images: [siteConfig.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: siteConfig.brand.name,
    description: siteConfig.seo.description,
    url: siteConfig.seo.siteUrl,
    logo: `${siteConfig.seo.siteUrl}/images/og-image.jpg`,
    priceRange: "₹₹",
    currenciesAccepted: "INR, USD",
    paymentAccepted: "UPI, Credit Card, Netbanking, Cash on Delivery",
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-base-black text-off-white font-body">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_bWVuYWNlLXN0b3JlLmNsZXJrLmFjY291bnRzLmRldiQ'}
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: '#C6FF00',
              colorPrimaryForeground: '#0A0A0A',
              colorBackground: '#0F0F0F',
              colorForeground: '#F5F1E8',
              colorMutedForeground: '#8A8A8A',
              colorInput: '#181818',
              colorInputForeground: '#F5F1E8',
              borderRadius: '0.5rem',
              fontFamily: 'var(--font-inter), sans-serif',
            },
            elements: {
              card: 'border border-[#262626] bg-[#0F0F0F] text-[#F5F1E8] shadow-2xl rounded-xl',
              headerTitle: 'text-[#F5F1E8] font-display text-2xl tracking-wide',
              headerSubtitle: 'text-[#8A8A8A] font-sans text-sm',
              socialButtonsBlockButton: 'bg-[#181818] border border-[#2B2B2B] text-[#F5F1E8] hover:bg-[#222222] transition-colors',
              socialButtonsBlockButtonText: 'text-[#F5F1E8] font-medium',
              dividerLine: 'bg-[#2B2B2B]',
              dividerText: 'text-[#8A8A8A] font-mono text-xs uppercase',
              formFieldLabel: 'text-[#8A8A8A] font-mono text-xs uppercase tracking-wider',
              formFieldInput: 'bg-[#181818] border-[#2B2B2B] text-[#F5F1E8] placeholder-[#555555] focus:border-[#C6FF00] focus:ring-[#C6FF00]/20 rounded-md',
              formButtonPrimary: 'bg-[#C6FF00] text-[#0A0A0A] font-bold hover:bg-[#D4FF33] transition-colors py-2.5 shadow-[0_0_15px_rgba(198,255,0,0.3)]',
              footerActionLink: 'text-[#C6FF00] hover:underline font-medium',
              identityPreviewText: 'text-[#F5F1E8]',
              identityPreviewEditButton: 'text-[#C6FF00]',
              formFieldSuccessText: 'text-[#C6FF00]',
              formFieldErrorText: 'text-[#FF4444]',
              modalBackdrop: 'backdrop-blur-md bg-black/80',
            },
          }}
        >
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
