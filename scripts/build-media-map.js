import fs from "node:fs";
import path from "node:path";
import {
  EXPORT_MEDIA_DIR,
  GENERATED_DIR,
  MEDIA_INVENTORY_PATH,
  MEDIA_MAP_PATH,
  MEDIA_TRACKER_PATH,
  ROOT_DIR,
  ROOT_MEDIA_DIR,
  SITE_DIR,
  ensureDir,
  escapeMd,
  listFiles,
  parseCsv,
  readJson,
  rowToObject,
  slugify,
  writeJson
} from "./lib.js";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif", ".gif"]);
const SOURCE_MEDIA_DIR = fs.existsSync(EXPORT_MEDIA_DIR) ? EXPORT_MEDIA_DIR : ROOT_MEDIA_DIR;
const PUBLIC_IMAGES_DIR = path.join(SITE_DIR, "public", "images");

const trackerRows = fs.existsSync(MEDIA_TRACKER_PATH)
  ? parseCsv(fs.readFileSync(MEDIA_TRACKER_PATH, "utf8"))
  : [];
const trackerHeaders = trackerRows[0] || [];
const trackerItems = trackerRows.slice(1).map((row) => rowToObject(trackerHeaders, row));
const phaseOneInventory = fs.existsSync(MEDIA_INVENTORY_PATH) ? readJson(MEDIA_INVENTORY_PATH) : [];
const localFiles = listFiles(SOURCE_MEDIA_DIR).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));

function rel(file) {
  return path.relative(ROOT_DIR, file).replace(/\\/g, "/");
}

function siteRel(file) {
  return path.relative(SITE_DIR, file).replace(/\\/g, "/");
}

function publicPurpose(fieldName) {
  if (/hero/i.test(fieldName)) return "hero";
  if (/featured/i.test(fieldName)) return "featured";
  if (/profile/i.test(fieldName)) return "profile";
  if (/thumb|card/i.test(fieldName)) return "card";
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
    "Dog Names": "dog-name",
    "Dog Parks": "park",
    "Pet Insurance Providers": "pet-insurance",
    Provinces: "province"
  };
  return map[collection] || slugify(collection);
}

function publicFolderForType(type) {
  const map = {
    park: "parks",
    city: "cities",
    province: "provinces",
    blog: "blog",
    breed: "breeds",
    "dog-name": "dog-names"
  };
  return map[type] || "general";
}

function normalizeExtension(ext) {
  const clean = ext.toLowerCase();
  return clean === ".jpeg" ? ".jpg" : clean;
}

function cleanFilenameBase(value, maxLength = 96) {
  const clean = slugify(value);
  if (clean.length <= maxLength) return clean || "image";
  return clean.slice(0, maxLength).replace(/-+[^-]*$/, "") || clean.slice(0, maxLength);
}

function decodedUrlFilename(url) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const filename = decodeURIComponent(path.basename(pathname));
    if (IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase())) return filename;
    if (/website-files\.com$/i.test(parsedUrl.hostname) && filename) return filename;
    return "";
  } catch {
    return "";
  }
}

function decodedUrlStem(url) {
  const filename = decodedUrlFilename(url);
  if (!filename) return "";
  return cleanFilenameBase(path.basename(filename, path.extname(filename)), 140);
}

function normalizedStem(file) {
  return cleanFilenameBase(path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, ""), 140);
}

function tokenSet(value) {
  return new Set(cleanFilenameBase(value, 180).split("-").filter(Boolean));
}

function scoreFile(row, file) {
  const sourceName = decodedUrlFilename(row.original_webflow_url || "");
  if (!row.current_local_filename && !sourceName) return { file, score: 0, reasons: [] };

  const originalBase = path.basename(file).toLowerCase();
  const stem = normalizedStem(file);
  const fileTokens = tokenSet(stem);
  const sourceStem = decodedUrlStem(row.original_webflow_url || "");
  const slug = cleanFilenameBase(row.item_slug || "", 140);
  const name = cleanFilenameBase(row.item_name || "", 140);
  const type = collectionType(row.collection || "");
  const purpose = publicPurpose(row.field_name || "");
  let score = 0;
  const reasons = [];

  if (row.current_local_filename && originalBase === row.current_local_filename.toLowerCase()) {
    score += 120;
    reasons.push("exact tracker filename");
  }
  if (sourceName && originalBase === sourceName.toLowerCase()) {
    score += 115;
    reasons.push("exact original Webflow filename");
  }
  if (sourceStem && stem === sourceStem) {
    score += 90;
    reasons.push("normalized original Webflow filename");
  }
  if (sourceStem && sourceStem.length >= 8 && (stem.includes(sourceStem) || sourceStem.includes(stem))) {
    score += 32;
    reasons.push("partial original Webflow filename");
  }
  if (slug && stem === slug) {
    score += 38;
    reasons.push("exact slug");
  }
  if (slug && stem.includes(slug)) {
    score += 28;
    reasons.push("slug in filename");
  }
  if (name && stem.includes(name)) {
    score += 18;
    reasons.push("item name in filename");
  }
  if (type && stem.includes(type)) {
    score += 5;
    reasons.push("collection prefix");
  }
  if (purpose && stem.includes(purpose)) {
    score += 8;
    reasons.push("field purpose");
  }

  for (const token of tokenSet(slug)) {
    if (fileTokens.has(token)) score += 2;
  }
  for (const token of tokenSet(name)) {
    if (fileTokens.has(token)) score += 1;
  }

  return { file, score, reasons };
}

function confidenceFor(score) {
  if (score >= 80) return "high";
  if (score >= 34) return "medium";
  if (score >= 18) return "low";
  return "none";
}

function isCopyEligible(confidence, candidates) {
  if (confidence === "high") return true;
  if (confidence !== "medium") return false;
  if (candidates.length < 2) return true;
  return candidates[0].score - candidates[1].score >= 12;
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

function cleanedFilename(row, sourceFile) {
  const type = collectionType(row.collection);
  const purpose = publicPurpose(row.field_name);
  const slug = cleanFilenameBase(row.item_slug || row.item_name || path.basename(sourceFile, path.extname(sourceFile)));
  const ext = normalizeExtension(path.extname(sourceFile || decodedUrlFilename(row.original_webflow_url || "") || ".jpg") || ".jpg");
  return `${type}-${slug}-${purpose}${ext}`;
}

function publicPathFor(row, sourceFile) {
  const type = collectionType(row.collection);
  const folder = publicFolderForType(type);
  return `/images/${folder}/${cleanedFilename(row, sourceFile)}`;
}

function publicPathToFile(publicPath) {
  return path.join(SITE_DIR, "public", publicPath.replace(/^\//, ""));
}

function filesIdentical(source, dest) {
  if (!source || !dest || !fs.existsSync(source) || !fs.existsSync(dest)) return false;
  if (fs.statSync(source).size !== fs.statSync(dest).size) return false;
  return fs.readFileSync(source).equals(fs.readFileSync(dest));
}

function publicFromFile(file) {
  return `/${path.relative(path.join(SITE_DIR, "public"), file).replace(/\\/g, "/")}`;
}

function resolvedPublishedPath(defaultPublicPath, sourceFile) {
  const defaultFile = publicPathToFile(defaultPublicPath);
  if (!fs.existsSync(defaultFile)) return { publicPath: defaultPublicPath, ready: false };
  if (filesIdentical(sourceFile, defaultFile)) return { publicPath: defaultPublicPath, ready: true };

  const parsed = path.parse(defaultFile);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!fs.existsSync(candidate)) break;
    if (filesIdentical(sourceFile, candidate)) {
      return { publicPath: publicFromFile(candidate), ready: true };
    }
  }

  return { publicPath: defaultPublicPath, ready: false };
}

function isRiskyFilename(filename) {
  return /\s|_|,|\(|\)|[A-Z]|[^a-zA-Z0-9._() -]/.test(filename) || filename.length > 100;
}

function csvLine(row) {
  return row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
}

function sourceInventory() {
  const byName = new Map();
  const bySize = new Map();
  const matchedHighConfidence = new Set();

  for (const file of localFiles) {
    const nameKey = path.basename(file).toLowerCase();
    byName.set(nameKey, [...(byName.get(nameKey) || []), file]);
    const size = fs.statSync(file).size;
    bySize.set(size, [...(bySize.get(size) || []), file]);
  }

  for (const row of trackerItems) {
    const best = localFiles.map((file) => scoreFile(row, file)).sort((a, b) => b.score - a.score)[0];
    if (best && confidenceFor(best.score) === "high") matchedHighConfidence.add(best.file);
  }

  const files = localFiles.map((file) => {
    const stat = fs.statSync(file);
    const filename = path.basename(file);
    const ext = path.extname(file);
    return {
      filename,
      currentSourcePath: rel(file),
      extension: ext.toLowerCase(),
      sizeBytes: stat.size,
      hasSpaces: /\s/.test(filename),
      hasSpecialCharacters: /[^a-zA-Z0-9._() -]/.test(filename),
      isVeryLong: filename.length > 100,
      hasUppercaseExtension: ext !== ext.toLowerCase(),
      riskyName: isRiskyFilename(filename),
      highConfidenceTrackerMatch: matchedHighConfidence.has(file)
    };
  });

  const duplicateFilenames = [...byName.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([filename, values]) => ({ filename, count: values.length, paths: values.map(rel) }));
  const possibleDuplicates = [...bySize.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([sizeBytes, values]) => ({
      sizeBytes: Number(sizeBytes),
      files: values.map((file) => ({ filename: path.basename(file), path: rel(file) }))
    }));

  return {
    generatedAt: new Date().toISOString(),
    sourceFolder: rel(SOURCE_MEDIA_DIR),
    totalFiles: localFiles.length,
    totalSizeBytes: files.reduce((total, file) => total + file.sizeBytes, 0),
    fileTypes: Object.entries(
      files.reduce((acc, file) => {
        acc[file.extension] = (acc[file.extension] || 0) + 1;
        return acc;
      }, {})
    ).map(([extension, count]) => ({ extension, count })),
    duplicateFilenames,
    filesWithSpaces: files.filter((file) => file.hasSpaces),
    filesWithSpecialCharacters: files.filter((file) => file.hasSpecialCharacters),
    filesWithVeryLongNames: files.filter((file) => file.isVeryLong),
    filesWithUppercaseExtensions: files.filter((file) => file.hasUppercaseExtension),
    possibleDuplicates,
    files,
    highConfidenceMatchedFiles: files.filter((file) => file.highConfidenceTrackerMatch).length
  };
}

const matchedSourceFiles = new Set();
const items = trackerItems.map((row) => {
  const notes = [];
  const candidates = localFiles.map((file) => scoreFile(row, file)).sort((a, b) => b.score - a.score);
  const best = candidates[0] || null;
  const confidence = best ? confidenceFor(best.score) : "none";
  const sourceFile = confidence === "none" ? "" : best.file;
  const copyEligible = sourceFile ? isCopyEligible(confidence, candidates) : false;
  const defaultPublicPath = copyEligible ? publicPathFor(row, sourceFile) : "";
  const published = defaultPublicPath ? resolvedPublishedPath(defaultPublicPath, sourceFile) : { publicPath: "", ready: false };
  const publicPath = published.publicPath;
  const publicPathReady = published.ready;

  if (sourceFile) {
    matchedSourceFiles.add(sourceFile);
    notes.push(`Best source match scored ${best.score}: ${best.reasons.join(", ") || "filename similarity"}.`);
  } else {
    notes.push("No source media file matched this tracker row.");
  }
  if (confidence === "low") notes.push("Low confidence match requires owner review before copying.");
  if (confidence === "medium" && !copyEligible) notes.push("Medium confidence match has competing candidates and was not copy eligible.");
  if (copyEligible && !publicPathReady) notes.push("Copy eligible; public image has not been copied yet.");
  if (publicPathReady) notes.push("Public image exists and is preferred for rendering.");

  return {
    collection: row.collection || "",
    itemName: row.item_name || "",
    itemSlug: row.item_slug || "",
    fieldName: row.field_name || "",
    originalWebflowUrl: row.original_webflow_url || "",
    localFilename: sourceFile ? path.basename(sourceFile) : row.current_local_filename || "",
    currentLocalPath: sourceFile ? rel(sourceFile) : "",
    originalSourcePath: sourceFile ? rel(sourceFile) : "",
    cleanedFilename: sourceFile ? cleanedFilename(row, sourceFile) : "",
    suggestedFilename: sourceFile ? cleanedFilename(row, sourceFile) : "",
    suggestedPublicPath: publicPath || (sourceFile ? publicPathFor(row, sourceFile) : ""),
    publicPath,
    publicPathReady,
    priority: rowPriority(row),
    status: publicPathReady ? "published" : copyEligible ? "matched" : sourceFile ? "needs_review" : "missing",
    matchStatus: publicPathReady ? "published" : copyEligible ? "copy_ready" : sourceFile ? "review_required" : "missing",
    confidence,
    matchConfidence: confidence,
    needsOwnerReview: confidence === "low" || (confidence === "medium" && !copyEligible) || !sourceFile,
    notes
  };
});

const unmatchedLocalFiles = localFiles
  .filter((file) => !matchedSourceFiles.has(file))
  .map((file) => ({
    filename: path.basename(file),
    currentPath: rel(file),
    fileType: path.extname(file).toLowerCase(),
    sizeBytes: fs.statSync(file).size,
    possibleMatch: "",
    reason: "No tracker row matched this local file.",
    status: "unmatched",
    notes: ["Review manually before publishing."]
  }));
const missingLocalFiles = items.filter((item) => !item.currentLocalPath);
const unresolvedItems = items.filter((item) => item.needsOwnerReview || !item.publicPathReady);
const riskyFiles = localFiles
  .filter((file) => isRiskyFilename(path.basename(file)))
  .map((file) => ({
    filename: path.basename(file),
    currentPath: rel(file),
    suggestedFilename: `${cleanFilenameBase(path.basename(file, path.extname(file)).replace(/^[a-f0-9]{24}_/i, ""))}${normalizeExtension(path.extname(file))}`
  }));
const inventory = sourceInventory();

const mediaMap = {
  generatedAt: new Date().toISOString(),
  mediaSourceFolder: "/cms-exports/CMS Media/",
  actualMediaSourceFolder: rel(SOURCE_MEDIA_DIR),
  publicImagesFolder: "site/public/images/",
  items,
  unmatchedLocalFiles,
  missingLocalFiles,
  unresolvedItems,
  riskyFiles
};

writeJson(MEDIA_MAP_PATH, mediaMap);
writeJson(path.join(ROOT_DIR, "migration-prep", "phase-5-source-media-inventory.json"), inventory);

const inventoryReport = [
  "# Phase 5 Source Media Inventory\n",
  `Generated at: ${inventory.generatedAt}`,
  `- Source folder: ${escapeMd(inventory.sourceFolder)}`,
  `- Total media files found: ${inventory.totalFiles}`,
  `- Total size: ${Math.round(inventory.totalSizeBytes / 1024 / 1024)} MB`,
  `- File types: ${inventory.fileTypes.map((item) => `${item.extension || "(none)"} (${item.count})`).join(", ") || "none"}`,
  `- Duplicate filenames: ${inventory.duplicateFilenames.length}`,
  `- Files with spaces: ${inventory.filesWithSpaces.length}`,
  `- Files with special characters: ${inventory.filesWithSpecialCharacters.length}`,
  `- Files with very long names: ${inventory.filesWithVeryLongNames.length}`,
  `- Files with uppercase extensions: ${inventory.filesWithUppercaseExtensions.length}`,
  `- Possible duplicates by size: ${inventory.possibleDuplicates.length}`,
  `- High-confidence matched source files: ${inventory.highConfidenceMatchedFiles}`,
  `- Files not matched to tracker rows: ${unmatchedLocalFiles.length}`,
  "\n## Duplicate Filename Sample\n",
  ...(inventory.duplicateFilenames.length
    ? inventory.duplicateFilenames.slice(0, 40).map((item) => `- ${escapeMd(item.filename)} (${item.count})`)
    : ["- None"]),
  "\n## Risky Filename Sample\n",
  ...(riskyFiles.length
    ? riskyFiles.slice(0, 60).map((file) => `- ${escapeMd(file.filename)} -> ${escapeMd(file.suggestedFilename)}`)
    : ["- None"]),
  "\n## Unmatched Source File Sample\n",
  ...(unmatchedLocalFiles.length ? unmatchedLocalFiles.slice(0, 60).map((file) => `- ${escapeMd(file.currentPath)}`) : ["- None"])
];
fs.writeFileSync(path.join(ROOT_DIR, "migration-prep", "phase-5-source-media-inventory.md"), `${inventoryReport.join("\n")}\n`);

const report = [
  "# Media Map Report\n",
  `Generated at: ${mediaMap.generatedAt}`,
  `- Total tracker rows: ${trackerItems.length}`,
  `- Total source media files found: ${localFiles.length}`,
  `- Published media rows: ${items.filter((item) => item.publicPathReady).length}`,
  `- Copy-ready media rows: ${items.filter((item) => item.matchStatus === "copy_ready").length}`,
  `- High-confidence matches: ${items.filter((item) => item.matchConfidence === "high").length}`,
  `- Medium-confidence matches: ${items.filter((item) => item.matchConfidence === "medium").length}`,
  `- Low-confidence matches: ${items.filter((item) => item.matchConfidence === "low").length}`,
  `- Missing media rows: ${missingLocalFiles.length}`,
  `- Unmatched source files: ${unmatchedLocalFiles.length}`,
  `- Files with risky source names: ${riskyFiles.length}`,
  `- Inventory records from Phase 1: ${phaseOneInventory.length}`,
  "\n## Recommended Manual Fixes\n",
  "- Review low-confidence and unmatched files in the Phase 5 owner review report.",
  "- Keep the source CMS Media folder unchanged; publishable copies belong under `site/public/images/`.",
  "- Use `npm run media:copy:dry` before every write copy run.",
  "\n## Suggested Filename Cleanup Sample\n",
  ...(riskyFiles.length ? riskyFiles.slice(0, 40).map((file) => `- ${escapeMd(file.filename)} -> ${escapeMd(file.suggestedFilename)}`) : ["- None"]),
  "\n## Unmatched Source Files Sample\n",
  ...(unmatchedLocalFiles.length ? unmatchedLocalFiles.slice(0, 40).map((file) => `- ${escapeMd(file.currentPath)}`) : ["- None"])
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "media-map-report.md"), `${report.join("\n")}\n`);

const unmatchedRows = [
  ["filename", "current_source_path", "file_type", "size_bytes", "possible_match", "reason", "status", "notes"],
  ...unmatchedLocalFiles.map((file) => [
    file.filename,
    file.currentPath,
    file.fileType,
    file.sizeBytes,
    file.possibleMatch,
    file.reason,
    file.status,
    file.notes.join("; ")
  ])
];
fs.writeFileSync(
  path.join(ROOT_DIR, "migration-prep", "phase-5-unmatched-media-files.csv"),
  `${unmatchedRows.map(csvLine).join("\n")}\n`
);

const missingRows = [
  ["collection", "item_name", "item_slug", "field_name", "original_webflow_url", "expected_filename", "public_path", "status", "notes"],
  ...items
    .filter((item) => !item.publicPathReady)
    .map((item) => [
      item.collection,
      item.itemName,
      item.itemSlug,
      item.fieldName,
      item.originalWebflowUrl,
      item.cleanedFilename || item.suggestedFilename,
      item.publicPath || item.suggestedPublicPath,
      item.matchStatus,
      item.notes.join("; ")
    ])
];
fs.writeFileSync(
  path.join(ROOT_DIR, "migration-prep", "phase-5-missing-media-after-copy.csv"),
  `${missingRows.map(csvLine).join("\n")}\n`
);

const ownerReview = [
  "# Phase 5 Media Owner Review\n",
  `Generated at: ${mediaMap.generatedAt}`,
  `- Media tracker rows fully resolved: ${items.filter((item) => item.publicPathReady).length}`,
  `- Media tracker rows unresolved: ${items.filter((item) => !item.publicPathReady).length}`,
  `- Source files unmatched: ${unmatchedLocalFiles.length}`,
  `- Possible duplicate groups by size: ${inventory.possibleDuplicates.length}`,
  `- Pages may still rely on placeholders for unresolved rows: ${items.filter((item) => !item.publicPathReady).length}`,
  "\n## Highest Priority Unresolved Rows\n",
  ...items
    .filter((item) => !item.publicPathReady)
    .sort((a, b) => {
      const weight = { High: 0, Medium: 1, Low: 2 };
      return (weight[a.priority] ?? 3) - (weight[b.priority] ?? 3) || a.collection.localeCompare(b.collection);
    })
    .slice(0, 80)
    .map((item) => `- ${escapeMd(item.priority)}: ${escapeMd(item.collection)} / ${escapeMd(item.itemName)} / ${escapeMd(item.fieldName)} (${escapeMd(item.matchStatus)})`),
  "\n## Recommended Owner Action\n",
  "- Review low-confidence rows first, then unmatched source files.",
  "- Confirm whether unresolved category thumbnails and secondary gallery images are needed for launch.",
  "- Do not edit files in the source CMS Media backup folder; future cleanup should happen on copied public files only."
];
fs.writeFileSync(path.join(ROOT_DIR, "migration-prep", "phase-5-media-owner-review.md"), `${ownerReview.join("\n")}\n`);

console.log(`Built media map with ${items.length} tracker rows and ${localFiles.length} source media files`);
