import fs from "node:fs";
import path from "node:path";
import {
  GENERATED_DIR,
  MEDIA_MAP_PATH,
  canonicalFor,
  collectionFileName,
  ensureDir,
  escapeMd,
  readJson
} from "./lib.js";

const indexPath = path.join(GENERATED_DIR, "collections-index.json");
const index = fs.existsSync(indexPath) ? readJson(indexPath) : [];
const mediaMap = fs.existsSync(MEDIA_MAP_PATH) ? readJson(MEDIA_MAP_PATH) : { items: [], missingLocalFiles: [] };
const strictMedia = process.env.STRICT_MEDIA === "1";
const reviewMediaBacklog = process.env.REVIEW_MEDIA_BACKLOG === "1";
const errors = [];
const seoWarnings = [];
const mediaWarnings = [];
const dataWarnings = [];
const ownerReviewItems = [];
const routeMap = new Map();
const counts = [];

for (const collection of index) {
  const filePath = path.join(GENERATED_DIR, collection.file || collectionFileName(collection.collection));
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing generated data file for ${collection.collection}: ${filePath}`);
    continue;
  }

  const items = readJson(filePath);
  const slugs = new Map();
  let emptySeo = 0;
  let emptyMeta = 0;
  let missingSlug = 0;
  let missingName = 0;

  for (const item of items) {
    if (!item.slug) {
      missingSlug += 1;
      dataWarnings.push(`${collection.collection}: item ${item.id || "(no id)"} is missing a slug.`);
    } else if (slugs.has(item.slug)) {
      dataWarnings.push(`${collection.collection}: duplicate slug ${item.slug}.`);
    } else {
      slugs.set(item.slug, item);
    }

    if (!item.name && !item.title) {
      missingName += 1;
      dataWarnings.push(`${collection.collection}: item ${item.id || item.slug || "(unknown)"} is missing name/title.`);
    }

    if (!item.seoTitle) {
      emptySeo += 1;
      seoWarnings.push(`${collection.collection}:${item.slug || item.id} is missing SEO title fallback.`);
    }
    if (!item.metaDescription) {
      emptyMeta += 1;
      seoWarnings.push(`${collection.collection}:${item.slug || item.id} is missing meta description fallback.`);
    }

    if (item.slug) {
      const route = new URL(canonicalFor(collection.collection, item.slug)).pathname;
      if (routeMap.has(route)) {
        ownerReviewItems.push(`Generated route collision: ${route} used by ${routeMap.get(route)} and ${collection.collection}:${item.slug}.`);
      } else {
        routeMap.set(route, `${collection.collection}:${item.slug}`);
      }
    }

    for (const [fieldName, values] of Object.entries(item.references || {})) {
      if (Array.isArray(values) && values.some((value) => value.length > 240)) {
        dataWarnings.push(`${collection.collection}:${item.slug} has unusually long reference value in ${fieldName}.`);
      }
    }
  }

  counts.push({
    collection: collection.collection,
    items: items.length,
    missingSlug,
    missingName,
    emptySeo,
    emptyMeta,
    duplicateSlugs: items.length - slugs.size - missingSlug
  });
}

const missingMedia = mediaMap.missingLocalFiles || [];
const unmatchedLocalFiles = mediaMap.unmatchedLocalFiles || [];
const riskyFiles = mediaMap.riskyFiles || [];
if (strictMedia) {
  if (missingMedia.length) {
    mediaWarnings.push(`${missingMedia.length} media tracker rows do not have a matched local file yet.`);
  }
  if (unmatchedLocalFiles.length) {
    mediaWarnings.push(`${unmatchedLocalFiles.length} local media files do not match tracker rows yet.`);
  }
  if (riskyFiles.length) {
    mediaWarnings.push(`${riskyFiles.length} local media files have risky names for publishing.`);
  }
} else if (reviewMediaBacklog) {
  if (missingMedia.length) {
    ownerReviewItems.push(`[media] ${missingMedia.length} tracker rows are missing source files (backlog, non-blocking by default).`);
  }
  if (unmatchedLocalFiles.length) {
    ownerReviewItems.push(`[media] ${unmatchedLocalFiles.length} local media files remain unmatched to tracker rows.`);
  }
  if (riskyFiles.length) {
    ownerReviewItems.push(`[media] ${riskyFiles.length} source files still use risky naming conventions.`);
  }
}

const warnings = [...seoWarnings, ...mediaWarnings, ...dataWarnings, ...ownerReviewItems];

const report = [
  "# Validation Report\n",
  `Generated at: ${new Date().toISOString()}\n`,
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,
  `- SEO warnings: ${seoWarnings.length}`,
  `- Media warnings: ${mediaWarnings.length}`,
  `- Data quality warnings: ${dataWarnings.length}`,
  `- Owner review items: ${ownerReviewItems.length}`,
  `- Generated routes checked: ${routeMap.size}`,
  `- Media tracker rows missing local files: ${missingMedia.length}`,
  "\n## Counts By Collection\n",
  "| Collection | Items | Missing Slugs | Missing Names | Empty SEO Titles | Empty Meta Descriptions | Duplicate Slugs |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...counts.map((row) => `| ${escapeMd(row.collection)} | ${row.items} | ${row.missingSlug} | ${row.missingName} | ${row.emptySeo} | ${row.emptyMeta} | ${row.duplicateSlugs} |`),
  "\n## Errors\n",
  ...(errors.length ? errors.map((error) => `- ${escapeMd(error)}`) : ["- None"]),
  "\n## SEO Warnings\n",
  ...(seoWarnings.length ? seoWarnings.map((warning) => `- ${escapeMd(warning)}`) : ["- None"]),
  "\n## Media Warnings\n",
  ...(mediaWarnings.length ? mediaWarnings.map((warning) => `- ${escapeMd(warning)}`) : ["- None"]),
  "\n## Data Quality Warnings\n",
  ...(dataWarnings.length ? dataWarnings.slice(0, 120).map((warning) => `- ${escapeMd(warning)}`) : ["- None"]),
  dataWarnings.length > 120 ? `- ${dataWarnings.length - 120} additional data warnings not shown.` : "",
  "\n## Recommended Owner Review Items\n",
  ...(ownerReviewItems.length ? ownerReviewItems.map((item) => `- ${escapeMd(item)}`) : ["- No generated route collisions detected. Confirm future route ownership policy for shared `/dog-parks/{slug}/` namespace."]),
  "- Complete local media matching for rows listed in the media map report.",
  "- Review generated SEO fallbacks before launch."
].filter(Boolean);

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "validation-report.md"), `${report.join("\n")}\n`);

if (errors.length) {
  console.error(`Validation completed with ${errors.length} errors and ${warnings.length} warnings`);
  process.exitCode = 1;
} else {
  console.log(`Validation completed with ${warnings.length} warnings (${seoWarnings.length} SEO, ${mediaWarnings.length} media, ${dataWarnings.length} data, ${ownerReviewItems.length} owner review)`);
}
