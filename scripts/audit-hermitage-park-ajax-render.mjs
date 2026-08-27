import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const route = "/dog-parks/hermitage-park/";
const defaultHtmlPath = "dist/dog-parks/hermitage-park/index.html";
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || defaultHtmlPath;
const finalize = process.argv.includes("--finalize");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imageSource = "/images/dog-parks/hermitage-park-original.png";
const sourceImagePath = "public/images/dog-parks/hermitage-park-original.png";
const expectedTitle = "Hermitage Leash-Free Dog Park | Ajax, Ontario | LeashFree.ca";
const expectedDescription = "Plan a visit to Hermitage Leash-Free Dog Park in Ajax: a fenced grass enclosure with current hours, size, parking, waste facilities, and rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/hermitage-park/";
const expectedSource = "https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/";
const expectedAlt = "Painterly illustration of two off-leash dogs with their handler inside the grass and woven-wire enclosure at Hermitage Park in Ajax";
const expectedReviewed = "2026-08-25T12:00:00.000Z";
const expectedCoordinates = { latitude: "43.8578201779", longitude: "-79.0530177105" };

const failures = [];
const check = (condition, label) => {
  if (!condition) failures.push(label);
};
const match = (text, expression) => text.match(expression)?.[1] || "";

function parseCsv(text) {
  const out = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      out.push(row);
      row = [];
      value = "";
    } else value += char;
  }
  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    out.push(row);
  }
  return out;
}

function updateManifest(patch, nextPriorityPage) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(/"slug"\s*:\s*"hermitage-park"/);
  if (markerIndex < 0) throw new Error("Hermitage Park manifest entry not found");
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
    else if (char === "}" && --depth === 0) {
      end = index;
      break;
    }
  }
  if (end < 0) throw new Error("Hermitage Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"Hermitage Park"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

const html = fs.readFileSync(htmlPath, "utf8");
const pageHeaderHtml = match(html, /<section class="page-header">([\s\S]*?)<\/section>/i);
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
  .flatMap((entry) => {
    const parsed = JSON.parse(entry[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park");
const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage");

check(title === expectedTitle, "SEO title mismatch");
check(description === expectedDescription, "meta description mismatch");
check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 25, 2026"), "Reviewed On text missing");
check(visibleText.includes("designated leash-free area"), "current leash-free designation missing");
check(visibleText.includes("1.5-metre post-and-woven-wire fence"), "confirmed fence detail missing");
check(visibleText.includes("approximately 1,805 square metres"), "official mapped area missing");
check(visibleText.includes("one wooden picnic bench and one waste receptacle"), "confirmed enclosure assets missing");
check(visibleText.includes("Hermitage Park lot off Griffiths Drive"), "confirmed parking location missing");
check(visibleText.includes("Current records do not identify a separate small-dog section"), "unknown facilities disclosure missing");
check(visibleText.includes("6 a.m. to 11 p.m."), "current park hours missing");
check(!visibleText.includes("Not officially fenced or designated off-leash"), "stale non-designation claim visible");
check(!visibleText.includes("Hermitage Rd & Delaney Dr"), "stale address visible");
check(!visibleText.includes("Dawn to Dusk"), "stale hours visible");
check(!visibleText.includes("https://") && !visibleText.includes("www."), "raw URL visible");
for (const marker of [
  "Primary sources reviewed",
  "Confirmed:",
  "Unknown:",
  "reasonable inference",
  "research-complete",
  "implementation-complete",
  "verification-pending",
  "how the page was improved",
  "old copy"
]) check(!visibleText.toLowerCase().includes(marker.toLowerCase()), `internal marker visible: ${marker}`);

check(html.includes(`src="${imageSource}"`) || html.includes(`href="${imageSource}"`) || html.includes(`content="https://leashfree.ca${imageSource}"`), "intended source image missing");
check(html.includes(`alt="${expectedAlt}"`), "hero alt text mismatch");
for (const width of [480, 960, 1600]) {
  for (const format of ["avif", "webp", "jpg"]) {
    const derivative = `/images/optimized/dog-parks/hermitage-park-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
for (const fallback of ["placeholder", "default-dog", "/images/cities/city-ajax", "/images/dog-parks/hermitage-park-off-leash-area-original.png"]) {
  check(!pageHeaderHtml.toLowerCase().includes(fallback), `unintended hero fallback marker present: ${fallback}`);
}

check(parkSchema?.name === "Hermitage Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema review date mismatch");
check(parkSchema?.address?.streetAddress === "42/44 Pollard Crescent", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Ajax", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "unsupported postal code present in Park schema");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema longitude mismatch");
const amenityNames = (parkSchema?.amenityFeature || []).map((item) => item.name);
check(JSON.stringify(amenityNames) === JSON.stringify(["Fenced area", "Benches", "Waste bins", "Parking"]), "Park schema amenities mismatch");
check((parkSchema?.amenityFeature || []).every((item) => item.value === true), "Park schema amenity values mismatch");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema review date mismatch");
check(faqSchema?.mainEntity?.length === 6, "FAQ schema question count mismatch");

const parks = JSON.parse(fs.readFileSync("src/data/generated/parks.json", "utf8"));
const park = parks.find((entry) => entry.slug === "hermitage-park");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch");
check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch");
check(park?.raw?.["Reviewed On"] === "Tue Aug 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Updated On"] === "Thu Jul 10 2025 23:40:54 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On was unexpectedly changed");
check(park?.raw?.Fenced === "Yes", "generated JSON fenced value mismatch");
check(park?.raw?.["Surface type"] === "Grass", "generated JSON surface mismatch");
check(park?.raw?.Size === "Approximately 1,805 m² (official mapped polygon)", "generated JSON size mismatch");

const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === "hermitage-park");
check(Boolean(csvRow), "Hermitage Park CSV row missing");
for (const [key, value] of Object.entries(park?.raw || {})) {
  const index = headers.indexOf(key);
  check(index >= 0 && csvRow?.[index] === String(value ?? ""), `JSON-CSV mismatch: ${key}`);
}

const derivatives = JSON.parse(fs.readFileSync("src/data/generated/image-derivatives.json", "utf8")).images[imageSource];
check(derivatives?.width === 1672 && derivatives?.height === 941, "source image dimensions mismatch");
check(derivatives?.fallbackSrc === "/images/optimized/dog-parks/hermitage-park-original/1600.jpg", "image fallback derivative mismatch");
check(fs.statSync(sourceImagePath).size < 1_000_000, "compressed source image exceeds 1 MB");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(sourceImagePath)).digest("hex");
const matchingSourceImages = fs.readdirSync("public/images/dog-parks")
  .filter((name) => /\.(?:png|jpe?g|webp|avif)$/i.test(name))
  .map((name) => path.join("public/images/dog-parks", name))
  .filter((file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") === sourceHash);
check(matchingSourceImages.length === 1 && path.normalize(matchingSourceImages[0]) === path.normalize(sourceImagePath), "source illustration is not unique");
const overrides = fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8");
check(overrides.includes(`"hermitage-park": "${imageSource}"`), "image override mapping mismatch");

for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  check(!fs.readFileSync(queuePath, "utf8").includes(route), `completed route remains in ${queuePath}`);
}

console.log(JSON.stringify({
  route,
  title,
  description,
  canonical,
  visibleTextCharacters: visibleText.length,
  sourceImage: { width: derivatives?.width, height: derivatives?.height, bytes: fs.statSync(sourceImagePath).size, sha256: sourceHash },
  uniqueSourceMatches: matchingSourceImages,
  renderedDerivativeCount: 9,
  faqQuestions: faqSchema?.mainEntity?.length || 0,
  amenitySchema: parkSchema?.amenityFeature || [],
  failures
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
} else if (finalize) {
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
    reason: "Completed with current Town of Ajax outdoor, park, pet-waste, parking, Dog and Cat By-law, Parks By-law, and municipal asset-layer validation; synchronized visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and nine responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback, and editorial-marker inspection.",
    nextAction: "Complete; proceed to Chris Gibson Park on the next page-improvement run."
  }, "Chris Gibson Park");
}
