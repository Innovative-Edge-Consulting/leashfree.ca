import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "bishops-park";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/bishops-park-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Bishop's Park On-Leash Guide | Hamilton | LeashFree.ca";
const expectedDescription = "Plan an on-leash visit to Bishop's Park in Hamilton: official address, parkette size, shaded benches, asphalt path, dog rules and renewal timeline.";
const expectedCanonical = "https://leashfree.ca/dog-parks/bishops-park/";
const expectedSource = "https://www.hamilton.ca/things-do/parks-green-space/creating-improving-parks/park-projects/bishops-park";
const expectedReviewed = "2026-08-28T12:00:00.000Z";
const expectedAlt = "Realistic digital illustration of a leashed dog and handler on the shaded asphalt path at Bishop's Park in Hamilton";

function parseCsv(text) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function updateManifest(patch, nextPriorityPage = "Bishop's Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Bishop's Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Bishop's Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

const implementationChecks = {
  content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete",
  imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-complete", backlog: "implementation-complete", renderedPage: "verification-pending"
};

if (markVerification) {
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed." });
  console.log("Marked Bishop's Park verification-pending."); process.exit(0);
}

const failures = []; const check = (condition, label) => { if (!condition) failures.push(label); }; const match = (text, expression) => text.match(expression)?.[1] || "";
const html = fs.readFileSync(htmlPath, "utf8");
const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")
  .replace(/&(?:nbsp|#xA0);/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;|&apos;/gi, "'").replace(/&quot;|“|”/gi, '"').replace(/&ndash;|–/gi, "–").replace(/\s+/g, " ").trim();
const title = match(html, /<title>([^<]+)<\/title>/i).replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&"); const description = match(html, /<meta name="description" content="([^"]*)"/i); const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].flatMap((entry) => { const parsed = JSON.parse(entry[1]); return Array.isArray(parsed) ? parsed : [parsed]; });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park"); const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage"); const breadcrumbSchema = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

check(title === expectedTitle, "SEO title mismatch"); check(description === expectedDescription, "meta description mismatch"); check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 28, 2026"), "Reviewed On text missing"); check(visibleText.includes("On-Leash Parkette Guide") && visibleText.includes("does not appear in Hamilton's current dog-park and free-running-area inventory"), "on-leash parkette identity missing");
check(visibleText.includes("91 East Avenue South") && visibleText.includes("Hunter Street East") && visibleText.includes("Stinson neighbourhood"), "confirmed address or neighbourhood missing");
check(visibleText.includes("approximately 890 square metres") && visibleText.includes("0.0889 hectares"), "confirmed park size missing");
check(visibleText.includes("large canopy trees") && visibleText.includes("shaded bench seating") && visibleText.includes("asphalt path"), "confirmed current features missing");
check(visibleText.includes("not a secure dog enclosure") && visibleText.includes("ornamental metal fence"), "fence limitation missing");
check(visibleText.includes("summer and fall 2026") && visibleText.includes("spring 2027") && visibleText.includes("summer 2027"), "renewal timeline missing");
check(visibleText.includes("leash shorter than two metres") && visibleText.includes("licence tag") && visibleText.includes("Smoking and vaping are prohibited"), "Hamilton dog or park rules missing");
check(visibleText.includes("does not currently publish dedicated park hours") && visibleText.includes("parking arrangements") && visibleText.includes("washrooms"), "unknown visitor details disclosure missing");
check(!visibleText.includes("7:00 AM") && !visibleText.includes("9:00 PM") && !visibleText.includes("L8N 2T6") && !visibleText.includes("0.25 acres"), "unsupported legacy facts visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|previously attached|improved page|built-in imagegen|route should|this page keeps|reviewed city sources)/i.test(visibleText), "internal process language visible");

check(Boolean(breadcrumbSchema), "Breadcrumb schema missing"); check(Boolean(parkSchema), "Park schema missing"); check(parkSchema?.name === "Bishop's Park", "Park schema name mismatch");
check(parkSchema?.address?.streetAddress === "91 East Avenue South" && parkSchema?.address?.addressLocality === "Hamilton" && parkSchema?.address?.addressRegion === "Ontario" && parkSchema?.address?.postalCode === undefined, "Park schema address mismatch");
check(String(parkSchema?.geo?.latitude) === "43.2501760807" && String(parkSchema?.geo?.longitude) === "-79.8563443629", "Park schema coordinates mismatch"); check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(Array.isArray(parkSchema?.amenityFeature) && parkSchema.amenityFeature.length === 2 && parkSchema.amenityFeature.some((item) => item.name === "Benches") && parkSchema.amenityFeature.some((item) => item.name === "Shade"), "Park schema amenity set mismatch");
check(Boolean(faqSchema), "FAQ schema missing"); check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch"); check(faqSchema?.mainEntity?.length === 8, "FAQ schema count mismatch"); check(html.includes(`href="${expectedSource}"`), "official source link missing");

check(html.includes(imageSource), "intended source image missing"); check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) for (const format of ["avif", "webp", "jpg"]) { const derivative = `/images/optimized/dog-parks/bishops-park-original/${width}.${format}`; check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`); check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`); }
const pageHeaderHtml = match(html, /(<section class="page-header">[\s\S]*?<\/section>)/i).toLowerCase(); for (const fallback of ["dog-park-default", "default-dog", "/images/cities/city-hamilton"]) check(!pageHeaderHtml.includes(fallback), `unintended hero fallback marker present: ${fallback}`);
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override missing"); check(fs.readFileSync("src/pages/dog-parks/[slug].astro", "utf8").includes(`"${slug}": "${expectedAlt}"`), "hero alt override missing");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8")); const park = parks.find((item) => item.slug === slug); check(Boolean(park), "generated JSON record missing");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch"); check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch"); check(park?.raw?.City === "Hamilton" && park?.raw?.Province === "Ontario", "JSON locality mismatch");
check(park?.raw?.["Street Address"] === "91 East Avenue South" && park?.raw?.latitude === "43.2501760807" && park?.raw?.longitude === "-79.8563443629" && park?.raw?.["Postal Code"] === "" && park?.raw?.["Google Maps Link"] === "", "JSON location fields mismatch");
check(park?.raw?.["Reviewed On"] === "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch"); check(park?.raw?.["Updated On"] === "Sat Jun 14 2025 21:43:16 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On unexpectedly changed");
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0]; const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); check(Boolean(csvRow), "CMS CSV record missing");
if (park && csvRow) for (const [key, value] of Object.entries(park.raw)) { check(headers.includes(key), `CSV column missing: ${key}`); if (headers.includes(key)) check(String(csvRow[headers.indexOf(key)] ?? "") === String(value ?? ""), `JSON-CSV mismatch: ${key}`); }
check(!fs.readFileSync("reports/thin-page-backlog.csv", "utf8").includes(route), "thin-page backlog still contains route"); check(!fs.readFileSync("reports/content-review-queue.csv", "utf8").includes(route), "review queue still contains route");

const derivativeManifest = JSON.parse(fs.readFileSync(derivativeManifestPath, "utf8")); const derivativeEntry = derivativeManifest.images?.[imageSource]; check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch"); check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/bishops-park-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(imagePath).metadata(); check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch"); check(fs.statSync(imagePath).size < 1_000_000, "source image exceeds compressed-size ceiling");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(imagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) { if (file === path.basename(imagePath) || !file.endsWith("-original.png")) continue; const candidate = path.join("public/images/dog-parks", file); const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex"); check(candidateHash !== sourceHash, `source image reused from ${file}`); }

if (failures.length) { console.error(`Bishop's Park audit failed (${failures.length}):`); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
if (finalize) updateManifest({
  status: "passed",
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "verified-in-render", generatedJson: "implementation-complete", csv: "verified-parity", imageMapping: "verified", sourceImage: "verified", optimizedDerivatives: "verified", backlog: "implementation-complete", renderedPage: "verified" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: expectedAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Bishop's Park", sha256: sourceHash, generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed City context only: compact parkette, mature canopy trees, shaded benches, asphalt through-path and ornamental edge fencing. The scene shows one visibly leashed dog and handler, adds no planned fountain or unconfirmed amenity, and is visibly illustrative rather than an actual park photograph." },
  reason: "Completed with current City of Hamilton park-project, municipal GIS, leash-free inventory, pet-etiquette, licensing and smoke-free validation; synchronized on-leash copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact parity, and rendered metadata, schema, source, image, fallback and editorial-marker inspection.",
  nextAction: "Complete; proceed to Colonel Danforth Park on the next page-improvement run."
}, "Colonel Danforth Park");
console.log(`Bishop's Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
