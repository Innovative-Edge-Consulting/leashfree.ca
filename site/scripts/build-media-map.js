import fs from "node:fs";
import path from "node:path";
import {
  EXPORT_MEDIA_DIR,
  GENERATED_DIR,
  MEDIA_INVENTORY_PATH,
  MEDIA_MAP_PATH,
  MEDIA_TRACKER_PATH,
  ROOT_MEDIA_DIR,
  ROOT_DIR,
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

function publicPurpose(fieldName) {
  if (/thumb|card/i.test(fieldName)) return "card";
  if (/hero/i.test(fieldName)) return "hero";
  if (/featured|profile/i.test(fieldName)) return "profile";
  if (/gallery|additional/i.test(fieldName)) return "gallery";
  return "image";
}

function collectionType(collection) {
  const map = {
    "Blog Categories": "blog-category",
    "Blog Posts": "blog",
    "Blog Tags": "blog-tag",
    "Breed Groups": "breed-group",
    Categories: "category",
    "City Pages": "city",
    Directories: "directory",
    "Dog Breeds": "breed",
    "Dog Parks": "park",
    "Pet Insurance Providers": "pet-insurance",
    Provinces: "province"
  };
  return map[collection] || slugify(collection);
}

function publicFolder(row) {
  const map = {
    park: "parks",
    city: "cities",
    province: "provinces",
    blog: "blog",
    breed: "breeds"
  };
  return map[collectionType(row.collection)] || "general";
}

function suggestedFilename(row) {
  const ext = path.extname(row.suggested_local_path || "") || ".jpg";
  return `${collectionType(row.collection)}-${slugify(row.item_slug || row.item_name)}-${publicPurpose(row.field_name)}${ext.toLowerCase()}`;
}

function suggestedPublicPath(row) {
  return `/images/${publicFolder(row)}/${suggestedFilename(row)}`;
}

function decodeUrlFilename(url) {
  try {
    return decodeURIComponent(path.basename(new URL(url).pathname));
  } catch {
    return "";
  }
}

function normalizedFileTokens(file) {
  const base = path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, "");
  return new Set(slugify(base).split("-").filter(Boolean));
}

function scoreFile(row, file) {
  const originalBase = path.basename(file).toLowerCase();
  const base = slugify(path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, ""));
  const slug = slugify(row.item_slug);
  const name = slugify(row.item_name);
  const collection = collectionType(row.collection);
  const purpose = publicPurpose(row.field_name);
  const suggested = slugify(path.basename(suggestedFilename(row), path.extname(suggestedFilename(row))));
  const sourceName = slugify(decodeUrlFilename(row.original_webflow_url || ""));
  const tokens = normalizedFileTokens(file);
  let score = 0;
  if (row.current_local_filename && originalBase === row.current_local_filename.toLowerCase()) score += 100;
  if (suggested && base === suggested) score += 30;
  if (sourceName && base.includes(sourceName.replace(/\.[a-z0-9]+$/, ""))) score += 24;
  if (slug && base === slug) score += 20;
  if (slug && base.includes(slug)) score += 12;
  if (name && base.includes(name)) score += 8;
  if (collection && base.includes(collection)) score += 3;
  if (purpose && base.includes(purpose)) score += 3;
  if (slug) {
    const slugTokens = slug.split("-").filter(Boolean);
    const tokenMatches = slugTokens.filter((token) => tokens.has(token)).length;
    if (slugTokens.length && tokenMatches === slugTokens.length) score += 8;
    else score += tokenMatches;
  }
  return score;
}

function confidenceFor(score) {
  if (score >= 100) return "explicit";
  if (score >= 24) return "high";
  if (score >= 12) return "medium";
  if (score >= 8) return "low";
  return "none";
}

function rowPriority(row) {
  const collection = row.collection || "";
  const field = row.field_name || "";
  if (/City Pages|Provinces/i.test(collection) && /hero/i.test(field)) return "High";
  if (/Blog Posts/i.test(collection) && /hero|featured|thumbnail/i.test(field)) return "High";
  if (/Dog Breeds/i.test(collection) && /featured|profile|image/i.test(field)) return "High";
  if (/Dog Parks/i.test(collection) && /media|hero|card|featured/i.test(field)) return "High";
  if (/gallery|additional|rich text/i.test(field)) return "Medium";
  if (/thumbnail|icon|og image/i.test(field)) return "Medium";
  return "Low";
}

function isRiskyFilename(filename) {
  return /\s|_|,|\(|\)|[A-Z]/.test(filename) || filename.length > 100;
}

function csvLine(row) {
  return row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
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
    if (best?.score >= 8) {
      currentLocalPath = path.relative(process.cwd(), best.file).replace(/\\/g, "/");
      localFilename = path.basename(best.file);
      matchedLocal.add(best.file);
      status = "matched";
      confidence = confidenceFor(best.score);
      notes.push(`Matched by filename similarity score ${best.score}; owner should verify.`);
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
    suggestedPublicPath: suggestedPublicPath(row),
    suggestedFilename: suggestedFilename(row),
    priority: rowPriority(row),
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
const riskyFiles = localFiles
  .filter((file) => isRiskyFilename(path.basename(file)))
  .map((file) => ({
    filename: path.basename(file),
    currentPath: path.relative(process.cwd(), file).replace(/\\/g, "/"),
    suggestedFilename: slugify(path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, "")) + path.extname(file).toLowerCase()
  }));

const mediaMap = {
  generatedAt: new Date().toISOString(),
  mediaSourceFolder: "/cms-exports/CMS Media/",
  actualMediaSourceFolder: path.relative(process.cwd(), mediaSourceFolder).replace(/\\/g, "/"),
  items,
  unmatchedLocalFiles,
  missingLocalFiles,
  riskyFiles
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
  `- Files with risky names: ${riskyFiles.length}`,
  `- Inventory records from Phase 1: ${mediaInventory.length}`,
  "\n## Recommended Manual Fixes\n",
  "- Fill `current_local_filename` in `migration-prep/manual-media-tracker.csv` as media is downloaded.",
  "- Save high-priority files from `migration-prep/phase-3-media-to-save-next.csv` first.",
  "- Verify filename-similarity matches before copying media into `/public/images/`.",
  "- Leave missing rows unresolved until owner confirms whether each image is required.",
  "\n## Suggested Filename Cleanup Sample\n",
  ...riskyFiles.slice(0, 40).map((file) => `- ${escapeMd(file.filename)} -> ${escapeMd(file.suggestedFilename)}`),
  "\n## Unmatched Local Files Sample\n",
  ...unmatchedLocalFiles.slice(0, 40).map((file) => `- ${escapeMd(file.currentPath)}`)
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "media-map-report.md"), `${report.join("\n")}\n`);

const mediaToSaveRows = [
  [
    "priority",
    "collection",
    "item_name",
    "item_slug",
    "field_name",
    "original_webflow_url",
    "current_local_filename",
    "suggested_filename",
    "suggested_public_path",
    "status",
    "notes"
  ],
  ...items
    .filter((item) => !item.currentLocalPath)
    .sort((a, b) => {
      const weight = { High: 0, Medium: 1, Low: 2 };
      return (weight[a.priority] ?? 3) - (weight[b.priority] ?? 3) || a.collection.localeCompare(b.collection);
    })
    .map((item) => [
      item.priority,
      item.collection,
      item.itemName,
      item.itemSlug,
      item.fieldName,
      item.originalWebflowUrl,
      item.localFilename,
      item.suggestedFilename,
      item.suggestedPublicPath,
      item.status,
      item.notes.join("; ")
    ])
];

fs.writeFileSync(
  path.join(ROOT_DIR, "migration-prep", "phase-3-media-to-save-next.csv"),
  `${mediaToSaveRows.map(csvLine).join("\n")}\n`
);
console.log(`Built media map with ${items.length} tracker rows and ${localFiles.length} local media files`);
