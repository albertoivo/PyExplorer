/**
 * Script para gerar ícones do PWA em diferentes tamanhos
 * Execute com: node scripts/generateIcons.js
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(projectRoot, 'public/icons/icon.svg');
const outputDir = join(projectRoot, 'public/icons');

// Garante que o diretório existe
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    const svgBuffer = readFileSync(inputSvg);

    for (const size of sizes) {
        const outputPath = join(outputDir, `icon-${size}x${size}.png`);

        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✓ Gerado: icon-${size}x${size}.png`);
    }

    // Gera também o apple-touch-icon
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(join(projectRoot, 'public/apple-touch-icon.png'));

    console.log('✓ Gerado: apple-touch-icon.png');

    // Gera favicon
    await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(join(projectRoot, 'public/favicon-32x32.png'));

    await sharp(svgBuffer)
        .resize(16, 16)
        .png()
        .toFile(join(projectRoot, 'public/favicon-16x16.png'));

    console.log('✓ Gerado: favicons');
    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(console.error);
