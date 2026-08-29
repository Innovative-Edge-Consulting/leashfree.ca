import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "guindon-park-cornwall";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/guindon-park-cornwall-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Guindon Park Dog Rules & Visit Guide | Cornwall | LeashFree.ca";
const expectedDescription = "Plan a leashed visit to Guindon Park in Cornwall: permitted roadways and Trillium Picnic Area, trail exclusions, washroom hours and current rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/guindon-park-cornwall/";
const expectedSource = "https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/guindon-park/";
const expectedReviewed = "2026-08-28T20:00:00.000Z";
const expectedAlt = "Realistic digital illustration of a leashed dog and handler on a wooded park roadway at Guindon Park in Cornwall";

function parseCsv(text) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (quoted) { if (char === '"' && next === '"') { value += '"'; index += 1; } else if (char === '"') quoted = false; else value += char; }
    else if (char === '"') quoted = true; else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; } else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function updateManifest(patch, nextPriorityPage = "Guindon Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Guindon Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Guindon Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

const implementationChecks = { content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete", imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-complete", backlog: "implementation-complete", renderedPage: "verification-pending" };
if (markVerification) { updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed." }); console.log("Marked Guindon Park verification-pending."); process.exit(0); }

const failures = []; const check = (condition, label) => { if (!condition) failures.push(label); }; const match = (text, expression) => text.match(expression)?.[1] || "";
const html = fs.readFileSync(htmlPath, "utf8");
const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|#xA0);/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;|&apos;/gi, "'").replace(/&quot;|“|”/gi, '"').replace(/&ndash;|–/gi, "–").replace(/\s+/g, " ").trim();
const title = match(html, /<title>([^<]+)<\/title>/i).replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&"); const description = match(html, /<meta name="description" content="([^"]*)"/i); const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].flatMap((entry) => { const parsed = JSON.parse(entry[1]); return Array.isArray(parsed) ? parsed : [parsed]; });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park"); const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage"); const breadcrumbSchema = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

check(title === expectedTitle, "SEO title mismatch"); check(description === expectedDescription, "meta description mismatch"); check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 28, 2026"), "Reviewed On text missing"); check(visibleText.includes("Guindon Park roadways") && visibleText.includes("Trillium Picnic Area"), "dog-permitted area identity missing");
check(visibleText.includes("not an off-leash dog park") && visibleText.includes("nature and ski trails"), "on-leash or trail exclusion missing");
check(visibleText.includes("500-acre") && visibleText.includes("whole park"), "whole-park size context missing");
check(visibleText.includes("east parking lot") && visibleText.includes("8:30 a.m. to 5 p.m.") && visibleText.includes("weather permitting"), "parking or washroom details missing");
check(visibleText.includes("at least nine metres") && visibleText.includes("within 75 metres") && visibleText.includes("boat launch"), "facility or boat-launch restrictions missing");
check(visibleText.includes("no longer than two metres") && visibleText.includes("licence and tag") && visibleText.includes("remove waste"), "Cornwall dog rules missing");
check(!visibleText.includes("K6H 7L2") && !visibleText.includes("45.0331862952299") && !visibleText.includes("6 am – 10 pm") && !visibleText.includes("natural trails, grass"), "unsupported legacy fact visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|previously attached|improved page|built-in imagegen|route should|this page keeps|reviewed city sources)/i.test(visibleText), "internal process language visible");

check(Boolean(breadcrumbSchema), "Breadcrumb schema missing"); check(!parkSchema, "Park schema should be omitted without verified coordinates");
check(Boolean(faqSchema), "FAQ schema missing"); check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch"); check(faqSchema?.mainEntity?.length === 10, "FAQ schema count mismatch"); check(html.includes(`href="${expectedSource}"`), "official source link missing");
check(html.includes(imageSource), "intended source image missing"); check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) for (const format of ["avif", "webp", "jpg"]) { const derivative = `/images/optimized/dog-parks/guindon-park-cornwall-original/${width}.${format}`; check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`); check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`); }
const pageHeaderHtml = match(html, /(<section class="page-header">[\s\S]*?<\/section>)/i).toLowerCase(); for (const fallback of ["dog-park-default", "default-dog", "/images/cities/city-cornwall"]) check(!pageHeaderHtml.includes(fallback), `unintended hero fallback marker present: ${fallback}`);
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override missing"); check(fs.readFileSync("src/pages/dog-parks/[slug].astro", "utf8").includes(`"${slug}": "${expectedAlt}"`), "hero alt override missing");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8")); const park = parks.find((item) => item.slug === slug); check(Boolean(park), "generated JSON record missing");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch"); check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch"); check(park?.raw?.City === "Cornwall" && park?.raw?.Province === "Ontario", "JSON locality mismatch");
check(park?.raw?.["Street Address"] === "Vincent Massey Drive (Highway 2)" && park?.raw?.latitude === "" && park?.raw?.longitude === "" && park?.raw?.["Postal Code"] === "" && park?.raw?.["Google Maps Link"] === "", "JSON location fields mismatch");
check(park?.raw?.["Reviewed On"] === "Fri Aug 28 2026 20:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch"); check(park?.raw?.["Updated On"] === "Fri Jul 11 2025 00:30:19 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On unexpectedly changed");
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0]; const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); check(Boolean(csvRow), "CMS CSV record missing");
if (park && csvRow) for (const [key, value] of Object.entries(park.raw)) { check(headers.includes(key), `CSV column missing: ${key}`); if (headers.includes(key)) check(String(csvRow[headers.indexOf(key)] ?? "") === String(value ?? ""), `JSON-CSV mismatch: ${key}`); }
check(!fs.readFileSync("reports/thin-page-backlog.csv", "utf8").includes(route), "thin-page backlog still contains route"); check(!fs.readFileSync("reports/content-review-queue.csv", "utf8").includes(route), "review queue still contains route");

const derivativeManifest = JSON.parse(fs.readFileSync(derivativeManifestPath, "utf8")); const derivativeEntry = derivativeManifest.images?.[imageSource]; check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch"); check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/guindon-park-cornwall-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(imagePath).metadata(); check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch"); check(fs.statSync(imagePath).size < 1_200_000, "source image exceeds compressed-size ceiling");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(imagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) { if (file === path.basename(imagePath) || !file.endsWith("-original.png")) continue; const candidate = path.join("public/images/dog-parks", file); const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex"); check(candidateHash !== sourceHash, `source image reused from ${file}`); }

if (failures.length) { console.error(`Guindon Park audit failed (${failures.length}):`); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
if (finalize) updateManifest({
  status: "passed",
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "verified-in-render", generatedJson: "implementation-complete", csv: "verified-parity", imageMapping: "verified", sourceImage: "verified", optimizedDerivatives: "verified", backlog: "implementation-complete", renderedPage: "verified" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: expectedAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Guindon Park", sha256: sourceHash, generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed City context only: mature Eastern Ontario woodland beside a park roadway where a dog may be walked on leash. One dog is visibly leashed; no prohibited trail access, waterfront use or unconfirmed amenity is shown, and the scene is visibly illustrative rather than an actual park photograph." },
  reason: "Completed with current City of Cornwall park, animal-control, bylaw and map validation; synchronized limited on-leash visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact parity, and rendered metadata, schema, source, image, fallback and editorial-marker inspection.",
  nextAction: "Complete; proceed to Millers Creek Park on the next page-improvement run."
}, "Millers Creek Park");
console.log(`Guindon Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
