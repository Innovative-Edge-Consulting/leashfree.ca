import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const backlogSummaryPath = "reports/thin-page-backlog-summary.md";

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

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"moose-jaw": "/images/cities/city-moose-jaw-hero.png"')) return;
  const anchor = '  "milton": "/images/cities/city-milton-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "moose-jaw": "/images/cities/city-moose-jaw-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "moose-jaw");
  if (!city) throw new Error("Moose Jaw city record not found.");

  const intro = "<p>Moose Jaw has enough current municipal material to support a stronger city guide than the generic page copy it had before. The City of Moose Jaw publishes a current specialty parks page for its dog parks, a current bylaws and enforcement page covering dog licensing, and current bylaw documents that support the city's animal-control framework. That gives this page a defensible source base for where the off-leash space is, how it is laid out, and what owners should confirm before they go.</p>";
  const about = "<p>The current City of Moose Jaw dog park listing says the off-leash site is at 1500 High Street West, not at the older 9th Avenue NW and Caribou Street West description that previously appeared on this page. The city now describes two adjacent dog parks there: one enclosed area for small dogs and one for large dogs. The same city page says the dog parks are open year-round and that running water is typically available from late May to late September, weather dependent. That is a materially better description of the actual setup than the thin single-park summary this page started with.</p><p>Moose Jaw's current animal licensing guidance also adds facts this city page should carry. The city says dogs must be licensed within Moose Jaw, yearly dog licences run from April 1 to March 31, and the annual fee is $15 for altered dogs and $40 for unaltered dogs. When buying a licence, the city asks owners to bring proof of spay or neuter status, vaccinations, and microchip information if available. As of Tuesday, July 28, 2026, the city's dog park listing also displays a \"currently closed\" notice link beside the High Street West entry, so visitors should verify the latest city status update before making a dedicated trip.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Moose Jaw's open prairie exposure can make fenced park visits feel much colder than the temperature suggests, especially when wind picks up on the west side of the city.</li><li><strong>Spring:</strong> Shoulder-season visits are more dependable if you plan for soft ground and confirm whether water service has been turned on yet.</li><li><strong>Summer:</strong> The city says running water is generally available from late May to late September, weather dependent, but you should still bring backup water on hot days.</li><li><strong>Fall:</strong> Cooler temperatures usually make the large and small dog enclosures more comfortable for longer play sessions, though water shutoff timing can vary with weather.</li></ul>";
  const parkRules = "<p><strong>Check current site status first:</strong> the City of Moose Jaw's current dog park page shows a closure notice link beside the 1500 High Street West listing as of July 28, 2026.</p><p><strong>Use the correct enclosure:</strong> the city says there are two adjacent dog parks, with one enclosed area for small dogs and another for large dogs.</p><p><strong>Treat licensing as mandatory city-wide:</strong> Moose Jaw says dogs are required to be licensed within the city, with licences running from April 1 through March 31.</p><p><strong>Plan around seasonal water service:</strong> the city says running water is available only from approximately late May to late September, weather dependent.</p><p><strong>Do not bring dogs showing unsafe behaviour:</strong> Moose Jaw's Dangerous Dog Bylaw defines dangerous behaviour to include attacking without provocation or chasing people or animals in an apparent attitude of attack.</p>";
  const etiquette = "<p><strong>1. Pick the enclosure that matches your dog.</strong></p><p>Moose Jaw's official setup is split by dog size, so use the small-dog or large-dog side as intended rather than treating the site as one open field.</p><p><strong>2. Confirm the latest city status before driving over.</strong></p><p>The current city dog park listing shows a closure notice link, so this is a park where last-minute checks matter.</p><p><strong>3. Do not rely on seasonal water alone.</strong></p><p>The city says water is usually available only from late May to late September and only when weather allows.</p><p><strong>4. Keep your licensing records easy to access.</strong></p><p>Moose Jaw's licensing page specifically asks owners to bring proof of spay or neuter status, vaccinations, and microchip information if available when purchasing a licence.</p><p><strong>5. Use Moose Jaw's wider trail network for on-leash decompression.</strong></p><p>The city says its trail system includes over 40 kilometres of routes around Moose Jaw, which is useful if your dog does better with a calmer walk before or after the fenced park.</p>";
  const faqs = "<p><strong>1. Where are Moose Jaw's official dog parks?</strong></p><p>The City of Moose Jaw currently lists the dog parks at 1500 High Street West.</p><p><strong>2. Is there more than one enclosure?</strong></p><p>Yes. The city says there are two adjacent dog parks, with one enclosed area for small dogs and another for large dogs.</p><p><strong>3. Are the dog parks open year-round?</strong></p><p>Yes. The city's current specialty parks page says the dog parks are open year-round.</p><p><strong>4. When is water usually available?</strong></p><p>The city says running water is available from approximately late May to late September, weather dependent.</p><p><strong>5. Do dogs need a city licence in Moose Jaw?</strong></p><p>Yes. Moose Jaw says dogs are required to be licensed within the city, with licences valid from April 1 to March 31.</p><p><strong>6. Is there any current caution before visiting?</strong></p><p>Yes. As of July 28, 2026, the city dog park listing shows a closure notice link next to the High Street West entry, so you should confirm the latest city update before you go.</p>";
  const metaDescription = "Source-backed guide to dog parks in Moose Jaw, Saskatchewan, covering the current two-enclosure site at 1500 High Street West, dog licence rules, seasonal water service, and the city's current closure notice link.";

  city.seoTitle = "Dog Parks in Moose Jaw, Saskatchewan | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Saskatchewan"],
    "Featured Park 1": ["moose-jaw-dog-park"],
    "Featured Park 2": ["seasonal-rink-dog-parks-regina"],
    "Featured Park 3": ["swift-current-off-leash-dog-park"],
    "Province Page": ["https://leashfree.ca/saskatchewan-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "moose-jaw-dog-park",
    "Featured Park 2": "seasonal-rink-dog-parks-regina",
    "Featured Park 3": "swift-current-off-leash-dog-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://moosejaw.ca/parks-recreation-culture/parks-trails/specialty-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Regina, Swift Current, Saskatoon",
    "Updated On": "Tue Jul 28 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "moose-jaw");
  if (!targetRow) throw new Error("Moose Jaw city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Moose Jaw, Saskatchewan | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Moose Jaw, Saskatchewan, covering the current two-enclosure site at 1500 High Street West, dog licence rules, seasonal water service, and the city's current closure notice link.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Moose Jaw has enough current municipal material to support a stronger city guide than the generic page copy it had before. The City of Moose Jaw publishes a current specialty parks page for its dog parks, a current bylaws and enforcement page covering dog licensing, and current bylaw documents that support the city's animal-control framework. That gives this page a defensible source base for where the off-leash space is, how it is laid out, and what owners should confirm before they go.</p>",
    "About Section": "<p>The current City of Moose Jaw dog park listing says the off-leash site is at 1500 High Street West, not at the older 9th Avenue NW and Caribou Street West description that previously appeared on this page. The city now describes two adjacent dog parks there: one enclosed area for small dogs and one for large dogs. The same city page says the dog parks are open year-round and that running water is typically available from late May to late September, weather dependent. That is a materially better description of the actual setup than the thin single-park summary this page started with.</p><p>Moose Jaw's current animal licensing guidance also adds facts this city page should carry. The city says dogs must be licensed within Moose Jaw, yearly dog licences run from April 1 to March 31, and the annual fee is $15 for altered dogs and $40 for unaltered dogs. When buying a licence, the city asks owners to bring proof of spay or neuter status, vaccinations, and microchip information if available. As of Tuesday, July 28, 2026, the city's dog park listing also displays a \"currently closed\" notice link beside the High Street West entry, so visitors should verify the latest city status update before making a dedicated trip.</p>",
    "Featured Park 1": "moose-jaw-dog-park",
    "Featured Park 2": "seasonal-rink-dog-parks-regina",
    "Featured Park 3": "swift-current-off-leash-dog-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Moose Jaw's open prairie exposure can make fenced park visits feel much colder than the temperature suggests, especially when wind picks up on the west side of the city.</li><li><strong>Spring:</strong> Shoulder-season visits are more dependable if you plan for soft ground and confirm whether water service has been turned on yet.</li><li><strong>Summer:</strong> The city says running water is generally available from late May to late September, weather dependent, but you should still bring backup water on hot days.</li><li><strong>Fall:</strong> Cooler temperatures usually make the large and small dog enclosures more comfortable for longer play sessions, though water shutoff timing can vary with weather.</li></ul>",
    "Park Rules": "<p><strong>Check current site status first:</strong> the City of Moose Jaw's current dog park page shows a closure notice link beside the 1500 High Street West listing as of July 28, 2026.</p><p><strong>Use the correct enclosure:</strong> the city says there are two adjacent dog parks, with one enclosed area for small dogs and another for large dogs.</p><p><strong>Treat licensing as mandatory city-wide:</strong> Moose Jaw says dogs are required to be licensed within the city, with licences running from April 1 through March 31.</p><p><strong>Plan around seasonal water service:</strong> the city says running water is available only from approximately late May to late September, weather dependent.</p><p><strong>Do not bring dogs showing unsafe behaviour:</strong> Moose Jaw's Dangerous Dog Bylaw defines dangerous behaviour to include attacking without provocation or chasing people or animals in an apparent attitude of attack.</p>",
    "City Website": "https://moosejaw.ca/parks-recreation-culture/parks-trails/specialty-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Pick the enclosure that matches your dog.</strong></p><p>Moose Jaw's official setup is split by dog size, so use the small-dog or large-dog side as intended rather than treating the site as one open field.</p><p><strong>2. Confirm the latest city status before driving over.</strong></p><p>The current city dog park listing shows a closure notice link, so this is a park where last-minute checks matter.</p><p><strong>3. Do not rely on seasonal water alone.</strong></p><p>The city says water is usually available only from late May to late September and only when weather allows.</p><p><strong>4. Keep your licensing records easy to access.</strong></p><p>Moose Jaw's licensing page specifically asks owners to bring proof of spay or neuter status, vaccinations, and microchip information if available when purchasing a licence.</p><p><strong>5. Use Moose Jaw's wider trail network for on-leash decompression.</strong></p><p>The city says its trail system includes over 40 kilometres of routes around Moose Jaw, which is useful if your dog does better with a calmer walk before or after the fenced park.</p>",
    "Dog Park FAQs": "<p><strong>1. Where are Moose Jaw's official dog parks?</strong></p><p>The City of Moose Jaw currently lists the dog parks at 1500 High Street West.</p><p><strong>2. Is there more than one enclosure?</strong></p><p>Yes. The city says there are two adjacent dog parks, with one enclosed area for small dogs and another for large dogs.</p><p><strong>3. Are the dog parks open year-round?</strong></p><p>Yes. The city's current specialty parks page says the dog parks are open year-round.</p><p><strong>4. When is water usually available?</strong></p><p>The city says running water is available from approximately late May to late September, weather dependent.</p><p><strong>5. Do dogs need a city licence in Moose Jaw?</strong></p><p>Yes. Moose Jaw says dogs are required to be licensed within the city, with licences valid from April 1 to March 31.</p><p><strong>6. Is there any current caution before visiting?</strong></p><p>Yes. As of July 28, 2026, the city dog park listing shows a closure notice link next to the High Street West entry, so you should confirm the latest city update before you go.</p>",
    "Nearby Cities": "Regina, Swift Current, Saskatoon",
    "Updated On": "Tue Jul 28 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  };

  for (const [field, value] of Object.entries(updates)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(cityCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const pageIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/moose-jaw/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) => [...bodyRows.reduce((map, row) => {
    const key = row[field] || "";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");

  const summary = `# Thin Page Improvement Backlog

Generated from \`reports/content-health.json\` on 2026-07-22.

This backlog contains ${bodyRows.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.

## Backlog counts

| Tier | Pages |
| --- | ---: |
${tierRows}

| Content type | Pages |
| --- | ---: |
${sectionRows}

## Prioritization

- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.
- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.
- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.
- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.

Do not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.

## First 50 pages

| # | Tier | Type | Page | Score | Words | Missing source |
| ---: | --- | --- | --- | ---: | ---: | --- |
${topRows}
`;
  fs.writeFileSync(backlogSummaryPath, summary);
}

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();

console.log("Updated Moose Jaw city page and refreshed backlog files.");
