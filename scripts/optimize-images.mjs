import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, parse } from 'path';

const INPUT_DIR = 'src/assets/images/problems';
const OUTPUT_DIR = 'src/assets/images/problems/optimized';

// Sizes: main preview (800px for retina on 400px container), thumbnail (96px for retina on 48px)
const VARIANTS = [
  { suffix: '-lg', width: 800, quality: 85 },
  { suffix: '-sm', width: 96, quality: 80 },
  // Tiny blur placeholder (20px, inlined as base64 in component)
  { suffix: '-placeholder', width: 20, quality: 30 },
];

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.png'));

for (const file of files) {
  const { name } = parse(file);
  const inputPath = join(INPUT_DIR, file);

  for (const variant of VARIANTS) {
    const outputPath = join(OUTPUT_DIR, `${name}${variant.suffix}.webp`);
    await sharp(inputPath)
      .resize(variant.width, null, { withoutEnlargement: true })
      .webp({ quality: variant.quality })
      .toFile(outputPath);

    const stat = (await import('fs')).statSync(outputPath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`  ${outputPath} (${sizeKB} KB)`);
  }
  console.log(`Done: ${file}`);
}

console.log('\nAll images optimized!');
