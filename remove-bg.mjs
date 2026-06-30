import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

async function removeWhiteBg(inputPath, outputPath, threshold = 240) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  for (let i = 0; i < width * height; i++) {
    const r = buf[i * channels];
    const g = buf[i * channels + 1];
    const b = buf[i * channels + 2];
    if (r > threshold && g > threshold && b > threshold) {
      buf[i * channels + 3] = 0;
    }
  }

  await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log('✓', outputPath);
}

for (const f of ['fig1', 'fig2', 'fig3', 'fig4']) {
  const path = `C:/Users/Michuuu/Desktop/Laguno/dashboard/public/${f}.png`;
  await removeWhiteBg(path, path);
}
