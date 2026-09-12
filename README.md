# MENANCE — Not for everyone.

> A fully animated, 3D-first, entertainment-driven ecommerce storefront for Gen Z streetwear brand **MENANCE**. Built with Next.js 16 (App Router), React 19, TypeScript, React Three Fiber, Drei, Tailwind CSS v4, Framer Motion, GSAP, Lenis, and Zustand.

---

## ⚡ Tech Stack & Architecture

- **Framework**: Next.js 16.3 (Turbopack, App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **3D Engine**: React Three Fiber (R3F) & `@react-three/drei` (Three.js 0.186)
- **Smooth Scroll**: Lenis
- **Animations & Micro-interactions**: Framer Motion & GSAP ScrollTrigger
- **State Management**: Zustand with persistent storage (Multi-currency INR/USD, Cart, Drawer, Toasts, Confetti)
- **Typography**: Anton (Display) & Inter (Body)
- **Color Palette**:
  - Base Black: `#0A0A0A`
  - Off-White / Bone: `#F5F1E8`
  - Acid Green: `#C6FF00`
  - Muted Grey: `#8A8A8A`

---

## 👕 3D Interactive Features

- **Procedural Waffle Knit Texture**: Custom Three.js `DataTexture` generating thermal honeycomb normal mapping with bump highlights.
- **Studio Lighting**: Key directional light, cool rim light, soft ambient fill, and contact shadows.
- **Dynamic Color Tween**: Smooth Three.js lerping between colorways (*Base Black*, *Bone*, *Acid Green*, *Cement*).
- **Spring Scale Sizing**: Responsive scaling from XS ($0.85\times$) to 4XL ($1.18\times$) reflecting boxy fit changes in real time.
- **Touch & Mobile Optimized**: DPR clamping, mobile shadows disable toggle, OrbitControls with auto-rotation, and SSR-safe fallback canvas.

---

## 📱 Storefront & Auth Pages (22 Core Routes)

### Core Storefront
1. **`/`** — Full entertainment-driven homepage with 12 sections (Hero 3D showcase, Marquee announcement, Featured 6-SKU Drop carousel, Shop by Vibe flip cards, Brand Story pinned scroll, UGC Wall, Best Sellers, Customer Reviews, and pull-apart Footer).
2. **`/shop`** — Catalog with vibe filters, keyword search, price/name sorting, and corner 3D viewer.
3. **`/shop/[slug]`** — Product detail with full 3D viewer, swatches, spring-scaled sizing, specifications accordion, stock countdown, and mobile sticky buy bar.
4. **`/checkout`** — Mocked checkout with dynamic UPI QR code, Cards, COD, and confirmation screen.
5. **`/size-guide`** — Interactive 3D scale simulator, cm/inch toggle, and XS–4XL fit specs table.
6. **`/about`** — Anti-brand manifesto, 280 GSM waffle fabric dissection, and roadmap.
7. **`/shipping`** — Live pincode delivery calculator and 7-day doorstep exchange steps.
8. **`/faq`** — Category-filtered animated accordions.
9. **`/contact`** — Deadpan contact interface with character counter and vibe selector.
10. **`/lookbook`** — Parallax runway gallery with interactive hotspot pins and quick-add popups.
11. **`/drops`** — Split-flap countdown clock for Drop 001 and VIP notification modal.
12. **`/privacy`** — Privacy policy in Menance deadpan typography.
13. **`/terms`** — Terms of service.

### Authentication & Member Portal (Clerk + Cloudflare Edge)
14. **`/login`** — "BACK FOR MORE." email/password, Google & Apple OAuth, passwordless magic link, and stay signed in toggle.
15. **`/signup`** — "GET IN." registration with password strength meter and verification code flow.
16. **`/forgot-password`** — "FORGOT IT? HAPPENS." recovery code dispatcher.
17. **`/reset-password`** — "YOU'RE BACK." 6-digit code validation and new password reset.
18. **`/verify-email`** — Email verification screen.
19. **`/account`** — Protected user dashboard with lifetime order stats, wishlist count, and drop perks.
20. **`/account/orders`** — Protected order archive with real-time tracking IDs and invoice downloads.
21. **`/account/wishlist`** — Protected personal roster synced with local storage and instant quick buy.
22. **`/account/settings`** — Protected profile manager, saved addresses, and notification dispatch toggles.

---

## 🔐 Authentication & Cloudflare Workers Setup

The storefront uses a provider-agnostic adapter under `src/lib/auth/` backed primarily by **Clerk**:

```
src/lib/auth/
├── types.ts    # Standardized AuthUser, AuthSession, AuthAdapter interfaces
├── clerk.ts    # Clerk implementation with Menance deadpan error mapping
└── index.ts    # Primary unified hooks (useAuth, useSignIn, useSignUp)
```

### Environment Variables
Configure these in your Cloudflare Pages Dashboard under **Settings → Environment Variables** or locally in `.dev.vars` / `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/account
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/account
```

### Cloudflare Edge Middleware (`middleware.ts`)
- Automatically intercepts requests on Cloudflare Workers edge runtime.
- Redirects unauthenticated visits from `/account/*` to `/login?redirect=[path]`.
- Redirects authenticated members away from `/login` and `/signup` straight to `/account`.
- Safe bypass for Next.js internal chunks, static assets, and media files.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/zaaammmiiinnn/menace-store.git
cd menace-store

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📦 License

All rights reserved © MENANCE 2026.
