import fs from "node:fs";

const route = "/dog-parks/conroy-pit/";
const htmlPath = "dist/dog-parks/conroy-pit/index.html";
const imageSource = "/images/dog-parks/conroy-pit-original.png";
const expectedTitle = "Conroy Pit Off-Leash Dog Area | Ottawa | LeashFree.ca";
const expectedDescription = "Plan a visit to Conroy Pit, Ottawa's year-round NCC off-leash dog area, with P17 parking, boundary rules, seasonal access, and verified visitor details.";
const expectedCanonical = "https://leashfree.ca/dog-parks/conroy-pit/";
const expectedSource = "https://ncc-ccn.gc.ca/places/pine-grove";
const expectedAlt = "Painterly illustration of two off-leash dogs with their handler in a Pine Grove forest clearing at Conroy Pit";
const expectedReviewed = "2026-08-25T12:00:00.000Z";
const expectedCoordinates = { latitude: "45.3622997", longitude: "-75.6180932" };

const failures = [];
const check = (condition, label) => {
  if (!condition) failures.push(label);
};
const match = (text, expression) => text.match(expression)?.[1] || "";

const html = fs.readFileSync(htmlPath, "utf8");
const pageHeaderHtml = match(html, /<section class="page-header">([\s\S]*?)<\/section>/i);
const visibleText = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&(?:nbsp|#xA0);/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')
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
check(visibleText.includes("Free, year-round parking is available at P17 on Conroy Road."), "confirmed parking claim missing");
check(visibleText.includes("Dogs are not permitted at the adjacent Conroy Pit toboggan hill"), "toboggan-hill restriction missing");
check(visibleText.includes("no more than two pets per handler"), "two-pet rule missing");
check(!visibleText.includes("https://") && !visibleText.includes("www."), "raw URL visible");
for (const marker of [
  "Primary sources reviewed",
  "legacy 24-hour",
  "unsupported legacy",
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
    check(html.includes(`/images/optimized/dog-parks/conroy-pit-original/${width}.${format}`), `rendered derivative missing: ${width}.${format}`);
    check(fs.existsSync(`public/images/optimized/dog-parks/conroy-pit-original/${width}.${format}`), `derivative file missing: ${width}.${format}`);
  }
}
for (const fallback of ["placeholder", "default-dog", "/images/cities/city-ottawa"]) {
  check(!pageHeaderHtml.toLowerCase().includes(fallback), `unintended hero fallback marker present: ${fallback}`);
}

check(parkSchema?.name === "Conroy Pit", "Park schema name mismatch");
check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch");
check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch");
check(parkSchema?.dateModified === expectedReviewed, "Park schema review date mismatch");
check(parkSchema?.address?.streetAddress === "P17, Conroy Road", "Park schema address mismatch");
check(parkSchema?.address?.addressLocality === "Ottawa", "Park schema city mismatch");
check(parkSchema?.address?.addressRegion === "Ontario", "Park schema province mismatch");
check(!parkSchema?.address?.postalCode, "unverified postal code rendered in schema");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude, "Park schema latitude mismatch");
check(parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema longitude mismatch");
check(parkSchema?.amenityFeature?.some((entry) => entry.name === "Parking" && entry.value === true), "confirmed parking missing from schema");
check(!parkSchema?.amenityFeature?.some((entry) => ["Fenced area", "Small dog area", "Water", "Benches", "Shade", "Waste bins", "Bag dispensers", "Washrooms"].includes(entry.name)), "unconfirmed amenity emitted in schema");
check(faqSchema?.dateModified === expectedReviewed, "FAQ schema review date mismatch");
check(faqSchema?.mainEntity?.length === 6, "FAQ schema question count mismatch");

const parks = JSON.parse(fs.readFileSync("src/data/generated/parks.json", "utf8"));
const park = parks.find((entry) => entry.slug === "conroy-pit");
check(park?.canonicalUrl === expectedCanonical, "generated JSON canonical mismatch");
check(park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON source mismatch");
check(park?.raw?.["Reviewed On"] === "Tue Aug 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Updated On"] === "Tue Jun 24 2025 20:51:45 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On was unexpectedly changed");

const derivatives = JSON.parse(fs.readFileSync("src/data/generated/image-derivatives.json", "utf8")).images[imageSource];
check(derivatives?.width === 1720 && derivatives?.height === 914, "source image dimensions mismatch");
check(derivatives?.fallbackSrc === "/images/optimized/dog-parks/conroy-pit-original/1600.jpg", "image fallback derivative mismatch");

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
