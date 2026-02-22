import fs from 'fs/promises';
import { optimize } from 'svgo';
import sharp from 'sharp';
import path from 'path';

const IMG_DIR = './src/image';

const toWebp = [
    'offece.svg',
    'makeup.svg',
    'safety.svg',
    'ufo.svg',
    'sticker_1.svg',
    'sticker_2.svg'
];

async function run() {
    const files = await fs.readdir(IMG_DIR);

    for (const file of files) {
        const filePath = path.join(IMG_DIR, file);
        if (toWebp.includes(file)) {
            const ext = path.extname(file);
            const webpPath = path.join(IMG_DIR, file.replace(ext, '.webp'));

            console.log(`Converting ${file} to WebP...`);
            if (file.endsWith('.gif')) {
                await sharp(filePath, { animated: true })
                    .webp({ effort: 6, quality: 75 })
                    .toFile(webpPath);
            } else {
                await sharp(filePath, { unlimited: true })
                    .webp({ quality: 80 })
                    .toFile(webpPath);
            }
            console.log(`Saved ${webpPath}`);
        } else if (file.endsWith('.svg')) {
            console.log(`Minifying ${file} with SVGO...`);
            const svgData = await fs.readFile(filePath, 'utf8');
            const result = optimize(svgData, {
                path: filePath,
                multipass: true
            });
            await fs.writeFile(filePath, result.data);
            console.log(`Optimized ${file}`);
        }
    }
}

run().catch(console.error);
