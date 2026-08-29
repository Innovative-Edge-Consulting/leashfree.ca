import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "memorial-park-white-rock";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/memorial-park-white-rock-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Memorial Park Dog Guide | White Rock, BC | LeashFree.ca";
const expectedDescription = "Plan a leashed visit to Memorial Park in White Rock: waterfront lawn, benches, washrooms, spray pad, paid parking, hours, promenade access and dog rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/memorial-park-white-rock/";
const expectedSource = "https://www.whiterockcity.ca/398/Parks";
const expectedReviewed = "2026-08-27T12:00:00.000Z";
const expectedAlt = "Realistic digital illustration of a leashed dog and handler beside the sloped waterfront lawn at Memorial Park in White Rock";
const expectedCoordinates = { latitude: "49.0213194049", longitude: "-122.8062016774" };

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
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

function updateManifest(patch, nextPriorityPage = "Memorial Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Memorial Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Memorial Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

const implementationChecks = {
  content: "implementation-complete",
  seo: "implementation-complete",
  structuredData: "implementation-complete",
  generatedJson: "implementation-complete",
  csv: "implementation-complete",
  imageMapping: "implementation-complete",
  sourceImage: "implementation-complete",
  optimizedDerivatives: "implementation-complete",
  backlog: "implementation-complete",
  renderedPage: "verification-pending"
};

if (markVerification) {
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run the production build, repository QA, parity, image, and rendered-page checks before marking the page passed." });
  console.log("Marked Memorial Park verification-pending.");
  process.exit(0);
}

const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const match = (text, expression) => text.match(expression)?.[1] || "";
const html = fs.readFileSync(htmlPath, "utf8");
const visibleText = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&(?:nbsp|#xA0);/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;|“|”/gi, '"')
  .replace(/&ndash;|–/gi, "–")
  .replace(/\s+/g, " ")
  .trim();

const title = match(html, /<title>([^<]+)<\/title>/i);
const description = match(html, /<meta name="description" content="([^"]*)"/i);
const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  .flatMap((entry) => { const parsed = JSON.parse(entry[1]); return Array.isArray(parsed) ? parsed : [parsed]; });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park");
const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage");

check(title === expectedTitle, "SEO title mismatch");
check(description === expectedDescription, "meta description mismatch");
check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 27, 2026"), "Reviewed On text missing");
check(visibleText.includes("15300 Block Marine Drive"), "visitor-directory address missing");
check(visibleText.includes("White Rock") && visibleText.includes("British Columbia"), "city or province missing");
check(visibleText.includes("on-leash waterfront park"), "on-leash identity missing");
check(visibleText.includes("Ruth Johnson Park") && visibleText.includes("off-leash destination"), "correct off-leash alternative missing");
check(visibleText.includes("dawn to dusk"), "regular park hours missing");
check(visibleText.includes("2 a.m. and 5 a.m."), "overnight waterfront restriction missing");
check(visibleText.includes("sloped green lawn") && visibleText.includes("spray pad") && visibleText.includes("Pier washrooms"), "confirmed facilities missing");
check(visibleText.includes("Paid waterfront parking"), "parking guidance missing");
check(visibleText.includes("5:30 a.m. to 9 a.m."), "seasonal Promenade hours missing");
check(visibleText.includes("never permitted on White Rock Pier"), "pier prohibition missing");
check(!visibleText.includes("leash-free before 10 am") && !visibleText.includes("6 am – 10 pm"), "stale legacy hours visible");
check(!visibleText.includes("49.02349328817894") && !visibleText.includes("-122.80570327863806"), "stale coordinates visible");
check(!visibleText.includes("V4B 1C7"), "unsupported postal code visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|improved page)/i.test(visibleText), "internal process language visible");

check(Boolean(parkSchema), "Park schema missing");
check(parkSchema?.name === "Memorial Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(parkSchema?.address?.streetAddress === "15300 Block Marine Drive", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "White Rock", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "British Columbia", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "Park schema should omit unknown postal code");
check(String(parkSchema?.geo?.latitude) === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(String(parkSchema?.geo?.longitude) === expectedCoordinates.longitude, "Park schema longitude mismatch");
const amenities = new Set((parkSchema?.amenityFeature || []).map((item) => item.name));
check(amenities.size === 2 && amenities.has("Benches") && amenities.has("Washrooms"), "amenity schema should contain only confirmed benches and washrooms");
check(Boolean(faqSchema), "FAQ schema missing");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch");
check(faqSchema?.mainEntity?.length === 7, "FAQ schema count mismatch");

check(html.includes(imageSource), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/memorial-park-white-rock-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
check(!html.includes("city-white-rock-hero"), "unintended city fallback image used");
check(!html.includes("british-columbia-dog-parks-hero"), "unintended province fallback image used");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
check(Boolean(park), "generated JSON record missing");
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug);
check(Boolean(csvRow), "CMS CSV record missing");
if (park && csvRow) {
  for (const [key, value] of Object.entries(park.raw)) {
    check(headers.includes(key), `CSV column missing: ${key}`);
    if (headers.includes(key)) check(String(csvRow[headers.indexOf(key)] ?? "") === String(value ?? ""), `JSON-CSV mismatch: ${key}`);
  }
}
check(!fs.readFileSync("reports/thin-page-backlog.csv", "utf8").includes(route), "thin-page backlog still contains route");
check(!fs.readFileSync("reports/content-review-queue.csv", "utf8").includes(route), "review queue still contains route");

const derivativeManifest = JSON.parse(fs.readFileSync(derivativeManifestPath, "utf8"));
const derivativeEntry = derivativeManifest.images?.[imageSource];
check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch");
check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/memorial-park-white-rock-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(imagePath).metadata();
check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch");
check(fs.statSync(imagePath).size < 1_000_000, "source image exceeds 1 MB");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(imagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) {
  if (file === path.basename(imagePath) || !file.endsWith("-original.png")) continue;
  const candidate = path.join("public/images/dog-parks", file);
  const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex");
  check(candidateHash !== sourceHash, `source image reused from ${file}`);
}

if (failures.length) {
  console.error(`Memorial Park audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (finalize) {
  updateManifest({
    status: "passed",
    artifactChecks: {
      content: "implementation-complete",
      seo: "implementation-complete",
      structuredData: "verified-in-render",
      generatedJson: "implementation-complete",
      csv: "verified-parity",
      imageMapping: "verified",
      sourceImage: "verified",
      optimizedDerivatives: "verified",
      backlog: "implementation-complete",
      renderedPage: "verified"
    },
    image: {
      source: imageSource,
      width: 1536,
      height: 1024,
      compressedBytes: fs.statSync(imagePath).size,
      alt: expectedAlt,
      derivatives: [480, 960],
      formats: ["avif", "webp", "jpg"],
      reuse: "unique to Memorial Park in White Rock",
      sha256: sourceHash,
      visualReference: "The current City park photograph shows a compact sloped lawn, curving paved waterfront edge, benches, Semiahmoo Bay at low tide, and a wooded coastal hillside. The generated illustration uses those confirmed characteristics from a different composition, excludes signs and public-art replicas, and shows one dog leashed in the park rather than on the beach or pier."
    },
    reason: "Completed with current City park, dog, waterfront, parking, bylaw, project, and GIS validation; synchronized the on-leash visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback, and editorial-marker inspection.",
    nextAction: "Complete; proceed to White Spruce Park on the next page-improvement run."
  }, "White Spruce Park");
}

console.log(`Memorial Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
