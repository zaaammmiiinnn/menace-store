"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LenisProvider } from "@/providers/lenis-provider";
import { MotionProvider } from "@/providers/motion-provider";
import { LoadingScreen } from "@/components/loading/loading-screen";
import { CustomCursor } from "@/components/cursor/custom-cursor";
import { GrainOverlay } from "@/components/effects/grain-overlay";
import { GradientOrbs } from "@/components/effects/gradient-orbs";
import { Navbar } from "@/components/nav/navbar";
import { MobileMenu } from "@/components/nav/mobile-menu";
import { Footer } from "@/components/footer/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Confetti } from "@/components/ui/confetti";
import { PageTransition } from "@/components/transitions/page-transition";
import { useUiStore } from "@/store/ui-store";

function GlobalToast() {
  const toastMessage = useUiStore((state) => state.toastMessage);
  const hideToast = useUiStore((state) => state.hideToast);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          onClick={hideToast}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#161616] border border-[#C6FF00]/80 text-[#F5F1E8] text-xs font-mono shadow-[0_0_30px_rgba(198,255,0,0.3)] cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" />
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isCheckout = pathname?.startsWith('/checkout');

  if (isAdmin) {
    return (
      <MotionProvider>
        <CustomCursor />
        <GlobalToast />
        <main className="flex-1 relative z-10">{children}</main>
      </MotionProvider>
    );
  }

  if (isCheckout) {
    return (
      <MotionProvider>
        <GlobalToast />
        <main className="flex-1 relative z-10">{children}</main>
      </MotionProvider>
    );
  }

  return (
    <LenisProvider>
      <MotionProvider>
        <LoadingScreen />
        <CustomCursor />
        <GrainOverlay />
        <GradientOrbs />
        <Confetti />
        <Navbar />
        <MobileMenu />
        <CartDrawer />
        <GlobalToast />
        <PageTransition>
          <main className="flex-1 relative z-10">{children}</main>
        </PageTransition>
        <Footer />
      </MotionProvider>
    </LenisProvider>
  );
}

export default AppShell;
