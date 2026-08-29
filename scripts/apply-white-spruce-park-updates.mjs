import fs from "node:fs";

const slug = "white-spruce-park";
const route = `/dog-parks/${slug}/`;
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imagePath = "public/images/dog-parks/white-spruce-park-original.png";

const seoTitle = "White Spruce Park Dog Park | Brampton, ON | LeashFree.ca";
const metaDescription = "Plan a visit to White Spruce Park's leash-free area in Brampton: Heart Lake Road access, small- and large-dog sections, rules, map and park facts.";
const intro = "<p><strong>White Spruce Park</strong> has a City-designated leash-free area inside a 22.687-hectare city park on Heart Lake Road in Brampton. Use the mapped dog area for off-leash play; dogs stay leashed on the rest of the park and its recreational trails.</p>";
const body = "<p>The current City park directory lists White Spruce Park at <strong>0 Heart Lake Road</strong>. Municipal GIS identifies wider-park access from Heart Lake Road and Barr Crescent and maps the leash-free area at approximately <strong>43.7288168482, -79.7793816898</strong>. Leash your dog until you are inside the marked off-leash zone.</p><p>The wider 22.687-hectare city park also has a baseball diamond and two lighted tennis courts. Those shared facilities are outside the dog-area feature and should not be treated as part of the leash-free space. The City does not currently publish the dog area's precise size, fence and gate configuration, surface, water, seating, shade, waste facilities, parking layout or nearby washrooms. Bring drinking water, a bowl and waste bags, and check the entrance setup when you arrive.</p><p>Brampton's current bylaw requires leash-free visitors to use the marked small- or large-dog section appropriate to their dog. Dogs must have current rabies vaccination, wear a collar and current City licence, and be spayed or neutered. Puppies under four months and children under ten are not permitted. Keep each dog supervised, carry one leash per dog, bring no more than three dogs per person, clean up immediately, and leash dogs when entering and leaving.</p><p>The City does not publish dedicated operating hours for the White Spruce leash-free area. Brampton's Park Lands By-law prohibits loitering in parkland from <strong>11 p.m. to 7 a.m.</strong>; posted hours, temporary closures and on-site directions still control. Check current City notices before a special trip.</p>";
const parkRules = "Clean up immediately; keep rabies vaccination and a current Brampton licence up to date; dogs must be spayed or neutered; supervise dogs and carry one leash per dog; bring no more than three dogs per person; no puppies under four months or children under ten; use the appropriate marked small- or large-dog area; leash dogs when entering and leaving; follow posted notices.";
const faqs = "<p><strong>1. Is White Spruce Park a leash-free dog park?</strong></p><p>Yes. Brampton's current park directory and municipal feature layer identify a designated leash-free area inside White Spruce Park. Dogs stay leashed outside the marked zone.</p><p><strong>2. Where is the White Spruce Park dog area?</strong></p><p>The City lists the wider park at 0 Heart Lake Road, with access points from Heart Lake Road and Barr Crescent. This page's map uses the municipal leash-free feature point inside the park.</p><p><strong>3. Is the White Spruce leash-free area fenced?</strong></p><p>The current City directory does not publish fence or gate specifications for this dog area. Check the entrance and boundary markers before letting your dog off leash.</p><p><strong>4. Is there a small-dog section?</strong></p><p>Brampton's current bylaw requires marked small- and large-dog areas within leash-free zones. Use the section posted for your dog's size.</p><p><strong>5. What amenities are confirmed at White Spruce Park?</strong></p><p>The wider park has a baseball diamond and two lighted tennis courts. Current City sources do not confirm dog-area water, benches, shade, waste stations, bag dispensers, parking or washrooms, so arrive self-sufficient.</p><p><strong>6. What hours does the dog area keep?</strong></p><p>The City does not currently publish dedicated hours for the White Spruce leash-free area. Park rules prohibit loitering from 11 p.m. to 7 a.m.; follow posted hours and closure notices.</p>";
const notes = "Research reviewed 2026-08-27. Official sources: https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx ; https://www.brampton.ca/en/residents/Animal-Services/Pages/Off-Leash-Parks.aspx ; https://www.brampton.ca/EN/City-Hall/Bylaws/All%20Bylaws/Animal%20Services%20By-law%20201-2023.pdf ; https://www.brampton.ca/en/City-Hall/Bylaws/All%20Bylaws/Parkland.PDF ; https://www.brampton.ca/EN/residents/parks/pages/park-overview.aspx ; https://www.brampton.ca/EN/residents/parks/Pages/Code-of-Conduct.aspx ; https://www.brampton.ca/EN/residents/Recreation/Programs-Activities/pages/tennis-pickleball-listing.aspx ; https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/Planning_Parks/FeatureServer/1 ; https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/ParksPts/FeatureServer/0 ; https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/ParkFeatures/FeatureServer/0 ; https://www.brampton.ca/EN/Arts-Culture-Tourism/Experience-Brampton/Activities-and-Attractions/Documents/Green-and-Fall-Colour.pdf . Confirmed: current leash-free designation, current 0 Heart Lake Road address, current dog-area feature point, wider 22.687-hectare city park, access points, current baseball and tennis assets, two lighted open tennis courts, bylaw rules and marked small/large sections, and the city-wide 11 p.m.-7 a.m. no-loitering rule. Inferences: the leash-free feature point is the best map reference; 22.687 hectares describes the wider park, not the dog area. Unknown: dog-area size, current fence/gate configuration, surface, water, benches, shade, waste bins, bags, parking, washrooms, dedicated hours, postal code and temporary closures. Source variation: current directory/GIS uses 0 Heart Lake Road; a 2020 City release used 10302 Heart Lake Road. Current directory/GIS controls. An older City guide described fencing and dawn-to-9-p.m. access, but current City sources do not republish those specifications, so they do not control current fields.";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
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
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function updateManifest(patch, nextPriorityPage = "White Spruce Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("White Spruce Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("White Spruce Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync("reports/thin-page-backlog.csv", "utf8"));
  const headers = rows[0];
  const records = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ""])));
  const countBy = (field) => [...records.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = records.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");
  fs.writeFileSync("reports/thin-page-backlog-summary.md", `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${records.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${tierRows}\n\n| Content type | Pages |\n| --- | ---: |\n${sectionRows}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${topRows}\n`);
}

if (process.argv.includes("--mark-research-pending")) {
  updateManifest({ status: "research-pending", nextAction: "Revalidate current Brampton park, off-leash, bylaw, recreation and GIS sources before changing visitor-facing artifacts." });
  console.log("Marked White Spruce Park research-pending.");
  process.exit(0);
}

if (process.argv.includes("--mark-research-complete")) {
  updateManifest({ status: "research-complete", conflicts: [], nextAction: "Apply the current official-source findings across copy, data, image, queues and audit artifacts together." });
  console.log("Marked White Spruce Park research-complete.");
  process.exit(0);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched copy, data, unique illustration, mappings, queues and audit artifacts together." });
  console.log("Marked White Spruce Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("White Spruce Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("White Spruce Park source image not found");

Object.assign(park, {
  name: "White Spruce Park",
  title: "White Spruce Park Leash-Free Dog Area",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  media: [],
  references: { City: ["Brampton"], Province: ["Ontario"], Tags: ["leash-free", "small-dog-area", "city-park", "natural-trails"] }
});

Object.assign(park.raw, {
  "Park Name": "White Spruce Park",
  "Park Header": "White Spruce Park Leash-Free Dog Area",
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "0 Heart Lake Road",
  latitude: "43.7288168482",
  longitude: "-79.7793816898",
  City: "Brampton",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Current fence and gate configuration not published by the City",
  "Separate Small Dog Area": "Yes",
  "Surface type": "Not published for the leash-free area",
  Size: "Dog area unknown; wider city park is 22.687 hectares",
  "Water source available": "Not published; bring water",
  Benches: "Not published for the leash-free area",
  "Shaded area": "Not published for the leash-free area",
  "Waste bins": "Not published for the leash-free area",
  "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Not published for the leash-free area",
  "Washrooms nearby": "Not published by the City",
  "Operating hours": "No dedicated hours published; no loitering in parkland 11 p.m. to 7 a.m.",
  "Seasonal Restrictions": "Follow posted hours, maintenance closures and on-site directions",
  "Park Rules": parkRules,
  "Park Website or Source": "https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.7288168482%2C-79.7793816898",
  Tags: "leash-free,small-dog-area,city-park,natural-trails",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Thu Aug 27 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
  "Dog Park FAQs": faqs
});

fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
for (const key of Object.keys(park.raw)) {
  if (!headers.includes(key)) {
    headers.push(key);
    for (const item of csvRows.slice(1)) item.push("");
  }
}
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug);
if (!csvRow) throw new Error("White Spruce Park CMS CSV row not found");
for (const [key, value] of Object.entries(park.raw)) csvRow[headers.indexOf(key)] = String(value ?? "");
fs.writeFileSync(csvPath, serializeCsv(csvRows));

for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  const rows = parseCsv(fs.readFileSync(queuePath, "utf8"));
  const routeIndex = rows[0].indexOf("route");
  fs.writeFileSync(queuePath, serializeCsv([rows[0], ...rows.slice(1).filter((row) => row[routeIndex] !== route)]));
}
rebuildBacklogSummary();

updateManifest({
  status: "implementation-complete",
  artifactChecks: {
    content: "implementation-complete",
    seo: "implementation-complete",
    structuredData: "implementation-complete",
    generatedJson: "implementation-complete",
    csv: "implementation-complete",
    imageMapping: "implementation-complete",
    sourceImage: "implementation-complete",
    optimizedDerivatives: "implementation-complete",
    backlog: "implementation-complete",
    renderedPage: "verification-pending"
  },
  image: {
    source: "/images/dog-parks/white-spruce-park-original.png",
    width: 1536,
    height: 1024,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Realistic digital illustration of two off-leash dogs and their handler in a forest-edged clearing at White Spruce Park in Brampton",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to White Spruce Park",
    visualReference: "No dependable current close-up photograph of the White Spruce leash-free area was located. The independent illustration therefore uses only the City-confirmed forested recreational setting and leash-free use, with exact boundaries, fencing, signs, water, seating, waste fixtures, parking, washrooms and sports amenities outside the frame."
  },
  reason: "Implementation completed from current City park-directory, off-leash, bylaw, recreation and municipal GIS research. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping and queues are synchronized.",
  nextAction: "Mark verification pending, then run the production build, repository QA, parity, image and targeted rendered checks before passing."
});

console.log("Updated White Spruce Park and removed it from the active improvement queues.");
