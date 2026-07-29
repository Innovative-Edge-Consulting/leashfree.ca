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
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
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
  if (source.includes('"white-rock": "/images/cities/city-white-rock-hero.png"')) return;
  const anchor = '  "victoria": "/images/cities/city-victoria-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "white-rock": "/images/cities/city-white-rock-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "white-rock");
  if (!city) throw new Error("White Rock city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, White Rock’s dog page should be treated as a rules-and-access guide built from the city’s current dog, waterfront, animal-control, and licence pages. White Rock is much tighter and more regulated than larger cities: it has one official off-leash dog park, strict promenade hours, on-leash beach requirements, and a hard no-dogs rule on the pier.</p>";
  const about = "<p>White Rock’s official dog access model is simple but specific. The city’s dogs page says dogs in White Rock must be leashed and licenced, and that dogs can go off-leash only in the off-leash dog park located in Ruth Johnson Park. The dedicated off-leash park page identifies that site at 14600 North Bluff Road and describes it as a large, treed, fenced area. The Centennial and Ruth Johnson Park facility page supports the same location and confirms the broader park includes walking trails along with the fenced off-leash dog park. That gives White Rock a clearer official off-leash anchor than the older generic city copy suggested.</p><p>The waterfront rules are where accuracy matters most. White Rock says leashed dogs are allowed on the Promenade from 5:30 a.m. to 9 a.m. from April 1 to September 30, and at any time from October 1 to March 31. The city also published a March 26, 2026 reminder confirming that the 5:30 a.m. to 9:00 a.m. seasonal promenade restriction remains in effect from April 1 through September 30. Dogs are not allowed on the White Rock Pier at any time. On the beach, dogs are permitted only on a leash shorter than two metres, and the city says the Wildlife Act does not allow off-leash dogs on the beach because the beach is part of the Boundary Bay Wildlife Management Area. White Rock’s licence page adds that all dogs over the age of four months residing in White Rock must hold a valid licence. As of July 29, 2026, the city’s published dog licence fees are $25 for an altered dog and $40 for an unaltered dog, with additional listed fees for aggressive, nuisance, replacement, and transfer categories. For enforcement and questions, White Rock directs general dog inquiries to dogs@whiterockcity.ca, licensing inquiries to 604-541-2139, and bylaw or animal-control complaints to 604-541-2146. Those are the facts a White Rock page actually needs.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> White Rock’s waterfront is usable more often than inland winter cities, but rain, slick boards, and wind exposure matter.</li><li><strong>Spring:</strong> April 1 is the key seasonal date because promenade dog access shifts to early-morning hours only.</li><li><strong>Summer:</strong> Promenade access is limited to 5:30 a.m. to 9 a.m., so later daytime outings need to shift to parks or fully on-leash routes.</li><li><strong>Fall:</strong> October 1 reopens full-day leashed promenade access, which materially changes route planning.</li></ul>";
  const parkRules = "<p><strong>Use Ruth Johnson Park for off-leash activity:</strong> White Rock says dogs can go off-leash in the off-leash dog park located in Ruth Johnson Park.</p><p><strong>Keep dogs leashed elsewhere:</strong> the city says dogs in White Rock must be leashed and licenced.</p><p><strong>Follow promenade hours exactly:</strong> from April 1 to September 30, leashed dogs are permitted on the Promenade only from 5:30 a.m. to 9 a.m.; from October 1 to March 31 they are allowed at any time.</p><p><strong>Do not take dogs onto the pier:</strong> White Rock says dogs are not allowed on the White Rock Pier at any time.</p><p><strong>Keep beach dogs on a short leash:</strong> dogs are permitted on the beach only on a leash of less than two metres, and off-leash beach use is not allowed under the Wildlife Act.</p>";
  const etiquette = "<p><strong>1. Treat White Rock as a timing-sensitive city.</strong></p><p>The same route can be legal or not depending on the month and time of day, especially on the promenade.</p><p><strong>2. Do not improvise at the waterfront.</strong></p><p>White Rock’s beach, promenade, and pier all have different dog rules, and they are not interchangeable.</p><p><strong>3. Use the off-leash park for off-leash behaviour.</strong></p><p>The city gives owners one clear official off-leash site in Ruth Johnson Park, so the rest of White Rock should be treated accordingly.</p><p><strong>4. Keep wildlife context in mind on the beach.</strong></p><p>The beach restriction is tied to provincial wildlife protection, which means off-leash assumptions there are not minor rule breaches.</p><p><strong>5. Use the right contact for the issue.</strong></p><p>White Rock separates general dog questions, licensing, and bylaw complaints, which helps avoid delays when something actually needs action.</p>";
  const faqs = "<p><strong>1. Does White Rock have an official off-leash dog park?</strong></p><p>Yes. The city says dogs can go off-leash in the off-leash dog park at Ruth Johnson Park, 14600 North Bluff Road.</p><p><strong>2. Are dogs allowed on the White Rock Promenade?</strong></p><p>Yes, but only on leash, and from April 1 to September 30 they are allowed only from 5:30 a.m. to 9 a.m.; from October 1 to March 31 they are allowed at any time.</p><p><strong>3. Are dogs allowed on the White Rock Pier?</strong></p><p>No. White Rock says dogs are not allowed on the White Rock Pier at any time.</p><p><strong>4. Can dogs be off leash on White Rock beach?</strong></p><p>No. Dogs may be on the beach only on a leash shorter than two metres, and the city says the Wildlife Act does not allow off-leash dogs on the beach.</p><p><strong>5. Does White Rock require dog licences?</strong></p><p>Yes. The city says all dogs over the age of four months living in White Rock must hold a valid licence.</p><p><strong>6. What are the current White Rock dog licence fees?</strong></p><p>As of July 29, 2026, White Rock lists $25 for an altered dog and $40 for an unaltered dog.</p>";
  const metaDescription = "Source-backed guide to White Rock dog parks and waterfront rules, covering Ruth Johnson Park’s fenced off-leash dog park, promenade hours, beach leash limits, no-dogs pier rule, dog licensing, and bylaw contacts.";

  city.seoTitle = "White Rock Dog Parks and Waterfront Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Featured Park 1": ["dog-beach-white-rock"],
    "Featured Park 2": ["centennial-park-white-rock"],
    "Featured Park 3": ["memorial-park-white-rock"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "dog-beach-white-rock",
    "Featured Park 2": "centennial-park-white-rock",
    "Featured Park 3": "memorial-park-white-rock",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.whiterockcity.ca/799/Dogs-in-White-Rock",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Surrey, Delta, Langley",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "white-rock");
  if (!targetRow) throw new Error("White Rock city CSV row not found.");
  const updates = {
    "SEO Title Tag": "White Rock Dog Parks and Waterfront Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to White Rock dog parks and waterfront rules, covering Ruth Johnson Park’s fenced off-leash dog park, promenade hours, beach leash limits, no-dogs pier rule, dog licensing, and bylaw contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, White Rock’s dog page should be treated as a rules-and-access guide built from the city’s current dog, waterfront, animal-control, and licence pages. White Rock is much tighter and more regulated than larger cities: it has one official off-leash dog park, strict promenade hours, on-leash beach requirements, and a hard no-dogs rule on the pier.</p>",
    "About Section": "<p>White Rock’s official dog access model is simple but specific. The city’s dogs page says dogs in White Rock must be leashed and licenced, and that dogs can go off-leash only in the off-leash dog park located in Ruth Johnson Park. The dedicated off-leash park page identifies that site at 14600 North Bluff Road and describes it as a large, treed, fenced area. The Centennial and Ruth Johnson Park facility page supports the same location and confirms the broader park includes walking trails along with the fenced off-leash dog park. That gives White Rock a clearer official off-leash anchor than the older generic city copy suggested.</p><p>The waterfront rules are where accuracy matters most. White Rock says leashed dogs are allowed on the Promenade from 5:30 a.m. to 9 a.m. from April 1 to September 30, and at any time from October 1 to March 31. The city also published a March 26, 2026 reminder confirming that the 5:30 a.m. to 9:00 a.m. seasonal promenade restriction remains in effect from April 1 through September 30. Dogs are not allowed on the White Rock Pier at any time. On the beach, dogs are permitted only on a leash shorter than two metres, and the city says the Wildlife Act does not allow off-leash dogs on the beach because the beach is part of the Boundary Bay Wildlife Management Area. White Rock’s licence page adds that all dogs over the age of four months residing in White Rock must hold a valid licence. As of July 29, 2026, the city’s published dog licence fees are $25 for an altered dog and $40 for an unaltered dog, with additional listed fees for aggressive, nuisance, replacement, and transfer categories. For enforcement and questions, White Rock directs general dog inquiries to dogs@whiterockcity.ca, licensing inquiries to 604-541-2139, and bylaw or animal-control complaints to 604-541-2146. Those are the facts a White Rock page actually needs.</p>",
    "Featured Park 1": "dog-beach-white-rock",
    "Featured Park 2": "centennial-park-white-rock",
    "Featured Park 3": "memorial-park-white-rock",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> White Rock’s waterfront is usable more often than inland winter cities, but rain, slick boards, and wind exposure matter.</li><li><strong>Spring:</strong> April 1 is the key seasonal date because promenade dog access shifts to early-morning hours only.</li><li><strong>Summer:</strong> Promenade access is limited to 5:30 a.m. to 9 a.m., so later daytime outings need to shift to parks or fully on-leash routes.</li><li><strong>Fall:</strong> October 1 reopens full-day leashed promenade access, which materially changes route planning.</li></ul>",
    "Park Rules": "<p><strong>Use Ruth Johnson Park for off-leash activity:</strong> White Rock says dogs can go off-leash in the off-leash dog park located in Ruth Johnson Park.</p><p><strong>Keep dogs leashed elsewhere:</strong> the city says dogs in White Rock must be leashed and licenced.</p><p><strong>Follow promenade hours exactly:</strong> from April 1 to September 30, leashed dogs are permitted on the Promenade only from 5:30 a.m. to 9 a.m.; from October 1 to March 31 they are allowed at any time.</p><p><strong>Do not take dogs onto the pier:</strong> White Rock says dogs are not allowed on the White Rock Pier at any time.</p><p><strong>Keep beach dogs on a short leash:</strong> dogs are permitted on the beach only on a leash of less than two metres, and off-leash beach use is not allowed under the Wildlife Act.</p>",
    "City Website": "https://www.whiterockcity.ca/799/Dogs-in-White-Rock",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Treat White Rock as a timing-sensitive city.</strong></p><p>The same route can be legal or not depending on the month and time of day, especially on the promenade.</p><p><strong>2. Do not improvise at the waterfront.</strong></p><p>White Rock’s beach, promenade, and pier all have different dog rules, and they are not interchangeable.</p><p><strong>3. Use the off-leash park for off-leash behaviour.</strong></p><p>The city gives owners one clear official off-leash site in Ruth Johnson Park, so the rest of White Rock should be treated accordingly.</p><p><strong>4. Keep wildlife context in mind on the beach.</strong></p><p>The beach restriction is tied to provincial wildlife protection, which means off-leash assumptions there are not minor rule breaches.</p><p><strong>5. Use the right contact for the issue.</strong></p><p>White Rock separates general dog questions, licensing, and bylaw complaints, which helps avoid delays when something actually needs action.</p>",
    "Dog Park FAQs": "<p><strong>1. Does White Rock have an official off-leash dog park?</strong></p><p>Yes. The city says dogs can go off-leash in the off-leash dog park at Ruth Johnson Park, 14600 North Bluff Road.</p><p><strong>2. Are dogs allowed on the White Rock Promenade?</strong></p><p>Yes, but only on leash, and from April 1 to September 30 they are allowed only from 5:30 a.m. to 9 a.m.; from October 1 to March 31 they are allowed at any time.</p><p><strong>3. Are dogs allowed on the White Rock Pier?</strong></p><p>No. White Rock says dogs are not allowed on the White Rock Pier at any time.</p><p><strong>4. Can dogs be off leash on White Rock beach?</strong></p><p>No. Dogs may be on the beach only on a leash shorter than two metres, and the city says the Wildlife Act does not allow off-leash dogs on the beach.</p><p><strong>5. Does White Rock require dog licences?</strong></p><p>Yes. The city says all dogs over the age of four months living in White Rock must hold a valid licence.</p><p><strong>6. What are the current White Rock dog licence fees?</strong></p><p>As of July 29, 2026, White Rock lists $25 for an altered dog and $40 for an unaltered dog.</p>",
    "Nearby Cities": "Surrey, Delta, Langley",
    "Updated On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/white-rock/")];
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
console.log("Updated White Rock city page and refreshed backlog files.");
