import fs from "node:fs";
import sharp from "sharp";

const slug = "colonel-danforth-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/colonel-danforth-park-original.png";
const imageSource = "/images/dog-parks/colonel-danforth-park-original.png";
const imageAlt = "Realistic digital illustration of two off-leash dogs inside a wooded fenced area at Colonel Danforth Park in Scarborough";
const seoTitle = "Colonel Danforth Park Off-Leash Guide | Toronto";
const metaDescription = "Plan a visit to Colonel Danforth Park's fenced off-leash area in Scarborough, with official address, parking, washroom, trail boundaries and dog rules.";
const reviewedOn = "Fri Aug 28 2026 18:00:00 GMT+0000 (Coordinated Universal Time)";
const sourceUrl = "https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/location/?id=4";
const intro = `<p><strong>Colonel Danforth Park</strong> has a designated fenced dog off-leash area in Scarborough's Highland Creek ravine. Dogs may run inside the signed enclosure, but they must remain leashed on the surrounding park paths and trails.</p>`;
const body = `<h2>A fenced off-leash area within a large ravine park</h2>
<p>Toronto's current park inventory lists a dog off-leash area at Colonel Danforth Park, and the City's off-leash study identifies it as fenced with no separate small-dog area. The enclosure is only one part of the broader park, so keep your dog leashed until you are through the signed off-leash entrance.</p>
<h2>Know where the boundary ends</h2>
<p>The surrounding Highland Creek trail system is shared park space rather than a continuous off-leash route. Toronto requires dogs to use a leash no longer than two metres outside designated areas. Follow every posted boundary and put the leash back on before leaving the enclosure, especially where walkers and cyclists share the trail.</p>
<h2>Arrival and park amenities</h2>
<p>The City's park record uses 73 Colonel Danforth Trail as the address and lists a picnic site and washroom. Current municipal mapping also shows three public parking lots in the park. It does not identify which lot is the simplest dog-area access, and washroom availability may be seasonal or time-limited. Check the official listing and on-site signs when you arrive.</p>
<h2>Bring water and waste bags</h2>
<p>Current City sources do not publish the off-leash surface, drinking-water access, bag-dispenser locations or dog-area waste-bin locations. Bring your own water and bags. Park-wide benches are mapped, but seating and shade inside the enclosure are not confirmed.</p>
<h2>Toronto off-leash rules</h2>
<p>Dogs using a Toronto off-leash area must be vaccinated and licensed. Keep your dog attended, within sight and under control, pick up waste immediately and follow posted signs. Dogs subject to a Dangerous Dog Order, dogs required to be muzzled or leashed by an order, female dogs in heat and other dogs excluded by City rules may not use the enclosure. Toronto parks are closed between midnight and 5:30 a.m.; follow any separately posted hours at the off-leash area.</p>`;
const parkRules = "Inside the signed enclosure, keep your vaccinated and licensed dog attended, within sight and under control, and pick up waste immediately. Use a leash no longer than two metres everywhere outside the designated off-leash boundary and follow posted park rules.";
const faqs = `<p><strong>Does Colonel Danforth Park have an off-leash dog area?</strong></p><p>Yes. Toronto's current park inventory and adopted Dogs Off-Leash Strategy list a designated off-leash area at Colonel Danforth Park.</p>
<p><strong>Is the Colonel Danforth Park off-leash area fenced?</strong></p><p>Yes. Toronto's citywide study identifies it as fenced. Follow the current on-site gates and boundary signs because the exact post-expansion layout is not published online.</p>
<p><strong>Is there a separate small-dog area?</strong></p><p>No separate small-dog area is identified in the City's off-leash study.</p>
<p><strong>Can dogs be off leash on the Highland Creek trails?</strong></p><p>No. Keep dogs on a leash no longer than two metres on the surrounding park and multi-use trails. Remove the leash only after entering the designated enclosure.</p>
<p><strong>Where is Colonel Danforth Park?</strong></p><p>The official park address is 73 Colonel Danforth Trail in Scarborough. The address and mapped point represent the park, not a guaranteed off-leash entrance.</p>
<p><strong>Are parking and washrooms available?</strong></p><p>The City maps three public parking lots and lists a washroom at the park. The closest lot to the dog area and current washroom hours are not published, so check signs on arrival.</p>
<p><strong>What surface, water and hours should visitors expect?</strong></p><p>The off-leash surface and water access are not currently published. Bring water and bags. Toronto parks close from midnight to 5:30 a.m.; follow any separately posted dog-area hours.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: current Toronto park inventory identifies Colonel Danforth Park at 73 Colonel Danforth Trail, representative point 43.7784151381, -79.1687754154, with Dog Off-Leash Area, Picnic Site and Washroom; adopted 2025 Dogs Off-Leash Strategy lists Colonel Danforth Park in Ward 25; 2021 citywide OLA study records fenced yes and small-dog area no; current outdoor-recreation GIS contains an active off-leash-area asset; current parking GIS maps three public lots, two with 104 and 21 total spaces and one without a count; general park closure midnight-5:30 a.m.; on-leash maximum 2 m outside signed OLA; cleanup, control, vaccination, licence and attendance rules; Highland Creek trail connectivity; 2023 expansion funding with then-targeted fall 2023 construction. Reasonable inference: address and point are park arrival context, not exact dog-area entrance; follow signs and keep dogs leashed until inside. Unknown: exact post-expansion OLA boundary and area, surface, gate configuration, OLA seating/shade, potable water, bag dispensers, waste-bin locations, washroom season/hours, closest practical parking lot, postal code, temporary closures, commercial dog-walker access and separate posted OLA hours. Sources: https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/location/?id=4 | https://gis.toronto.ca/arcgis/rest/services/cot_geospatial13/FeatureServer/77 | https://gis.toronto.ca/arcgis/rest/services/cot_geospatial13/FeatureServer/34 | https://gis.toronto.ca/arcgis/rest/services/cot_geospatial13/FeatureServer/30 | https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254205.pdf | https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254206.pdf | https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dog-off-leash-areas/ | https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ | https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ | https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dogs-in-the-city/responsible-dog-ownership/ | https://www.toronto.ca/community-people/animals-pets/pet-licensing/ways-to-license-your-pet-2/ | https://secure.toronto.ca/council/agenda-item.do?item=2023.MM7.34 | https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/trails/. Source variation: legacy on-leash-only wording is superseded by current OLA records; legacy 12 acres conflicts with older official full-park figures near 54.8 ha and no current source establishes it as the OLA size, so it is removed. Legacy postal, water, surface, shade, bag-dispenser and 7 a.m.-9 p.m. claims are unsupported. Image: built-in ImageGen, 2026-08-28; independent realistic digital illustration without a reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Colonel Danforth Park") {
  const text = fs.readFileSync(manifestPath, "utf8"); const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Colonel Danforth Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Colonel Danforth Park manifest entry end not found");
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
    const anchor = '  "bishops-park": "/images/dog-parks/bishops-park-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"bishops-park": "Realistic digital illustration of a leashed dog and handler on the shaded asphalt path at Bishop\'s Park in Hamilton"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Synchronize Colonel Danforth Park visitor copy, SEO, FAQs, data, mappings and queues using the completed research packet." });
  console.log("Marked Colonel Danforth Park implementation-pending."); process.exit(0);
}

if (!fs.existsSync(imagePath)) throw new Error("Colonel Danforth Park source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("Colonel Danforth Park source image must be 1536x1024");
for (const settings of [{ quality: 72, colors: 192 }, { quality: 64, colors: 128 }]) {
  if (fs.statSync(imagePath).size < 1_000_000) break;
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: settings.quality, colors: settings.colors, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}
if (fs.statSync(imagePath).size >= 1_000_000) throw new Error("Colonel Danforth Park source image remains above the compression ceiling");

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Colonel Danforth Park generated JSON record not found");
Object.assign(park, { name: "Colonel Danforth Park", title: "Colonel Danforth Park Off-Leash Area Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Toronto"], Province: ["Ontario"], Tags: ["off-leash", "fenced", "trails", "parking", "washroom", "nature-park"] } });
Object.assign(park.raw, {
  "Park Name": "Colonel Danforth Park", "Park Header": "Colonel Danforth Park Off-Leash Area Guide", "Park type": "Fenced dog off-leash area", Description: body,
  "Street Address": "73 Colonel Danforth Trail", latitude: "43.7784151381", longitude: "-79.1687754154", City: "Toronto", Province: "Ontario", "Postal Code": "",
  Fenced: "Yes", "Separate Small Dog Area": "No", "Surface type": "Not published for the off-leash area", Size: "Current off-leash area size not published",
  "Water source available": "Not published; bring water", Benches: "Park-wide benches mapped; off-leash seating not confirmed", "Shaded area": "Wooded ravine setting; shade inside enclosure not confirmed", "Waste bins": "Locations not published; bring waste bags", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Yes", "Washrooms nearby": "Yes", "Operating hours": "Park closed 12:00 AM-5:30 AM; follow posted off-leash hours",
  "Seasonal Restrictions": "Follow posted closure and maintenance notices", "Park Rules": parkRules, "Park Website or Source": sourceUrl, "Google Maps Link": "",
  Tags: "off-leash,fenced,trails,parking,washroom,nature-park", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Colonel Danforth Park CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Colonel Danforth Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed context only: fenced designated off-leash use in the wooded Highland Creek ravine. Two dogs and one attentive handler remain inside the enclosure; no unconfirmed water, washroom, parking, furniture, signage, small-dog section or exact gate layout is shown." },
  reason: "Implementation completed from current Toronto park inventory and GIS, adopted off-leash strategy, citywide OLA study, park rules, dog-ownership guidance and trail sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "Colonel Danforth Park");
console.log("Applied Colonel Danforth Park implementation and marked it implementation-complete.");
