import { access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_ASSETS = join(__dirname, "..", "dist", "assets");
const FOLDERS = ["man", "women"];
const STAGE_COUNT = 16;

async function verifyFolder(folder) {
  const dir = join(DIST_ASSETS, folder);
  for (let i = 1; i <= STAGE_COUNT; i++) {
    await access(join(dir, `${i}.webp`));
  }
}

try {
  for (const folder of FOLDERS) {
    await verifyFolder(folder);
  }
  console.log(`Production assets OK: ${FOLDERS.length * STAGE_COUNT} webp files in dist.`);
} catch {
  console.error("Production dist is missing mascot webp assets. Run npm run build from scratch.");
  process.exit(1);
}
