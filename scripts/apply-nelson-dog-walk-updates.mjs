import fs from "node:fs";

const slug = "nelson-dog-walk-lakeside-path";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/nelson-dog-walk-lakeside-path-original.png";
const imageSource = "/images/dog-parks/nelson-dog-walk-lakeside-path-original.png";
const imageAlt = "Realistic digital illustration of a leashed dog and handler on Nelson's paved waterfront path beside Kootenay Lake";
const seoTitle = "Nelson Waterfront Dog Use Guide | LeashFree.ca";
const metaDescription = "Plan a Nelson waterfront dog walk with the official leash, off-leash and restricted zones, Lakeside Park limits, shared-path context and dog rules.";
const intro = `<p>Nelson's waterfront has <strong>separate off-leash, leash-required and dog-restricted zones</strong>, not one continuous leash-free path. Use the City of Nelson's Waterfront Dog Use Areas map and posted signs to identify each boundary; Rotary Lakeside Park's core is dog-free, while leashed dogs may use the perimeter walkways around the playing fields.</p>`;
const body = `<h2>Follow the mapped waterfront zones</h2>
<p>The City's Animal Regulation and Control Bylaw makes Schedule B the boundary map for waterfront dog use. Dogs may be off leash only inside the mapped Waterfront Dog Off Leash Area. Other marked waterfront sections require a leash or prohibit dogs, so do not use the shoreline or path surface alone to decide when a leash can come off.</p>
<h2>Lakeside Park has different rules</h2>
<p>Rotary Lakeside Park itself is a dog-free zone. The current City parks page allows leashed dogs on the perimeter walkways around the playing fields, and the bylaw preserves the specific exceptions shown on Schedule B. Keep clear of the beach, lawns and other restricted park areas, and follow signs where the pathway meets the park and fields.</p>
<h2>A shared waterfront route</h2>
<p>The City identifies the Centennial Pathway beside Lakeside Park as paved. Farther west, the 900 block of Lakeside Drive includes a 3.6-metre-wide waterfront multi-use path between the Prestige Lakeside Resort and Chahko Mika Mall. This is shared pedestrian and cycling space; the path project does not expand or replace the dog-use boundaries on Schedule B.</p>
<h2>Rules for handlers</h2>
<p>In a leash-required area, use a leash no longer than 183 centimetres. In the mapped off-leash area, a dog must remain under control and within five metres of its handler. Pick up waste immediately, keep your dog from approaching restricted park areas, and carry a leash throughout the visit. Nelson dog owners must also maintain a current City licence and keep the tag on the dog's collar or harness.</p>
<h2>Plan before you go</h2>
<p>The City does not publish a single official address, coordinate, operating schedule or complete amenity list for the linear dog-use zones. Open the official waterfront map before travelling, bring drinking water and waste bags, and confirm posted conditions when you arrive.</p>`;
const parkRules = "Use the City waterfront dog-use map and posted signs. Remove the leash only inside the mapped off-leash area; use a leash no longer than 183 centimetres in leash zones; keep an off-leash dog under control and within five metres; stay out of restricted areas; and remove waste immediately.";
const faqs = `<p><strong>Is Nelson's whole waterfront path off leash?</strong></p><p>No. Schedule B divides the waterfront into off-leash, leash-required and dog-restricted zones. Dogs may be off leash only inside the mapped off-leash area.</p>
<p><strong>Are dogs allowed in Rotary Lakeside Park?</strong></p><p>The park core is dog-free. The City allows leashed dogs on the perimeter walkways around the playing fields, subject to the exact Schedule B boundaries and posted signs.</p>
<p><strong>How long can a leash be?</strong></p><p>The City's bylaw defines a leash as no longer than 183 centimetres.</p>
<p><strong>What does under control mean off leash?</strong></p><p>Under the bylaw, an off-leash dog must stay within five metres of its handler or other competent person in control.</p>
<p><strong>Is the waterfront path paved?</strong></p><p>The City describes the Centennial Pathway at Lakeside Park as paved and identifies a 3.6-metre-wide multi-use path on the 900 block of Lakeside Drive. Surface conditions may vary elsewhere along the dog-use zones.</p>
<p><strong>Are water, washrooms or dog bags available?</strong></p><p>The reviewed City sources do not publish a complete amenity list for the mapped dog-use zones. Bring water and waste bags and verify facilities on arrival.</p>
<p><strong>Where should I enter the dog-use area?</strong></p><p>The City does not publish one official address for the linear zones. Use the Waterfront Dog Use Areas map and posted signs to choose an entrance and confirm the applicable rule.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: Schedule B establishes separate waterfront off-leash, leash-required and restricted zones; only the mapped off-leash area permits dogs off leash; Lakeside Park core is dog-free and the playing-field perimeter walkways allow leashed dogs; maximum leash length 183 cm; off-leash control within five metres; immediate waste removal; resident licence/tag rules; paved Centennial Pathway; current 3.6 m multi-use path context on the 900 block of Lakeside Drive. Reasonable inference: retain this route as a mixed waterfront dog-access guide and remove the unsupported point location. Unknown: official facility name, text-described off-leash endpoints, address, coordinates, size, fence, small-dog area, complete surfaces, water, dog-area seating/shade, bins, bag dispensers, parking, washrooms, hours, postal code and temporary restrictions. Sources: https://www.nelson.ca/415/Maps | https://www.nelson.ca/DocumentCenter/View/717 | https://nelson.civicweb.net/document/1025 | https://www.nelson.ca/320/Parks | https://www.nelson.ca/157/Domestic-Animals | https://www.nelson.ca/802/Active-Transportation | https://www.nelson.ca/CivicAlerts.aspx?AID=863. Source variation: the parks-page summary and mapped bylaw zones are compatible when Schedule B controls exact boundaries. Potential canonical overlap with the existing Lakefront Walkway Dog Park route remains an internal uncertainty because neither LeashFree name is established as a separate official facility. Image: built-in ImageGen, 2026-08-28; independent realistic digital illustration with no reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Nelson Dog Walk") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Nelson Dog Walk manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Nelson Dog Walk manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status || "implementation-pending"}"`);
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
    const anchor = '  "stony-swamp-conservation-area": "/images/dog-parks/stony-swamp-conservation-area-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"stony-swamp-conservation-area": "Realistic digital illustration of a leashed dog and handler on a forest trail above a beaver pond at Stony Swamp"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Create and inspect the unique illustration, then synchronize visitor copy, SEO, FAQs, data, mappings and queues." });
  console.log("Marked Nelson Dog Walk implementation-pending."); process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Nelson Dog Walk generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Nelson Dog Walk source image not found");
Object.assign(park, { name: "Nelson Dog Walk", title: "Nelson Waterfront Dog Use Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Nelson"], Province: ["British Columbia"], Tags: ["mixed-dog-access", "waterfront", "off-leash-zone", "leash-required"] } });
Object.assign(park.raw, {
  "Park Name": "Nelson Dog Walk", "Park Header": "Nelson Waterfront Dog Use Guide", "Park type": "On-leash park guide", Description: body,
  "Street Address": "Nelson waterfront dog-use zones along Lakeside Drive", latitude: "", longitude: "", City: "Nelson", Province: "British Columbia", "Postal Code": "",
  Fenced: "Not published; use mapped and posted boundaries", "Separate Small Dog Area": "Not published", "Surface type": "Paved path in confirmed sections; conditions vary by zone", Size: "Linear mapped waterfront zones; dimensions not published",
  "Water source available": "Not published; bring water", Benches: "Not published for the dog-use zones", "Shaded area": "Varies along the waterfront", "Waste bins": "Not published", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Not confirmed for a single official entrance", "Washrooms nearby": "Not published for the off-leash zone", "Operating hours": "No dedicated dog-use hours published",
  "Seasonal Restrictions": "Dog access changes by mapped zone; Lakeside Park core is restricted and playing-field perimeter walkways require a leash", "Park Rules": parkRules,
  "Park Website or Source": "https://www.nelson.ca/415/Maps", "Google Maps Link": "", Tags: "mixed-dog-access,waterfront,off-leash-zone,leash-required", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Nelson Dog Walk CMS CSV row not found");
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
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete", imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-complete", backlog: "implementation-complete", renderedPage: "verification-pending" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Nelson Dog Walk", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed Nelson waterfront context only: paved shared path, West Arm lake, forested mountain slopes and distant orange bridge. The composition shows one visibly leashed dog and handler and no invented amenity." },
  reason: "Implementation completed from current City maps, bylaw, parks, domestic-animal and active-transportation sources. Mixed-access visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping and queues are synchronized.",
  nextAction: "Run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "Nelson Dog Walk");
console.log("Applied Nelson Dog Walk implementation and marked it implementation-complete.");
