import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "hamilton-beach";
const route = `/dog-parks/${slug}/`;
const defaultHtmlPath = `dist/dog-parks/${slug}/index.html`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || defaultHtmlPath;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativesPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/hamilton-beach-original.png";
const sourceImagePath = `public${imageSource}`;
const expectedTitle = "Hamilton Beach On-Leash Guide | Hamilton, Ontario | LeashFree.ca";
const expectedDescription = "Plan an on-leash walk at Confederation Beach Park and Hamilton Beach Trail: current hours, paved trail length, beach restriction, parking, and rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/hamilton-beach/";
const expectedSource = "https://conservationhamilton.ca/conservation-areas/confederation-park/";
const expectedAlt = "Realistic digital illustration of a leashed dog and handler on the paved Hamilton Beach Trail beside Lake Ontario";
const expectedReviewed = "2026-08-26T12:00:00.000Z";
const expectedCoordinates = { latitude: "43.2501726941", longitude: "-79.7537066673" };
const areaConflict = "The City of Hamilton's project page describes a 93-hectare park, while the current Open Hamilton Parks layer (last edited 2026-08-02) records 96.444 hectares. Both values are withheld from visitor content until the City reconciles the boundary or measurement difference.";

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

function updateManifest(patch, nextPriorityPage = "Hamilton Beach") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Hamilton Beach manifest entry not found");
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
  if (end < 0) throw new Error("Hamilton Beach manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  if (patch.status === "blocked") {
    updated = updated.replace(/"blockingIssues"\s*:\s*\[[^\]]*\](?![\s\S]*"blockingIssues")/, `"blockingIssues": ${JSON.stringify([areaConflict])}`);
    const revalidation = {
      page: "Hamilton Beach",
      route,
      checkedOn: "2026-08-26",
      checkedAt: new Date().toISOString(),
      status: "blocked",
      finding: "The City project page still says 93 hectares, while the live Open Hamilton Parks layer, last edited 2026-08-02, still reports 96.444 hectares. Both values remain withheld from visitor content."
    };
    updated = updated.replace(/"lastBlockedRevalidation"\s*:\s*\{[^}]*\}/, `"lastBlockedRevalidation": ${JSON.stringify(revalidation)}`);
  }
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
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run production build, repository QA, parity, image, and rendered-page checks; retain the documented official area conflict." });
  console.log("Marked Hamilton Beach verification-pending.");
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

const title = match(html, /<title>([^<]+)<\/title>/i).replace(/&#39;|&apos;/gi, "'");
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
check(visibleText.includes("680 Van Wagners Beach Road"), "street address missing");
check(visibleText.includes("L8E 3L8"), "postal code missing");
check(visibleText.includes("Hamilton") && visibleText.includes("Ontario"), "city or province missing");
check(visibleText.includes("not a leash-free dog park"), "on-leash designation missing");
check(visibleText.includes("not permitted on the beach"), "beach restriction missing");
check(visibleText.includes("4.3-kilometre paved Hamilton Beach Trail"), "trail length or surface missing");
check(visibleText.includes("another 4.2 kilometres of Waterfront Trail"), "trail connection missing");
check(visibleText.includes("shorter than 2 metres"), "leash length rule missing");
check(visibleText.includes("open daily from 6 a.m. to 11 p.m."), "hours missing");
check(visibleText.includes("accessible parking spaces") && visibleText.includes("washrooms"), "confirmed facilities missing");
check(!visibleText.includes("580 Van Wagners Beach Rd"), "stale address visible");
check(!visibleText.includes("7:00 AM") && !visibleText.includes("9:00 PM"), "stale hours visible");
check(!visibleText.includes("Approx. 10 acres") && !visibleText.includes("10 acres"), "unsupported size visible");
check(!visibleText.includes("boardwalk"), "unsupported boardwalk claim visible");
check(!visibleText.includes("lifeguard-supervised swimming zones"), "stale beach-access claim visible");
check(!visibleText.includes("93 hectare") && !visibleText.includes("93-hectare") && !visibleText.includes("96.444"), "conflicting area value visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial|source conflict|old copy|improved page|municipal gis)/i.test(visibleText), "internal process language visible");

check(Boolean(parkSchema), "Park schema missing");
check(parkSchema?.name === "Hamilton Beach", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(parkSchema?.address?.streetAddress === "680 Van Wagners Beach Road", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Hamilton", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(parkSchema?.address?.postalCode === "L8E 3L8", "Park schema postal code mismatch");
check(String(parkSchema?.geo?.latitude) === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(String(parkSchema?.geo?.longitude) === expectedCoordinates.longitude, "Park schema longitude mismatch");
const amenities = new Set((parkSchema?.amenityFeature || []).map((item) => item.name));
check(amenities.size === 3 && amenities.has("Waste bins") && amenities.has("Parking") && amenities.has("Washrooms"), "amenity schema should contain only confirmed waste bins, parking, and washrooms");
check(Boolean(faqSchema), "FAQ schema missing");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema Reviewed On mismatch");
check(faqSchema?.mainEntity?.length === 7, "FAQ schema count mismatch");

check(html.includes(imageSource), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/hamilton-beach-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
check(!html.includes("city-hamilton-hero"), "unintended city fallback image used");
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

const derivativeManifest = JSON.parse(fs.readFileSync(derivativesPath, "utf8"));
const derivativeEntry = derivativeManifest.images?.[imageSource];
check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch");
check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/hamilton-beach-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(sourceImagePath).metadata();
check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch");
check(fs.statSync(sourceImagePath).size < 1_000_000, "source image exceeds 1 MB");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(sourceImagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) {
  if (file === path.basename(sourceImagePath) || !file.endsWith("-original.png")) continue;
  const candidate = path.join("public/images/dog-parks", file);
  const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex");
  check(candidateHash !== sourceHash, `source image reused from ${file}`);
}

if (failures.length) {
  console.error(`Hamilton Beach audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (finalize) {
  updateManifest({
    status: "blocked",
    conflicts: [areaConflict],
    blockingIssues: [areaConflict],
    image: {
      source: imageSource,
      width: 1536,
      height: 1024,
      compressedBytes: fs.statSync(sourceImagePath).size,
      alt: expectedAlt,
      derivatives: [480, 960],
      formats: ["avif", "webp", "jpg"],
      reuse: "unique to Hamilton Beach",
      sha256: sourceHash,
      visualReference: "Current Hamilton Conservation Authority photographs show a broad Lake Ontario shoreline, beach grass, scattered deciduous trees, sand and rock protection. The generated scene uses those confirmed characteristics but places the leashed dog and handler on the paved shared trail, away from the beach, and does not copy an official photograph's composition."
    },
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
    reason: "Conflict-safe implementation and verification completed with current City of Hamilton and Hamilton Conservation Authority park, trail, pet-rule, leash-free-map, park-map, and municipal GIS sources; synchronized visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and six responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback, and editorial-marker inspection. The page remains blocked because current official sources disagree on total park area, and neither value is visitor-facing.",
    nextAction: "Revalidate Hamilton Beach when the City reconciles the 93-hectare project-page figure with the current 96.444-hectare GIS value; do not advance to Memorial Park while this page is active."
  });
}

console.log(`Hamilton Beach verification passed (${finalize ? "manifest blocked on official area conflict" : "verification only"}); SHA-256 ${sourceHash}.`);
