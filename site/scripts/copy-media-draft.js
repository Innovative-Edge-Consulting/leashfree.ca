import fs from "node:fs";
import path from "node:path";
import { MEDIA_MAP_PATH, SITE_DIR, readJson } from "./lib.js";

const mediaMap = fs.existsSync(MEDIA_MAP_PATH) ? readJson(MEDIA_MAP_PATH) : { items: [] };
const writeMode = process.argv.includes("--write");

if (writeMode) {
  console.error("Write mode is intentionally not implemented yet. This draft is dry-run only.");
  process.exit(1);
}

const planned = mediaMap.items
  .filter((item) => item.currentLocalPath && item.suggestedPublicPath)
  .map((item) => ({
    source: item.currentLocalPath,
    destination: path.join(SITE_DIR, "public", item.suggestedPublicPath.replace(/^\/+/, "")).replace(/\\/g, "/"),
    confidence: item.confidence,
    notes: item.notes
  }));

console.log(JSON.stringify({ dryRun: true, plannedCopies: planned.length, planned }, null, 2));
