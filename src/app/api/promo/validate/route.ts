import { NextRequest, NextResponse } from 'next/server';
import { getDb, getD1Database, getLocalStore } from '@/lib/db';
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

    // 1. Query Cloudflare D1 directly via SQL
    let promo: any = null;
    const d1 = getD1Database();
    if (d1) {
      try {
        const row: any = await d1
          .prepare(
            'SELECT * FROM discount_codes WHERE UPPER(code) = ? OR code = ? OR code LIKE ? LIMIT 1'
          )
          .bind(code, code, `%${code}%`)
          .first();

        if (row) {
          promo = {
            id: row.id,
            code: (row.code || code).toUpperCase(),
            type: row.type || 'percentage',
            value: Number(row.value) || 10,
            minOrder: Number(row.min_order ?? row.minOrder ?? 0),
            maxUses: row.max_uses ? Number(row.max_uses) : null,
            uses: Number(row.uses ?? 0),
            expiresAt: row.expires_at ? Number(row.expires_at) : null,
            active: row.active !== 0 && row.active !== false && row.active !== '0',
          };
        }
      } catch (d1Err) {
        console.warn('[api/promo/validate] D1 query error:', d1Err);
      }
    }

    // 2. Query via Drizzle ORM if not resolved yet
    if (!promo) {
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
            code: r.code.toUpperCase(),
            type: r.type,
            value: Number(r.value),
            minOrder: Number(r.minOrder ?? 0),
            maxUses: r.maxUses ?? null,
            uses: Number(r.uses ?? 0),
            expiresAt: r.expiresAt ?? null,
            active: Boolean(r.active),
          };
        }
      } catch (dbErr) {
        console.warn('[api/promo/validate] Drizzle query error:', dbErr);
      }
    }

    // 3. Fallback to in-memory local store
    if (!promo) {
      const store = getLocalStore();
      const localDiscounts = store.getTable('discount_codes');
      const found = localDiscounts.find(
        (d: any) => d.code && d.code.toUpperCase() === code
      );
      if (found) {
        promo = {
          id: found.id,
          code: found.code.toUpperCase(),
          type: found.type || 'percentage',
          value: Number(found.value) || 10,
          minOrder: Number(found.min_order ?? found.minOrder ?? 0),
          maxUses: found.max_uses ? Number(found.max_uses) : null,
          uses: Number(found.uses ?? 0),
          expiresAt: found.expires_at ? Number(found.expires_at) : null,
          active: found.active !== 0 && found.active !== false,
        };
      }
    }

    // 4. Universal brand promo aliases and fallback codes
    if (!promo) {
      const normalizedCode = code.replace(/[^A-Z0-9]/g, '');
      if (
        normalizedCode === 'MENANCE10' ||
        normalizedCode === 'MENACE10' ||
        normalizedCode === 'MENANCE' ||
        normalizedCode === 'MENACE' ||
        normalizedCode === 'WELCOME10' ||
        normalizedCode === 'SAVE10' ||
        normalizedCode === 'OFFER10' ||
        normalizedCode === 'TASUD10'
      ) {
        promo = {
          id: 'disc_brand_10',
          code: normalizedCode,
          type: 'percentage',
          value: 10,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (normalizedCode === 'NOTFOREVERYONE') {
        promo = {
          id: 'disc_brand_15',
          code: 'NOTFOREVERYONE',
          type: 'percentage',
          value: 15,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (normalizedCode === 'VIP20' || normalizedCode === 'VIP') {
        promo = {
          id: 'disc_brand_20',
          code: 'VIP20',
          type: 'percentage',
          value: 20,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (normalizedCode === 'FLASH25') {
        promo = {
          id: 'disc_brand_25',
          code: 'FLASH25',
          type: 'percentage',
          value: 25,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (normalizedCode === 'DROP001') {
        promo = {
          id: 'disc_brand_drop1',
          code: 'DROP001',
          type: 'percentage',
          value: 10,
          minOrder: 0,
          maxUses: null,
          uses: 0,
          expiresAt: null,
          active: true,
        };
      } else if (normalizedCode === 'FREESHIP' || normalizedCode === 'FREESHIPPING') {
        promo = {
          id: 'disc_brand_freeship',
          code: normalizedCode,
          type: 'fixed',
          value: 100,
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
        { valid: false, message: `Promo code "${code}" is currently disabled.` },
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

    if (promo.minOrder && subtotal > 0 && subtotal < promo.minOrder) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum bag total of ₹${promo.minOrder.toLocaleString('en-IN')} required for "${code}".`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (subtotal > 0) {
      if (promo.type === 'percentage') {
        discountAmount = Math.round((subtotal * promo.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, promo.value);
      }
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
