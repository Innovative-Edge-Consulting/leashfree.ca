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
  if (source.includes('"campbellford": "/images/cities/city-campbellford-hero.png"')) return;
  const updated = source.replace(
    '  "battleford": "/images/dog-parks/battleford-original.png",\n',
    '  "battleford": "/images/dog-parks/battleford-original.png",\n  "campbellford": "/images/cities/city-campbellford-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "campbellford");
  if (!city) throw new Error("Campbellford city record not found.");

  const intro = "<p>Current official sources point Campbellford dog owners to Trent Hills animal-services rules and to the designated pet exercise area at Ferris Provincial Park. Ontario Parks lists Ferris as having one fenced off-leash pet exercise area near the day-use parking lot, while Trent Hills requires all dogs to be licensed annually under its dog-licensing by-law.</p>";
  const about = "<p>The previous Campbellford page relied on unsupported claims about a dog park in Kennedy Park. The stronger evidence currently available points to Ferris Provincial Park near Campbellford. Ontario Parks lists Ferris as having one pet exercise area and describes it as a fenced off-leash area with grass and trees located near the day-use parking lot between Ranney Falls Trail and the picnic shelter area. Ontario Parks also states that pets must remain on a leash in all other areas of the park.</p><p>For local owner requirements, the Municipality of Trent Hills requires all dogs to be licensed each year through its dog-licensing program. The municipality's current rates are $20 for one altered dog and $35 for one unaltered dog on a yearly 365-day licence. That means Campbellford-area owners can combine Trent Hills licensing compliance with the closest official off-leash option that is currently documented by a primary source.</p>";
  const seasonalTips = "<p>- Spring: Ferris Provincial Park operates seasonally, so check current park opening dates before planning an off-leash stop early in the year.<br>- Summer: The official pet exercise area is near the day-use parking lot, which makes shorter exercise stops practical during warm-weather visits.<br>- Fall: Ferris remains a strong option while the park is open, but operating dates still matter because Ontario Parks posts specific opening and closing windows.<br>- Winter: Ferris is not presented as a year-round off-leash solution in the current official operating-date listing, so verify access and consider on-leash alternatives when the park is closed.</p>";
  const parkRules = "<p><strong>Use the designated off-leash area only:</strong> Ontario Parks says Ferris has one fenced pet exercise area and that pets must remain on leash in all other areas of the park.</p><p><strong>Keep licences current:</strong> Trent Hills requires all dogs to be licensed each year under the municipal dog-licensing by-law.</p><p><strong>Expect park-season limits:</strong> Ferris Provincial Park has published operating dates, so access to the official off-leash area is not something to assume year-round.</p><p><strong>Verify on arrival:</strong> Ontario Parks notes that facility hours and availability are subject to change, so check current postings before relying on the off-leash area.</p>";
  const etiquette = "<p><strong>1. Do not treat unsupported local listings as municipal fact.</strong></p><p>The strongest current primary-source evidence is Ontario Parks' Ferris pet exercise area, not the older generic Kennedy Park description.</p><p><strong>2. Leash up outside the exercise area.</strong></p><p>Ontario Parks is explicit that pets must remain on a leash everywhere else in Ferris Provincial Park.</p><p><strong>3. Plan around seasonal operations.</strong></p><p>Ferris posts operating dates and facility updates, so check access before driving out.</p><p><strong>4. Keep your Trent Hills dog licence current.</strong></p><p>Local licensing is a municipal requirement even when the off-leash destination is a provincial-park facility.</p><p><strong>5. Use conservative park expectations.</strong></p><p>If a feature is not confirmed by Ontario Parks or Trent Hills, treat it as unverified until you see it posted on site.</p>";
  const faqs = "<p><strong>1. Is there an official off-leash dog area near Campbellford?</strong></p><p>Yes. Ontario Parks lists one fenced pet exercise area at Ferris Provincial Park near Campbellford.</p><p><strong>2. Where is the Ferris pet exercise area located?</strong></p><p>Ontario Parks says it is near the day-use parking lot between Ranney Falls Trail and the picnic shelter area.</p><p><strong>3. Are dogs allowed off leash anywhere else in Ferris Provincial Park?</strong></p><p>No. Ontario Parks says pets must remain on a leash in all other areas of the park.</p><p><strong>4. Do Campbellford dog owners need a municipal dog licence?</strong></p><p>Yes. Trent Hills requires all dogs to be licensed each year.</p><p><strong>5. What are the current Trent Hills dog-licence fees?</strong></p><p>The municipality currently lists $20 for one altered dog and $35 for one unaltered dog on a yearly licence.</p><p><strong>6. Is the Ferris off-leash area guaranteed year-round?</strong></p><p>No. Ontario Parks publishes operating dates and says facility availability can change, so confirm the current season before visiting.</p>";
  const metaDescription = "Find Campbellford dog park guidance, Ferris Provincial Park off-leash details, and current Trent Hills dog-licensing requirements. This source-backed Campbellford guide replaces generic claims with current primary-source facts.";

  city.seoTitle = "Dog Parks in Campbellford, Ontario | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "campbellford-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.ontarioparks.ca/park/ferris/facilities",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Trent Hills, Cobourg",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "campbellford");
  if (!targetRow) throw new Error("Campbellford city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Campbellford, Ontario | Off-Leash Guide",
    "Meta Description": "Find Campbellford dog park guidance, Ferris Provincial Park off-leash details, and current Trent Hills dog-licensing requirements. This source-backed Campbellford guide replaces generic claims with current primary-source facts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Current official sources point Campbellford dog owners to Trent Hills animal-services rules and to the designated pet exercise area at Ferris Provincial Park. Ontario Parks lists Ferris as having one fenced off-leash pet exercise area near the day-use parking lot, while Trent Hills requires all dogs to be licensed annually under its dog-licensing by-law.</p>",
    "About Section": "<p>The previous Campbellford page relied on unsupported claims about a dog park in Kennedy Park. The stronger evidence currently available points to Ferris Provincial Park near Campbellford. Ontario Parks lists Ferris as having one pet exercise area and describes it as a fenced off-leash area with grass and trees located near the day-use parking lot between Ranney Falls Trail and the picnic shelter area. Ontario Parks also states that pets must remain on a leash in all other areas of the park.</p><p>For local owner requirements, the Municipality of Trent Hills requires all dogs to be licensed each year through its dog-licensing program. The municipality's current rates are $20 for one altered dog and $35 for one unaltered dog on a yearly 365-day licence. That means Campbellford-area owners can combine Trent Hills licensing compliance with the closest official off-leash option that is currently documented by a primary source.</p>",
    "Featured Park 1": "campbellford-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Spring: Ferris Provincial Park operates seasonally, so check current park opening dates before planning an off-leash stop early in the year.<br>- Summer: The official pet exercise area is near the day-use parking lot, which makes shorter exercise stops practical during warm-weather visits.<br>- Fall: Ferris remains a strong option while the park is open, but operating dates still matter because Ontario Parks posts specific opening and closing windows.<br>- Winter: Ferris is not presented as a year-round off-leash solution in the current official operating-date listing, so verify access and consider on-leash alternatives when the park is closed.</p>",
    "Park Rules": "<p><strong>Use the designated off-leash area only:</strong> Ontario Parks says Ferris has one fenced pet exercise area and that pets must remain on leash in all other areas of the park.</p><p><strong>Keep licences current:</strong> Trent Hills requires all dogs to be licensed each year under the municipal dog-licensing by-law.</p><p><strong>Expect park-season limits:</strong> Ferris Provincial Park has published operating dates, so access to the official off-leash area is not something to assume year-round.</p><p><strong>Verify on arrival:</strong> Ontario Parks notes that facility hours and availability are subject to change, so check current postings before relying on the off-leash area.</p>",
    "City Website": "https://www.ontarioparks.ca/park/ferris/facilities",
    "Dog Park Etiquettes": "<p><strong>1. Do not treat unsupported local listings as municipal fact.</strong></p><p>The strongest current primary-source evidence is Ontario Parks' Ferris pet exercise area, not the older generic Kennedy Park description.</p><p><strong>2. Leash up outside the exercise area.</strong></p><p>Ontario Parks is explicit that pets must remain on a leash everywhere else in Ferris Provincial Park.</p><p><strong>3. Plan around seasonal operations.</strong></p><p>Ferris posts operating dates and facility updates, so check access before driving out.</p><p><strong>4. Keep your Trent Hills dog licence current.</strong></p><p>Local licensing is a municipal requirement even when the off-leash destination is a provincial-park facility.</p><p><strong>5. Use conservative park expectations.</strong></p><p>If a feature is not confirmed by Ontario Parks or Trent Hills, treat it as unverified until you see it posted on site.</p>",
    "Dog Park FAQs": "<p><strong>1. Is there an official off-leash dog area near Campbellford?</strong></p><p>Yes. Ontario Parks lists one fenced pet exercise area at Ferris Provincial Park near Campbellford.</p><p><strong>2. Where is the Ferris pet exercise area located?</strong></p><p>Ontario Parks says it is near the day-use parking lot between Ranney Falls Trail and the picnic shelter area.</p><p><strong>3. Are dogs allowed off leash anywhere else in Ferris Provincial Park?</strong></p><p>No. Ontario Parks says pets must remain on a leash in all other areas of the park.</p><p><strong>4. Do Campbellford dog owners need a municipal dog licence?</strong></p><p>Yes. Trent Hills requires all dogs to be licensed each year.</p><p><strong>5. What are the current Trent Hills dog-licence fees?</strong></p><p>The municipality currently lists $20 for one altered dog and $35 for one unaltered dog on a yearly licence.</p><p><strong>6. Is the Ferris off-leash area guaranteed year-round?</strong></p><p>No. Ontario Parks publishes operating dates and says facility availability can change, so confirm the current season before visiting.</p>",
    "Nearby Cities": "Trent Hills, Cobourg",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/campbellford/")];
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

console.log("Updated Campbellford city page and refreshed backlog files.");
