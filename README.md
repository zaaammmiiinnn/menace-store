# MENACE — Not for everyone.

> A fully animated, 3D-first, entertainment-driven ecommerce storefront for Gen Z streetwear brand **MENACE**. Built with Next.js 16 (App Router), React 19, TypeScript, React Three Fiber, Drei, Tailwind CSS v4, Framer Motion, GSAP, Lenis, and Zustand.

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

## 📱 Storefront Pages (13 Core Routes)

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
12. **`/privacy`** — Privacy policy in Menace deadpan typography.
13. **`/terms`** — Terms of service.

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

All rights reserved © MENACE 2026.
