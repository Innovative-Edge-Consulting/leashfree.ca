import fs from "node:fs";

const parksPath = "src/data/generated/parks.json";
const parkCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      value += char;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }
    if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function stringifyCsv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function setRawFields(raw, updates) {
  for (const [key, value] of Object.entries(updates)) raw[key] = value;
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "moose-jaw-dog-park");
  if (!park) throw new Error("Moose Jaw Dog Park record not found.");

  const metaDescription = "Source-backed guide to Moose Jaw Dog Park, covering the current official 1500 High Street West location, separate small- and large-dog enclosures, year-round access, and seasonal water service.";
  const description = "<p>Source-backed guide to Moose Jaw Dog Park, with the current city-listed High Street West location, two adjacent fenced enclosures, and seasonal water details.</p>";
  const body = "<p>The City of Moose Jaw currently lists its dog parks at 1500 High Street West and describes two adjacent fenced enclosures: one for small dogs and one for large dogs. The city's specialty parks page says the site is open year-round, with running water usually available from late May to late September, weather dependent. As of Tuesday, July 28, 2026, the same city listing also shows a closure notice link, so visitors should verify current status before heading over.</p>";

  park.seoTitle = "Moose Jaw Dog Park | Off-Leash Guide";
  park.metaDescription = metaDescription;
  park.description = description;
  park.body = body;

  setRawFields(park.raw, {
    "Park Header": "Moose Jaw Dog Park",
    "Description": body,
    "Street Address": "1500 block High St W",
    "Operating hours": "Open year-round (confirm current closure status)",
    "Seasonal Restrictions": "Running water is typically available from late May to late September, weather dependent.",
    "Park Website or Source": "https://moosejaw.ca/parks-recreation-culture/parks-trails/specialty-parks/",
    "Intro Paragraph": description,
    "Notes / Comments": "City listing says there are two adjacent dog parks with one small-dog and one large-dog enclosure. As of July 28, 2026, the official listing also shows a closure notice link.",
    "Reviewed On": "Tue Jul 28 2026 14:30:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": park.seoTitle,
    "Meta Description": metaDescription
  });

  fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "moose-jaw-dog-park");
  if (!targetRow) throw new Error("Moose Jaw Dog Park CSV row not found.");

  const updates = {
    "Park Header": "Moose Jaw Dog Park",
    "Description": "<p>The City of Moose Jaw currently lists its dog parks at 1500 High Street West and describes two adjacent fenced enclosures: one for small dogs and one for large dogs. The city's specialty parks page says the site is open year-round, with running water usually available from late May to late September, weather dependent. As of Tuesday, July 28, 2026, the same city listing also shows a closure notice link, so visitors should verify current status before heading over.</p>",
    "Street Address": "1500 block High St W",
    "Operating hours": "Open year-round (confirm current closure status)",
    "Seasonal Restrictions": "Running water is typically available from late May to late September, weather dependent.",
    "Park Website or Source": "https://moosejaw.ca/parks-recreation-culture/parks-trails/specialty-parks/",
    "Intro Paragraph": "<p>Source-backed guide to Moose Jaw Dog Park, with the current city-listed High Street West location, two adjacent fenced enclosures, and seasonal water details.</p>",
    "Notes / Comments": "City listing says there are two adjacent dog parks with one small-dog and one large-dog enclosure. As of July 28, 2026, the official listing also shows a closure notice link.",
    "Reviewed On": "Tue Jul 28 2026 14:30:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Moose Jaw Dog Park | Off-Leash Guide",
    "Meta Description": "Source-backed guide to Moose Jaw Dog Park, covering the current official 1500 High Street West location, separate small- and large-dog enclosures, year-round access, and seasonal water service."
  };

  for (const [field, value] of Object.entries(updates)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }

  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

updateParksJson();
updateParkCsv();

console.log("Updated Moose Jaw park record with current official source details.");
