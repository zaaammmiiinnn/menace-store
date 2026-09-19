'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartStore } from '@/store/cart-store';
import { ProgressIndicator } from '@/components/checkout/ProgressIndicator';
import { CartSummary } from '@/components/checkout/CartSummary';
import { CustomerForm } from '@/components/checkout/CustomerForm';
import { AddressForm } from '@/components/checkout/AddressForm';
import { PaymentMethodForm } from '@/components/checkout/PaymentMethodForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CreateOrderSchema, type CreateOrderInput } from '@/lib/validation/checkout';
import { useAuth } from '@/lib/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart();
  const { promoCode } = useCartStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');

  // Ensure cart drawer is closed and scroll is unlocked when checkout mounts
  useEffect(() => {
    cart.closeCart();
    document.body.style.overflow = '';
  }, []);

  // Form setup using Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(CreateOrderSchema) as any,
    defaultValues: {
      customer: {
        name: '',
        email: '',
        phone: '',
      },
      shipping: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      paymentMethod: 'prepaid',
      items: [],
    },
  });

  const handleSelectPaymentMethod = (method: 'prepaid' | 'cod') => {
    setPaymentMethod(method);
    setValue('paymentMethod', method, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // Keep items synced to react-hook-form value
  useEffect(() => {
    setValue(
      'items',
      cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl || '/products/placeholder.svg',
        edition: item.edition,
        customArtworkUrl: item.customArtworkUrl,
        customPlacement: item.customPlacement,
        customScale: item.customScale,
        customQuoteText: item.customQuoteText,
      })),
      { shouldValidate: true }
    );
  }, [cart.items, setValue]);

  // Dynamically load Razorpay checkout script on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).Razorpay) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptReady(true);
    script.onerror = () => {
      console.warn('[Razorpay] Script failed to load from CDN. Falling back to test handler.');
      setIsScriptReady(true);
    };
    document.body.appendChild(script);
  }, []);

  const onFormInvalid = (fieldErrors: any) => {
    console.warn('[checkout] Validation errors:', fieldErrors);
    setErrorMessage(
      'Please complete all required fields (Name, Email, Mobile Number, Street Address, City, PIN code, and State) before proceeding to payment.'
    );

    setTimeout(() => {
      const firstInvalid =
        document.querySelector('.border-red-500') ||
        document.querySelector('input:invalid') ||
        document.querySelector('input[name*="customer"]');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus?.();
      }
    }, 50);
  };

  // Pre-populate customer name and email if logged in
  useEffect(() => {
    if (user) {
      if (user.fullName && user.fullName !== 'MENANCE MEMBER') {
        setValue('customer.name', user.fullName);
      }
      if (user.email) {
        setValue('customer.email', user.email);
      }
    }
  }, [user, setValue]);

  const onFormSubmit = async (formData: CreateOrderInput) => {
    setErrorMessage(null);

    if (cart.items.length === 0) {
      setErrorMessage('Your bag is empty. Please add silhouettes before checkout.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);

    try {
      // Aggregate line items to guarantee strict quantity summation without duplicate rows
      const itemsMap = new Map<string, any>();
      cart.items.forEach((item) => {
        const key = `${item.productId}_${item.color}_${item.size}_${item.edition || 'archive'}_${item.customArtworkUrl || ''}_${item.customPlacement || ''}_${item.customScale || ''}_${item.customQuoteText || ''}`;
        if (itemsMap.has(key)) {
          const prev = itemsMap.get(key);
          prev.quantity += item.quantity;
        } else {
          itemsMap.set(key, {
            productId: item.productId,
            variantId: item.variantId || item.id,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
            edition: item.edition,
            customArtworkUrl: item.customArtworkUrl,
            customPlacement: item.customPlacement,
            customScale: item.customScale,
            customQuoteText: item.customQuoteText,
          });
        }
      });
      const orderItemsPayload = Array.from(itemsMap.values());

      // 1. Create order on server
      const createRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentMethod: paymentMethod || formData.paymentMethod || 'prepaid',
          clerkUserId: user?.id || null,
          promoCode: promoCode || null,
          items: orderItemsPayload,
        }),
      });

      const responseText = await createRes.text();
      let resData: any = {};
      try {
        resData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[checkout] Server returned non-JSON:', responseText);
        throw new Error('Order creation service is momentarily unreachable. Please verify your connection or try again.');
      }

      if (!createRes.ok || resData.error) {
        throw new Error(resData.error || 'Failed to create order on server.');
      }

      const { orderId, gateway, payu, razorpayOrderId, amount, currency } = resData;

      // 2. Cash on Delivery (COD) Flow
      if (gateway === 'cod' || paymentMethod === 'cod' || formData.paymentMethod === 'cod') {
        cart.clearCart();
        router.push(`/checkout/success?order=${orderId}&method=cod`);
        return;
      }

      // 3. PayU Hosted Payment Flow (Live Gateway)
      if (gateway === 'payu' && payu?.action && payu?.params) {
        // Clear cart store before transitioning to PayU
        cart.clearCart();

        // Construct and auto-submit hidden PayU form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payu.action;

        Object.entries(payu.params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = String(v);
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
      const isRealRazorpayKey =
        Boolean(razorpayKey) &&
        !razorpayKey.includes('placeholder') &&
        !razorpayOrderId.includes('sim');

      // 4. Fallback: Open Razorpay Checkout Modal if configured
      if ((window as any).Razorpay && isRealRazorpayKey) {
        const options = {
          key: razorpayKey,
          amount,
          currency: currency || 'INR',
          name: 'MENANCE',
          description: 'DROP 001 // NOT FOR EVERYONE',
          order_id: razorpayOrderId,
          prefill: {
            name: formData.customer.name,
            email: formData.customer.email,
            contact: formData.customer.phone,
          },
          theme: {
            color: '#C6FF00',
            backdrop_color: '#0A0A0A',
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // Verify signature on backend
              const verifyRes = await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  orderId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }

              // Clear cart store
              cart.clearCart();

              // Redirect to success page
              router.push(`/checkout/success?order=${orderId || verifyData.orderId}`);
            } catch (vErr: any) {
              console.error('[checkout/verify] Verification failed:', vErr);
              router.push(
                `/checkout/failure?reason=${encodeURIComponent(
                  vErr.message || 'Verification failed'
                )}&order=${orderId}`
              );
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setErrorMessage('Payment was dismissed. Your allocation is preserved in your bag.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setIsProcessing(false);
          const reason = resp?.error?.description || 'Payment rejected by bank';
          router.push(`/checkout/failure?reason=${encodeURIComponent(reason)}&order=${orderId}`);
        });

        rzp.open();
      } else {
        // Test/Sandbox simulation for preview environments
        console.log('[checkout] Finalizing test transaction verification for order:', orderId);
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: `test_sig_${Date.now()}`,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'Payment verification simulation failed');
        }

        cart.clearCart();
        router.push(`/checkout/success?order=${orderId}`);
      }
    } catch (err: any) {
      console.error('[checkout] Order initiation failed:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Checkout could not be completed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8]">
      {/* Top Header */}
      <header className="border-b border-[#1C1C1C] bg-[#0A0A0A] py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#8A8A8A] hover:text-[#C6FF00] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO SHOP</span>
          </Link>

          <Link href="/" className="font-display text-2xl tracking-tight text-[#F5F1E8]">
            MENANCE<span className="text-[#C6FF00]">®</span>
          </Link>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A8A8A]">
            <ShieldCheck size={14} className="text-[#C6FF00]" />
            <span className="hidden sm:inline">256-BIT ENCRYPTED</span>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Mobile Cart Summary Accordion */}
      <div className="lg:hidden border-b border-[#1C1C1C] bg-[#121212] px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileCartOpen(!mobileCartOpen)}
          className="w-full flex items-center justify-between font-mono text-xs text-[#F5F1E8]"
        >
          <div className="flex items-center gap-2 text-[#C6FF00]">
            <ShoppingBag size={14} />
            <span className="font-bold">
              {mobileCartOpen ? 'HIDE BAG DETAILS' : 'SHOW BAG DETAILS'} ({cart.items.length})
            </span>
            {mobileCartOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <span className="font-bold text-sm">₹{cart.getTotal().toLocaleString('en-IN')}</span>
        </button>

        {mobileCartOpen && (
          <div className="pt-4 mt-3 border-t border-[#1C1C1C]">
            <CartSummary />
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit, onFormInvalid)}>
          <input type="hidden" {...register('paymentMethod')} value={paymentMethod} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (60% on desktop): Forms */}
            <div className="lg:col-span-7 space-y-8">
              {/* Desktop Bag Summary */}
              <div className="hidden lg:block">
                <CartSummary />
              </div>

              {/* Customer Identity */}
              <CustomerForm register={register} errors={errors} />

              {/* Shipping Destination & Payment Mode */}
              <AddressForm
                register={register}
                setValue={setValue}
                errors={errors}
                paymentMethod={paymentMethod}
                onSelectPaymentMethod={handleSelectPaymentMethod}
              />
            </div>

            {/* Right Column (40% on desktop): Sticky Order Summary */}
            <div className="lg:col-span-5">
              <OrderSummary
                isProcessing={isProcessing}
                onSubmit={handleSubmit(onFormSubmit, onFormInvalid)}
                error={errorMessage}
                paymentMethod={paymentMethod}
                onSelectPaymentMethod={handleSelectPaymentMethod}
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
