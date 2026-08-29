import fs from "node:fs";

const slug = "thurlow-dog-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/thurlow-dog-park-original.png";
const imageSource = "/images/dog-parks/thurlow-dog-park-original.png";
const imageAlt = "Realistic digital illustration of two off-leash dogs in the divided grass runs at Pat Culhane Dog Park in Belleville";
const seoTitle = "Pat Culhane Dog Park (Thurlow) Guide | LeashFree.ca";
const metaDescription = "Plan a visit to Pat Culhane Dog Park in Belleville with its correct Farnham Road address, fenced small- and large-dog areas, size and current dog rules.";
const intro = `<p>Also known as Thurlow Dog Park, this facility's official name is <strong>Pat Culhane Dog Park</strong>. The approximately 0.425-hectare off-leash park is at 427 Farnham Road, on the northeast corner of Maitland Drive and Farnham Road, with fenced areas for large and small dogs.</p>`;
const body = `<h2>Use the Farnham Road entrance</h2>
<p>Pat Culhane Dog Park is at 427 Farnham Road in Belleville. The municipal park map places it on the northeast corner of Maitland Drive and Farnham Road.</p>
<h2>Compact, divided off-leash space</h2>
<p>The current City park polygon covers 0.42487966 hectares, or about 1.05 acres. The dog park is enclosed by perimeter fencing and has an interior separation for small dogs, giving visitors distinct large- and small-dog sections. Use the appropriate section, close each gate behind you and keep a leash ready for entry and exit.</p>
<h2>Rules for handlers</h2>
<p>Keep your dog under control throughout the visit and prevent chasing, fighting or damage. Pick up waste immediately and dispose of it properly. Belleville requires every dog older than three months to be registered with the City and to wear a valid dog tag.</p>
<h2>Plan around unlisted amenities</h2>
<p>The City does not currently publish dedicated dog-park hours or a complete list of surfaces, drinking water, seating, shade, waste fixtures, parking or washrooms for this site. Check posted signs and temporary notices when you arrive, and bring drinking water, waste bags and a leash.</p>`;
const parkRules = "Use the appropriate fenced section, close gates behind you, keep your dog under control, carry a leash, remove waste immediately, and ensure dogs older than three months have a current Belleville licence and tag.";
const faqs = `<p><strong>What is Thurlow Dog Park's official name?</strong></p><p>The City names the facility Pat Culhane Dog Park. It is also commonly listed as Thurlow Dog Park.</p>
<p><strong>Where is Pat Culhane Dog Park?</strong></p><p>It is at 427 Farnham Road, on the northeast corner of Maitland Drive and Farnham Road in Belleville.</p>
<p><strong>Is the dog park fenced?</strong></p><p>Yes. City construction records specify perimeter fencing for the dog park.</p>
<p><strong>Is there a separate small-dog area?</strong></p><p>Yes. The park has an interior separation for small dogs, creating distinct large- and small-dog sections.</p>
<p><strong>How large is Pat Culhane Dog Park?</strong></p><p>The current municipal park polygon is approximately 0.425 hectares, or about 1.05 acres.</p>
<p><strong>What are the operating hours?</strong></p><p>The City does not currently publish dedicated hours for this dog park. Follow posted opening, closing and temporary restriction signs at the site.</p>
<p><strong>Are water, bags, parking or washrooms available?</strong></p><p>The City does not publish a complete current amenity list for this site. Bring water and waste bags and verify parking and washroom options before relying on them.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: current official name Pat Culhane Dog Park; 427 Farnham Road at the northeast corner of Maitland Drive and Farnham Road; City ownership; current 0.42487966-hectare park polygon; 2021 City construction award for perimeter fencing, inner small-dog separation, AODA-compliant pedestrian gate openings and double-gated equipment openings; official dedication on 2021-10-29; current licence/tag rule for dogs over three months; control and immediate cleanup duties. Reasonable inference: polygon centroid 44.2070609970, -77.3944479724 is the best stable map point; the established Thurlow route should introduce the current official name; the awarded construction and subsequent dedication support fenced large- and small-dog sections. Unknown: dedicated hours, postal code, current surfaces, water, benches, shade, waste fixtures, bag dispensers, parking, washrooms, temporary closures and whether every tendered gate retains its original configuration. Sources: https://gis.belleville.ca/arcgis/rest/services/BV_GIS/Parkland/MapServer/0 | https://belleville.bidsandtenders.ca/Module/Tenders/en/Tender/Detail/e369b7ad-21c7-4773-af22-21fcf342d6f6 | https://www.belleville.ca/en/resourcesGeneral/Magazine/BELLEVILLE-MAGAZINE-Dec.-2021.pdf | https://www.belleville.ca/en/resources/PRMP/City-of-Belleville-PRMP-Phase-1-ReportRevisedJan2022.pdf | https://www.belleville.ca/home-and-property/by-law-and-animal-services/commonly-requested-by-laws/ | https://www.belleville.ca/home-and-property/by-law-and-animal-services/animal-and-pet-services/dog-tags-and-licences/ | https://www.belleville.ca/learn-and-play/facilities-and-rentals/community-centres/. Source variation: legacy 516 Harmony Road is the community centre; a non-municipal 2.6-acre report differs from the current City polygon and matching City master-plan value, so the current municipal geometry controls. Image: built-in ImageGen, 2026-08-28; independent realistic digital illustration with no reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Thurlow Dog Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Thurlow Dog Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Thurlow Dog Park manifest entry end not found");
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
    const anchor = '  "nelson-dog-walk-lakeside-path": "/images/dog-parks/nelson-dog-walk-lakeside-path-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"nelson-dog-walk-lakeside-path": "Realistic digital illustration of a leashed dog and handler on Nelson\'s paved waterfront path beside Kootenay Lake"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Synchronize visitor copy, SEO, FAQs, data, mappings and queues for the inspected unique illustration." });
  console.log("Marked Thurlow Dog Park implementation-pending."); process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Thurlow Dog Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Thurlow Dog Park source image not found");
Object.assign(park, { name: "Pat Culhane Dog Park", title: "Pat Culhane Dog Park (Thurlow)", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Belleville"], Province: ["Ontario"], Tags: ["leash-free", "fenced", "small-dog-area", "belleville"] } });
Object.assign(park.raw, {
  "Park Name": "Pat Culhane Dog Park", "Park Header": "Pat Culhane Dog Park (Thurlow)", "Park type": "Leash Free", Description: body,
  "Street Address": "427 Farnham Road", latitude: "44.2070609970", longitude: "-77.3944479724", City: "Belleville", Province: "Ontario", "Postal Code": "",
  Fenced: "Yes", "Separate Small Dog Area": "Yes", "Surface type": "Not published", Size: "Approximately 0.425 hectares (1.05 acres)",
  "Water source available": "Not published; bring water", Benches: "Not published", "Shaded area": "Not published", "Waste bins": "Not published", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Not published; verify before relying on parking", "Washrooms nearby": "Not published", "Operating hours": "No dedicated dog-park hours published",
  "Seasonal Restrictions": "Follow posted opening, closing and temporary restriction notices", "Park Rules": parkRules,
  "Park Website or Source": "https://gis.belleville.ca/arcgis/rest/services/BV_GIS/Parkland/MapServer/0", "Google Maps Link": "", Tags: "leash-free,fenced,small-dog-area,belleville", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Thurlow Dog Park CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Pat Culhane Dog Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed City records only: compact open turf, sparse canopy, perimeter fencing and an interior small-dog separation. The scene adds no unconfirmed amenities and is visibly illustrative rather than an actual park photograph." },
  reason: "Implementation completed from current City park GIS, construction, dedication, master-plan, community-centre, licensing and animal-control sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, mappings and queues are synchronized.",
  nextAction: "Run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "Thurlow Dog Park");
console.log("Applied Thurlow Dog Park implementation and marked it implementation-complete.");
