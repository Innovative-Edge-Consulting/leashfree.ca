import fs from "node:fs";
import sharp from "sharp";

const slug = "david-bartlett-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/david-bartlett-park-original.png";
const imageSource = "/images/dog-parks/david-bartlett-park-original.png";
const imageAlt = "Realistic digital illustration of two off-leash dogs and their handler in a tree-lined clearing at David Bartlett Park in Manotick";
const seoTitle = "David Bartlett Park Off-Leash Guide | Ottawa";
const metaDescription = "Plan a visit to David Bartlett Park in Manotick with its mixed leash boundary, official address, free gravel parking, hours and current Ottawa dog rules.";
const reviewedOn = "Fri Aug 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
const sourceUrl = "https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks";
const intro = `<p><strong>David Bartlett Park</strong> is a large community park in Manotick with a mixed dog designation. Dogs may be off leash through most of the park, but they must be leashed south of the fence along the pathway at the park's southern edge.</p>`;
const body = `<h2>Most of the park is off leash, with one leashed section</h2>
<p>Ottawa's current park map classifies David Bartlett Park as mixed use for dogs. Dogs may be off leash through the main part of the park. South of the fence, along the pathway at the southern edge, dogs must stay leashed. Check the posted boundary before unclipping because this is not a single fully enclosed dog run.</p>
<h2>Use the official address and follow the boundary</h2>
<p>The City lists 5201 McLean Crescent in Rideau as the park address and maps the property as a community park of approximately 14.285 hectares. That figure covers the whole park, not a separately measured off-leash area. The official map point represents the park rather than a particular entrance.</p>
<h2>Free gravel parking is mapped</h2>
<p>The municipal inventory shows a free 25-space gravel parking lot at the park. It lists no lighting and no designated accessible spaces for that lot, and the park record does not mark the site as accessible. Arrive in daylight and follow current parking signs because ordinary space availability is not guaranteed.</p>
<h2>Keep dogs away from the river</h2>
<p>Although the park sits beside the Rideau River, the current City record marks no waterbody access. Do not treat the shoreline as a dog-swimming area. Potable water, washrooms, benches, shade coverage, waste-bin locations and bag dispensers are not currently published, so bring drinking water and waste bags.</p>
<h2>Ottawa dog rules and park hours</h2>
<p>Keep an off-leash dog in sight and under voice control, and leash promptly if a confrontation with a person or animal may develop. Ottawa requires immediate waste cleanup, annual dog registration and a City tag on the collar or harness. Parks are open daily from 5 a.m. to 11 p.m. unless different hours are posted.</p>`;
const parkRules = "Dogs may be off leash through most of David Bartlett Park but must be leashed south of the fence along the southern pathway. Keep dogs in sight and under voice control, leash promptly if a confrontation may develop, remove waste immediately, and follow posted boundaries.";
const faqs = `<p><strong>Can dogs be off leash at David Bartlett Park?</strong></p><p>Yes, through most of the park. Ottawa's current map gives the park a mixed designation, so the southern section has a different rule.</p>
<p><strong>Where must dogs be leashed?</strong></p><p>Dogs must be leashed south of the fence along the pathway at the southern edge of the park. Follow posted signs if the on-site boundary changes.</p>
<p><strong>Is David Bartlett Park fully fenced?</strong></p><p>A southern fence is used as a leash-boundary reference, but current City sources do not describe the off-leash portion as a fully enclosed dog run.</p>
<p><strong>Is there a separate small-dog area?</strong></p><p>Current City sources do not publish a separate small-dog area.</p>
<p><strong>Can dogs swim in the Rideau River from the park?</strong></p><p>No waterbody access is identified in the current municipal park record, so do not use the shoreline as a dog-swimming entry.</p>
<p><strong>Is parking available?</strong></p><p>Yes. The City maps a free 25-space gravel lot with no lighting and no designated accessible spaces.</p>
<p><strong>What should visitors bring?</strong></p><p>Bring drinking water, waste bags and a leash. Potable water, washrooms, seating and dog-waste fixtures are not currently published.</p>
<p><strong>What are the park hours?</strong></p><p>Ottawa parks are open daily from 5 a.m. to 11 p.m. unless different hours are posted.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: current Ottawa Parks Inventory GIS identifies David Bartlett Park, Park ID 1536, at 5201 McLean Crescent, Rideau; community-park category and passive-recreation type; official point 45.24474882, -75.69989422; current polygon 142851.4446 square metres or approximately 14.285 hectares; mixed dog designation; dogs must be leashed south of the fence along the pathway south of the park and may be off leash through the rest; dogs must remain under handler control; GIS waterbody-access field no; free 25-space gravel lot with no lighting and zero mapped accessible spaces; park record marks accessible no; general park hours 5 a.m.-11 p.m. unless posted otherwise; annual City dog registration/tag; immediate cleanup; sight, voice-control and prompt-leashing requirements. Reasonable inference: the southern fence is a boundary reference, not proof of a fully enclosed off-leash run; the park point is the safest representative coordinate; current no-waterbody-access data supersedes legacy river-access wording. Unknown: full perimeter fence/gates, separate small-dog area, dog-use surface, potable water, benches, shade, waste bins, bag dispensers, washrooms, postal code, temporary closures or boundary changes, and ordinary parking availability. Sources: https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/24 | https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/8 | https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/14 | https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/dogs-parks | https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks | https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077 | https://ottawa.ca/en/living-ottawa/animals-and-pets/dogs/responsible-dog-ownership | https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/park-amenities | https://ottawa.ca/en/living-ottawa/animals-and-pets/pet-registration/cat-and-dog-registration. Source variation: legacy 35 acres is consistent with the current full-park polygon after rounding but is not a separate off-leash-area measurement. Legacy Rideau River access conflicts with the current no-waterbody-access field and is removed. Legacy grass/trails, water, benches, shade, waste bins, seasonal washroom and dawn-to-dusk claims are unsupported. Image: built-in ImageGen, 2026-08-28; independent realistic editorial digital illustration without a reference image; not a photograph.";

function parseCsv(text) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
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

function serializeCsv(rows) {
  return `${rows.map((row) => row.map((value) => { const text = String(value ?? ""); return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }).join(",")).join("\n")}\n`;
}

function updateManifest(patch, nextPriorityPage = "David Bartlett Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("David Bartlett Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("David Bartlett Park manifest entry end not found");
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
    const anchor = '  "colonel-danforth-park": "/images/dog-parks/colonel-danforth-park-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"colonel-danforth-park": "Realistic digital illustration of two off-leash dogs inside a wooded fenced area at Colonel Danforth Park in Scarborough"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Synchronize David Bartlett Park visitor copy, SEO, FAQs, data, mappings and queues using the completed research packet." });
  console.log("Marked David Bartlett Park implementation-pending."); process.exit(0);
}

if (!fs.existsSync(imagePath)) throw new Error("David Bartlett Park source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("David Bartlett Park source image must be 1536x1024");
for (const settings of [{ quality: 72, colors: 192 }, { quality: 64, colors: 128 }]) {
  if (fs.statSync(imagePath).size < 1_000_000) break;
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: settings.quality, colors: settings.colors, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}
if (fs.statSync(imagePath).size >= 1_000_000) throw new Error("David Bartlett Park source image remains above the compression ceiling");

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("David Bartlett Park generated JSON record not found");
Object.assign(park, { name: "David Bartlett Park", title: "David Bartlett Park Off-Leash Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Ottawa"], Province: ["Ontario"], Tags: ["off-leash", "mixed-designation", "parking", "community-park"] } });
Object.assign(park.raw, {
  "Park Name": "David Bartlett Park", "Park Header": "David Bartlett Park Off-Leash Guide", "Park type": "Mixed off-leash and on-leash park", Description: body,
  "Street Address": "5201 McLean Crescent", latitude: "45.24474882", longitude: "-75.69989422", City: "Ottawa", Province: "Ontario", "Postal Code": "",
  Fenced: "Not fully enclosed; southern fence marks the leash boundary", "Separate Small Dog Area": "Not published", "Surface type": "Not published for the dog-use areas", Size: "Approximately 14.285 ha (whole park)",
  "Water source available": "No waterbody access; potable water not published", Benches: "Not published", "Shaded area": "Not published", "Waste bins": "Locations not published; bring waste bags", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Yes", "Washrooms nearby": "Not published", "Operating hours": "5:00 AM-11:00 PM unless otherwise posted",
  "Seasonal Restrictions": "Follow posted closure and maintenance notices", "Park Rules": parkRules, "Park Website or Source": sourceUrl, "Google Maps Link": "",
  Tags: "off-leash,mixed-designation,parking,community-park", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("David Bartlett Park CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to David Bartlett Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed context only: a broad community park beside the Rideau River where most parkland is off leash. Two dogs and one attentive handler remain well away from the vegetated shoreline; the illustration adds no fence, sign, water access or unconfirmed amenity and is not presented as a photograph." },
  reason: "Implementation completed from current City of Ottawa park inventory, dog-designation, parking, park-hours, animal-control and registration sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "David Bartlett Park");
console.log("Applied David Bartlett Park implementation and marked it implementation-complete.");
