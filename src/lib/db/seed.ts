import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SEED_PRODUCTS, SIZES, type SeedProductDef } from './seed-data';

export { SEED_PRODUCTS, SIZES, type SeedProductDef };

export function generateSeedSql(): string {
  const statements: string[] = [];
  const now = Date.now();

  // Ensure Drop 001 exists
  statements.push(`
INSERT OR IGNORE INTO drops (id, name, launch_at, status, description)
VALUES ('drop_001', 'DROP 001 — NOT FOR EVERYONE', '2026-10-10T10:00:00+05:30', 'upcoming', 'First collection of 240 GSM heavyweight waffle knit oversized silhouettes.');
`);

  for (const p of SEED_PRODUCTS) {
    const slugUpper = p.slug.toUpperCase().replace(/-/g, '-');
    const safeDesc = p.description.replace(/'/g, "''");
    const safeQuote = p.backQuote.replace(/'/g, "''");
    const safeLogo = p.frontLogo.replace(/'/g, "''");
    const safeName = p.name.replace(/'/g, "''");

    statements.push(`
INSERT OR REPLACE INTO products (
  id, slug, name, description, price_inr, price_usd, category, drop_id, status,
  back_quote, front_logo, fabric_gsm, fabric_type, fit, sleeve_type,
  created_at, updated_at
) VALUES (
  '${p.id}', '${p.slug}', '${safeName}', '${safeDesc}', ${p.priceInr}, ${p.priceUsd}, '${p.category}', 'drop_001', 'draft',
  '${safeQuote}', '${safeLogo}', ${p.fabricGsm}, '${p.fabricType}', '${p.fit}', '${p.sleeveType}',
  ${now}, ${now}
);`);

    // Insert 4 image slots per product
    const images = [
      { suffix: 'front.jpg', alt: `${p.name} - Front View`, order: 0 },
      { suffix: 'back.jpg', alt: `${p.name} - Back View (${p.backQuote})`, order: 1 },
      { suffix: 'detail-1.jpg', alt: `${p.name} - 240 GSM Fabric Texture Detail`, order: 2 },
      { suffix: 'detail-2.jpg', alt: `${p.name} - Neck Tag Detail`, order: 3 },
    ];

    for (const img of images) {
      const imgId = `img_${p.id}_${img.order}`;
      const imgUrl = `/products/${p.slug}/${img.suffix}`;
      const safeAlt = img.alt.replace(/'/g, "''");
      statements.push(`
INSERT OR REPLACE INTO product_images (id, product_id, url, alt, sort_order)
VALUES ('${imgId}', '${p.id}', '${imgUrl}', '${safeAlt}', ${img.order});`);
    }

    // Insert 7 size variants per product (S to 4XL)
    for (const size of SIZES) {
      const sku = `MENANCE-${slugUpper}-${size}`;
      const variantId = `var_${p.id}_${size.toLowerCase()}`;
      statements.push(`
INSERT OR REPLACE INTO product_variants (id, product_id, size, color, sku, stock, price_override, image_url)
VALUES ('${variantId}', '${p.id}', '${size}', '${p.color}', '${sku}', 0, NULL, '/products/${p.slug}/front.jpg');`);
    }
  }

  return statements.join('\n');
}

export async function runSeed() {
  console.log('⚡ Generating DROP 001 Seed SQL for 8 products...');
  const sql = generateSeedSql();
  const tempSqlFile = path.join(__dirname, 'seed.temp.sql');
  fs.writeFileSync(tempSqlFile, sql, 'utf8');

  console.log(`✅ Seed SQL written to ${tempSqlFile} (${SEED_PRODUCTS.length} products, ${SEED_PRODUCTS.length * 7} variants)`);

  try {
    console.log('🚀 Executing seed on Cloudflare D1 (remote: menace-db)...');
    execSync(
      `source "$HOME/.nvm/nvm.sh" && nvm use v26.8.2 && npx wrangler d1 execute menace-db --remote --file="${tempSqlFile}"`,
      { stdio: 'inherit', shell: '/bin/zsh' }
    );
    console.log('🎉 Successfully seeded DROP 001 into Cloudflare D1!');
  } catch (err) {
    console.error('⚠️ Note: Wrangler execution threw an error or was interrupted:', err);
  } finally {
    if (fs.existsSync(tempSqlFile)) {
      fs.unlinkSync(tempSqlFile);
    }
  }
}

// Auto-run if executed directly
if (require.main === module || process.argv[1]?.includes('seed.ts')) {
  runSeed();
}
