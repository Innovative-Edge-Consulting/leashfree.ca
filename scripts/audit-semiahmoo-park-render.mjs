import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "semiahmoo-park";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/semiahmoo-park-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "Semiahmoo Park Dog Access Advisory | Surrey, BC | LeashFree.ca";
const expectedDescription = "Check dog access before visiting Semiahmoo Park in South Surrey. Semiahmoo First Nation's published rule prohibits pets; use designated alternatives.";
const expectedCanonical = "https://leashfree.ca/dog-parks/semiahmoo-park/";
const expectedSource = "https://www.semiahmoofirstnation.ca/";
const expectedReviewed = "2026-08-28T12:00:00.000Z";
const expectedAlt = "Realistic digital illustration of the driftwood shoreline and tidal flats at Semiahmoo Park on Semiahmoo Bay";

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

function updateManifest(patch, nextPriorityPage = "Stony Swamp Conservation Area") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Semiahmoo Park manifest entry not found");
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
  if (end < 0) throw new Error("Semiahmoo Park manifest entry end not found");
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
  console.log("Marked Semiahmoo Park verification-pending.");
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
const breadcrumbSchema = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

check(title === expectedTitle, "SEO title mismatch");
check(description === expectedDescription, "meta description mismatch");
check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 28, 2026"), "Reviewed On text missing");
check(visibleText.includes("15782 Marine Drive"), "current address missing");
check(visibleText.includes("South Surrey") && visibleText.includes("British Columbia"), "city or province missing");
check(visibleText.includes("Semiahmoo First Nation reserve land"), "land authority missing");
check(visibleText.includes("prohibits dogs and other pets"), "no-pets rule missing");
check(visibleText.includes("Current routine public hours not published"), "hours uncertainty missing");
check(visibleText.includes("Ruth Johnson Park") && visibleText.includes("Blackie Spit Park"), "designated alternatives missing");
check(visibleText.includes("current operator information does not confirm parking terms"), "amenity uncertainty missing");
check(!visibleText.includes("Semiahmoo Park Leash-Free Area") && !visibleText.includes("limited leash-free access"), "stale off-leash claim visible");
check(!visibleText.includes("6 am – 10 pm") && !visibleText.includes("V4B 1E6"), "stale hours or postal code visible");
check(!visibleText.includes("49.019177629706654") && !visibleText.includes("-122.78580462413233"), "unsupported coordinates visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|previously attached|third-party directories|improved page)/i.test(visibleText), "internal process language visible");

check(Boolean(breadcrumbSchema), "Breadcrumb schema missing");
check(!parkSchema, "Park schema should be omitted while official coordinates remain unknown");
check(Boolean(faqSchema), "FAQ schema missing");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch");
check(faqSchema?.mainEntity?.length === 8, "FAQ schema count mismatch");
check(html.includes(`href="${expectedSource}"`), "official source link missing");

check(html.includes(imageSource), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/semiahmoo-park-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
check(!html.includes("dog-park-default"), "unintended default dog-park image used");
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override mapping missing");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
check(Boolean(park), "generated JSON record missing");
check(park?.raw?.latitude === "" && park?.raw?.longitude === "", "unknown coordinates should be blank");
check(park?.raw?.City === "Surrey" && park?.raw?.Province === "British Columbia", "JSON locality mismatch");
check(park?.raw?.["Postal Code"] === "", "unknown postal code should be blank");
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
check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/semiahmoo-park-original/960.jpg", "derivative fallback mismatch");
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
  console.error(`Semiahmoo Park audit failed (${failures.length}):`);
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
      reuse: "unique to Semiahmoo Park",
      sha256: sourceHash,
      visualReference: "Semiahmoo First Nation's current land-management page shows Semiahmoo Bay at low tide with broad tidal flats, shallow channels, a pebbly shoreline, driftwood and distant low headlands. The independent illustration uses those confirmed characteristics in a new composition, shows no dogs and adds no unconfirmed park amenities."
    },
    reason: "Completed with current Semiahmoo First Nation, City of Surrey, City of White Rock and Surrey dog-access validation; synchronized the no-pets advisory, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed shoreline illustration and six responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, structured data, source, image, fallback and editorial-marker inspection.",
    nextAction: "Complete; proceed to Stony Swamp Conservation Area on the next page-improvement run."
  });
}

console.log(`Semiahmoo Park audit passed (${finalize ? "finalized" : "verification only"}); SHA-256 ${sourceHash}.`);
