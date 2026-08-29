import fs from "node:fs";
import sharp from "sharp";

const slug = "bishops-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/bishops-park-original.png";
const imageSource = "/images/dog-parks/bishops-park-original.png";
const imageAlt = "Realistic digital illustration of a leashed dog and handler on the shaded asphalt path at Bishop's Park in Hamilton";
const seoTitle = "Bishop's Park On-Leash Guide | Hamilton | LeashFree.ca";
const metaDescription = "Plan an on-leash visit to Bishop's Park in Hamilton: official address, parkette size, shaded benches, asphalt path, dog rules and renewal timeline.";
const reviewedOn = "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const sourceUrl = "https://www.hamilton.ca/things-do/parks-green-space/creating-improving-parks/park-projects/bishops-park";
const intro = `<p><strong>Bishop's Park</strong> is a compact City of Hamilton parkette at 91 East Avenue South. Dogs may visit on leash; this is not one of Hamilton's designated dog parks or free-running areas.</p>`;
const body = `<h2>An on-leash neighbourhood stop</h2>
<p>Bishop's Park sits at East Avenue South and Hunter Street East in Hamilton's Stinson neighbourhood. The City classifies the active parkette at approximately 890 square metres. It does not appear in Hamilton's current dog-park and free-running-area inventory, so keep your dog leashed throughout the park.</p>
<h2>Shade, benches and a short paved route</h2>
<p>Several large canopy trees shade the bench seating and the asphalt path that connects East Avenue South with Hunter Street East. The compact layout suits a brief neighbourhood break more than an extended dog walk. An ornamental metal fence edges part of the space, but it is not a secure dog enclosure.</p>
<h2>Renewal is being designed</h2>
<p>Hamilton says the existing park features are nearing the end of their lifecycle. The listed renewal scope includes a new asphalt path, upgraded benches, a drinking fountain, entrance planting, ornamental-fence replacement and relocation of a light fixture. The current timeline schedules detailed design for summer and fall 2026, tendering in spring 2027 and construction in summer 2027. Check the City project page before travelling because dates and access conditions can change.</p>
<h2>Plan a self-contained visit</h2>
<p>The City confirms the street address, park size, shade, benches and asphalt path. It does not currently publish dedicated park hours, a postal code, parking arrangements, washrooms, dog-water access, waste-bin locations or bag dispensers for this parkette. Bring water and waste bags, follow posted street-parking signs and be ready to choose another stop if renewal work limits access.</p>
<h2>Hamilton dog rules apply</h2>
<p>Use a leash shorter than two metres and keep your dog under control. Pick up waste immediately, and keep the City's current licence tag attached to the collar of every dog older than three months. Smoking and vaping are prohibited in Hamilton parks. Stay on the path where practical and do not treat the ornamental fence as an off-leash boundary.</p>`;
const parkRules = "Keep dogs on a leash shorter than two metres and under control, pick up waste, keep the current Hamilton licence tag attached to the collar, and follow posted park notices. Smoking and vaping are prohibited.";
const faqs = `<p><strong>Is Bishop's Park an off-leash dog park?</strong></p><p>No. It is not listed as a Hamilton dog park or free-running area. Dogs must remain on leash throughout the parkette.</p>
<p><strong>Where is Bishop's Park?</strong></p><p>It is at 91 East Avenue South, at Hunter Street East, in Hamilton's Stinson neighbourhood.</p>
<p><strong>How large is Bishop's Park?</strong></p><p>The City's current park record gives an area of approximately 890 square metres, or 0.0889 hectares.</p>
<p><strong>What current features does the City confirm?</strong></p><p>The City confirms large canopy trees, shaded bench seating and an asphalt path between East Avenue South and Hunter Street East.</p>
<p><strong>Is Bishop's Park fenced for dogs?</strong></p><p>No secure dog enclosure is documented. The ornamental metal fence is a park-edge feature and should not be treated as an off-leash boundary.</p>
<p><strong>Are hours, parking, water and washrooms published?</strong></p><p>No dedicated hours, parking arrangements, current drinking water or washrooms are published for this parkette. Bring water and waste bags and follow posted street signs.</p>
<p><strong>Will renewal work affect a visit?</strong></p><p>The City currently schedules detailed design for summer and fall 2026, tendering in spring 2027 and construction in summer 2027. Check the project page for updated dates and access notices.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: City of Hamilton parkette at 91 East Avenue South, corner of Hunter Street East, Stinson neighbourhood, Ward 3; current municipal GIS area 0.0889 ha and centroid 43.2501760807, -79.8563443629; large canopy trees, shaded bench seating and asphalt path connecting both street edges; absent from current dog-park/free-running inventory, so ordinary on-leash rule applies; leash shorter than 2 m, control, immediate cleanup, licensing/tag duties, and smoke/vape prohibition; renewal scope lists path, benches, drinking fountain, planting, ornamental-fence replacement and light relocation, with design summer/fall 2026, tender spring 2027 and construction summer 2027. Reasonable inference: compact on-leash parkette, not a dog park; ornamental fence is not a secure dog enclosure; visitors should recheck the project page. Unknown: dedicated hours, postal code, complete fence/gate layout, surface outside the asphalt path, current potable water, waste bins, bag dispensers, parking, washrooms, small-dog area, temporary closures, exact construction impacts and final design. Sources: https://www.hamilton.ca/things-do/parks-green-space/creating-improving-parks/park-projects/bishops-park | https://open.hamilton.ca/datasets/98c01721338342bf82b0833ae05e7acb_6/explore | https://services.arcgis.com/rYz782eMbySr2srL/arcgis/rest/services/Parks_OD/FeatureServer/6 | https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs/dog-parks-and-free-running-areas | https://www.hamilton.ca/home-neighbourhood/animals-pets/responsible-pet-ownership/pet-etiquette-city-properties | https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs | https://www.hamilton.ca/people-programs/public-health/smoking-vaping/smoke-vape-free-spaces | https://engage.hamilton.ca/bishopspark. Source variation: legacy 0.25 acre is modest rounding from the current 0.0889 ha polygon; current official measurement controls. Legacy 7 a.m.-9 p.m. hours, postal code and affirmative water/waste/parking fields are not currently supported. Image: built-in ImageGen, 2026-08-28; independent realistic digital illustration without a reference image; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Bishop's Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Bishop's Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Bishop's Park manifest entry end not found");
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
    const anchor = '  "barkwood-forest": "/images/dog-parks/barkwood-forest-original.png",\n';
    if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found");
    mapping = mapping.replace(anchor, `${anchor}${mappingLine}`); fs.writeFileSync(mappingPath, mapping);
  }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8");
  const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) {
    const anchor = '  ,"barkwood-forest": "Realistic digital illustration of two off-leash dogs and their handler on a forest-and-meadow trail at Barkwood Forest"\n';
    if (!template.includes(anchor)) throw new Error("Hero alt anchor not found");
    template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template);
  }
}

const pendingChecks = Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"]));
if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: pendingChecks, nextAction: "Synchronize Bishop's Park visitor copy, SEO, FAQs, data, mappings and queues using the completed research packet." });
  console.log("Marked Bishop's Park implementation-pending."); process.exit(0);
}

if (!fs.existsSync(imagePath)) throw new Error("Bishop's Park source image not found");
const sourceMetadata = await sharp(imagePath).metadata();
if (sourceMetadata.width !== 1536 || sourceMetadata.height !== 1024) throw new Error("Bishop's Park source image must be 1536x1024");
for (const settings of [{ quality: 72, colors: 192 }, { quality: 64, colors: 128 }]) {
  if (fs.statSync(imagePath).size < 1_000_000) break;
  const compressedPath = `${imagePath}.compressed.png`;
  await sharp(imagePath).png({ compressionLevel: 9, effort: 10, palette: true, quality: settings.quality, colors: settings.colors, dither: 0.8 }).toFile(compressedPath);
  fs.copyFileSync(compressedPath, imagePath); fs.unlinkSync(compressedPath);
}
if (fs.statSync(imagePath).size >= 1_000_000) throw new Error("Bishop's Park source image remains above the compression ceiling");

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Bishop's Park generated JSON record not found");
Object.assign(park, { name: "Bishop's Park", title: "Bishop's Park On-Leash Parkette Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Hamilton"], Province: ["Ontario"], Tags: ["on-leash", "parkette", "asphalt-path", "shaded", "benches"] } });
Object.assign(park.raw, {
  "Park Name": "Bishop's Park", "Park Header": "Bishop's Park On-Leash Parkette Guide", "Park type": "On-leash park guide", Description: body,
  "Street Address": "91 East Avenue South", latitude: "43.2501760807", longitude: "-79.8563443629", City: "Hamilton", Province: "Ontario", "Postal Code": "",
  Fenced: "Ornamental edge fencing; not a dog enclosure", "Separate Small Dog Area": "No designated dog area", "Surface type": "Asphalt path; other surface coverage not published", Size: "Approx. 890 m² (0.0889 ha)",
  "Water source available": "Not currently published; drinking fountain planned in renewal", Benches: "Yes", "Shaded area": "Yes", "Waste bins": "Not published; bring waste bags", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Not published; follow posted street signs", "Washrooms nearby": "Not published", "Operating hours": "Not published",
  "Seasonal Restrictions": "Renewal design scheduled summer/fall 2026; construction scheduled summer 2027; check the City project page", "Park Rules": parkRules,
  "Park Website or Source": sourceUrl, "Google Maps Link": "", Tags: "on-leash,parkette,asphalt-path,shaded,benches", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": reviewedOn, "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const row of csvRows.slice(1)) row.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Bishop's Park CMS CSV row not found");
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
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Bishop's Park", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed City context only: compact parkette, mature canopy trees, shaded benches, asphalt through-path and ornamental edge fencing. The scene shows one visibly leashed dog and handler, adds no planned fountain or unconfirmed amenity, and is visibly illustrative rather than an actual park photograph." },
  reason: "Implementation completed from current Hamilton park-project, municipal GIS, leash-free inventory, pet-etiquette, licensing and smoke-free sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, mappings and queues are synchronized; optimized derivatives and rendered verification remain.",
  nextAction: "Create responsive derivatives, then run production build, repository QA, exact parity, image uniqueness and rendered-page checks before marking the page passed."
}, "Bishop's Park");
console.log("Applied Bishop's Park implementation and marked it implementation-complete.");
