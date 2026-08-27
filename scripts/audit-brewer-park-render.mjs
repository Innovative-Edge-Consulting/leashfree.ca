import fs from "node:fs";

const route = "/dog-parks/brewer-park/";
const htmlPath = "dist/dog-parks/brewer-park/index.html";
const imageSource = "/images/dog-parks/brewer-park-original.png";
const expectedTitle = "Brewer Park Off-Leash Area | Ottawa | LeashFree.ca";
const expectedDescription = "Plan a Brewer Park visit in Ottawa with verified mixed off-leash boundaries, the 100 Brewer Way address, free parking, hours, rules, and facilities.";
const expectedCanonical = "https://leashfree.ca/dog-parks/brewer-park/";
const expectedSource = "https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks";
const expectedAlt = "Painterly illustration of two off-leash dogs with their handler beside the riverside path in the designated southern area of Brewer Park";
const expectedReviewed = "2026-08-25T12:00:00.000Z";
const expectedCoordinates = { latitude: "45.38696719", longitude: "-75.6889477" };

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
check(visibleText.includes("Dogs are prohibited in every other part of the park."), "mixed-designation prohibition missing");
check(visibleText.includes("south of the berm and parking lot"), "southern dog-area boundary missing");
check(visibleText.includes("free parking in three park lots"), "confirmed parking detail missing");
check(visibleText.includes("Current City sources do not confirm dog-area fencing"), "unknown fencing disclosure missing");
check(!visibleText.includes("https://") && !visibleText.includes("www."), "raw URL visible");
for (const marker of [
  "Primary sources reviewed",
  "legacy fenced-run",
  "unsupported by current",
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
    check(html.includes(`/images/optimized/dog-parks/brewer-park-original/${width}.${format}`), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public/images/optimized/dog-parks/brewer-park-original/${width}.${format}`), `derivative file missing: ${width}.${format}`);
  }
}
for (const fallback of ["placeholder", "default-dog", "/images/cities/city-ottawa"]) {
  check(!pageHeaderHtml.toLowerCase().includes(fallback), `unintended hero fallback marker present: ${fallback}`);
}

check(parkSchema?.name === "Brewer Park", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema review date mismatch");
check(parkSchema?.address?.streetAddress === "100 Brewer Way", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Ottawa", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(parkSchema?.address?.postalCode === "K1S 5T1", "Park schema postal code mismatch");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema longitude mismatch");
check(parkSchema?.amenityFeature?.length === 1 && parkSchema.amenityFeature[0]?.name === "Parking" && parkSchema.amenityFeature[0]?.value === true, "Park schema amenities mismatch");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema review date mismatch");
check(faqSchema?.mainEntity?.length === 6, "FAQ schema question count mismatch");

const parks = JSON.parse(fs.readFileSync("src/data/generated/parks.json", "utf8"));
const park = parks.find((entry) => entry.slug === "brewer-park");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch");
check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch");
check(park?.raw?.["Reviewed On"] === "Tue Aug 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Updated On"] === "Tue Jun 24 2025 20:53:03 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On was unexpectedly changed");

const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === "brewer-park");
check(Boolean(csvRow), "Brewer Park CSV row missing");
for (const [key, value] of Object.entries(park?.raw || {})) {
  const index = headers.indexOf(key);
  check(index >= 0 && csvRow?.[index] === String(value ?? ""), `JSON-CSV mismatch: ${key}`);
}

const derivatives = JSON.parse(fs.readFileSync("src/data/generated/image-derivatives.json", "utf8")).images[imageSource];
check(derivatives?.width === 1693 && derivatives?.height === 929, "source image dimensions mismatch");
check(derivatives?.fallbackSrc === "/images/optimized/dog-parks/brewer-park-original/1600.jpg", "image fallback derivative mismatch");

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

if (failures.length > 0) process.exitCode = 1;
