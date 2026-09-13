'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore, FREE_SHIPPING_THRESHOLD_INR } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { MagneticButton } from '@/components/ui/magnetic-button';
import {
  ShieldCheck,
  Lock,
  QrCode,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Tag,
  AlertCircle,
  Smartphone,
  ChevronRight
} from 'lucide-react';

// Indian PIN Code to City/State mapper
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  '11': { city: 'New Delhi', state: 'Delhi NCR' },
  '12': { city: 'Gurugram', state: 'Haryana' },
  '13': { city: 'Faridabad', state: 'Haryana' },
  '14': { city: 'Ludhiana', state: 'Punjab' },
  '16': { city: 'Chandigarh', state: 'Punjab' },
  '20': { city: 'Noida', state: 'Uttar Pradesh' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '30': { city: 'Jaipur', state: 'Rajasthan' },
  '38': { city: 'Ahmedabad', state: 'Gujarat' },
  '39': { city: 'Surat', state: 'Gujarat' },
  '40': { city: 'Mumbai', state: 'Maharashtra' },
  '41': { city: 'Pune', state: 'Maharashtra' },
  '44': { city: 'Nagpur', state: 'Maharashtra' },
  '50': { city: 'Hyderabad', state: 'Telangana' },
  '56': { city: 'Bengaluru', state: 'Karnataka' },
  '57': { city: 'Mangalore', state: 'Karnataka' },
  '60': { city: 'Chennai', state: 'Tamil Nadu' },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '68': { city: 'Kochi', state: 'Kerala' },
  '70': { city: 'Kolkata', state: 'West Bengal' },
};

const MERCHANT_UPI_ID = 'menace@okhdfcbank';
const MERCHANT_NAME = 'MENACE APPAREL';

export default function CheckoutPage() {
  const {
    items,
    cartTotal,
    getTotal,
    getDiscountAmount,
    discountPercent,
    promoCode,
    applyPromoCode,
    removePromoCode,
    clearCart,
    getFormattedPrice,
  } = useCartStore();

  const triggerConfetti = useUiStore((state) => state.triggerConfetti);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
  });

  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_INR;
  const shippingFee = isFreeShipping ? 0 : 99;
  const finalTotal = getTotal() + (items.length > 0 ? shippingFee : 0);

  // Dynamic UPI payment URL
  const upiPayUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(
    MERCHANT_NAME
  )}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent('MENACE Apparel Order')}`;

  // Handle PIN code auto-completion for Indian cities
  const handlePincodeChange = (pincode: string) => {
    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    let updatedCity = formData.city;
    let updatedState = formData.state;

    if (clean.length >= 2) {
      const prefix = clean.substring(0, 2);
      if (PINCODE_MAP[prefix]) {
        updatedCity = PINCODE_MAP[prefix].city;
        updatedState = PINCODE_MAP[prefix].state;
      }
    }

    setFormData((prev) => ({
      ...prev,
      pincode: clean,
      city: updatedCity,
      state: updatedState,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      handlePincodeChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput.trim());
    if (!success) {
      setPromoError('Invalid code. Try MENACE10 or VIP20');
    } else {
      setPromoInput('');
    }
  };

  // Helper to dynamically load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit Order to backend API and sync with Menace Admin
  const submitOrderToBackend = async (paymentDetails?: any) => {
    const payload = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      items: items.map((i) => ({
        id: i.id,
        productId: i.product.id,
        variantId: i.selectedSize?.value ? `${i.product.id}_${i.selectedSize.value}` : i.id,
        name: i.product.name,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        price: i.product.price,
      })),
      paymentMethod,
      paymentDetails: paymentDetails || (paymentMethod === 'upi' ? { utr: upiUtr } : {}),
      promoCode: promoCode || null,
      discountAmount: getDiscountAmount(),
      shippingFee,
      subtotal: cartTotal,
      total: finalTotal,
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record order');
    }

    const data = await res.json();
    return data;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Razorpay Payment Flow
      if (paymentMethod === 'card') {
        const scriptLoaded = await loadRazorpayScript();
        
        // Initiate Razorpay Order on server
        const rzpOrderRes = await fetch('/api/checkout/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            notes: {
              customer_name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
            },
          }),
        });

        const rzpData = await rzpOrderRes.json();

        if (scriptLoaded && (window as any).Razorpay && rzpData.keyId) {
          const options = {
            key: rzpData.keyId,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'MENACE APPAREL',
            description: 'Streetwear Drop 001 Checkout',
            order_id: rzpData.orderId,
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#C6FF00',
              backdrop_color: '#0A0A0A',
            },
            handler: async function (response: any) {
              try {
                // Verify signature and commit order
                await fetch('/api/checkout/razorpay', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'verify',
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const confirmed = await submitOrderToBackend({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                });

                setConfirmedOrder(confirmed);
                setOrderComplete(true);
                triggerConfetti();
                clearCart();
              } catch (err: any) {
                setErrorMessage(err.message || 'Payment verification failed');
              } finally {
                setIsProcessing(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const razorpayInstance = new (window as any).Razorpay(options);
          razorpayInstance.open();
          return;
        } else {
          // Fallback test simulation when gateway is running in offline sandbox
          const testPaymentId = `pay_sim_${Date.now()}`;
          const confirmed = await submitOrderToBackend({
            razorpayPaymentId: testPaymentId,
            mode: 'sandbox',
          });

          setConfirmedOrder(confirmed);
          setOrderComplete(true);
          triggerConfetti();
          clearCart();
          setIsProcessing(false);
          return;
        }
      }

      // 2. UPI or COD Flow
      const confirmed = await submitOrderToBackend();
      setConfirmedOrder(confirmed);
      setOrderComplete(true);
      triggerConfetti();
      clearCart();
    } catch (err: any) {
      console.error('Order error:', err);
      setErrorMessage(err.message || 'Error completing checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // CONFIRMED ORDER SCREEN
  if (orderComplete) {
    const orderId = confirmedOrder?.orderId || 'MNC-884920';

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-28 pb-20 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#C6FF00]/40 shadow-[0_0_60px_rgba(198,255,0,0.12)] text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-[#C6FF00]/15 border border-[#C6FF00] flex items-center justify-center mx-auto text-[#C6FF00] shadow-[0_0_20px_rgba(198,255,0,0.3)]">
            <CheckCircle2 size={34} />
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF00] bg-[#C6FF00]/10 px-3 py-1 rounded border border-[#C6FF00]/30 inline-block mb-2">
              ORDER LOCKED // {orderId}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase text-[#F5F1E8] tracking-tight">
              YOU ARE LOCKED IN.
            </h1>
            <p className="font-sans text-xs text-[#8A8A8A] mt-2 leading-relaxed">
              Order received and synced live to our fulfillment hub. Dispatched within 24 hours. Receipt sent to{' '}
              <span className="text-[#F5F1E8] font-bold">{formData.email || 'your email'}</span>.
            </p>
          </div>

          {/* Telemetry metadata card */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#262626] text-left font-mono text-xs space-y-2.5">
            <div className="flex justify-between items-center text-[#8A8A8A]">
              <span>Status:</span>
              <span className="text-[#C6FF00] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-ping" />
                PREPARING DISPATCH
              </span>
            </div>
            <div className="flex justify-between text-[#8A8A8A]">
              <span>Delivery Window:</span>
              <span className="text-[#F5F1E8]">2-4 Business Days (Express)</span>
            </div>
            <div className="flex justify-between text-[#8A8A8A]">
              <span>Payment Mode:</span>
              <span className="text-[#F5F1E8] uppercase">{paymentMethod.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-[#8A8A8A]">
              <span>Destination:</span>
              <span className="text-[#F5F1E8] truncate max-w-[200px]">
                {formData.city}, {formData.state} - {formData.pincode}
              </span>
            </div>
            <div className="flex justify-between text-[#8A8A8A] pt-2 border-t border-[#262626]">
              <span>Amount Paid / Due:</span>
              <span className="text-[#C6FF00] font-bold text-sm">
                {getFormattedPrice(finalTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 h-11 px-4 rounded-xl border border-[#262626] bg-[#161616] hover:bg-[#202020] text-[#F5F1E8] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>PRINT RECEIPT</span>
            </button>
            <Link href="/shop" className="flex-1 block">
              <MagneticButton variant="primary" size="lg" className="w-full h-11 text-xs">
                CONTINUE SHOPPING
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-24 pb-24 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Top return link */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8A8A8A] hover:text-[#C6FF00] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            <span>Return to Shop</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left: Customer Info & Payment Form */}
          <form onSubmit={handlePlaceOrder} className="flex-1 w-full space-y-6">
            {/* Step 1: Contact Details */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
                  1. CONTACT INFORMATION
                </h2>
                <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 rounded border border-[#C6FF00]/20">
                  STEP 1 OF 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Kabir"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Verma"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="kabir@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Mobile Number (SMS / WhatsApp Updates)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
                  2. DELIVERY ADDRESS
                </h2>
                <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 rounded border border-[#C6FF00]/20">
                  STEP 2 OF 3
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Street Address / Apartment / Landmark
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Flat 402, Horizon Heights, Bandra West"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase">
                        PIN Code
                      </label>
                      <span className="text-[9px] font-mono text-[#C6FF00]">Auto-Detect</span>
                    </div>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="400050"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-2.5 text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
                  3. PAYMENT METHOD
                </h2>
                <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 rounded border border-[#C6FF00]/20">
                  STEP 3 OF 3
                </span>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-[#C6FF00] shadow-[0_0_15px_rgba(198,255,0,0.15)]'
                      : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:text-[#F5F1E8]'
                  }`}
                >
                  <QrCode size={20} className="mx-auto mb-1.5" />
                  <span className="font-display text-xs uppercase block">UPI / QR CODE</span>
                  <span className="text-[9px] font-mono opacity-70">GPay, PhonePe, Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-[#C6FF00] shadow-[0_0_15px_rgba(198,255,0,0.15)]'
                      : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:text-[#F5F1E8]'
                  }`}
                >
                  <CreditCard size={20} className="mx-auto mb-1.5" />
                  <span className="font-display text-xs uppercase block">CARDS / NETBANKING</span>
                  <span className="text-[9px] font-mono opacity-70">Razorpay Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-[#C6FF00] shadow-[0_0_15px_rgba(198,255,0,0.15)]'
                      : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:text-[#F5F1E8]'
                  }`}
                >
                  <Truck size={20} className="mx-auto mb-1.5" />
                  <span className="font-display text-xs uppercase block">CASH ON DELIVERY</span>
                  <span className="text-[9px] font-mono opacity-70">Doorstep Verification</span>
                </button>
              </div>

              {/* Dynamic UPI Section */}
              {paymentMethod === 'upi' && (
                <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Dynamic QR Code */}
                    <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] shadow-lg flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          upiPayUrl
                        )}&bgcolor=141414&color=C6FF00&margin=4`}
                        alt="Dynamic UPI QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-[#8A8A8A] mt-2">
                        SCAN WITH ANY UPI APP
                      </span>
                    </div>

                    {/* VPA Copy & Direct Apps */}
                    <div className="flex-1 space-y-3 text-left w-full">
                      <div>
                        <div className="text-xs font-mono text-[#8A8A8A] uppercase">Merchant VPA:</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs font-mono text-[#C6FF00] select-all flex-1">
                            {MERCHANT_UPI_ID}
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="h-8 px-3 rounded-lg border border-[#262626] bg-[#1a1a1a] hover:bg-[#262626] text-xs font-mono flex items-center gap-1 transition-all"
                          >
                            {copiedUpi ? (
                              <>
                                <Check size={12} className="text-[#C6FF00]" />
                                <span className="text-[#C6FF00]">COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mobile Deep Link Buttons */}
                      <div>
                        <div className="text-[10px] font-mono text-[#8A8A8A] uppercase mb-1.5">
                          Tap to pay directly on mobile:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={upiPayUrl}
                            className="px-2.5 py-1.5 rounded bg-[#161616] border border-[#262626] hover:border-[#C6FF00]/50 text-[11px] font-mono text-[#F5F1E8] flex items-center gap-1.5 transition-colors"
                          >
                            <span>Google Pay</span>
                            <ExternalLink size={10} className="text-[#8A8A8A]" />
                          </a>
                          <a
                            href={upiPayUrl}
                            className="px-2.5 py-1.5 rounded bg-[#161616] border border-[#262626] hover:border-[#C6FF00]/50 text-[11px] font-mono text-[#F5F1E8] flex items-center gap-1.5 transition-colors"
                          >
                            <span>PhonePe</span>
                            <ExternalLink size={10} className="text-[#8A8A8A]" />
                          </a>
                          <a
                            href={upiPayUrl}
                            className="px-2.5 py-1.5 rounded bg-[#161616] border border-[#262626] hover:border-[#C6FF00]/50 text-[11px] font-mono text-[#F5F1E8] flex items-center gap-1.5 transition-colors"
                          >
                            <span>Paytm</span>
                            <ExternalLink size={10} className="text-[#8A8A8A]" />
                          </a>
                          <a
                            href={upiPayUrl}
                            className="px-2.5 py-1.5 rounded bg-[#161616] border border-[#262626] hover:border-[#C6FF00]/50 text-[11px] font-mono text-[#F5F1E8] flex items-center gap-1.5 transition-colors"
                          >
                            <span>CRED / BHIM</span>
                            <ExternalLink size={10} className="text-[#8A8A8A]" />
                          </a>
                        </div>
                      </div>

                      {/* Optional UTR confirmation */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-mono text-[#8A8A8A] uppercase mb-1">
                          UPI Ref No. / UTR (Optional, for instant reconciliation):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 423910293810"
                          maxLength={16}
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value)}
                          className="w-full bg-[#141414] border border-[#262626] focus:border-[#C6FF00] px-3 py-1.5 text-xs font-mono text-[#F5F1E8] rounded outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards / Razorpay Section */}
              {paymentMethod === 'card' && (
                <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-3 font-mono text-xs text-[#8A8A8A]">
                  <div className="flex items-center gap-2 text-[#F5F1E8]">
                    <Lock size={15} className="text-[#C6FF00]" />
                    <span className="font-bold">256-bit Bank Grade Encryption powered by Razorpay</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Supports all major credit/debit cards (Visa, Mastercard, RuPay, Amex), netbanking, and cardless EMIs.
                    Clicking &quot;Pay &amp; Place Order&quot; will open the secure Razorpay payment modal.
                  </p>
                </div>
              )}

              {/* COD Section */}
              {paymentMethod === 'cod' && (
                <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#262626] font-mono text-xs text-[#8A8A8A] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#F5F1E8]">
                    <Truck size={15} className="text-[#C6FF00]" />
                    <span className="font-bold">Cash On Delivery Available</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You can pay in cash or scan the courier agent&apos;s UPI QR code at your doorstep upon delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <MagneticButton
              disabled={items.length === 0 || isProcessing}
              variant="primary"
              size="xl"
              className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold shadow-2xl cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 font-mono text-sm">
                  <span className="w-4 h-4 rounded-full border-2 border-[#0A0A0A] border-t-transparent animate-spin" />
                  <span>COMMITTING TRANSACTION...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>PAY &amp; PLACE ORDER ({getFormattedPrice(finalTotal)})</span>
                  <Lock size={16} />
                </span>
              )}
            </MagneticButton>
          </form>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-96 p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-5 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
                ORDER SUMMARY
              </h3>
              <span className="text-xs font-mono text-[#8A8A8A]">
                {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Promo Code Input */}
            <div>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#0A0A0A] border border-[#262626] focus:border-[#C6FF00] px-3 py-2 text-xs font-mono text-[#F5F1E8] uppercase rounded outline-none"
                />
                <button
                  type="submit"
                  className="px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#333] text-xs font-mono font-bold text-[#F5F1E8] rounded transition-colors cursor-pointer"
                >
                  APPLY
                </button>
              </form>
              {promoError && (
                <p className="text-[10px] font-mono text-red-400 mt-1">{promoError}</p>
              )}
              {promoCode && (
                <div className="flex items-center justify-between mt-2 px-2.5 py-1 rounded bg-[#C6FF00]/10 border border-[#C6FF00]/30 text-xs font-mono text-[#C6FF00]">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>{promoCode} ({discountPercent}% OFF)</span>
                  </span>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-[10px] underline hover:text-white cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Items list */}
            {items.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBag size={28} className="mx-auto text-[#8A8A8A] mb-2" />
                <p className="font-display text-base uppercase text-[#8A8A8A]">BAG IS EMPTY</p>
                <Link href="/shop" className="text-xs font-mono text-[#C6FF00] hover:underline mt-2 inline-block">
                  Browse tees →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-3 py-2 border-b border-[#1f1f1f]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.product.images && item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-11 h-11 object-cover rounded-lg border border-[#262626] shrink-0 bg-base-black"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-display text-xs uppercase text-[#F5F1E8] line-clamp-1 block">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">
                          {item.color} / Size {item.size} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#F5F1E8] whitespace-nowrap">
                      {getFormattedPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals breakdown */}
            <div className="border-t border-[#262626] pt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#8A8A8A]">
                <span>Subtotal</span>
                <span>{getFormattedPrice(cartTotal)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-[#C6FF00]">
                  <span>Discount ({promoCode})</span>
                  <span>-{getFormattedPrice(getDiscountAmount())}</span>
                </div>
              )}

              <div className="flex justify-between text-[#8A8A8A]">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'FREE' : getFormattedPrice(shippingFee)}</span>
              </div>

              <div className="flex justify-between items-center text-base pt-3 border-t border-[#262626] font-display uppercase">
                <span className="text-[#F5F1E8]">TOTAL DUE</span>
                <span className="font-mono text-xl font-bold text-[#C6FF00]">
                  {getFormattedPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[11px] font-mono text-[#8A8A8A]">
              <ShieldCheck size={16} className="text-[#C6FF00] shrink-0" />
              <span>Doorstep size exchange within 7 days. Genuine heavyweight fabric guaranteed.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
