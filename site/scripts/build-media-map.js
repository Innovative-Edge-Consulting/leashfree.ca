import fs from "node:fs";
import path from "node:path";
import {
  EXPORT_MEDIA_DIR,
  GENERATED_DIR,
  MEDIA_INVENTORY_PATH,
  MEDIA_MAP_PATH,
  MEDIA_TRACKER_PATH,
  ROOT_MEDIA_DIR,
  ensureDir,
  escapeMd,
  listFiles,
  parseCsv,
  readJson,
  rowToObject,
  slugify,
  writeJson
} from "./lib.js";

const trackerRows = fs.existsSync(MEDIA_TRACKER_PATH)
  ? parseCsv(fs.readFileSync(MEDIA_TRACKER_PATH, "utf8"))
  : [];
const trackerHeaders = trackerRows[0] || [];
const trackerItems = trackerRows.slice(1).map((row) => rowToObject(trackerHeaders, row));
const mediaInventory = fs.existsSync(MEDIA_INVENTORY_PATH) ? readJson(MEDIA_INVENTORY_PATH) : [];
const mediaSourceFolder = fs.existsSync(ROOT_MEDIA_DIR) ? ROOT_MEDIA_DIR : EXPORT_MEDIA_DIR;
const localFiles = listFiles(mediaSourceFolder).filter((file) => /\.(jpg|jpeg|png|webp|svg|avif|gif)$/i.test(file));
const localByBase = new Map(localFiles.map((file) => [path.basename(file).toLowerCase(), file]));
const matchedLocal = new Set();

function scoreFile(row, file) {
  const base = slugify(path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, ""));
  const slug = slugify(row.item_slug);
  const name = slugify(row.item_name);
  const collection = slugify(row.collection);
  let score = 0;
  if (slug && base.includes(slug)) score += 6;
  if (name && base.includes(name)) score += 4;
  if (collection && base.includes(collection.replace(/s$/, ""))) score += 1;
  return score;
}

const items = trackerItems.map((row) => {
  const notes = [];
  let currentLocalPath = "";
  let localFilename = row.current_local_filename || "";
  let status = row.status || "not_started";
  let confidence = "none";

  if (localFilename && localByBase.has(localFilename.toLowerCase())) {
    const match = localByBase.get(localFilename.toLowerCase());
    currentLocalPath = path.relative(process.cwd(), match).replace(/\\/g, "/");
    matchedLocal.add(match);
    status = "matched";
    confidence = "explicit";
  } else {
    const best = localFiles
      .map((file) => ({ file, score: scoreFile(row, file) }))
      .sort((a, b) => b.score - a.score)[0];
    if (best?.score >= 6) {
      currentLocalPath = path.relative(process.cwd(), best.file).replace(/\\/g, "/");
      localFilename = path.basename(best.file);
      matchedLocal.add(best.file);
      status = "matched";
      confidence = best.score >= 10 ? "high" : "medium";
      notes.push("Matched by filename similarity; owner should verify.");
    } else {
      notes.push("No local file matched yet.");
    }
  }

  return {
    collection: row.collection || "",
    itemName: row.item_name || "",
    itemSlug: row.item_slug || "",
    fieldName: row.field_name || "",
    originalWebflowUrl: row.original_webflow_url || "",
    localFilename,
    currentLocalPath,
    suggestedPublicPath: (row.suggested_local_path || "").replace(/^\/public/, ""),
    status,
    confidence,
    notes
  };
});

const unmatchedLocalFiles = localFiles
  .filter((file) => !matchedLocal.has(file))
  .map((file) => ({
    filename: path.basename(file),
    currentPath: path.relative(process.cwd(), file).replace(/\\/g, "/"),
    notes: ["No tracker row matched this local file."]
  }));
const missingLocalFiles = items.filter((item) => !item.currentLocalPath);
const duplicateNames = Object.entries(
  localFiles.reduce((acc, file) => {
    const base = path.basename(file).toLowerCase();
    acc[base] = (acc[base] || 0) + 1;
    return acc;
  }, {})
).filter(([, count]) => count > 1);

const mediaMap = {
  generatedAt: new Date().toISOString(),
  mediaSourceFolder: "/cms-exports/CMS Media/",
  actualMediaSourceFolder: path.relative(process.cwd(), mediaSourceFolder).replace(/\\/g, "/"),
  items,
  unmatchedLocalFiles,
  missingLocalFiles
};

writeJson(MEDIA_MAP_PATH, mediaMap);

const report = [
  "# Media Map Report\n",
  `Generated at: ${mediaMap.generatedAt}\n`,
  `- Total tracker rows: ${trackerItems.length}`,
  `- Total local media files found: ${localFiles.length}`,
  `- Matched media rows: ${items.filter((item) => item.currentLocalPath).length}`,
  `- Missing media rows: ${missingLocalFiles.length}`,
  `- Unmatched local files: ${unmatchedLocalFiles.length}`,
  `- Duplicate filenames: ${duplicateNames.length ? duplicateNames.map(([name, count]) => `${escapeMd(name)} (${count})`).join(", ") : "none"}`,
  `- Inventory records from Phase 1: ${mediaInventory.length}`,
  "\n## Recommended Manual Fixes\n",
  "- Fill `current_local_filename` in `migration-prep/manual-media-tracker.csv` as media is downloaded.",
  "- Verify filename-similarity matches before copying media into `/public/images/`.",
  "- Leave missing rows unresolved until owner confirms whether each image is required.",
  "\n## Unmatched Local Files Sample\n",
  ...unmatchedLocalFiles.slice(0, 40).map((file) => `- ${escapeMd(file.currentPath)}`)
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "media-map-report.md"), `${report.join("\n")}\n`);
console.log(`Built media map with ${items.length} tracker rows and ${localFiles.length} local media files`);
