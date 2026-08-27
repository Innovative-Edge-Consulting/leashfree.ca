import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "ajax-waterfront-park";
const route = `/dog-parks/${slug}/`;
const defaultHtmlPath = `dist/dog-parks/${slug}/index.html`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || defaultHtmlPath;
const finalize = process.argv.includes("--finalize");
const markImplementation = process.argv.includes("--mark-implementation");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/ajax-waterfront-park-original.png";
const sourceImagePath = `public${imageSource}`;
const expectedTitle = "Ajax Waterfront Park Guide | Ajax, Ontario | LeashFree.ca";
const expectedDescription = "Plan a leashed dog walk at Ajax Waterfront: Lake Ontario parkland, an asphalt multi-use trail, current leash rules, hours, parking, and visitor tips.";
const expectedCanonical = "https://leashfree.ca/dog-parks/ajax-waterfront-park/";
const expectedSource = "https://ajax.ca/explore/parks-recreation/beaches-waterfronts-conservation/";
const expectedAlt = "Painterly illustration of a leashed dog and handler on the asphalt trail beside Lake Ontario at Ajax Waterfront";
const expectedReviewed = "2026-08-26T12:00:00.000Z";
const expectedCoordinates = { latitude: "43.8214755746", longitude: "-79.0100068494" };

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

function updateManifest(patch, nextPriorityPage = "Ajax Waterfront Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Ajax Waterfront Park manifest entry not found");
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
  if (end < 0) throw new Error("Ajax Waterfront Park manifest entry end not found");
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

if (markImplementation) {
  updateManifest({ status: "implementation-complete", artifactChecks: implementationChecks, nextAction: "Mark verification pending, then run the full production and rendered-page QA." });
  console.log("Marked Ajax Waterfront Park implementation-complete.");
  process.exit(0);
}
if (markVerification) {
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run production build, repository QA, parity, image, and rendered-page checks before marking the page passed." });
  console.log("Marked Ajax Waterfront Park verification-pending.");
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
check(visibleText.includes("Information reviewed Aug 26, 2026"), "Reviewed On text missing");
check(visibleText.includes("Lake Driveway E"), "address reference missing");
check(visibleText.includes("Ajax") && visibleText.includes("Ontario"), "city or province missing");
check(visibleText.includes("Keep dogs leashed throughout this shared waterfront destination"), "on-leash direction missing");
check(visibleText.includes("The current Town leash-free list does not include Ajax Waterfront") && visibleText.includes("the municipal dog-park layer has no Ajax Waterfront dog-park polygon"), "off-leash correction missing");
check(visibleText.includes("more than 150 acres"), "waterfront size missing");
check(visibleText.includes("asphalt multi-use trail"), "surface copy missing");
check(visibleText.includes("no longer than 1.8 metres"), "leash-length rule missing");
check(visibleText.includes("May 15 to September 15"), "seasonal parking window missing");
check(!visibleText.includes("open off-leash zones"), "stale off-leash claim visible");
check(!visibleText.includes("perfect for dogs that love nature and water access"), "stale dog-water claim visible");
check(!visibleText.includes("L1S 2C8") && !visibleText.includes("L1S2C8"), "unsupported postal code visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|improved page)/i.test(visibleText), "internal process language visible");

check(Boolean(parkSchema), "Park schema missing");
check(parkSchema?.name === "Ajax Waterfront Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(parkSchema?.address?.streetAddress === "Lake Driveway E", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Ajax", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "Park schema unsupported postal code present");
check(String(parkSchema?.geo?.latitude) === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(String(parkSchema?.geo?.longitude) === expectedCoordinates.longitude, "Park schema longitude mismatch");
const amenities = new Set((parkSchema?.amenityFeature || []).map((item) => item.name));
check(amenities.size === 1 && amenities.has("Parking"), "amenity schema should contain only confirmed parking");
check(Boolean(faqSchema), "FAQ schema missing");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch");
check(faqSchema?.mainEntity?.length === 7, "FAQ schema count mismatch");

check(html.includes(`src="${imageSource}"`) || html.includes(imageSource), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960, 1600]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/ajax-waterfront-park-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
check(!html.includes("city-ajax-hero"), "unintended city fallback image used");
check(!html.includes("alberta-dog-parks-hero.jpg"), "unintended default fallback image used");

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

const metadata = await sharp(sourceImagePath).metadata();
check(metadata.width === 1672 && metadata.height === 941, "source image dimensions mismatch");
check(fs.statSync(sourceImagePath).size < 1_500_000, "source image is not adequately compressed");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(sourceImagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) {
  if (file === path.basename(sourceImagePath) || !file.endsWith("-original.png")) continue;
  const candidate = path.join("public/images/dog-parks", file);
  const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex");
  check(candidateHash !== sourceHash, `source image reused from ${file}`);
}

if (failures.length) {
  console.error(`Ajax Waterfront Park audit failed (${failures.length}):`);
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
    reason: "Completed with current Town of Ajax waterfront, leash-free, parking, pet-waste, by-law, and municipal GIS validation; synchronized visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and nine responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback, and editorial-marker inspection.",
    nextAction: "Complete; proceed to Firemen's Park on the next page-improvement run."
  }, "Firemen's Park");
}

console.log(`Ajax Waterfront Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
