import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "thurlow-dog-park";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/thurlow-dog-park-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Pat Culhane Dog Park (Thurlow) Guide | LeashFree.ca";
const expectedDescription = "Plan a visit to Pat Culhane Dog Park in Belleville with its correct Farnham Road address, fenced small- and large-dog areas, size and current dog rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/thurlow-dog-park/";
const expectedSource = "https://gis.belleville.ca/arcgis/rest/services/BV_GIS/Parkland/MapServer/0";
const expectedReviewed = "2026-08-28T12:00:00.000Z";
const expectedAlt = "Realistic digital illustration of two off-leash dogs in the divided grass runs at Pat Culhane Dog Park in Belleville";
const expectedCoordinates = { latitude: "44.2070609970", longitude: "-77.3944479724" };

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

function updateManifest(patch, nextPriorityPage = "Thurlow Dog Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Thurlow Dog Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Thurlow Dog Park manifest entry end not found");
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
  console.log("Marked Thurlow Dog Park verification-pending."); process.exit(0);
}

const failures = []; const check = (condition, label) => { if (!condition) failures.push(label); }; const match = (text, expression) => text.match(expression)?.[1] || "";
const html = fs.readFileSync(htmlPath, "utf8");
const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")
  .replace(/&(?:nbsp|#xA0);/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;|&apos;/gi, "'").replace(/&quot;|“|”/gi, '"').replace(/&ndash;|–/gi, "–").replace(/\s+/g, " ").trim();
const title = match(html, /<title>([^<]+)<\/title>/i); const description = match(html, /<meta name="description" content="([^"]*)"/i); const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].flatMap((entry) => { const parsed = JSON.parse(entry[1]); return Array.isArray(parsed) ? parsed : [parsed]; });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park"); const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage"); const breadcrumbSchema = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

check(title === expectedTitle, "SEO title mismatch"); check(description === expectedDescription, "meta description mismatch"); check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 28, 2026"), "Reviewed On text missing"); check(visibleText.includes("Pat Culhane Dog Park") && visibleText.includes("Thurlow Dog Park"), "official name or alias missing");
check(visibleText.includes("427 Farnham Road") && visibleText.includes("northeast corner of Maitland Drive and Farnham Road"), "current address or location missing");
check(visibleText.includes("approximately 0.425-hectare") || visibleText.includes("0.42487966 hectares"), "current park area missing");
check(visibleText.includes("perimeter fencing") && visibleText.includes("interior separation for small dogs"), "confirmed divided fencing missing");
check(visibleText.includes("older than three months") && visibleText.includes("valid dog tag"), "current licensing rule missing"); check(visibleText.includes("Pick up waste immediately"), "cleanup rule missing");
check(visibleText.includes("does not currently publish dedicated dog-park hours"), "unknown hours disclosure missing"); check(visibleText.includes("bring drinking water, waste bags and a leash"), "visit preparation missing");
check(!visibleText.includes("516 Harmony") && !visibleText.includes("K8N5J1") && !visibleText.includes("Dawn to Dusk"), "unsupported legacy address, postal code or hours visible");
check(!visibleText.includes("Water source available No") && !visibleText.includes("Parking Available Yes"), "unsupported amenity visible"); check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|previously attached|improved page|built-in imagegen|route should|this page keeps|reviewed city sources)/i.test(visibleText), "internal process language visible");

check(Boolean(breadcrumbSchema), "Breadcrumb schema missing"); check(Boolean(parkSchema), "Park schema missing"); check(parkSchema?.name === "Pat Culhane Dog Park", "Park schema name mismatch"); check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch"); check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch"); check(parkSchema?.address?.streetAddress === "427 Farnham Road", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Belleville" && parkSchema?.address?.addressRegion === "Ontario", "Park schema locality mismatch"); check(!parkSchema?.address?.postalCode, "Park schema should omit unknown postal code");
check(String(parkSchema?.geo?.latitude) === expectedCoordinates.latitude && String(parkSchema?.geo?.longitude) === expectedCoordinates.longitude, "Park schema coordinates mismatch");
const amenities = new Set((parkSchema?.amenityFeature || []).map((item) => item.name)); check(amenities.size === 2 && amenities.has("Fenced area") && amenities.has("Small dog area"), "amenity schema mismatch");
check(Boolean(faqSchema), "FAQ schema missing"); check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch"); check(faqSchema?.mainEntity?.length === 8, "FAQ schema count mismatch"); check(html.includes(`href="${expectedSource}"`), "official source link missing");

check(html.includes(imageSource), "intended source image missing"); check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) for (const format of ["avif", "webp", "jpg"]) { const derivative = `/images/optimized/dog-parks/thurlow-dog-park-original/${width}.${format}`; check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`); check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`); }
const pageHeaderHtml = match(html, /(<section class="page-header">[\s\S]*?<\/section>)/i).toLowerCase(); for (const fallback of ["dog-park-default", "default-dog", "/images/cities/city-belleville"]) check(!pageHeaderHtml.includes(fallback), `unintended hero fallback marker present: ${fallback}`);
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override missing"); check(fs.readFileSync("src/pages/dog-parks/[slug].astro", "utf8").includes(`"${slug}": "${expectedAlt}"`), "hero alt override missing");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8")); const park = parks.find((item) => item.slug === slug); check(Boolean(park), "generated JSON record missing");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch"); check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch"); check(park?.raw?.City === "Belleville" && park?.raw?.Province === "Ontario", "JSON locality mismatch");
check(park?.raw?.latitude === expectedCoordinates.latitude && park?.raw?.longitude === expectedCoordinates.longitude, "JSON coordinates mismatch"); check(park?.raw?.["Postal Code"] === "" && park?.raw?.["Google Maps Link"] === "", "unknown postal code or unsupported map link should be blank");
check(park?.raw?.["Reviewed On"] === "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch"); check(park?.raw?.["Updated On"] === "Wed Jul 02 2025 18:40:09 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On unexpectedly changed");
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0]; const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); check(Boolean(csvRow), "CMS CSV record missing");
if (park && csvRow) for (const [key, value] of Object.entries(park.raw)) { check(headers.includes(key), `CSV column missing: ${key}`); if (headers.includes(key)) check(String(csvRow[headers.indexOf(key)] ?? "") === String(value ?? ""), `JSON-CSV mismatch: ${key}`); }
check(!fs.readFileSync("reports/thin-page-backlog.csv", "utf8").includes(route), "thin-page backlog still contains route"); check(!fs.readFileSync("reports/content-review-queue.csv", "utf8").includes(route), "review queue still contains route");

const derivativeManifest = JSON.parse(fs.readFileSync(derivativeManifestPath, "utf8")); const derivativeEntry = derivativeManifest.images?.[imageSource]; check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch"); check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/thurlow-dog-park-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(imagePath).metadata(); check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch"); check(fs.statSync(imagePath).size < 1_000_000, "source image exceeds compressed-size ceiling");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(imagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) { if (file === path.basename(imagePath) || !file.endsWith("-original.png")) continue; const candidate = path.join("public/images/dog-parks", file); const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex"); check(candidateHash !== sourceHash, `source image reused from ${file}`); }

if (failures.length) { console.error(`Thurlow Dog Park audit failed (${failures.length}):`); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
if (finalize) updateManifest({
  status: "passed",
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "verified-in-render", generatedJson: "implementation-complete", csv: "verified-parity", imageMapping: "verified", sourceImage: "verified", optimizedDerivatives: "verified", backlog: "implementation-complete", renderedPage: "verified" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: expectedAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Pat Culhane Dog Park", sha256: sourceHash, generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed City records only: compact open turf, sparse canopy, perimeter fencing and an interior small-dog separation. The scene adds no unconfirmed amenities and is visibly illustrative rather than an actual park photograph." },
  reason: "Completed with current City park GIS, construction, dedication, master-plan, community-centre, licensing and animal-control validation; synchronized visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact parity, and rendered metadata, schema, source, image, fallback and editorial-marker inspection.",
  nextAction: "Complete; proceed to Barkwood Forest on the next page-improvement run."
}, "Barkwood Forest");
console.log(`Thurlow Dog Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
