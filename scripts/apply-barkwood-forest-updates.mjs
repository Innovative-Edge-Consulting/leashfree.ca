import fs from "node:fs";
import sharp from "sharp";

const slug = "barkwood-forest";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/barkwood-forest-original.png";
const imageSource = "/images/dog-parks/barkwood-forest-original.png";
const imageAlt = "Realistic digital illustration of two off-leash dogs and their handler on a forest-and-meadow trail at Barkwood Forest";
const seoTitle = "Barkwood Forest Private Dog Park Guide | LeashFree.ca";
const metaDescription = "Plan a Barkwood Forest visit in rural Stittsville: member screening, fenced 100-acre trails, dawn-to-dusk access, winter routes and dog rules.";
const reviewedOn = "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const intro = `<p><strong>Barkwood Forest</strong> is a private, members-only off-leash park on Fernbank Road in rural Stittsville. Its operator describes 100 fenced acres of forest and fields, with screened-dog access from dawn to dusk every day.</p>`;
const body = `<h2>Screening comes before membership</h2>
<p>Barkwood Forest is not a City of Ottawa public dog park. Before a dog can become a member, the operator requires a free open-house walk that assesses social behaviour and off-leash recall. Only screened dogs may enter. A non-member person may walk with a member, but a non-member dog must complete screening first.</p>
<h2>Natural forest-and-field trails</h2>
<p>The 100-acre fenced property combines evergreen forest, open fields and gentle rolling ground. Marked trails are mostly flat, but roots and rocks make the surface natural rather than accessible pavement. The main loop takes about 40 minutes at a brisk pace or 60 minutes at a leisurely walk, and connecting trails allow shorter or longer outings.</p>
<h2>Year-round member access</h2>
<p>Members may visit daily from dawn until dusk, seven days a week and throughout the year. After significant snowfall, the operator says trails are plowed and packed by ATV. Check the operator's current notices before leaving in case weather or maintenance changes access.</p>
<h2>Arrival and practical facilities</h2>
<p>The parking area uses a two-gate airlock so there is no direct line between the off-leash property and Fernbank Road. Garbage receptacles are provided at the parking area and in the back woods. A washing station is available for muddy dogs and can provide a post-walk drink. Bring waste bags and keep a leash ready for arrival and departure.</p>
<h2>Rules for dogs and handlers</h2>
<p>Keep your dog social, responsive and under control, follow the operator's member procedures, and pick up waste during every walk. Ottawa requires dogs to be registered annually and to wear the City-issued tag on their collar or harness. The current operator page gives Fernbank Road as the location but does not publish an exact visitor street number, postal code or map coordinate.</p>`;
const parkRules = "Members must follow Barkwood Forest procedures, bring only screened dogs, keep dogs responsive and under control, pick up waste, carry a leash for transitions, and ensure Ottawa registration and tag requirements are met.";
const faqs = `<p><strong>Is Barkwood Forest a public dog park?</strong></p><p>No. It is a private off-leash property operated by Boogity Dog Walking, and dog access is limited to screened members.</p>
<p><strong>How does a dog become a Barkwood Forest member?</strong></p><p>The dog must attend an open-house walk and pass the operator's socialization and off-leash recall assessment before membership.</p>
<p><strong>How large is Barkwood Forest?</strong></p><p>The operator describes 100 fenced acres of forest and open fields.</p>
<p><strong>What are the member access hours?</strong></p><p>Members may visit daily from dawn until dusk, seven days a week and year-round.</p>
<p><strong>What are the trails like?</strong></p><p>The marked natural trails are mostly flat and pass through forest and fields, with roots and rocks along the way. The main loop takes about 40 to 60 minutes depending on pace.</p>
<p><strong>Are winter trails maintained?</strong></p><p>The operator says trails are plowed and packed after significant snowfall. Check current notices before a winter visit.</p>
<p><strong>Are parking, water and waste facilities available?</strong></p><p>There is a parking area with a two-gate airlock, garbage receptacles at the parking area and in the back woods, and a washing station that can also provide a post-walk drink. Parking capacity, washrooms and seating are not published.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: Boogity Dog Walking operates Barkwood Forest as a private off-leash park; 100 fenced acres of forest and fields on Fernbank Road in rural Stittsville; screened membership after an open-house socialization and recall assessment; only screened dogs may enter; non-member humans may accompany members; member access daily from dawn to dusk year-round; marked mostly flat natural trails with roots and rocks; 40-to-60-minute main loop plus connecting trails; winter plowing and packing after significant snowfall; parking-area and back-woods garbage receptacles; washing/drinking station; two-gate parking airlock; Ottawa annual registration/tag, private-land-consent and immediate cleanup rules. Reasonable inference: visitor copy should distinguish paid screened access from a municipal park and use the operator-published Fernbank Road location without a disputed street number or coordinate. Unknown: exact visitor entrance number, postal code, coordinate, parking capacity, washrooms, benches, separate small-dog area, complete fence layout, exact trail network, temporary closures and pricing after the review date. Sources: https://boogity.ca/barkwood-forest/ | https://boogity.ca/services/ | https://boogitydogwalkinginc.wildapricot.org/ | https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077 | https://ottawa.ca/en/living-ottawa/animals-and-pets/dogs/responsible-dog-ownership | https://open.ottawa.ca/pages/maps~5023601ab6d74edb913c602df9122d32. Source variation: the legacy record and some directories publish 7635 Fernbank Road while another commercial directory publishes 7580 Fernbank Road; the current operator page gives only Fernbank Road, so exact address, postal code, coordinate and map link remain blank. Image: built-in ImageGen, 2026-08-28; independent realistic digital illustration with no reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Barkwood Forest") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Barkwood Forest manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Barkwood Forest manifest entry end not found");
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
    const anchor = '  "thurlow-dog-park": "/images/dog-parks/thurlow-dog-park-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"thurlow-dog-park": "Realistic digital illustration of two off-leash dogs in the divided grass runs at Pat Culhane Dog Park in Belleville"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Synchronize visitor copy, SEO, FAQs, data, mappings and queues for the inspected unique illustration." });
  console.log("Marked Barkwood Forest implementation-pending."); process.exit(0);
}

if (!fs.existsSync(imagePath)) throw new Error("Barkwood Forest source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("Barkwood Forest source image must be 1536x1024");
if (fs.statSync(imagePath).size >= 1_000_000) {
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: 70, colors: 192, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Barkwood Forest generated JSON record not found");
Object.assign(park, { name: "Barkwood Forest", title: "Barkwood Forest Private Off-Leash Dog Park", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Ottawa"], Province: ["Ontario"], Tags: ["leash-free", "fenced", "private", "forest-trails", "members-only"] } });
Object.assign(park.raw, {
  "Park Name": "Barkwood Forest", "Park Header": "Barkwood Forest Private Off-Leash Dog Park", "Park type": "Leash Free", Description: body,
  "Street Address": "Fernbank Road", latitude: "", longitude: "", City: "Ottawa", Province: "Ontario", "Postal Code": "",
  Fenced: "Yes", "Separate Small Dog Area": "Not published", "Surface type": "Natural forest and field trails with roots and rocks", Size: "100 acres",
  "Water source available": "Washing station; operator says it can provide a post-walk drink", Benches: "Not published", "Shaded area": "Yes; forested trails", "Waste bins": "Yes; parking area and back woods", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Parking area present; capacity and ordinary availability not published", "Washrooms nearby": "Not published", "Operating hours": "Dawn to dusk daily for members",
  "Seasonal Restrictions": "Member access year-round; trails packed after significant snowfall; check current notices", "Park Rules": parkRules,
  "Park Website or Source": "https://boogity.ca/barkwood-forest/", "Google Maps Link": "", Tags: "leash-free,fenced,private,forest-trails,members-only", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Barkwood Forest CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Barkwood Forest", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed operator context only: mixed evergreen forest, open field, gentle ground and natural trail with roots and rocks. The scene shows two social off-leash dogs and one handler, adds no unconfirmed amenity, and is visibly illustrative rather than an actual park photograph." },
  reason: "Implementation completed from current operator membership, service and park details plus current Ottawa animal-control sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "Barkwood Forest");
console.log("Applied Barkwood Forest implementation and marked it implementation-complete.");
