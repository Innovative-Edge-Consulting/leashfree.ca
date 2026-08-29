import fs from "node:fs";
import sharp from "sharp";

const slug = "guindon-park-cornwall";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/guindon-park-cornwall-original.png";
const imageSource = "/images/dog-parks/guindon-park-cornwall-original.png";
const imageAlt = "Realistic digital illustration of a leashed dog and handler on a wooded park roadway at Guindon Park in Cornwall";
const seoTitle = "Guindon Park Dog Rules & Visit Guide | Cornwall";
const metaDescription = "Plan a leashed visit to Guindon Park in Cornwall: permitted roadways and Trillium Picnic Area, trail exclusions, washroom hours and current rules.";
const reviewedOn = "Fri Aug 28 2026 20:00:00 GMT+0000 (Coordinated Universal Time)";
const sourceUrl = "https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/guindon-park/";
const intro = `<p><strong>Guindon Park</strong> is a 500-acre waterfront park in Cornwall where dogs are allowed only on park roadways and in the Trillium Picnic Area. Dogs must stay leashed, and the nature and ski trails are not dog routes.</p>`;
const body = `<h2>Dog access is limited to two parts of the park</h2>
<p>Bring your dog only onto Guindon Park roadways and into the Trillium Picnic Area. Cornwall does not permit dogs in the park's other picnic areas or on the nature and ski trails. Keep the leash attached throughout the visit; Guindon Park is not an off-leash dog park.</p>
<h2>A 500-acre park does not mean 500 acres of dog access</h2>
<p>The City describes Guindon as a 500-acre, smoke-free park just off Highway 2, with dozens of kilometres of trails, woodland, waterfront and recreation areas. That size covers the whole park. For a dog outing, use the City's trail and picnic maps to identify Trillium and stay on the permitted roadways rather than entering a trail or another picnic area.</p>
<h2>Plan around the published facilities</h2>
<p>The City identifies an east parking lot and public washrooms at the end of Floral Drive. The washrooms are open daily from 8:30 a.m. to 5 p.m., weather permitting, and a portable toilet is available in the east parking lot. Overall park hours, parking capacity, parking fees, accessible stalls and ordinary space availability are not published, so check signs when you arrive.</p>
<h2>Keep clear of facilities and the boat launch</h2>
<p>Dogs must remain at least nine metres from park facilities and equipment such as playground structures, gazebos, bleachers and sports fields. Cornwall also prohibits people and domestic animals from swimming, bathing or fishing within 75 metres of the Guindon Park boat launch. Potable dog water, seating, shade and waste fixtures within the dog-permitted area are not listed, so bring water and waste bags.</p>
<h2>Follow Cornwall's leash, control and cleanup rules</h2>
<p>Use a leash no longer than two metres, keep your dog under control and remove waste from public property. Cornwall requires a licence and tag within 14 days of acquiring a dog, with tags renewed annually. Follow posted restrictions because temporary closures, trail conditions and event boundaries can change.</p>`;
const parkRules = "Dogs are permitted only on Guindon Park roadways and in the Trillium Picnic Area. Keep dogs under control on a leash no longer than two metres, stay at least nine metres from park facilities and equipment, remove waste, and do not enter other picnic areas or the nature and ski trails.";
const faqs = `<p><strong>Is Guindon Park an off-leash dog park?</strong></p><p>No. Dogs must stay leashed in every part of Guindon Park where they are permitted.</p>
<p><strong>Where are dogs allowed at Guindon Park?</strong></p><p>Cornwall permits dogs on park roadways and in the Trillium Picnic Area.</p>
<p><strong>Can dogs use the nature or ski trails?</strong></p><p>No. The City's current dog guidance excludes the nature and ski trails, along with every picnic area other than Trillium.</p>
<p><strong>How long can the leash be?</strong></p><p>The leash may be no longer than two metres, or about 6.5 feet.</p>
<p><strong>How close can dogs get to park facilities?</strong></p><p>Keep dogs at least nine metres from facilities and equipment such as playground structures, gazebos, bleachers and sports fields.</p>
<p><strong>Are washrooms available?</strong></p><p>Washrooms at the end of Floral Drive are open daily from 8:30 a.m. to 5 p.m., weather permitting. A portable toilet is also identified in the east parking lot.</p>
<p><strong>Is parking available?</strong></p><p>The City identifies an east parking lot, but it does not publish capacity, fees, accessible-stall details or ordinary availability for a visit.</p>
<p><strong>What are Guindon Park's hours?</strong></p><p>The current park page does not publish overall opening and closing hours. Check posted signs before entering.</p>
<p><strong>Can dogs swim near the boat launch?</strong></p><p>No person or domestic animal may swim, bathe or fish within 75 metres of the Guindon Park boat launch.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: current City park page describes a 500-acre smoke-free waterfront park just off Highway 2, dozens of kilometres of trails, an east parking lot, Floral Drive washrooms open daily 8:30 a.m.-5 p.m. weather permitting, and a portable toilet in the east lot. Current animal guidance and the consolidated Animal Control By-law permit dogs only on Guindon Park roadways and in the Trillium Picnic Area, not other picnic areas or nature/ski trails; maximum two-metre leash, control, nine-metre facility/equipment setback, cleanup, licence and annual tag requirements apply. The City bylaw page prohibits people and domestic animals from swimming, bathing or fishing within 75 metres of the Guindon Park boat launch. Reasonable inference: this is a limited on-leash guide; Vincent Massey Drive/Highway 2 is arrival context rather than a numbered address; 500 acres is the whole park, not dog-use area. Unknown: numbered address, postal code, official coordinates, precise roadway/Trillium boundaries, park hours, parking capacity/fees/accessibility/availability, dog fencing or small-dog area, exact dog-use surfaces, potable dog water, seating, shade, waste fixtures and temporary restrictions. Sources: https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/guindon-park/ | https://www.cornwall.ca/en/property-environment/animals-and-wildlife/ | https://media-003-ca.cdn.govstack.com/cornwall-ca/media/0lvj1i4d/animal_control_by-law.pdf | https://www.cornwall.ca/en/government-council/by-laws/ | https://www.cornwall.ca/en/build-invest/maps/ | https://media-003-ca.cdn.govstack.com/cornwall-ca/media/av2nj20w/guindonpark_trailnetwork.pdf | https://www.cornwall.ca/en/play-here/resources/Maps/Map_GuindonPark_PicnicAreas.pdf. Source variation: legacy leash-free and broad trail-access framing is contradicted by current rules and removed. Legacy coordinates, postal code, 6 a.m.-10 p.m. hours and affirmative dog-area amenities are unsupported. The current 500-acre visitor figure supersedes an older planning assessment's approximately 235-hectare study figure for general park context; neither measures dog access. Image: built-in ImageGen on 2026-08-28; independent realistic editorial digital illustration without a reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Guindon Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Guindon Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Guindon Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
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
    const anchor = '  "david-bartlett-park": "/images/dog-parks/david-bartlett-park-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"david-bartlett-park": "Realistic digital illustration of two off-leash dogs and their handler in a tree-lined clearing at David Bartlett Park in Manotick"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

if (!fs.existsSync(imagePath)) throw new Error("Guindon Park source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("Guindon Park source image must be 1536x1024");
for (const settings of [{ quality: 76, colors: 256 }, { quality: 68, colors: 192 }, { quality: 60, colors: 128 }]) {
  if (fs.statSync(imagePath).size < 1_200_000) break;
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: settings.quality, colors: settings.colors, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}
if (fs.statSync(imagePath).size >= 1_200_000) throw new Error("Guindon Park source image remains above the compression ceiling");

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Guindon Park generated JSON record not found");
Object.assign(park, { name: "Guindon Park", title: "Guindon Park On-Leash Dog Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Cornwall"], Province: ["Ontario"], Tags: ["on-leash", "limited-dog-access", "waterfront", "woodland"] } });
Object.assign(park.raw, {
  "Park Name": "Guindon Park", "Park Header": "Guindon Park On-Leash Dog Guide", "Park type": "On-leash park guide", Description: body,
  "Street Address": "Vincent Massey Drive (Highway 2)", latitude: "", longitude: "", City: "Cornwall", Province: "Ontario", "Postal Code": "",
  Fenced: "No designated dog enclosure; leash required", "Separate Small Dog Area": "No designated dog area", "Surface type": "Park roadways and Trillium Picnic Area; exact surfaces not published", Size: "500 acres (whole park)",
  "Water source available": "No dog water published; no swimming within 75 m of boat launch", Benches: "Not published for the dog-permitted area", "Shaded area": "Not published for the dog-permitted area", "Waste bins": "Locations not published; bring waste bags", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "East parking lot identified; capacity, fees and accessibility not published", "Washrooms nearby": "Floral Drive: 8:30 AM-5:00 PM daily, weather permitting; portable toilet in east lot", "Operating hours": "Overall park hours not published",
  "Seasonal Restrictions": "No dogs on nature or ski trails or in other picnic areas", "Park Rules": parkRules, "Park Website or Source": sourceUrl, "Google Maps Link": "",
  Tags: "on-leash,limited-dog-access,waterfront,woodland", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Guindon Park CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Guindon Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed context only: mature Eastern Ontario woodland beside a park roadway where a dog may be walked on leash. One dog is visibly leashed; no prohibited trail access, waterfront use or unconfirmed amenity is shown, and the scene is visibly illustrative rather than an actual park photograph." },
  reason: "Implementation completed from current City of Cornwall park, animal-control, bylaw and map sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
});
console.log("Applied Guindon Park implementation and marked it implementation-complete.");
