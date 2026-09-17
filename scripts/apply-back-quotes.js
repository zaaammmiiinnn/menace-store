const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processSweatpantsGrey() {
  const src = '/Users/zamin/.gemini/antigravity-ide/brain/76875fff-a282-4acc-b256-c2dc19e7a038/.user_uploaded/media_1789657322390.png';
  const outDir = 'public/products/heavy-wide-leg-sweatpants-grey';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Convert source PNG to clean JPG for front, front-plain, back-plain
  await sharp(src)
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'front.jpg'));

  await sharp(src)
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'front-plain.jpg'));

  await sharp(src)
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back-plain.jpg'));

  // 2. Generate back.jpg with signature quote: "LOOKS SOFT. ACTS HARD."
  // On wide-leg sweatpants, placement across the left leg calf/thigh or upper seat
  const meta = await sharp(src).metadata();
  const width = meta.width;
  const height = meta.height;

  // Let's create an authentic vertical or horizontal streetwear typographic print across the leg
  const quoteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <style>
        .quote {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 32px;
          fill: #1C1C1E;
          letter-spacing: 5px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.92;
        }
        .quote-sub {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 32px;
          fill: #1C1C1E;
          letter-spacing: 5px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.92;
        }
      </style>
      <text x="${width * 0.38}" y="${height * 0.58}" class="quote">LOOKS SOFT.</text>
      <text x="${width * 0.38}" y="${height * 0.63}" class="quote-sub">ACTS HARD.</text>
    </svg>
  `);

  await sharp(src)
    .composite([{ input: quoteSvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back.jpg'));

  console.log('✓ Created heavy-wide-leg-sweatpants-grey assets with signature quote');
}

async function processSweatpantsBlack() {
  const outDir = 'public/products/heavy-wide-leg-sweatpants-black';
  const plain = path.join(outDir, 'back-plain.jpg');
  if (!fs.existsSync(plain)) return;

  const meta = await sharp(plain).metadata();
  const width = meta.width;
  const height = meta.height;

  const quoteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <style>
        .quote {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 36px;
          fill: #E8E5DF;
          letter-spacing: 6px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.90;
        }
      </style>
      <text x="${width * 0.38}" y="${height * 0.58}" class="quote">MOVE</text>
      <text x="${width * 0.38}" y="${height * 0.63}" class="quote">DIFFERENT.</text>
    </svg>
  `);

  await sharp(plain)
    .composite([{ input: quoteSvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back.jpg'));

  console.log('✓ Created heavy-wide-leg-sweatpants-black back.jpg with quote MOVE DIFFERENT.');
}

async function processStripedShirt() {
  const outDir = 'public/products/the-striped-poplin-shirt';
  const plain = path.join(outDir, 'back-plain.jpg');
  if (!fs.existsSync(plain)) return;

  const meta = await sharp(plain).metadata();
  const width = meta.width;
  const height = meta.height;

  const quoteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <style>
        .quote {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 46px;
          fill: #111111;
          letter-spacing: 7px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.94;
        }
      </style>
      <text x="${width * 0.5}" y="${height * 0.36}" class="quote">TAKE UP MORE SPACE.</text>
    </svg>
  `);

  await sharp(plain)
    .composite([{ input: quoteSvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back.jpg'));

  console.log('✓ Created the-striped-poplin-shirt back.jpg with quote TAKE UP MORE SPACE.');
}

async function processRedGingham() {
  const outDir = 'public/products/the-red-gingham-shirt';
  const plain = path.join(outDir, 'back-plain.jpg');
  if (!fs.existsSync(plain)) return;

  const meta = await sharp(plain).metadata();
  const width = meta.width;
  const height = meta.height;

  const quoteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <style>
        .quote {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 38px;
          fill: #0F0F10;
          letter-spacing: 6px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.95;
        }
      </style>
      <text x="${width * 0.5}" y="${height * 0.40}" class="quote">SPEAK LESS. WEAR THIS.</text>
    </svg>
  `);

  await sharp(plain)
    .composite([{ input: quoteSvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back.jpg'));

  console.log('✓ Created the-red-gingham-shirt back.jpg with quote SPEAK LESS. WEAR THIS.');
}

async function processPinkGingham() {
  const outDir = 'public/products/the-pink-gingham-shirt';
  const plain = path.join(outDir, 'back-plain.jpg');
  if (!fs.existsSync(plain)) return;

  const meta = await sharp(plain).metadata();
  const width = meta.width;
  const height = meta.height;

  const quoteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="distress">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <style>
        .quote {
          font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
          font-weight: 900;
          font-size: 40px;
          fill: #151515;
          letter-spacing: 6px;
          text-anchor: middle;
          filter: url(#distress);
          opacity: 0.95;
        }
      </style>
      <text x="${width * 0.5}" y="${height * 0.40}" class="quote">NOT FOR EVERYONE.</text>
    </svg>
  `);

  await sharp(plain)
    .composite([{ input: quoteSvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'back.jpg'));

  console.log('✓ Created the-pink-gingham-shirt back.jpg with quote NOT FOR EVERYONE.');
}

async function processBlackWafflePlain() {
  const src = 'public/products/the-classic-waffle-black/back-plain.jpg';
  const dest = 'public/products/heavy-waffle-black-full/back-plain.jpg';
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('✓ Copied plain back to heavy-waffle-black-full/back-plain.jpg');
  }
}

async function main() {
  await processSweatpantsGrey();
  await processSweatpantsBlack();
  await processStripedShirt();
  await processRedGingham();
  await processPinkGingham();
  await processBlackWafflePlain();
}

main().catch(console.error);
