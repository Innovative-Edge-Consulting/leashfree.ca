import fs from "node:fs";
import path from "node:path";
import {
  CMS_SCHEMA_PATH,
  GENERATED_DIR,
  ROOT_DIR,
  canonicalFor,
  collectionFileName,
  ensureDir,
  escapeMd,
  getBody,
  getDescription,
  getSeoDescription,
  parseCsv,
  referenceFieldNames,
  readJson,
  rowToObject,
  slugify,
  writeJson
} from "./lib.js";

const schema = readJson(CMS_SCHEMA_PATH);
const report = [];
const index = [];

ensureDir(GENERATED_DIR);
report.push("# CMS Conversion Report\n");
report.push(`Generated at: ${new Date().toISOString()}\n`);
report.push("The conversion preserves every source CSV column under each item's `raw` field.\n");

for (const collection of schema) {
  const sourcePath = path.join(ROOT_DIR, collection.collectionFile);
  const outputFile = collectionFileName(collection.inferredCollectionName);
  const outputPath = path.join(GENERATED_DIR, outputFile);
  const warnings = [];

  let rows = [];
  try {
    rows = parseCsv(fs.readFileSync(sourcePath, "utf8"));
  } catch (error) {
    warnings.push(`Could not read source file: ${error.message}`);
  }

  const headers = rows[0] || [];
  const records = rows.slice(1).map((row) => rowToObject(headers, row));
  const seenSlugs = new Map();
  let missingSlugCount = 0;
  let missingNameCount = 0;
  let duplicateSlugCount = 0;

  const items = records.map((raw, rowIndex) => {
    const sourceRow = rowIndex + 2;
    const name = String(raw[collection.likelyNameField] || "").trim();
    const slug = String(raw[collection.likelySlugField] || "").trim();
    const title = raw["Blog Header (H1 Override)"] || raw["Park Header"] || raw["Header 1"] || raw["H1"] || raw["H2 Subheading"] || name;
    const seoTitle = raw["Meta Title"] || raw["SEO Title"] || raw["SEO Title Tag"] || raw["OG Title"] || title;
    const metaDescription = raw["Meta Description"] || raw["OG Description"] || getSeoDescription(raw, collection.inferredCollectionName, name);
    const description = getDescription(raw);
    const body = getBody(raw);
    const rowWarnings = [];

    if (!slug) {
      missingSlugCount += 1;
      rowWarnings.push("Missing slug.");
    } else if (seenSlugs.has(slug)) {
      duplicateSlugCount += 1;
      rowWarnings.push(`Duplicate slug also seen on row ${seenSlugs.get(slug)}.`);
    } else {
      seenSlugs.set(slug, sourceRow);
    }

    if (!name) {
      missingNameCount += 1;
      rowWarnings.push("Missing title/name field.");
    }

    const media = collection.mediaFields
      .map((fieldName) => {
        const value = raw[fieldName] || "";
        const urls = [...String(value).matchAll(/https?:\/\/[^\s,\]")]+/gi)].map((match) => match[0]);
        return {
          fieldName,
          value,
          originalUrls: urls
        };
      })
      .filter((entry) => entry.value || entry.originalUrls.length);

    const referenceFields = referenceFieldNames(collection.inferredCollectionName);
    const references = Object.fromEntries(
      referenceFields
        .filter((fieldName) => raw[fieldName])
        .map((fieldName) => [
          fieldName,
          String(raw[fieldName])
            .split(/[,;|]/)
            .map((value) => value.trim())
            .filter(Boolean)
        ])
    );

    if (rowWarnings.length) {
      warnings.push(`Row ${sourceRow}: ${rowWarnings.join(" ")}`);
    }

    return {
      id: raw["Item ID"] || "",
      name,
      slug,
      title: title || name,
      seoTitle,
      metaDescription,
      description,
      body,
      collection: collection.inferredCollectionName,
      sourceFile: collection.collectionFile,
      canonicalUrl: slug ? canonicalFor(collection.inferredCollectionName, slug) : "",
      routePath: slug ? new URL(canonicalFor(collection.inferredCollectionName, slug)).pathname : "",
      media,
      references,
      raw,
      warnings: rowWarnings
    };
  });

  writeJson(outputPath, items);
  index.push({
    collection: collection.inferredCollectionName,
    file: outputFile,
    itemCount: items.length,
    routePrefix: new URL(canonicalFor(collection.inferredCollectionName, "example")).pathname.replace("example/", "")
  });

    const mappedFields = [
    collection.likelyNameField,
    collection.likelySlugField,
    ...collection.seoFields,
    ...collection.mediaFields,
    ...referenceFieldNames(collection.inferredCollectionName)
  ].filter(Boolean);
  const rawOnly = headers.filter((header) => !mappedFields.includes(header));

  report.push(`## ${collection.inferredCollectionName}\n`);
  report.push(`- Source: \`${collection.collectionFile}\``);
  report.push(`- Output: \`${outputFile}\``);
  report.push(`- Items converted: ${items.length}`);
  report.push(`- Missing slugs: ${missingSlugCount}`);
  report.push(`- Duplicate slugs: ${duplicateSlugCount}`);
  report.push(`- Missing title/name values: ${missingNameCount}`);
  report.push(`- Fields mapped: ${mappedFields.map(escapeMd).join(", ") || "none"}`);
  report.push(`- Fields left raw only: ${rawOnly.map(escapeMd).join(", ") || "none"}`);
  report.push(`- Rows with warnings: ${warnings.length}`);
  if (warnings.length) {
    report.push("\nWarnings:");
    for (const warning of warnings.slice(0, 40)) report.push(`- ${escapeMd(warning)}`);
    if (warnings.length > 40) report.push(`- ${warnings.length - 40} additional warnings not shown.`);
  }
  report.push("");
}

writeJson(path.join(GENERATED_DIR, "collections-index.json"), index);
fs.writeFileSync(path.join(GENERATED_DIR, "conversion-report.md"), `${report.join("\n")}\n`);
console.log(`Converted ${schema.length} CMS collections into ${GENERATED_DIR}`);
