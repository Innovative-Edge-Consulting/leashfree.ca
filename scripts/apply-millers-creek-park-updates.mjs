import fs from "node:fs";
import sharp from "sharp";

const slug = "millers-creek-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/millers-creek-park-original.png";
const imageSource = "/images/dog-parks/millers-creek-park-original.png";
const imageAlt = "Realistic digital illustration of two off-leash dogs and their handler inside the fenced grass area at McLean Community Centre in Ajax";
const seoTitle = "McLean Community Centre Dog Park | Ajax";
const metaDescription = "Plan a visit to McLean Community Centre Leash-Free Dog Park in Ajax: smaller-dog section, fencing, grass, benches, waste, hours, parking and rules.";
const reviewedOn = "Fri Aug 28 2026 23:05:04 GMT+0000 (Coordinated Universal Time)";
const sourceUrl = "https://facilities.ajax.ca/Home/Detail?Id=db29e406-736f-469c-bec3-fdcfbca20c97";
const dogBylawUrl = "https://ajax.ca/wp-content/uploads/2026/06/By-law-40-2025-Dog-and-Cat-By-law-Remediated.pdf";
const parksBylawUrl = "https://ajax.ca/wp-content/uploads/2026/06/By-law-76-2026-Parks-By-law.pdf";
const openingAnnouncementUrl = "https://www.ajax.ca/en/inside-townhall/resources/Council/Councillor-Newsletters/September-2024/W1-Newsletter_September_2024_web.pdf";
const smallDogAnnouncementUrl = "https://www.ajax.ca/en/inside-townhall/resources/Council/Councillor-Newsletters/Spring-2025/W1-Newsletter_March-2025-5.pdf";
const intro = `<p><strong>McLean Community Centre Leash-Free Dog Park</strong> is a fenced dog area with a smaller-dog section at 95 Magill Drive inside the wider Millers Creek Community Park property. Ajax's current asset records map approximately 1,754 square metres with grass, a concrete pad, two benches and a waste receptacle.</p>`;
const body = `<h2>A purpose-built dog park at Millers Creek</h2>
<p>The current Town asset name is McLean Community Centre Leash-Free Dog Park. Ajax announced the new dog park open in September 2024 beside the community centre within the wider 17.62-hectare McLean Community Centre/Millers Creek Community Park property. The dog-area polygon is much smaller at approximately 1,754 square metres, or 0.18 hectares.</p>
<h2>Fenced grass space with a concrete pad</h2>
<p>Ajax records a 1.8-metre decorative metal fence, grass and concrete-pad surfaces, two six-foot steel benches, one waste receptacle and four signs. A 2025 Town Ward 1 newsletter confirms a section for smaller dogs and an in-ground dog-waste container. The exact small-dog layout, gate arrangement, potable dog water, shade coverage and bag dispensers are not published. Bring water and waste bags and follow the posted layout.</p>
<h2>Use 95 Magill Drive for arrival</h2>
<p>The dog park is beside McLean Community Centre at 95 Magill Drive. The Town lists parking lots and washrooms at the community centre and also identifies exterior Millers Creek Park washrooms at the same address. Parking capacity, fees, accessible-stall details, ordinary availability and washroom hours are not published for a dog-park visit.</p>
<h2>Park access normally runs from 6 a.m. to 11 p.m.</h2>
<p>Ajax's Parks By-law generally closes parks between 11 p.m. and 6 a.m. unless another rule or posted notice applies. Temporary maintenance restrictions are not published in advance for every visit, so check the signs at the enclosure.</p>
<h2>Keep dogs supervised and under control</h2>
<p>Handlers in an Ajax leash-free area must be at least 18, keep dogs within sight and under verbal control, stay with them, and manage no more than three dogs. Leash a dog immediately if it shows aggression and remove waste at once. Outside the enclosure, dogs on or within three metres of a multi-use path or off-road trail need a leash no longer than 1.8 metres.</p>
<h2>Confirm the current Town listing before a special trip</h2>
<p>Ajax's current dog-park asset, facility and pet-waste records identify this fenced 2024 site. The broader Town outdoor page still says Ajax has four designated off-leash areas, then lists five locations without naming McLean. Check the Town's current dog-park map and posted signs before travelling if your visit depends on the enclosure being open.</p>`;
const parkRules = "Handlers must be at least 18, keep dogs within sight and under verbal control, remain with them, and control no more than three dogs. Immediately leash any dog showing aggression, remove waste, and use a leash no longer than 1.8 metres on or within three metres of multi-use paths and off-road trails.";
const faqs = `<p><strong>Is Millers Creek Park a current off-leash dog park?</strong></p><p>Current Ajax asset, facility and pet-waste records identify the fenced McLean Community Centre Leash-Free Dog Park at Millers Creek. The Town's broader outdoor list has not been synchronized with the newer 2024 site, so check the current map and posted signs before a special trip.</p>
<p><strong>Where is the dog park?</strong></p><p>Use McLean Community Centre at 95 Magill Drive, Ajax, Ontario L1T 4M5. The fenced area is beside the community centre within the wider Millers Creek Community Park property.</p>
<p><strong>Is the dog park fenced?</strong></p><p>Yes. The current municipal asset layer records a 1.8-metre decorative metal fence.</p>
<p><strong>How large is the dog area and what is the surface?</strong></p><p>The official polygon is approximately 1,754 square metres, with grass and a concrete pad.</p>
<p><strong>Are benches and waste facilities available?</strong></p><p>The asset record identifies two six-foot steel benches and one waste receptacle. Ajax also lists an in-ground dog-waste container at 95 Magill Drive, but it does not identify a bag dispenser, so bring bags.</p>
<p><strong>Is there a small-dog area or drinking water?</strong></p><p>Yes. Ajax's 2025 Ward 1 newsletter says the completed park has a section for smaller dogs. Its size and exact layout are not published, and current Town records do not identify potable dog water.</p>
<p><strong>Are parking and washrooms available?</strong></p><p>The community-centre listing includes parking lots and washrooms, and Ajax identifies exterior Millers Creek Park washrooms at 95 Magill Drive. Dog-park parking availability and washroom hours are not published.</p>
<p><strong>What are the park hours?</strong></p><p>Ajax parks are generally available from 6 a.m. to 11 p.m. unless another rule or posted notice applies.</p>
<p><strong>What rules apply inside the leash-free area?</strong></p><p>Handlers must be at least 18, supervise dogs within sight and under verbal control, manage no more than three dogs, leash any dog showing aggression and remove waste immediately.</p>`;
const notes = `Research reviewed 2026-08-28. Confirmed: current Ajax dog-park asset layer names McLean Community Centre Leash-Free Dog Park, installed in 2024, with a 1.8 m decorative metal fence, grass and concrete-pad surfaces, two six-foot steel benches, one waste receptacle, four signs and an approximately 1,753.877 m² polygon. Ajax's September 2024 Ward 1 newsletter explicitly announces the newest Town dog park open at Millers Creek Park on the west side of McLean Community Centre. Ajax's Spring 2025 Ward 1 newsletter confirms that the completed park has a section for smaller dogs and a new in-ground dog-waste container. Polygon centroid derived from official geometry: 43.8655392926, -79.0378345154. The wider municipal park layer identifies McLean Community Centre/Millers Creek Community Park as a 17.620996 ha community park at 95 Magill Drive. Current McLean Community Centre directory gives 95 Magill Drive, Ajax ON L1T 4M5 and lists a fenced outdoor dog park, parking lots and washrooms. Ajax's current pet-waste page identifies an in-ground dog-waste container at the McLean leash-free dog park. Current 2026 Parks By-law sets normal park access at 6 a.m.-11 p.m. Current Dog and Cat By-law requires adult handlers, visual sight and verbal control, no unattended dogs, maximum three dogs, immediate leashing for aggression, cleanup, and a maximum 1.8 m leash on or within 3 m of multi-use paths and off-road trails. Reasonable inference: the dog-area polygon centroid is the best map point; 1,754 m² describes the enclosure while 17.62 ha describes the wider park. Unknown: exact small-dog-section size and layout, gate configuration, potable dog water, shade, bag dispensers, parking capacity/fees/accessibility/availability, washroom schedule, and temporary closures. Sources: https://ajaxmaps.ajax.ca/gisbert/rest/services/Cityworks/Ops_ES_IAM_PROD/MapServer/67 | https://ajaxmaps.ajax.ca/gisernie/rest/services/Public/Ajax_Open_Data/MapServer/22 | https://facilities.ajax.ca/Home/Detail?Id=db29e406-736f-469c-bec3-fdcfbca20c97 | https://facilities.ajax.ca/Home/Detail?CategoryIds=&CloseMap=true&FacilityTypeIds=20420&Id=78567214-7083-4c6b-b50f-9a8bf1a808de&Keywords=&Page=6&ScrollTo=facilityResultsContainer | https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ | https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/ | ${dogBylawUrl} | ${parksBylawUrl} | https://www.ajax.ca/en/resources/news/2024/MCC-Millers-Creek-Trail---Construction-Notice.pdf | ${openingAnnouncementUrl} | ${smallDogAnnouncementUrl}. Conflict revalidated 2026-08-28: the current general outdoor page still says Ajax has four designated off-leash areas, then lists five without McLean, while the current asset layer identifies eight leash-free dog parks and the facility, waste and newsletter records identify the 2024 McLean dog park. Status remains blocked after QA until Town sources reconcile. Image: built-in ImageGen on 2026-08-28; independent realistic editorial digital illustration without a reference image; not a photograph.`;

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

function serializeCsv(rows) {
  return `${rows.map((row) => row.map((value) => { const text = String(value ?? ""); return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }).join(",")).join("\n")}\n`;
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
  const entry = JSON.parse(text.slice(start, end + 1));
  const sourceReplacements = new Map([
    ["https://www.ajax.ca/Modules/bylaws/Bylaw/Download/1d18be84-8f82-4259-91a1-f8ea30eb8751", dogBylawUrl],
    ["https://www.ajax.ca/Modules/bylaws/Bylaw/Download/dc5e13f2-b242-4ec1-93c5-a26849a7c2ab", parksBylawUrl]
  ]);
  entry.sourceUrls = (entry.sourceUrls || []).map((url) => sourceReplacements.get(url) || url);
  if (!entry.sourceUrls.includes(openingAnnouncementUrl)) entry.sourceUrls.push(openingAnnouncementUrl);
  if (!entry.sourceUrls.includes(smallDogAnnouncementUrl)) entry.sourceUrls.push(smallDogAnnouncementUrl);
  const openingFact = "Ajax's September 2024 Ward 1 newsletter announced the Town's newest dog park open at Millers Creek Park on the west side of McLean Community Centre";
  if (!(entry.confirmedFacts || []).includes(openingFact)) entry.confirmedFacts = [...(entry.confirmedFacts || []), openingFact];
  const smallDogFact = "Ajax's Spring 2025 Ward 1 newsletter confirms that the completed Millers Creek dog park includes a section for smaller dogs and a new in-ground dog-waste container";
  if (!(entry.confirmedFacts || []).includes(smallDogFact)) entry.confirmedFacts = [...(entry.confirmedFacts || []), smallDogFact];
  entry.unknowns = (entry.unknowns || []).filter((item) => item !== "a separate small-dog area");
  if (!entry.unknowns.includes("the exact small-dog-section size and layout")) entry.unknowns.unshift("the exact small-dog-section size and layout");
  entry.currentRecord = "Ajax's current municipal asset layer identifies McLean Community Centre Leash-Free Dog Park as a fenced 2024 dog area inside the wider McLean Community Centre/Millers Creek Community Park property at 95 Magill Drive. The current facility directory describes a fenced outdoor dog park, and Ajax's 2024 and 2025 Ward 1 newsletters confirm the opening and a section for smaller dogs.";
  entry.conflicts = ["Ajax's current Nature Trails & Outdoor Spaces page says the Town has four designated off-leash areas, then lists five locations without the 2024 McLean Community Centre dog park. The current municipal dog-park asset layer identifies eight areas including McLean, while the current McLean Community Centre listing, pet-waste page, and 2024 and 2025 Town newsletters also identify the McLean leash-free dog park. The general list has not been reconciled with these records."];
  entry.sourceVariation = "Legacy copy describes informal wooded creekside leash-free use near Delaney Drive and Church Street. Current municipal records instead identify a purpose-built 2024 fenced dog park beside McLean Community Centre at 95 Magill Drive, with a smaller-dog section confirmed by a 2025 Town newsletter. The legacy address, coordinates, postal code, unfenced setting, dirt-trail surface, dawn-to-dusk hours and unsupported shade, parking, water, washroom and seasonal claims are removed. Current Town sources conflict because the general outdoor page says four designated areas, lists five and omits McLean while the live dog-park asset layer identifies eight areas including McLean and current facility, waste and newsletter records confirm the site.";
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  updated = updated.replace("neither figure measures dog access.", "neither figure describes the permitted dog-use area.");
  fs.writeFileSync(manifestPath, updated);
}

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync("reports/thin-page-backlog.csv", "utf8")); const headers = rows[0];
  const records = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ""])));
  const countBy = (field) => [...records.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = records.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");
  fs.writeFileSync("reports/thin-page-backlog-summary.md", `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${records.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${tierRows}\n\n| Content type | Pages |\n| --- | ---: |\n${sectionRows}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${topRows}\n`);
}

function ensureImageMappings() {
  const mappingPath = "src/data/dog-park-image-overrides.js"; let mapping = fs.readFileSync(mappingPath, "utf8");
  const mappingLine = `  "${slug}": "${imageSource}",\n`;
  if (!mapping.includes(mappingLine.trim())) {
    const anchor = '  "guindon-park-cornwall": "/images/dog-parks/guindon-park-cornwall-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"guindon-park-cornwall": "Realistic digital illustration of a leashed dog and handler on a wooded park roadway at Guindon Park in Cornwall"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

if (process.argv.includes("--mark-research-complete")) {
  updateManifest({ status: "research-complete", nextAction: "Refresh the current by-law and opening-announcement source packet, then synchronize the existing page and audit artifacts without resolving the Town's conflicting general list silently." });
  console.log("Marked Millers Creek Park research-complete."); process.exit(0);
}

if (process.argv.includes("--mark-implementation")) {
  updateManifest({ status: "implementation-pending", artifactChecks: { content: "implementation-pending", seo: "implementation-pending", structuredData: "implementation-pending", generatedJson: "implementation-pending", csv: "implementation-pending", imageMapping: "implementation-pending", sourceImage: "implementation-pending", optimizedDerivatives: "implementation-pending", backlog: "implementation-pending", renderedPage: "implementation-pending" }, nextAction: "Generate the unique illustration and implement synchronized page, data, image, queue and audit artifacts." });
  console.log("Marked Millers Creek Park implementation-pending."); process.exit(0);
}

if (!fs.existsSync(imagePath)) throw new Error("Millers Creek Park source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("Millers Creek Park source image must be 1536x1024");
for (const settings of [{ quality: 76, colors: 256 }, { quality: 68, colors: 192 }, { quality: 60, colors: 128 }]) {
  if (fs.statSync(imagePath).size < 1_200_000) break;
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: settings.quality, colors: settings.colors, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}
if (fs.statSync(imagePath).size >= 1_200_000) throw new Error("Millers Creek Park source image remains above the compression ceiling");

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Millers Creek Park generated JSON record not found");
Object.assign(park, { name: "McLean Community Centre Leash-Free Dog Park", title: "McLean Community Centre Leash-Free Dog Park", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Ajax"], Province: ["Ontario"], Tags: ["off-leash", "fenced", "grass", "community-park", "small-dog-area"] } });
Object.assign(park.raw, {
  "Park Name": "McLean Community Centre Leash-Free Dog Park", "Park Header": "McLean Community Centre Leash-Free Dog Park", "Park type": "Leash Free", Description: body,
  "Street Address": "95 Magill Drive", latitude: "43.8655392926", longitude: "-79.0378345154", City: "Ajax", Province: "Ontario", "Postal Code": "L1T 4M5",
  Fenced: "Yes", "Separate Small Dog Area": "Yes", "Surface type": "Grass and concrete pad", Size: "Approximately 1,754 m² (official dog-park polygon)",
  "Water source available": "Not published for the dog park; bring water", Benches: "Yes", "Shaded area": "Not published for the dog park", "Waste bins": "Yes", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Yes", "Washrooms nearby": "Yes", "Operating hours": "6:00 AM – 11:00 PM unless otherwise posted", "Seasonal Restrictions": "Follow posted closures; the general Town off-leash list is not synchronized with newer asset records",
  "Park Rules": parkRules, "Park Website or Source": sourceUrl, "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.8655392926%2C-79.0378345154",
  Tags: "off-leash,fenced,grass,community-park,small-dog-area", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "", "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Millers Creek Park CMS CSV row not found");
for (const [key, value] of Object.entries(park.raw)) csvRow[headers.indexOf(key)] = String(value ?? "");
fs.writeFileSync(csvPath, serializeCsv(csvRows));
ensureImageMappings();
for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  const rows = parseCsv(fs.readFileSync(queuePath, "utf8")); const routeIndex = rows[0].indexOf("route");
  fs.writeFileSync(queuePath, serializeCsv([rows[0], ...rows.slice(1).filter((row) => row[routeIndex] !== route)]));
}
rebuildBacklogSummary();
updateManifest({
  status: "implementation-complete",
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete", imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-pending", backlog: "implementation-complete", renderedPage: "verification-pending" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Millers Creek Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed context only: a fenced grass dog area with a concrete pad, decorative metal fence, two steel benches and one waste receptacle beside a suburban Ajax recreation property. Two dogs and one attentive handler are shown; no creek, drinking water, bag dispenser or unconfirmed amenity appears. The exact smaller-dog-section layout is intentionally not depicted, and the scene is visibly illustrative rather than an actual park photograph." },
  reason: "Implementation completed from current Town of Ajax asset, park, facility, waste, Ward 1 newsletter and by-law records. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain. The newly confirmed smaller-dog section is recorded, while the official-list conflict is preserved and prevents passed status.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks; finalize as blocked while the Town list conflict remains."
});
console.log("Applied Millers Creek Park implementation and marked it implementation-complete.");
