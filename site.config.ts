import type { NavLink, FooterLinkGroup, DropConfig, AnnouncementMessage, SEOConfig } from './src/types';

export const siteConfig = {
  brand: {
    name: 'MENACE',
    tagline: 'Not for everyone.',
    colors: {
      black: '#0A0A0A',
      offWhite: '#F5F1E8',
      acidGreen: '#C6FF00',
      mutedGrey: '#8A8A8A'
    },
    fonts: {
      display: 'Anton',
      body: 'Inter'
    }
  },
  social: {
    instagram: 'https://instagram.com/menace',
    tiktok: 'https://tiktok.com/@menace',
    twitter: 'https://twitter.com/menace',
    youtube: 'https://youtube.com/menace'
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Drops', href: '/drops' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' }
  ] as NavLink[],
  footerGroups: [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/shop' },
        { label: 'Tees', href: '/shop/tees' },
        { label: 'Hoodies', href: '/shop/hoodies' },
        { label: 'Accessories', href: '/shop/accessories' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Stockists', href: '/stockists' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Shipping & Returns', href: '/shipping' },
        { label: 'Size Guide', href: '/size-guide' },
        { label: 'Contact Us', href: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' }
      ]
    }
  ] as FooterLinkGroup[],
  drop: {
    name: 'DROP 001 — NOT FOR EVERYONE.',
    date: '2026-10-10T10:00:00+05:30',
    isLive: false
  } as DropConfig,
  currency: {
    primary: { code: 'INR', symbol: '₹' },
    secondary: { code: 'USD', symbol: '$' }
  },
  analytics: {
    ga4Id: '',
    metaPixelId: '',
    tiktokPixelId: ''
  },
  announcementMessages: [
    { text: 'FREE SHIPPING ON ALL ORDERS OVER ₹2999', link: '/shop' },
    { text: 'DROP 001 IS COMING. SIGN UP FOR EARLY ACCESS.', link: '/drops' }
  ] as AnnouncementMessage[],
  seo: {
    title: 'MENACE | Not for everyone.',
    description: 'The anti-brand for the unbothered. High quality blank and graphic apparel.',
    ogImage: '/images/og-image.jpg',
    siteUrl: 'https://menace.store'
  } as SEOConfig,
  assets: {
    modelPath: '/models/tee.glb',
    placeholderPath: '/images/placeholder.jpg'
  }
};
