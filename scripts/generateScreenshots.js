/**
 * Script para gerar screenshots do PWA
 * Execute com: node scripts/generateScreenshots.js
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function generateScreenshots() {
    // Wide screenshot
    const wideSvg = readFileSync(join(projectRoot, 'public/screenshots/screenshot-wide.svg'));
    await sharp(wideSvg)
        .resize(1280, 720)
        .png()
        .toFile(join(projectRoot, 'public/screenshots/screenshot-wide.png'));
    console.log('✓ Gerado: screenshot-wide.png');

    // Mobile screenshot
    const mobileSvg = readFileSync(join(projectRoot, 'public/screenshots/screenshot-mobile.svg'));
    await sharp(mobileSvg)
        .resize(390, 844)
        .png()
        .toFile(join(projectRoot, 'public/screenshots/screenshot-mobile.png'));
    console.log('✓ Gerado: screenshot-mobile.png');

    console.log('\n🎉 Screenshots geradas com sucesso!');
}

generateScreenshots().catch(console.error);
