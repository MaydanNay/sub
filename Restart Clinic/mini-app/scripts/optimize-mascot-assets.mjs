import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_ROOT = join(__dirname, "..", "public", "assets");
const FOLDERS = ["man", "women"];
const STAGE_COUNT = 16;
const MAX_EDGE = 512;
const WEBP_QUALITY = 82;

async function isStale(inputPath, outputPath) {
  try {
    const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
    return outputStat.mtimeMs < inputStat.mtimeMs;
  } catch {
    return true;
  }
}

async function optimizeFolder(folder) {
  const dir = join(ASSETS_ROOT, folder);
  const files = (await readdir(dir)).filter((name) => /\.png$/i.test(name));

  if (files.length === 0) {
    throw new Error(`No PNG sources found in public/assets/${folder}/`);
  }

  let optimized = 0;
  let skipped = 0;

  for (const file of files) {
    const inputPath = join(dir, file);
    const outputPath = join(dir, file.replace(/\.png$/i, ".webp"));

    if (!(await isStale(inputPath, outputPath))) {
      skipped += 1;
      continue;
    }

    const info = await sharp(inputPath)
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const before = (await stat(inputPath)).size;
    const after = info.size;
    const saved = Math.round((1 - after / before) * 100);
    console.log(`  ${folder}/${file} → .webp (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB, -${saved}%)`);
    optimized += 1;
  }

  return { optimized, skipped };
}

async function verifyFolder(folder) {
  const dir = join(ASSETS_ROOT, folder);
  for (let i = 1; i <= STAGE_COUNT; i++) {
    const webpPath = join(dir, `${i}.webp`);
    try {
      const fileStat = await stat(webpPath);
      if (fileStat.size === 0) {
        throw new Error(`empty file`);
      }
    } catch {
      throw new Error(`Missing or invalid public/assets/${folder}/${i}.webp`);
    }
  }
}

try {
  console.log("Optimizing mascot assets…");
  let totalOptimized = 0;
  let totalSkipped = 0;

  for (const folder of FOLDERS) {
    const { optimized, skipped } = await optimizeFolder(folder);
    totalOptimized += optimized;
    totalSkipped += skipped;
    await verifyFolder(folder);
  }

  console.log(`Done: ${totalOptimized} converted, ${totalSkipped} up-to-date, ${FOLDERS.length * STAGE_COUNT} webp verified.`);
} catch (error) {
  console.error("Mascot asset optimization failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
