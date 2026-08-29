import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const slug = "millers-creek-park";
const route = `/dog-parks/${slug}/`;
const htmlPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || `dist/dog-parks/${slug}/index.html`;
const finalize = process.argv.includes("--finalize");
const markVerification = process.argv.includes("--mark-verification");
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const jsonPath = "src/data/generated/parks.json";
const derivativeManifestPath = "src/data/generated/image-derivatives.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imageSource = "/images/dog-parks/millers-creek-park-original.png";
const imagePath = `public${imageSource}`;
const expectedTitle = "McLean Community Centre Dog Park | Ajax | LeashFree.ca";
const expectedDescription = "Plan a visit to McLean Community Centre Leash-Free Dog Park in Ajax: smaller-dog section, fencing, grass, benches, waste, hours, parking and rules.";
const expectedCanonical = "https://leashfree.ca/dog-parks/millers-creek-park/";
const expectedSource = "https://facilities.ajax.ca/Home/Detail?Id=db29e406-736f-469c-bec3-fdcfbca20c97";
const expectedReviewed = "2026-08-28T23:05:04.000Z";
const expectedAlt = "Realistic digital illustration of two off-leash dogs and their handler inside the fenced grass area at McLean Community Centre in Ajax";
const expectedCoordinates = { latitude: "43.8655392926", longitude: "-79.0378345154" };

function parseCsv(text) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (quoted) { if (char === '"' && next === '"') { value += '"'; index += 1; } else if (char === '"') quoted = false; else value += char; }
    else if (char === '"') quoted = true; else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; } else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function updateManifest(patch, nextPriorityPage = "Millers Creek Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Millers Creek Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Millers Creek Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  if (patch.status === "blocked") {
    const blockers = [{ page: "Millers Creek Park", route, status: "blocked", issue: "Ajax's current general outdoor page says there are four designated off-leash areas, lists five and omits the 2024 McLean Community Centre dog park, while the current municipal asset layer identifies eight areas and current facility, pet-waste and newsletter records identify McLean. The official sources remain unreconciled." }];
    updated = updated.replace(/"blockingIssues"\s*:\s*\[\{[^{}]*\}\]/, `"blockingIssues": ${JSON.stringify(blockers)}`);
    const revalidation = { page: "Millers Creek Park", route, checkedOn: "2026-08-28", checkedAt: "2026-08-29T00:03:30.000Z", status: "blocked", finding: "The current Town outdoor page still says Ajax has four designated off-leash areas, then lists five without McLean. The live municipal dog-park asset layer identifies eight areas including McLean, and current facility, pet-waste and Town newsletter records continue to identify the McLean dog park. The Spring 2025 Ward 1 newsletter additionally confirms a section for smaller dogs." };
    updated = updated.replace(/"lastBlockedRevalidation"\s*:\s*\{[^{}]*\}/, `"lastBlockedRevalidation": ${JSON.stringify(revalidation)}`);
  }
  fs.writeFileSync(manifestPath, updated);
}

const implementationChecks = { content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete", imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-complete", backlog: "implementation-complete", renderedPage: "verification-pending" };
if (markVerification) {
  updateManifest({ status: "verification-pending", artifactChecks: implementationChecks, nextAction: "Run production build, repository QA, exact parity, image uniqueness and rendered-page checks; finalize as blocked while the Town list conflict remains." });
  console.log("Marked Millers Creek Park verification-pending.");
  process.exit(0);
}

const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const match = (text, expression) => text.match(expression)?.[1] || "";
const html = fs.readFileSync(htmlPath, "utf8");
const visibleText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|#xA0);/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;|&apos;/gi, "'").replace(/&quot;|“|”/gi, '"').replace(/&ndash;|–/gi, "–").replace(/\s+/g, " ").trim();
const title = match(html, /<title>([^<]+)<\/title>/i).replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&");
const description = match(html, /<meta name="description" content="([^"]*)"/i);
const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].flatMap((entry) => { const parsed = JSON.parse(entry[1]); return Array.isArray(parsed) ? parsed : [parsed]; });
const parkSchema = jsonLd.find((entry) => entry["@type"] === "Park");
const faqSchema = jsonLd.find((entry) => entry["@type"] === "FAQPage");
const breadcrumbSchema = jsonLd.find((entry) => entry["@type"] === "BreadcrumbList");

check(title === expectedTitle, "SEO title mismatch"); check(description === expectedDescription, "meta description mismatch"); check(canonical === expectedCanonical, "canonical mismatch");
check(visibleText.includes("Information reviewed Aug 28, 2026"), "Reviewed On text missing");
check(visibleText.includes("McLean Community Centre Leash-Free Dog Park") && visibleText.includes("95 Magill Drive"), "official identity or address missing");
check(visibleText.includes("announced the new dog park open in September 2024"), "official opening announcement missing");
check(visibleText.includes("approximately 1,754 square metres") && visibleText.includes("1.8-metre decorative metal fence"), "dog-area size or fence missing");
check(visibleText.includes("grass and concrete-pad surfaces") && visibleText.includes("two six-foot steel benches"), "surface or benches missing");
check(visibleText.includes("section for smaller dogs") && visibleText.includes("exact small-dog layout"), "confirmed smaller-dog section or remaining layout unknown missing");
check(visibleText.includes("one waste receptacle") && visibleText.includes("exterior Millers Creek Park washrooms"), "waste or washroom detail missing");
check(visibleText.includes("6 a.m. to 11 p.m.") && visibleText.includes("no more than three dogs"), "hours or handler limit missing");
check(visibleText.includes("without naming McLean") && visibleText.includes("current dog-park map"), "official-list conflict warning missing");
check(!visibleText.includes("Near Delaney Dr & Church St") && !visibleText.includes("43.86656385296356") && !visibleText.includes("Dawn to Dusk") && !visibleText.includes("informal off-leash"), "unsupported legacy fact visible");
check(!/https?:\/\//i.test(visibleText), "raw URL visible in page text");
check(!/(primary sources|research notes|implementation|verification|visitor-facing|editorial reasoning|source conflict|old copy|previously attached|improved page|built-in imagegen)/i.test(visibleText), "internal process language visible");

check(Boolean(breadcrumbSchema), "Breadcrumb schema missing"); check(Boolean(parkSchema), "Park schema missing"); check(Boolean(faqSchema), "FAQ schema missing");
check(parkSchema?.name === "McLean Community Centre Leash-Free Dog Park", "Park schema name mismatch"); check(parkSchema?.url === expectedCanonical, "Park schema URL mismatch"); check(parkSchema?.sameAs === expectedSource, "Park schema source mismatch"); check(parkSchema?.dateModified === expectedReviewed, "Park schema Reviewed On mismatch");
check(parkSchema?.address?.streetAddress === "95 Magill Drive" && parkSchema?.address?.addressLocality === "Ajax" && parkSchema?.address?.addressRegion === "Ontario" && parkSchema?.address?.postalCode === "L1T 4M5", "Park schema address mismatch");
check(parkSchema?.geo?.latitude === expectedCoordinates.latitude && parkSchema?.geo?.longitude === expectedCoordinates.longitude, "Park schema coordinates mismatch");
const amenityNames = (parkSchema?.amenityFeature || []).map((item) => item.name);
check(JSON.stringify(amenityNames) === JSON.stringify(["Fenced area", "Small dog area", "Benches", "Waste bins", "Parking", "Washrooms"]), "Park schema amenities mismatch");
check(faqSchema?.dateModified === expectedReviewed && faqSchema?.mainEntity?.length === 10, "FAQ schema review date or count mismatch");
check(html.includes(`href="${expectedSource}"`), "official source link missing");

check(html.includes(imageSource), "intended source image missing"); check(html.includes(`alt="${expectedAlt}"`), "hero alt mismatch");
for (const width of [480, 960]) for (const format of ["avif", "webp", "jpg"]) {
  const derivative = `/images/optimized/dog-parks/millers-creek-park-original/${width}.${format}`;
  check(html.includes(derivative), `rendered derivative missing: ${width}.${format}`); check(fs.existsSync(`public${derivative}`), `derivative file missing: ${width}.${format}`);
}
const pageHeaderHtml = match(html, /(<section class="page-header">[\s\S]*?<\/section>)/i).toLowerCase();
for (const fallback of ["dog-park-default", "default-dog", "/images/cities/city-ajax", "ajax-waterfront-park-original", "hermitage-park-original"]) check(!pageHeaderHtml.includes(fallback), `unintended hero fallback marker present: ${fallback}`);
check(fs.readFileSync("src/data/dog-park-image-overrides.js", "utf8").includes(`"${slug}": "${imageSource}"`), "image override missing");
check(fs.readFileSync("src/pages/dog-parks/[slug].astro", "utf8").includes(`"${slug}": "${expectedAlt}"`), "hero alt override missing");

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8")); const park = parks.find((item) => item.slug === slug); check(Boolean(park), "generated JSON record missing");
check(park?.canonicalUrl === expectedCanonical && park?.raw?.["Park Website or Source"] === expectedSource, "generated JSON canonical or source mismatch");
check(park?.raw?.["Street Address"] === "95 Magill Drive" && park?.raw?.City === "Ajax" && park?.raw?.Province === "Ontario" && park?.raw?.["Postal Code"] === "L1T 4M5", "generated JSON location mismatch");
check(park?.raw?.latitude === expectedCoordinates.latitude && park?.raw?.longitude === expectedCoordinates.longitude, "generated JSON coordinates mismatch");
check(park?.raw?.["Reviewed On"] === "Fri Aug 28 2026 23:05:04 GMT+0000 (Coordinated Universal Time)", "generated JSON Reviewed On mismatch");
check(park?.raw?.["Notes / Comments"]?.includes("By-law-76-2026-Parks-By-law.pdf") && park?.raw?.["Notes / Comments"]?.includes("W1-Newsletter_September_2024_web.pdf") && park?.raw?.["Notes / Comments"]?.includes("W1-Newsletter_March-2025-5.pdf"), "current by-law or newsletter source missing from internal notes");
check(!park?.raw?.["Notes / Comments"]?.includes("Modules/bylaws/Bylaw/Download"), "deprecated Ajax by-law URL remains in internal notes");
check(park?.raw?.["Updated On"] === "Thu Jul 10 2025 23:42:19 GMT+0000 (Coordinated Universal Time)", "Webflow Updated On unexpectedly changed");
check(park?.raw?.Fenced === "Yes" && park?.raw?.["Separate Small Dog Area"] === "Yes" && park?.raw?.["Surface type"] === "Grass and concrete pad" && park?.raw?.Size === "Approximately 1,754 m² (official dog-park polygon)", "generated JSON park setup mismatch");
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0]; const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); check(Boolean(csvRow), "CMS CSV record missing");
if (park && csvRow) for (const [key, value] of Object.entries(park.raw)) { check(headers.includes(key), `CSV column missing: ${key}`); if (headers.includes(key)) check(String(csvRow[headers.indexOf(key)] ?? "") === String(value ?? ""), `JSON-CSV mismatch: ${key}`); }
check(!fs.readFileSync("reports/thin-page-backlog.csv", "utf8").includes(route), "thin-page backlog still contains route"); check(!fs.readFileSync("reports/content-review-queue.csv", "utf8").includes(route), "review queue still contains route");

const derivativeManifest = JSON.parse(fs.readFileSync(derivativeManifestPath, "utf8")); const derivativeEntry = derivativeManifest.images?.[imageSource];
check(derivativeEntry?.width === 1536 && derivativeEntry?.height === 1024, "derivative manifest dimensions mismatch"); check(derivativeEntry?.fallbackSrc === "/images/optimized/dog-parks/millers-creek-park-original/960.jpg", "derivative fallback mismatch");
const metadata = await sharp(imagePath).metadata(); check(metadata.width === 1536 && metadata.height === 1024, "source image dimensions mismatch"); check(fs.statSync(imagePath).size < 1_200_000, "source image exceeds compressed-size ceiling");
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(imagePath)).digest("hex");
for (const file of fs.readdirSync("public/images/dog-parks")) {
  if (file === path.basename(imagePath) || !file.endsWith("-original.png")) continue;
  const candidate = path.join("public/images/dog-parks", file); const candidateHash = crypto.createHash("sha256").update(fs.readFileSync(candidate)).digest("hex");
  check(candidateHash !== sourceHash, `source image reused from ${file}`);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); const manifestEntry = manifest.improvementQueue.find((item) => item.slug === slug);
check(manifestEntry?.conflicts?.length === 1 && manifestEntry?.status !== "passed", "manifest conflict missing or page prematurely passed");
check(manifestEntry?.sourceUrls?.includes("https://ajax.ca/wp-content/uploads/2026/06/By-law-76-2026-Parks-By-law.pdf") && manifestEntry?.sourceUrls?.includes("https://www.ajax.ca/en/inside-townhall/resources/Council/Councillor-Newsletters/September-2024/W1-Newsletter_September_2024_web.pdf") && manifestEntry?.sourceUrls?.includes("https://www.ajax.ca/en/inside-townhall/resources/Council/Councillor-Newsletters/Spring-2025/W1-Newsletter_March-2025-5.pdf"), "manifest current by-law or newsletter source missing");
check(manifestEntry?.confirmedFacts?.some((item) => item.includes("section for smaller dogs")) && manifestEntry?.unknowns?.includes("the exact small-dog-section size and layout") && !manifestEntry?.unknowns?.includes("a separate small-dog area"), "manifest smaller-dog facts or unknowns are not synchronized");
check(!manifestEntry?.sourceUrls?.some((url) => url.includes("Modules/bylaws/Bylaw/Download")), "manifest retains deprecated Ajax by-law URL");

console.log(JSON.stringify({ route, title, description, canonical, visibleTextCharacters: visibleText.length, sourceImage: { width: metadata.width, height: metadata.height, bytes: fs.statSync(imagePath).size, sha256: sourceHash }, renderedDerivativeCount: 6, faqQuestions: faqSchema?.mainEntity?.length || 0, amenitySchema: parkSchema?.amenityFeature || [], conflictCount: manifestEntry?.conflicts?.length || 0, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
else if (finalize) {
  updateManifest({
    status: "blocked",
    artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "verified-in-render", generatedJson: "implementation-complete", csv: "verified-parity", imageMapping: "verified", sourceImage: "verified", optimizedDerivatives: "verified", backlog: "implementation-complete", renderedPage: "verified" },
    reason: "Implementation and QA completed with current Town of Ajax asset, park, facility, waste, 2024 opening announcement, Spring 2025 Ward 1 newsletter, 2025 Dog and Cat By-law and 2026 Parks By-law records; visitor copy, SEO, FAQs, generated JSON and CMS CSV are synchronized, including the confirmed smaller-dog section; the unique compressed illustration and six responsive derivatives passed; production build, repository page QA, exact parity, metadata, schema, source, image, fallback and editorial-marker checks passed. Status remains blocked only because the current general outdoor page still omits the newer McLean dog park while the live asset layer identifies eight areas and other current official records identify it.",
    nextAction: "Revalidate the Town's general off-leash list against the current asset, facility and pet-waste records; keep Millers Creek Park active until the official sources reconcile.",
    image: { ...manifestEntry.image, compressedBytes: fs.statSync(imagePath).size, sha256: sourceHash }
  });
  console.log("Finalized Millers Creek Park as blocked after successful QA because current Town sources remain unreconciled.");
}
