import fs from "node:fs";

const route = "/dog-parks/brenda-leipsic-park/";
const htmlPath = process.argv.slice(2).find((argument) => !argument.startsWith("--"))
  || "dist/dog-parks/brenda-leipsic-park/index.html";
const imageSource = "/images/dog-parks/brenda-leipsic-park-original.png";
const expectedTitle = "Brenda Leipsic Park Off-Leash Area | Winnipeg | LeashFree.ca";
const expectedDescription = "Plan a visit to Brenda Leipsic Park in Winnipeg, an approximately 6.20-hectare park with an off-leash area, trails, hours, facilities, and rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/brenda-leipsic-park/";
const expectedSource = "https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas-locations.stm";
const expectedAlt = "Painterly illustration of two off-leash dogs and their handler on a broad path beside an open shelter in a prairie park setting";
const expectedReviewed = "2026-08-25T12:00:00.000Z";
const expectedCoordinates = { latitude: "49.8465982232", longitude: "-97.1709645354" };
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const finalize = process.argv.includes("--finalize");

function updateManifestEntry(patch, nextPriorityPage) {
  let text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(/"slug"\s*:\s*"brenda-leipsic-park"/);
  if (markerIndex < 0) throw new Error("Brenda Leipsic Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  if (start < 0) throw new Error("Brenda Leipsic Park manifest entry start not found");
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
  if (end < 0) throw new Error("Brenda Leipsic Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  text = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  if (nextPriorityPage) {
    text = text.replace(/"nextPriorityPage": "[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  }
  fs.writeFileSync(manifestPath, text);
}

updateManifestEntry({
  status: "verification-pending",
  artifactChecks: {
    content: "implementation-complete",
    seo: "implementation-complete",
    structuredData: "verification-pending",
    generatedJson: "implementation-complete",
    csv: "implementation-complete",
    imageMapping: "verification-pending",
    sourceImage: "verification-pending",
    optimizedDerivatives: "verification-pending",
    backlog: "implementation-complete",
    renderedPage: "verification-pending"
  },
  nextAction: "Complete production build, repository QA, rendered inspection, image verification, and JSON-CSV parity checks."
});

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
check(visibleText.includes("records 1,683 metres of paths and trails"), "current path facts missing");
check(visibleText.includes("205 metres of fence and four gates"), "partial fencing facts missing");
check(visibleText.includes("Treat the boundary as unfenced"), "unfenced-boundary guidance missing");
check(visibleText.includes("three litter bins, one shelter, five tables, and five signs"), "confirmed park assets missing");
check(visibleText.includes("do not confirm a separate small-dog section, potable water, bag dispensers, washrooms, or a City park parking lot"), "unknown facilities disclosure missing");
check(visibleText.includes("approximately 6.20 hectares"), "approximate 2026 park-area figure missing");
check(!visibleText.includes("6.803434"), "older ArcGIS area value visible");
check(!visibleText.includes("https://") && !visibleText.includes("www."), "raw URL visible");
for (const marker of [
  "Primary sources reviewed",
  "Secondary coordinate check",
  "reasonable inference",
  "supersedes older",
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
    check(html.includes(`/images/optimized/dog-parks/brenda-leipsic-park-original/${width}.${format}`), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public/images/optimized/dog-parks/brenda-leipsic-park-original/${width}.${format}`), `derivative file missing: ${width}.${format}`);
  }
}
for (const fallback of ["placeholder", "default-dog", "/images/cities/city-winnipeg"]) {
  check(!pageHeaderHtml.toLowerCase().includes(fallback), `unintended hero fallback marker present: ${fallback}`);
}

check(parkSchema?.name === "Brenda Leipsic Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema review date mismatch");
check(parkSchema?.address?.streetAddress === "100 Hurst Way", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Winnipeg", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Manitoba", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "unsupported postal code present in Park schema");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema longitude mismatch");
check(Array.isArray(parkSchema?.amenityFeature) && parkSchema.amenityFeature.length === 0, "unsupported affirmative amenities present in Park schema");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema review date mismatch");
check(faqSchema?.mainEntity?.length === 6, "FAQ schema question count mismatch");

const parks = JSON.parse(fs.readFileSync("src/data/generated/parks.json", "utf8"));
const park = parks.find((entry) => entry.slug === "brenda-leipsic-park");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch");
check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch");
check(park?.raw?.["Reviewed On"] === "Tue Aug 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Updated On"] === "Sat Jul 12 2025 02:12:27 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On was unexpectedly changed");
check(park?.raw?.Size === "Approximately 6.20 hectares (2026 City parks report)", "generated JSON approximate size mismatch");

const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === "brenda-leipsic-park");
check(Boolean(csvRow), "Brenda Leipsic Park CSV row missing");
for (const [key, value] of Object.entries(park?.raw || {})) {
  const index = headers.indexOf(key);
  check(index >= 0 && csvRow?.[index] === String(value ?? ""), `JSON-CSV mismatch: ${key}`);
}

const derivatives = JSON.parse(fs.readFileSync("src/data/generated/image-derivatives.json", "utf8")).images[imageSource];
check(derivatives?.width === 1672 && derivatives?.height === 941, "source image dimensions mismatch");
check(derivatives?.fallbackSrc === "/images/optimized/dog-parks/brenda-leipsic-park-original/1600.jpg", "image fallback derivative mismatch");
check(fs.statSync("public/images/dog-parks/brenda-leipsic-park-original.png").size < 1_000_000, "compressed source image exceeds 1 MB");

for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  check(!fs.readFileSync(queuePath, "utf8").includes(route), `completed route remains in ${queuePath}`);
}

console.log(JSON.stringify({
  route,
  title,
  description,
  canonical,
  visibleTextCharacters: visibleText.length,
  sourceImage: { width: derivatives?.width, height: derivatives?.height },
  renderedDerivativeCount: 9,
  faqQuestions: faqSchema?.mainEntity?.length || 0,
  amenitySchema: parkSchema?.amenityFeature || [],
  failures
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
} else if (finalize) {
  updateManifestEntry({
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
    reason: "Implementation and verification completed with current City of Winnipeg location, boundary, rules, 2026 asset inventory, active by-law, and official open-data centroid; synchronized approximate 6.20-hectare park-area wording from the newer 2026 City report; documented the older ArcGIS variation internally; synchronized visitor copy, SEO, FAQs, JSON and CMS CSV; verified the unique compressed illustration and nine responsive derivatives; completed production build, repository page QA, JSON-CSV parity, and rendered HTML, schema, source, image, fallback, and editorial-marker inspection.",
    nextAction: "Complete; proceed to Hermitage Park on the next page-improvement run."
  }, "Hermitage Park");

  let manifestText = fs.readFileSync(manifestPath, "utf8");
  manifestText = manifestText.replace(/"blockingIssues": \[[^\]]*\]/, '"blockingIssues": []');
  manifestText = manifestText.replace(
    /"lastBlockedRevalidation": \{[\s\S]*?\n  \},\n  "publicationAudit"/,
    `"lastBlockedRevalidation": {\n    "page": "Brenda Leipsic Park",\n    "route": "/dog-parks/brenda-leipsic-park/",\n    "checkedOn": "2026-08-25",\n    "checkedAt": "2026-08-25T21:22:28.8755985-04:00",\n    "status": "passed",\n    "finding": "Resolved editorially using approximately 6.20 hectares from the newer 2026 City asset report. The older 2023-edited ArcGIS variation remains documented internally; no precise off-leash-area size is asserted."\n  },\n  "publicationAudit"`
  );
  fs.writeFileSync(manifestPath, manifestText);
}
