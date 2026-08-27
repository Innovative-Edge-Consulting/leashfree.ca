import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const slug = "chris-gibson-park";
const route = `/dog-parks/${slug}/`;
const defaultHtmlPath = `dist/dog-parks/${slug}/index.html`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || defaultHtmlPath;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imageSource = "/images/dog-parks/chris-gibson-park-original.png";
const sourceImagePath = `public${imageSource}`;
const expectedTitle = "Chris Gibson Park Leash-Free Area | Brampton, Ontario | LeashFree.ca";
const expectedDescription = "Plan a visit to Chris Gibson Park's leash-free area in Brampton with its verified location, current dog rules, and construction access notes.";
const expectedCanonical = "https://leashfree.ca/dog-parks/chris-gibson-park/";
const expectedSource = "https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx";
const expectedAlt = "Painterly illustration of two off-leash dogs playing with their handler in a broad tree-lined community park in Brampton";
const expectedReviewed = "2026-08-26T12:00:00.000Z";
const expectedCoordinates = { latitude: "43.6837429262", longitude: "-79.7767464074" };

const failures = [];
const check = (condition, label) => {
  if (!condition) failures.push(label);
};
const match = (text, expression) => text.match(expression)?.[1] || "";

function parseCsv(text) {
  const rows = [];
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
      rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }
  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function updateManifest(patch, nextPriorityPage) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Chris Gibson Park manifest entry not found");
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
  if (end < 0) throw new Error("Chris Gibson Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"Chris Gibson Park"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

if (markVerification) {
  updateManifest({
    status: "verification-pending",
    verificationBlocker: undefined,
    artifactChecks: {
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
    },
    nextAction: "Run production build, repository QA, exact JSON-CSV parity, image uniqueness, and targeted rendered inspection before marking the page passed."
  }, "Chris Gibson Park");
  console.log("Marked Chris Gibson Park verification-pending.");
  process.exit(0);
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
check(visibleText.includes("Information reviewed Aug 26, 2026"), "Reviewed On text missing");
check(visibleText.includes("current park directory lists a leash-free area at Chris Gibson Park"), "current leash-free designation missing");
check(visibleText.includes("135 McLaughlin Road North"), "confirmed park address missing");
check(visibleText.includes("18.788-hectare community park"), "confirmed wider-park area missing");
check(visibleText.includes("shared recreation amenities, not part of the dog area"), "wider-park amenity boundary missing");
check(visibleText.includes("closed for a major renovation"), "recreation-centre closure missing");
check(visibleText.includes("completion in Q4 2026"), "construction completion estimate missing");
check(visibleText.includes("do not publish the dog area's fence details"), "unknown dog-area facilities disclosure missing");
check(visibleText.includes("no more than three dogs"), "three-dog limit missing");
check(visibleText.includes("puppies under four months"), "puppy restriction missing");
check(visibleText.includes("children under ten"), "child restriction missing");
check(visibleText.includes("does not publish dedicated hours"), "hours uncertainty missing");
for (const stale of [
  "A fenced leash-free dog run",
  "grass/woodchips",
  "7 am – 10 pm",
  "L6X1Y9",
  "Yes (Community Centre)",
  "43.683776701053105",
  "-79.77673517945249"
]) check(!visibleText.includes(stale), `stale or unsupported claim visible: ${stale}`);
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
    const derivative = `/images/optimized/dog-parks/chris-gibson-park-original/${width}.${format}`;
    check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
  }
}
for (const fallback of ["placeholder", "default-dog", "/images/cities/city-brampton", "/images/dog-parks/chris-gibson-park.png"]) {
  check(!pageHeaderHtml.toLowerCase().includes(fallback), `unintended hero fallback marker present: ${fallback}`);
}

check(parkSchema?.name === "Chris Gibson Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema review date mismatch");
check(parkSchema?.address?.streetAddress === "135 McLaughlin Rd N", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Brampton", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "unsupported postal code present in Park schema");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema longitude mismatch");
check((parkSchema?.amenityFeature || []).length === 0, "unsupported affirmative amenity present in Park schema");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema review date mismatch");
check(faqSchema?.mainEntity?.length === 6, "FAQ schema question count mismatch");

const parks = JSON.parse(fs.readFileSync("src/data/generated/parks.json", "utf8"));
const park = parks.find((entry) => entry.slug === slug);
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch");
check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch");
check(park?.raw?.["Reviewed On"] === "Wed Aug 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Updated On"] === "Tue Jun 24 2025 20:48:17 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On was unexpectedly changed");
check(park?.raw?.Fenced === "Unknown - not documented in current City sources", "generated JSON fence uncertainty mismatch");
check(park?.raw?.["Surface type"] === "Unknown - not documented in current City sources", "generated JSON surface uncertainty mismatch");
check(park?.raw?.Size === "Dog-area size not published; wider park is 18.788 ha", "generated JSON size qualification mismatch");

const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug);
check(Boolean(csvRow), "Chris Gibson Park CSV row missing");
for (const [key, value] of Object.entries(park?.raw || {})) {
  const index = headers.indexOf(key);
  check(index >= 0 && csvRow?.[index] === String(value ?? ""), `JSON-CSV mismatch: ${key}`);
}

const derivatives = JSON.parse(fs.readFileSync("src/data/generated/image-derivatives.json", "utf8")).images[imageSource];
check(derivatives?.width === 1774 && derivatives?.height === 886, "source image dimensions mismatch");
check(derivatives?.fallbackSrc === "/images/optimized/dog-parks/chris-gibson-park-original/1600.jpg", "image fallback derivative mismatch");
check(fs.statSync(sourceImagePath).size < 1_000_000, "compressed source image exceeds 1 MB");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(sourceImagePath)).digest("hex");
const matchingSourceImages = fs.readdirSync("public/images/dog-parks")
  .filter((name) => /\.(?:png|jpe?g|webp|avif)$/i.test(name))
  .map((name) => path.join("public/images/dog-parks", name))
  .filter((file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") === sourceHash);
check(matchingSourceImages.length === 1 && path.normalize(matchingSourceImages[0]) === path.normalize(sourceImagePath), "source illustration is not unique");
const overrides = fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8");
check(overrides.includes(`"${slug}": "${imageSource}"`), "image override mapping mismatch");

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
    verificationBlocker: undefined,
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
    reason: "Completed with current City of Brampton park-directory, animal-services, Animal Services By-law, Park Lands By-law, recreation-construction, and municipal GIS validation; synchronized visitor copy, SEO, FAQs, generated JSON and CMS CSV; verified the unique compressed illustration and nine responsive derivatives; completed production build, repository page QA, exact artifact parity, and rendered metadata, schema, source, image, fallback, and editorial-marker inspection.",
    nextAction: "Complete; proceed to Sunnidale Park on the next page-improvement run."
  }, "Sunnidale Park");
}
