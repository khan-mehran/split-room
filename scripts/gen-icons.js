const fs = require('fs');
const sharp = require('sharp');

// Generates the SVG at any size
const svgIcon = (size) => {
  const rx = Math.round(size * 0.22); // rounded square corners

  // Roof triangle
  const roofLeft  = size * 0.094;
  const roofRight = size * 0.906;
  const roofTop   = size * 0.156;
  const roofBase  = size * 0.500;
  const cx        = size * 0.500;

  // House body
  const bodyX  = size * 0.141;
  const bodyY  = size * 0.469;
  const bodyW  = size * 0.719;
  const bodyH  = size * 0.430;
  const bodyRx = size * 0.039;

  // Door (cutout — same color as background dark)
  const doorX  = size * 0.398;
  const doorY  = size * 0.648;
  const doorW  = size * 0.203;
  const doorH  = size * 0.250;
  const doorRx = size * 0.025;

  // Orange accent badge (top-right quadrant, above roof)
  const badgeCx = size * 0.760;
  const badgeCy = size * 0.220;
  const badgeR  = size * 0.105;

  // Dot and line sizes for ÷ symbol inside badge
  const dotR  = badgeR * 0.18;
  const lineW = badgeR * 1.10;
  const lineH = badgeR * 0.16;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>

  <!-- House roof -->
  <polygon points="${roofLeft},${roofBase} ${cx},${roofTop} ${roofRight},${roofBase}" fill="white"/>

  <!-- House body -->
  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyRx}" fill="white"/>

  <!-- Door -->
  <rect x="${doorX}" y="${doorY}" width="${doorW}" height="${doorH}" rx="${doorRx}" fill="#1e293b"/>

  <!-- Orange split badge -->
  <circle cx="${badgeCx}" cy="${badgeCy}" r="${badgeR}" fill="#64748b"/>

  <!-- Division symbol: top dot -->
  <circle cx="${badgeCx}" cy="${badgeCy - badgeR * 0.38}" r="${dotR}" fill="white"/>
  <!-- Division symbol: horizontal line -->
  <rect x="${badgeCx - lineW / 2}" y="${badgeCy - lineH / 2}" width="${lineW}" height="${lineH}" rx="${lineH / 2}" fill="white"/>
  <!-- Division symbol: bottom dot -->
  <circle cx="${badgeCx}" cy="${badgeCy + badgeR * 0.38}" r="${dotR}" fill="white"/>
</svg>`);
};

async function generate() {
  fs.mkdirSync('public/icons', { recursive: true });
  for (const size of [192, 512]) {
    await sharp(svgIcon(size)).png().toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`✓ public/icons/icon-${size}x${size}.png`);
    // Also write the SVG source
    fs.writeFileSync(`public/icons/icon-${size}x${size}.svg`, svgIcon(size).toString('utf-8'));
    console.log(`✓ public/icons/icon-${size}x${size}.svg`);
  }
}

generate().catch(console.error);
