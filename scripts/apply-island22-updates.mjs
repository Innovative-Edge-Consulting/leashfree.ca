import fs from "node:fs";

const file = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewedOnHeader = "Reviewed On";
const metaTitleHeader = "Meta Title";
const metaDescriptionHeader = "Meta Description";

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (quoted && line[index + 1] === "\"") {
        field += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function csv(fields) {
  return fields.map((value) => {
    const field = value ?? "";
    return /[",\r\n]/.test(field) ? `"${field.replaceAll("\"", "\"\"")}"` : field;
  }).join(",");
}

const canonicalMapUrl = "https://www.google.com/maps/place/Island+22+Dog+Park/@49.190965,-121.9840739,17z/data=!4m14!1m7!3m6!1s0x54843faad55feebb:0xa498848bae611fb2!2sIsland+22+Regional+Park!8m2!3d49.193398!4d-121.9804046!16s%2Fg%2F11f0wn4z9y!3m5!1s0x54843f3e619ea44d:0x2061185cc4a72dbd!8m2!3d49.1906958!4d-121.9844822!16s%2Fg%2F11rq50hdrn?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D";
const officialSource = "https://www.fvrd.ca/EN/main/parks-recreation/parks-trails/island-22.html";

const updates = {
  "dog-friendly-beach-island-22": {
    "Park Website or Source": officialSource,
    "Google Maps Link": canonicalMapUrl,
    "Street Address": "44955 Cartmell Road",
    latitude: "49.1906958",
    longitude: "-121.9844822",
    "Notes / Comments": "<p>This legacy route is redirected to the Island 22 Dog Park page. The current Fraser Valley Regional District park page describes a fenced off-leash dog area and states that dogs must remain on leash in all other areas of Island 22 Regional Park, including the riverfront.</p>",
    "Intro Paragraph": "<p>This record is kept only as a legacy source row. The live route now redirects to the Island 22 Dog Park page because the current official park source does not support a separate off-leash riverside beach page.</p>",
    "Seasonal Restrictions": "Redirected to Island 22 Dog Park; verify current park notices for high water or access changes",
    "Operating hours": "See Island 22 Dog Park page for current seasonal park hours",
    "Meta Title": "Island 22 Dog Park Chilliwack | Off-Leash Guide",
    "Meta Description": "Legacy Island 22 riverside route redirected to the official Island 22 Dog Park page because the current source describes a fenced off-leash area rather than a separate off-leash beach."
  },
  "island-22-dog-park": {
    "Park Name": "Island 22 Dog Park",
    "Park Header": "Island 22 Dog Park, Chilliwack",
    "Description": "<p>Island 22 Dog Park is the designated off-leash area within Island 22 Regional Park in Chilliwack. The Fraser Valley Regional District describes it as a large fenced off-leash area where dogs can run and play under owner supervision, and notes that a small dog enclosure is available within the dog area.</p><p>The same official park page says dogs must remain on leash everywhere else in the park, including the trails, parking lots, and riverfront. That distinction matters because Island 22 is a much larger regional park with a boat launch, equestrian facilities, walking trails, and other shared recreation uses outside the fenced dog area.</p>",
    "Street Address": "44955 Cartmell Road",
    latitude: "49.1906958",
    longitude: "-121.9844822",
    Fenced: "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Unknown - confirm current footing on site",
    Size: "Large",
    "Water source available": "Unknown",
    Benches: "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes",
    "Operating hours": "May 1 - Oct 14: 6 am to sunset; Oct 15 - Apr 30: 7 am to sunset; 5 am during approved Sockeye fishery",
    "Seasonal Restrictions": "Dogs must stay leashed outside the fenced off-leash area; gate is locked outside posted park hours",
    "Park Website or Source": officialSource,
    "Google Maps Link": canonicalMapUrl,
    Tags: "leash-free, Chilliwack, fenced off-leash area, regional park",
    "Notes / Comments": "<p>The current FVRD park page describes Island 22's dog space as a fenced off-leash area and states that dogs must remain on leash in all other areas of the regional park, including the riverfront. The City of Chilliwack parks page also identifies washrooms, on-site parking, and broader regional park amenities.</p>",
    "Intro Paragraph": "<p>Island 22 Dog Park is the correct off-leash destination within Island 22 Regional Park. It is better understood as a fenced dog area inside a larger multi-use regional park than as a general off-leash beach or riverfront access point.</p>",
    "Meta Title": "Island 22 Dog Park Chilliwack | Off-Leash Guide",
    "Meta Description": "Source-backed guide to Island 22 Dog Park in Chilliwack, including fenced off-leash access, small-dog enclosure details, seasonal park hours, and leash rules outside the dog area."
  }
};

const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const lines = raw.split(/\r?\n/);
const headers = parseCsvLine(lines[0]);
for (const header of [reviewedOnHeader, metaTitleHeader, metaDescriptionHeader]) {
  if (!headers.includes(header)) headers.push(header);
}
const headerIndex = new Map(headers.map((header, index) => [header, index]));
const targetSlugs = new Set(Object.keys(updates));
let updatedCount = 0;

const nextLines = [csv(headers)];
for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
  const line = lines[lineIndex];
  if (!line) continue;
  const values = parseCsvLine(line);
  while (values.length < headers.length) values.push("");
  const slug = values[headerIndex.get("slug")];
  const update = updates[slug];
  if (update) {
    for (const [field, value] of Object.entries(update)) {
      const index = headerIndex.get(field);
      if (typeof index === "number") values[index] = value;
    }
    const reviewDate = "Fri Jul 17 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
    values[headerIndex.get("Updated On")] = reviewDate;
    values[headerIndex.get(reviewedOnHeader)] = reviewDate;
    updatedCount += 1;
    targetSlugs.delete(slug);
  }
  nextLines.push(csv(values));
}

if (targetSlugs.size > 0) {
  throw new Error(`Missing rows for slugs: ${[...targetSlugs].join(", ")}`);
}

fs.writeFileSync(file, `${nextLines.join("\n")}\n`);
console.log(`Updated ${updatedCount} Island 22 records.`);
