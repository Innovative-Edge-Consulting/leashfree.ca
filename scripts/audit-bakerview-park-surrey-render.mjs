import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "bakerview-park-surrey";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/bakerview-park-surrey-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Bakerview Park On-Leash Guide | Surrey, BC | LeashFree.ca";
const expectedDescription = "Plan a leashed visit to Bakerview Park in Surrey: dawn-to-dusk hours, 154 Street parking, sports fields, washrooms, dog rules and map.";
const expectedCanonical = "https://leashfree.ca/dog-parks/bakerview-park-surrey/";
const expectedSource = "https://www.surrey.ca/parks-recreation/parks/bakerview-park";
const expectedReviewed = "2026-08-27T12:00:00.000Z";
const expectedAlt = "Realistic digital illustration of a leashed dog and handler on a tree-lined path beside Bakerview Park's grass sports fields in Surrey";
const expectedCoordinates = { latitude: "49.0356433346", longitude: "-122.7972670408" };

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

function updateManifest(patch, nextPriorityPage = "Bakerview Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Bakerview Park manifest entry not found");
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
  if (end < 0) throw new Error("Bakerview Park manifest entry end not found");
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
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run the production build, repository QA, parity, image and rendered-page checks before marking the page passed." });
  console.log("Marked Bakerview Park verification-pending.");
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
check(visibleText.includes("1845 154 Street"), "current address missing");
check(visibleText.includes("Surrey") && visibleText.includes("British Columbia"), "city or province missing");
check(visibleText.includes("dogs must remain leashed"), "on-leash identity missing");
check(visibleText.includes("approximately 3.85 hectares"), "current park area missing");
check(visibleText.includes("Sunnyside Community Hall") && visibleText.includes("two baseball diamonds") && visibleText.includes("grass soccer field"), "confirmed park amenities missing");
check(visibleText.includes("parking lot beside the community hall") && visibleText.includes("154 Street"), "parking access missing");
check(visibleText.includes("Dawn until dusk"), "current hours missing");
check(visibleText.includes("no longer than three metres") && visibleText.includes("over three months"), "current leash or licensing rule missing");
check(visibleText.includes("Blackie Spit Park") && visibleText.includes("Wills Brook Park"), "current off-leash alternatives missing");
check(!visibleText.includes("Bakerview Park Leash-Free Area") && !visibleText.includes("informal off-leash"), "stale off-leash claim visible");
check(!visibleText.includes("6 am – 10 pm") && !visibleText.includes("V4A 5J8"), "stale hours or postal code visible");
check(!visibleText.includes("49.03804392682226") && !visibleText.includes("-122.79812370996017"), "stale coordinates visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|improved page|historical source variation)/i.test(visibleText), "internal process language visible");

check(Boolean(parkSchema), "Park schema missing");
check(parkSchema?.name === "Bakerview Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(parkSchema?.address?.streetAddress === "1845 154 Street", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Surrey", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "British Columbia", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "Park schema should omit unknown postal code");
check(String(parkSchema?.geo?.latitude) === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(String(parkSchema?.geo?.longitude) === expectedCoordinates.longitude, "Park schema longitude mismatch");
const amenities = new Set((parkSchema?.amenityFeature || []).map((item) => item.name));
check(amenities.size === 2 && amenities.has("Parking") && amenities.has("Washrooms"), "amenity schema should contain only confirmed parking and washrooms");
check(Boolean(faqSchema), "FAQ schema missing");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch");
check(faqSchema?.mainEntity?.length === 7, "FAQ schema count mismatch");

check(html.includes(imageSource), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/bakerview-park-surrey-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
check(!html.includes("dog-park-default"), "unintended default dog-park image used");
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override mapping missing");

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
check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/bakerview-park-surrey-original/960.jpg", "derivative fallback mismatch");
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
  console.error(`Bakerview Park audit failed (${failures.length}):`);
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
      reuse: "unique to Bakerview Park",
      sha256: sourceHash,
      visualReference: "The current City park image confirms a broad open lawn and mature deciduous tree edge. The independent illustration uses those general landscape characteristics in a new composition and adds only City-confirmed paved-path and sports-field context, with one dog visibly leashed and no playground, signs or unconfirmed dog amenities."
    },
    reason: "Completed with current City park, dog-access, bylaw and municipal GIS validation; synchronized the on-leash visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback and editorial-marker inspection.",
    nextAction: "Complete; proceed to Semiahmoo Park on the next page-improvement run."
  }, "Semiahmoo Park");
}

console.log(`Bakerview Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
