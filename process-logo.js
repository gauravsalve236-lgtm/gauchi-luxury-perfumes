const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function processLogo() {
  const inputPath = "C:/Users/Gaurav.Salve/.gemini/antigravity/brain/8a9384d3-d549-41b1-956c-71c8bab88ee9/.user_uploaded/media_1794030474256_ff1caa0b.png";
  const outputDir = path.join(__dirname, "public", "images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3 or 4

  // Output buffer RGBA
  const outData = Buffer.alloc(width * height * 4);

  // Target Champagne Gold Color:
  // We can use a rich metallic luxury gold:
  // Base Gold: #C5A059 (197, 160, 89) to #D4AF37 (212, 175, 55)
  // Let's create subtle vertical gold gradient from top (218, 185, 95) to bottom (185, 145, 65)
  for (let y = 0; y < height; y++) {
    const t = y / height;
    // Gold gradient interpolation
    const goldR = Math.round(218 * (1 - t) + 185 * t);
    const goldG = Math.round(185 * (1 - t) + 145 * t);
    const goldB = Math.round(95 * (1 - t) + 65 * t);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance (0 = black, 255 = white)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Invert: 0 in input (black dove) becomes opaque (255)
      // 255 in input (white background) becomes transparent (0)
      const alpha = Math.max(0, Math.min(255, Math.round(255 - lum)));

      outData[outIdx] = goldR;
      outData[outIdx + 1] = goldG;
      outData[outIdx + 2] = goldB;
      outData[outIdx + 3] = alpha;
    }
  }

  // Trim transparent borders and save
  const outputPath = path.join(outputDir, "gauchi-gold-logo.png");
  await sharp(outData, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .trim()
    .toFile(outputPath);

  console.log("Processed logo successfully saved to:", outputPath);
}

processLogo().catch(console.error);
