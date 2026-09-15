# MENANCE® — Production Razorpay Checkout Integration

Complete guide to setting up and operating the Indian D2C Razorpay checkout on Next.js 15, Cloudflare Workers, and Cloudflare D1.

---

## 1. Environment Configuration

Add the following environment variables to `.env.local` (for local development) and to your Cloudflare Workers / OpenNext deployment environment secrets:

```bash
# Server-side Razorpay API credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Client-side publishable key for Razorpay checkout.js modal
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx

# Webhook secret configured in Razorpay Dashboard
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

For Cloudflare Workers:
```bash
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

---

## 2. Architectural Highlights

### Lazy Initialization (Cloudflare 1102 Protection)
Cloudflare Workers throws Error 1102 if heavyweight third-party SDKs attempt network or socket calls during top-level module evaluation.
The Razorpay client in [`src/lib/razorpay/client.ts`](./src/lib/razorpay/client.ts) is initialized lazily via `getRazorpay()` only when handling an incoming checkout request.

### Edge-Native HMAC Signature Verification
Cloudflare Workers edge runtime does not provide Node.js `crypto`.
All signature verifications in [`src/lib/razorpay/verify.ts`](./src/lib/razorpay/verify.ts) utilize the native **Web Crypto API** (`crypto.subtle`) for HMAC SHA-256 computation:
- **Order Verification**: `HMAC-SHA256("${order_id}|${payment_id}", RAZORPAY_KEY_SECRET)`
- **Webhook Verification**: `HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)`

### Cloudflare D1 Database Schema
Orders are stored across two tables:
- `orders`: Stores customer identity, shipping address JSON, financial totals (`subtotal_inr`, `shipping_inr`, `discount_inr`, `total_inr`), and `status` (`pending`, `paid`, `failed`, `shipped`, `delivered`, `refunded`).
- `order_items`: Line items with `product_id`, `variant_id`, `size`, `color`, `quantity`, `price_inr`, `image_url`.

---

## 3. Checkout Workflow

1. **Bag Review (`CartSummary.tsx`)**:
   - Free shipping progress bar indicates distance to the ₹1,499 threshold.
   - Dynamic recalculation of shipping (₹0 if $\ge ₹1499$, else ₹99).
2. **Customer Identity (`CustomerForm.tsx`)**:
   - Validates name, email, and 10-digit Indian phone number via Zod.
3. **Delivery Address (`AddressForm.tsx`)**:
   - PIN Code auto-lookup identifies city & state from a 20+ city Indian postal index.
   - State selector covers all 28 Indian states and union territories.
4. **Order Creation (`POST /api/checkout/create-order`)**:
   - Rate limited to 5 requests per minute per IP.
   - Creates a pending order in D1 and initiates a Razorpay order in paise (`amount * 100`).
5. **Razorpay Modal Execution**:
   - Opens `checkout.js` with branded theme (`#C6FF00` accent, `#0A0A0A` backdrop).
   - Supports UPI (GPay, PhonePe, Paytm, CRED), RuPay/Visa/Mastercard cards, and Netbanking.
6. **Signature Verification (`POST /api/checkout/verify`)**:
   - Verifies the cryptographic HMAC SHA-256 signature.
   - Updates order state to `paid`, stores `razorpay_payment_id` and `paid_at`.
   - Dispatches console email notification stub.
   - Redirects customer to `/checkout/success?order=MNC-...`.

---

## 4. Webhook Configuration

In your **Razorpay Dashboard** (`https://dashboard.razorpay.com/app/webhooks`):
1. Add new webhook URL: `https://your-domain.com/api/webhooks/razorpay`
2. Secret: Match `RAZORPAY_WEBHOOK_SECRET`
3. Subscribed Events:
   - `payment.captured` $\rightarrow$ Marks order as `paid`
   - `payment.failed` $\rightarrow$ Marks order as `failed`
   - `refund.created` $\rightarrow$ Marks order as `refunded`

---

## 5. Test Credentials (Razorpay Sandbox)

- **UPI Test VPA**: `success@razorpay`
- **Cards**: Any standard Razorpay test card (e.g. 4111 1111 1111 1111, OTP: 123456)
