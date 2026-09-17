import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLocalStore } from '@/lib/db';
import { discountCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body?.code;
    const subtotal = Math.max(0, Number(body?.subtotal) || 0);

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a promo code.' },
        { status: 400 }
      );
    }

    const code = rawCode.trim().toUpperCase();

    // 1. Query Cloudflare D1
    let promo: any = null;
    try {
      const db = getDb();
      const results = await db
        .select()
        .from(discountCodes)
        .where(eq(discountCodes.code, code));

      if (results && results.length > 0) {
        const r = results[0];
        promo = {
          id: r.id,
          code: r.code,
          type: r.type,
          value: r.value,
          minOrder: r.minOrder ?? 0,
          maxUses: r.maxUses ?? null,
          uses: r.uses ?? 0,
          expiresAt: r.expiresAt ?? null,
          active: Boolean(r.active),
        };
      }
    } catch (d1Err) {
      console.warn('[api/promo/validate] D1 query failed, falling back to local store:', d1Err);
    }

    // 2. Fallback to in-memory local store
    if (!promo) {
      const store = getLocalStore();
      const localDiscounts = store.getTable('discount_codes');
      const found = localDiscounts.find(
        (d: any) => d.code && d.code.toUpperCase() === code
      );
      if (found) {
        promo = {
          id: found.id,
          code: found.code,
          type: found.type,
          value: found.value,
          minOrder: found.min_order ?? found.minOrder ?? 0,
          maxUses: found.max_uses ?? found.maxUses ?? null,
          uses: found.uses ?? 0,
          expiresAt: found.expires_at ?? found.expiresAt ?? null,
          active: Boolean(found.active),
        };
      }
    }

    // 3. Built-in legacy brand promo fallback
    if (!promo) {
      if (code === 'MENANCE10' || code === 'NOTFOREVERYONE') {
        promo = {
          id: 'disc_legacy_1',
          code,
          type: 'percentage',
          value: 10,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (code === 'VIP20' || code === 'DROP001') {
        promo = {
          id: 'disc_legacy_2',
          code,
          type: 'percentage',
          value: 20,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      }
    }

    if (!promo) {
      return NextResponse.json(
        { valid: false, message: `Promo code "${code}" is invalid.` },
        { status: 404 }
      );
    }

    if (!promo.active) {
      return NextResponse.json(
        { valid: false, message: `Promo code "${code}" is no longer active.` },
        { status: 400 }
      );
    }

    if (promo.expiresAt && promo.expiresAt < Date.now()) {
      return NextResponse.json(
        { valid: false, message: `Promo code "${code}" has expired.` },
        { status: 400 }
      );
    }

    if (promo.maxUses && promo.uses >= promo.maxUses) {
      return NextResponse.json(
        { valid: false, message: `Promo code "${code}" has reached maximum redemptions.` },
        { status: 400 }
      );
    }

    if (promo.minOrder && subtotal < promo.minOrder) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum bag total of ₹${promo.minOrder.toLocaleString('en-IN')} required for "${code}".`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = Math.round((subtotal * promo.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, promo.value);
    }

    return NextResponse.json({
      valid: true,
      id: promo.id,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder,
      discountAmount,
      message: `Promo code "${promo.code}" applied! (${promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`})`,
    });
  } catch (error: any) {
    console.error('[api/promo/validate] Handler error:', error);
    return NextResponse.json(
      { valid: false, message: error.message || 'Failed to validate promo code.' },
      { status: 500 }
    );
  }
}
