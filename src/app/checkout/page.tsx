"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore, FREE_SHIPPING_THRESHOLD_INR } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { 
  ShieldCheck, 
  Lock, 
  QrCode, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  ShoppingBag
} from "lucide-react";

export default function CheckoutPage() {
  const { 
    items, 
    cartTotal, 
    getTotal, 
    getDiscountAmount, 
    discountPercent, 
    promoCode, 
    clearCart, 
    getFormattedPrice 
  } = useCartStore();

  const triggerConfetti = useUiStore((state) => state.triggerConfetti);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [upiApp, setUpiApp] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedId = `MNC-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setOrderComplete(true);
      triggerConfetti();
      clearCart();
    }, 1500);
  };

  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_INR;
  const shippingFee = isFreeShipping ? 0 : 99;
  const finalTotal = getTotal() + (items.length > 0 ? shippingFee : 0);

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-base-black text-off-white pt-28 pb-20 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-2xl bg-surface border border-acid-green/40 shadow-[0_0_50px_rgba(198,255,0,0.15)] text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-acid-green/20 border border-acid-green flex items-center justify-center mx-auto text-acid-green">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-acid-green">
              ORDER CONFIRMED // {orderId}
            </span>
            <h1 className="font-display text-4xl uppercase text-off-white mt-1">
              YOU ARE LOCKED IN.
            </h1>
            <p className="font-sans text-xs text-muted-grey mt-2 leading-relaxed">
              We just sent your receipt and tracking telemetry to <span className="text-off-white">{formData.email || 'your email'}</span>. Dispatched within 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-base-black border border-border text-left font-mono text-xs space-y-2">
            <div className="flex justify-between text-muted-grey">
              <span>Status:</span>
              <span className="text-acid-green font-bold">PREPARING DISPATCH</span>
            </div>
            <div className="flex justify-between text-muted-grey">
              <span>Estimated Delivery:</span>
              <span className="text-off-white">2-4 Business Days</span>
            </div>
            <div className="flex justify-between text-muted-grey">
              <span>Payment Mode:</span>
              <span className="text-off-white uppercase">{paymentMethod.toUpperCase()}</span>
            </div>
          </div>

          <Link href="/shop" className="block">
            <MagneticButton variant="primary" size="lg" className="w-full">
              CONTINUE BROWSING
            </MagneticButton>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-24 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Top return link */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-grey hover:text-acid-green transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            <span>Return to Shop</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Customer Info & Payment Form */}
          <form onSubmit={handlePlaceOrder} className="flex-1 w-full space-y-8">
            {/* Step 1: Contact Details */}
            <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                  1. CONTACT INFORMATION
                </h2>
                <span className="text-[10px] font-mono text-acid-green">STEP 1 OF 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Kabir"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Verma"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="kabir@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                    Mobile Number (For WhatsApp/SMS Tracking)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                  2. DELIVERY ADDRESS
                </h2>
                <span className="text-[10px] font-mono text-acid-green">STEP 2 OF 3</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                    Street Address / Apartment
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Flat 402, Menace Heights, Bandra West"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none cursor-pointer"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-grey uppercase mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="400050"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full bg-base-black border border-border focus:border-acid-green px-3 py-2 text-xs font-mono text-off-white rounded outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method (UPI, Razorpay / Cards, COD) */}
            <div className="p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
                  3. PAYMENT METHOD
                </h2>
                <span className="text-[10px] font-mono text-acid-green">STEP 3 OF 3</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-acid-green/10 border-acid-green text-acid-green ring-1 ring-acid-green/30'
                      : 'bg-base-black border-border text-muted-grey hover:text-off-white'
                  }`}
                >
                  <QrCode size={20} className="mx-auto mb-1" />
                  <span className="font-display text-xs uppercase block">UPI / QR CODE</span>
                  <span className="text-[9px] font-mono opacity-70">GPay, PhonePe, Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-acid-green/10 border-acid-green text-acid-green ring-1 ring-acid-green/30'
                      : 'bg-base-black border-border text-muted-grey hover:text-off-white'
                  }`}
                >
                  <CreditCard size={20} className="mx-auto mb-1" />
                  <span className="font-display text-xs uppercase block">CARDS / NETBANKING</span>
                  <span className="text-[9px] font-mono opacity-70">Razorpay Secured</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-acid-green/10 border-acid-green text-acid-green ring-1 ring-acid-green/30'
                      : 'bg-base-black border-border text-muted-grey hover:text-off-white'
                  }`}
                >
                  <Truck size={20} className="mx-auto mb-1" />
                  <span className="font-display text-xs uppercase block">CASH ON DELIVERY</span>
                  <span className="text-[9px] font-mono opacity-70">Pay upon delivery</span>
                </button>
              </div>

              {/* UPI Options Detail */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-base-black border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white p-2 rounded-lg flex items-center justify-center shadow-lg">
                      {/* Stylized QR placeholder */}
                      <div className="w-full h-full bg-base-black rounded flex items-center justify-center text-acid-green font-mono text-[9px] font-bold text-center leading-tight">
                        SCAN TO PAY
                      </div>
                    </div>
                    <div>
                      <span className="font-display text-sm text-off-white uppercase block">
                        FAST UPI CHECKOUT
                      </span>
                      <p className="font-mono text-xs text-muted-grey mt-0.5">
                        Scan with Google Pay, PhonePe, Paytm, or BHIM. Zero payment fees.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-acid-green bg-acid-green/10 border border-acid-green/30 px-3 py-1 rounded">
                    ⚡ Instant Verification
                  </span>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 rounded-xl bg-base-black border border-border/80 space-y-3 font-mono text-xs text-muted-grey">
                  <div className="flex items-center gap-2 text-off-white">
                    <Lock size={14} className="text-acid-green" />
                    <span>256-bit Bank Grade Encryption powered by Razorpay</span>
                  </div>
                  <p>You will be redirected to the secure gateway upon clicking Place Order.</p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-base-black border border-border/80 font-mono text-xs text-muted-grey space-y-1">
                  <p className="text-off-white">Cash on Delivery selected.</p>
                  <p>Please keep exact change ready when the courier arrives at your door.</p>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <MagneticButton
              disabled={items.length === 0 || isProcessing}
              variant="primary"
              size="xl"
              className="w-full flex items-center justify-center gap-2 text-lg shadow-2xl cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 font-mono text-sm">
                  <span className="w-4 h-4 rounded-full border-2 border-base-black border-t-transparent animate-spin" />
                  <span>AUTHORIZING TRANSACTION...</span>
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
          <div className="w-full lg:w-96 p-6 rounded-2xl bg-surface border border-border/80 space-y-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-xl uppercase tracking-wider text-off-white">
                ORDER SUMMARY
              </h3>
              <span className="text-xs font-mono text-muted-grey">
                {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Items list */}
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={28} className="mx-auto text-muted-grey mb-2" />
                <p className="font-display text-lg uppercase text-muted-grey">BAG IS EMPTY</p>
                <Link href="/shop" className="text-xs font-mono text-acid-green hover:underline mt-2 inline-block">
                  Browse tees →
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <span className="font-display text-xs uppercase text-off-white line-clamp-1 block">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-grey uppercase">
                        {item.color} / Size {item.size} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-off-white whitespace-nowrap">
                      {getFormattedPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals breakdown */}
            <div className="border-t border-border pt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-muted-grey">
                <span>Subtotal</span>
                <span>{getFormattedPrice(cartTotal)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-acid-green">
                  <span>Discount ({promoCode})</span>
                  <span>-{getFormattedPrice(getDiscountAmount())}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-grey">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'FREE' : getFormattedPrice(shippingFee)}</span>
              </div>

              <div className="flex justify-between items-center text-base pt-3 border-t border-border font-display uppercase">
                <span className="text-off-white">TOTAL DUE</span>
                <span className="font-mono text-xl font-bold text-acid-green">
                  {getFormattedPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-base-black border border-border text-[11px] font-mono text-muted-grey">
              <ShieldCheck size={16} className="text-acid-green shrink-0" />
              <span>Free doorstep size exchange within 7 days of delivery.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
