import sharp from "sharp";
import fs from "fs";
import path from "path";

const publicDir = path.join(process.cwd(), "public");

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="68" font-family="system-ui, sans-serif" font-size="55" font-weight="bold" fill="white" text-anchor="middle">A</text>
</svg>
`);

async function generate() {
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, "favicon-16x16.png"));

  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon-32x32.png"));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, "favicon-48x48.png"));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "android-chrome-512x512.png"));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "android-chrome-192x192.png"));

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), png16);

  console.log("Favicons generated successfully!");
}

generate().catch(console.error);