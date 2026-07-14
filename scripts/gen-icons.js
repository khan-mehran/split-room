const fs = require('fs');
const sharp = require('sharp');

const svgIcon = (size) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#0F766E"/>
  <rect x="${size*0.12}" y="${size*0.52}" width="${size*0.76}" height="${size*0.40}" rx="${size*0.06}" fill="white" opacity="0.95"/>
  <polygon points="${size*0.12},${size*0.54} ${size*0.5},${size*0.20} ${size*0.88},${size*0.54}" fill="white" opacity="0.95"/>
  <rect x="${size*0.38}" y="${size*0.67}" width="${size*0.24}" height="${size*0.25}" rx="${size*0.03}" fill="#0F766E"/>
  <text x="${size*0.78}" y="${size*0.42}" font-size="${size*0.2}" text-anchor="middle" font-family="Arial,sans-serif" fill="#F97316" font-weight="bold">$</text>
</svg>`);

async function generate() {
  fs.mkdirSync('public/icons', { recursive: true });
  for (const size of [192, 512]) {
    await sharp(svgIcon(size))
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`Generated public/icons/icon-${size}x${size}.png`);
  }
}

generate().catch(console.error);
