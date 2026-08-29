import fs from "node:fs";

const slug = "stony-swamp-conservation-area";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/stony-swamp-conservation-area-original.png";
const imageSource = "/images/dog-parks/stony-swamp-conservation-area-original.png";
const imageAlt = "Realistic digital illustration of a leashed dog and handler on a forest trail above a beaver pond at Stony Swamp";
const seoTitle = "Stony Swamp Dog Access Guide | Ottawa | LeashFree.ca";
const metaDescription = "Plan a dog-friendly Stony Swamp visit with seasonal leash rules, dog-free trails, Bruce Pit access, parking, washrooms, and current closure checks.";
const intro = `<p>Stony Swamp Conservation Area is a <strong>mixed-access Greenbelt trail sector</strong> in southwest Ottawa, not one large leash-free dog park. The National Capital Commission permits leashed dogs on specified natural trails from April 15 through November 30, prohibits dogs year-round on several sensitive trails, and limits off-leash use to the designated Bruce Pit area.</p>`;
const body = `<h2>Dog access varies by trail</h2>
<p>Stony Swamp has more than 40 kilometres of trails through forests, wetlands, beaver ponds and quarry landscapes. The NCC trail directory allows leashed dogs from April 15 through November 30 on Trails 20, 21, 23, 24, Lime Kiln Trail and Trail 25, the dog-permitted portion of Trail 26, Trail 27 and Trail 29. Choose a route from the current NCC trail table and follow signs where numbered routes meet named nature loops.</p>
<p>Dogs are prohibited year-round on Old Quarry, Sarsaparilla, Beaver, Chipmunk and Jack Pine nature trails. Natural Greenbelt trails do not allow dogs in winter. The Greenbelt Pathway West permits leashed dogs year-round, but a current storm-damage notice closes its segment between Corkstown Road and Timm Drive until further notice.</p>
<h2>Bruce Pit is the off-leash exception</h2>
<p><a href="/dog-parks/bruce-pit/">Bruce Pit</a>, reached from P12, is the Stony Swamp sector's designated year-round off-leash area. Keep your dog leashed in the parking lot and everywhere outside the marked off-leash boundary. Dogs are not permitted at the adjacent toboggan hill.</p>
<h2>Parking and facilities</h2>
<p>The NCC lists free, year-round parking at P4 through P13. Outhouses are available at P5, P7, P8, P9, P11 and P12, and the official trail map identifies garbage containers at Greenbelt parking lots. Picnic areas are available at some trailheads, but NCC animal regulations prohibit pets in picnic areas. The Stony Swamp trails do not meet universal accessibility standards.</p>
<h2>Rules and visit planning</h2>
<p>On leash-required routes, use a leash or harness no longer than two metres. Each handler may bring no more than two pets, must pick up waste, and must prevent chasing, bites, attacks and property damage. Keep pets at least three metres from shorelines. The Greenbelt is open year-round except during extreme weather, but the NCC does not publish dedicated daily hours for Stony Swamp. Bring drinking water and waste bags, check current closures, and obey every posted route restriction.</p>`;
const parkRules = "Use only dog-permitted routes and posted boundaries. Keep dogs on a leash no longer than two metres except inside Bruce Pit's designated off-leash area; bring no more than two pets per handler; pick up waste; keep pets at least three metres from shorelines and out of picnic, event and cross-country ski areas.";
const faqs = `<p><strong>Is Stony Swamp Conservation Area an off-leash dog park?</strong></p><p>No. Stony Swamp has mixed dog access. Bruce Pit is the sector's designated year-round off-leash area; dogs must be leashed or are prohibited elsewhere according to the trail.</p>
<p><strong>Which Stony Swamp trails allow dogs?</strong></p><p>From April 15 through November 30, the NCC permits leashed dogs on Trails 20, 21, 23, 24, Lime Kiln Trail and Trail 25, the dog-permitted portion of Trail 26, Trail 27 and Trail 29. Follow current trail signs at junctions.</p>
<p><strong>Which trails prohibit dogs year-round?</strong></p><p>Dogs are not permitted on Old Quarry, Sarsaparilla, Beaver, Chipmunk or Jack Pine nature trails.</p>
<p><strong>Can I bring a dog to Stony Swamp in winter?</strong></p><p>Dogs are not allowed on natural Greenbelt trails in winter. Leashed dogs may use the Greenbelt Pathway West year-round, and Bruce Pit remains a designated year-round off-leash area, subject to closures and posted conditions.</p>
<p><strong>Where can visitors park?</strong></p><p>The NCC lists free, year-round parking at lots P4 through P13. Choose the lot for your permitted route and keep dogs leashed in parking areas.</p>
<p><strong>Are washrooms or drinking water available?</strong></p><p>Outhouses are listed at P5, P7, P8, P9, P11 and P12. The NCC does not publish a potable-water source for these routes, so bring water for your dog.</p>
<p><strong>Are any Stony Swamp routes currently closed?</strong></p><p>The current NCC storm notice closes the Greenbelt Pathway West segment between Corkstown Road and Timm Drive until further notice. Check the NCC site again before travelling because conditions can change.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: NCC-managed southwest Ottawa Greenbelt sector; more than 40 km of trails; seasonal on-leash access on Trails 20, 21, 23, 24, Lime Kiln/25, a dog-permitted Trail 26 segment, 27 and 29; year-round dog prohibition on Old Quarry, Sarsaparilla, Beaver, Chipmunk and Jack Pine nature trails; year-round on-leash Greenbelt Pathway West; Bruce Pit as the only sector-specific year-round off-leash area; free year-round P4-P13 parking; outhouses at P5, P7, P8, P9, P11 and P12; parking-lot garbage containers; no universal accessibility; year-round Greenbelt access except extreme weather; current storm closure between Corkstown Road and Timm Drive; two-metre leash, two-pet maximum, cleanup, control, shoreline and excluded-area rules. Reasonable inferences: retain this route as a mixed dog-access guide; remove the unsupported representative point; direct visitors to the official trail table and signed boundary. Unknown: a single official street address or coordinate, precise sector boundary and area, Bruce Pit fence configuration, separate small-dog area, potable water, benches and exact shade on dog-permitted routes, bag dispensers, postal code, dedicated daily hours, closure detour and temporary conditions beyond published notices. Sources: https://ncc-ccn.gc.ca/places/stony-swamp | https://ncc-ccn.gc.ca/places/hiking-and-walking-greenbelt | https://ncc-ccn.gc.ca/regulations | https://ncc-ccn.gc.ca/places/greenbelt-visitor-info | https://ncc-ccn.gc.ca/places/your-safety-in-the-greenbelt | https://ncc-ccn.gc.ca/places/cycling-greenbelt | https://ncc-ccn.gc.ca/closures/partial-closures-in-the-greenbelt-following-july-1-storm | https://medias.ncc-ccn.ca/ncc/documents/national-capital-greenbelt-all-seasons-trail-map.pdf. Source variation: the Stony Swamp dog-access note names Greenbelt Pathway East, while the same page and the current hiking and cycling directories connect Stony Swamp to Greenbelt Pathway West. Both NCC pathways allow year-round on-leash use; route-specific copy uses West because the current route tables and sector geography agree. Image record: built-in ImageGen, 2026-08-28; independent original realistic digital illustration, no reference image used; visual brief based only on confirmed mixed woodland, wetland, beaver-pond and sandstone habitat, with one leashed dog and handler kept well back from the shoreline; no attribution required; not a photograph.";

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

function updateManifest(patch, nextPriorityPage = "Stony Swamp Conservation Area") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Stony Swamp Conservation Area manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "{") depth += 1; else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Stony Swamp Conservation Area manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1)); Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status || "implementation-pending"}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

function compactImprovementQueue() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); const text = fs.readFileSync(manifestPath, "utf8");
  const marker = '"improvementQueue": ['; const markerIndex = text.indexOf(marker); if (markerIndex < 0) throw new Error("Improvement queue marker not found");
  const start = text.indexOf("[", markerIndex); let depth = 0; let quoted = false; let escaped = false; let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true; else if (char === "[") depth += 1; else if (char === "]" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Improvement queue end not found");
  const compact = `[\n${manifest.improvementQueue.map((item) => `    ${JSON.stringify(item)}`).join(",\n")}\n  ]`;
  fs.writeFileSync(manifestPath, `${text.slice(0, start)}${compact}${text.slice(end + 1)}`);
}

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync("reports/thin-page-backlog.csv", "utf8")); const headers = rows[0];
  const records = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ""])));
  const countBy = (field) => [...records.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n"); const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = records.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");
  fs.writeFileSync("reports/thin-page-backlog-summary.md", `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${records.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${tierRows}\n\n| Content type | Pages |\n| --- | ---: |\n${sectionRows}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${topRows}\n`);
}

function ensureImageMappings() {
  const mappingPath = "src/data/dog-park-image-overrides.js"; let mapping = fs.readFileSync(mappingPath, "utf8"); const mappingLine = `  "${slug}": "${imageSource}",\n`;
  if (!mapping.includes(mappingLine.trim())) { const anchor = '  "stouffville-leash-free-dog-park": "/images/cities/city-stouffville-hero.png",\n'; if (!mapping.includes(anchor)) throw new Error("Park image mapping anchor not found"); mapping = mapping.replace(anchor, `${mappingLine}${anchor}`); fs.writeFileSync(mappingPath, mapping); }
  const templatePath = "src/pages/dog-parks/[slug].astro"; let template = fs.readFileSync(templatePath, "utf8"); const altLine = `  ,"${slug}": "${imageAlt}"\n`;
  if (!template.includes(`"${slug}"`)) { const anchor = '  ,"semiahmoo-park": "Realistic digital illustration of the driftwood shoreline and tidal flats at Semiahmoo Park on Semiahmoo Bay"\n'; if (!template.includes(anchor)) throw new Error("Park hero alt mapping anchor not found"); template = template.replace(anchor, `${anchor}${altLine}`); fs.writeFileSync(templatePath, template); }
}

if (process.argv.includes("--compact-manifest")) { compactImprovementQueue(); console.log("Compacted the persistent improvement queue without changing its data."); process.exit(0); }

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", artifactChecks: Object.fromEntries(["content", "seo", "structuredData", "generatedJson", "csv", "imageMapping", "sourceImage", "optimizedDerivatives", "backlog", "renderedPage"].map((key) => [key, "implementation-pending"])), nextAction: "Generate and inspect the unique illustration, then synchronize visitor copy, SEO, FAQs, data, mappings and queues." });
  console.log("Marked Stony Swamp Conservation Area implementation-pending."); process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Stony Swamp Conservation Area generated JSON record not found"); if (!fs.existsSync(imagePath)) throw new Error("Stony Swamp source image not found");
Object.assign(park, { name: "Stony Swamp Conservation Area", title: "Stony Swamp Dog Access Guide", seoTitle, metaDescription, description: intro, body, media: [], references: { City: ["Ottawa"], Province: ["Ontario"], Tags: ["mixed-dog-access", "on-leash-trails", "Bruce-Pit", "NCC-Greenbelt"] } });
Object.assign(park.raw, {
  "Park Name": "Stony Swamp Conservation Area", "Park Header": "Stony Swamp Dog Access Guide", "Park type": "On-leash park guide", Description: body,
  "Street Address": "NCC parking lots P4–P13, southwest Ottawa", latitude: "", longitude: "", City: "Ottawa", Province: "Ontario", "Postal Code": "",
  Fenced: "Not a single enclosed dog park; follow signed access boundaries", "Separate Small Dog Area": "Not published by NCC", "Surface type": "Natural trails and boardwalks; asphalt and stone dust on Greenbelt Pathway West", Size: "More than 40 km of trails in the Stony Swamp sector",
  "Water source available": "Potable water not published; bring water", Benches: "Not published for dog-permitted routes", "Shaded area": "Woodland conditions vary by route", "Waste bins": "Garbage containers at parking lots", "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Yes", "Washrooms nearby": "Outhouses at P5, P7, P8, P9, P11 and P12", "Operating hours": "Open year-round except during extreme weather; no dedicated daily hours published",
  "Seasonal Restrictions": "Dog access varies by route; permitted natural trails require a leash Apr. 15–Nov. 30; dog-free trails and active closures apply", "Park Rules": parkRules,
  "Park Website or Source": "https://ncc-ccn.gc.ca/places/stony-swamp", "Google Maps Link": "", Tags: "mixed-dog-access,on-leash-trails,Bruce-Pit,NCC-Greenbelt", "Notes / Comments": notes, "Public Notes": "", "Intro Paragraph": intro, Media: "",
  "Reviewed On": "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "Meta Title": seoTitle, "Meta Description": metaDescription, "Dog Park FAQs": faqs
});
fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0];
for (const key of Object.keys(park.raw)) if (!headers.includes(key)) { headers.push(key); for (const item of csvRows.slice(1)) item.push(""); }
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug); if (!csvRow) throw new Error("Stony Swamp CMS CSV row not found");
for (const [key, value] of Object.entries(park.raw)) csvRow[headers.indexOf(key)] = String(value ?? ""); fs.writeFileSync(csvPath, serializeCsv(csvRows));
ensureImageMappings();
for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) { const rows = parseCsv(fs.readFileSync(queuePath, "utf8")); const routeIndex = rows[0].indexOf("route"); fs.writeFileSync(queuePath, serializeCsv([rows[0], ...rows.slice(1).filter((row) => row[routeIndex] !== route)])); }
rebuildBacklogSummary();
updateManifest({
  status: "implementation-complete",
  artifactChecks: { content: "implementation-complete", seo: "implementation-complete", structuredData: "implementation-complete", generatedJson: "implementation-complete", csv: "implementation-complete", imageMapping: "implementation-complete", sourceImage: "implementation-complete", optimizedDerivatives: "implementation-complete", backlog: "implementation-complete", renderedPage: "verification-pending" },
  image: { source: imageSource, width: 1536, height: 1024, compressedBytes: fs.statSync(imagePath).size, alt: imageAlt, derivatives: [480, 960], formats: ["avif", "webp", "jpg"], reuse: "unique to Stony Swamp Conservation Area", generation: "Built-in ImageGen on 2026-08-28; independent original with no reference image", visualReference: "Confirmed NCC habitat facts only: mixed forest, wetlands, beaver ponds and pale sandstone. The new composition shows one leashed dog and handler on higher ground well back from the shoreline and no invented amenity." },
  reason: "Implementation completed from current NCC dog-access, trail, facility, regulation, visitor-hours, cycling, closure and map sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping and queues are synchronized.",
  nextAction: "Mark verification pending, then run production build, repository QA, parity, image uniqueness and targeted rendered checks before passing."
}, "Stony Swamp Conservation Area");
console.log("Updated Stony Swamp Conservation Area and removed it from the active improvement queues.");
