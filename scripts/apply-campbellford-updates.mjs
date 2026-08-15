import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const reviewQueueCsvPath = "reports/content-review-queue.csv";
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

  const intro = "<p>As of Saturday, August 15, 2026, Campbellford is best treated as a Ferris Provincial Park access page rather than a generic city dog-park roundup. Ontario Parks lists one fenced off-leash pet exercise area at Ferris, while Trent Hills separately requires annual dog licensing for local owners.</p>";
  const about = "<p>The earlier Campbellford page had the right corrective instinct but still read too much like a generic city guide. The strongest primary-source evidence points to Ferris Provincial Park near Campbellford. Ontario Parks says Ferris has one designated pet exercise area near the day-use parking lot between Ranney Falls Trail and the picnic shelter area, and describes it as a fenced off-leash area with grass and trees. The same page is explicit that pets must remain on a leash everywhere else in the park. Ontario Parks also currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026, which matters because this is not a year-round municipal park assumption.</p><p>For local compliance, the Municipality of Trent Hills requires all dogs to be licensed each year through its dog-licensing program. The current published yearly fees are $20 for one altered dog and $35 for one unaltered dog. Put together, the useful Campbellford page is not a long list of unverified park claims. It is a precise guide to the one clearly documented nearby off-leash area plus the local licensing rule dog owners still need to follow.</p>";
  const seasonalTips = "<p>- Spring: Ferris operates on published seasonal dates, so early-season visits should start with a quick check that the park is open.<br>- Summer: the fenced pet exercise area sits near the day-use parking lot, which makes shorter off-leash stops practical during warm-weather trips.<br>- Fall: Ferris stays useful while the park is open, but the operating window still matters because Ontario Parks posts a defined seasonal closing date.<br>- Winter: Ferris is not a dependable year-round off-leash answer in the current official listing, so assume on-leash alternatives are needed when the park is closed.</p>";
  const parkRules = "<p><strong>Use the designated off-leash area only:</strong> Ontario Parks says Ferris has one fenced pet exercise area and that pets must remain on leash in all other areas of the park.</p><p><strong>Keep dog licences current:</strong> Trent Hills requires all dogs to be licensed each year under the municipal dog-licensing by-law.</p><p><strong>Respect the seasonal operating window:</strong> Ontario Parks currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026.</p><p><strong>Check conditions before relying on the facility:</strong> Ontario Parks says facility hours and availability are subject to change.</p>";
  const etiquette = "<p><strong>1. Treat Ferris as the verified off-leash answer.</strong></p><p>The primary-source case here is Ferris Provincial Park, not unsupported older mentions of other local dog parks.</p><p><strong>2. Leash up immediately outside the exercise area.</strong></p><p>Ontario Parks is explicit that dogs must remain on a leash everywhere else in Ferris.</p><p><strong>3. Plan around the park season, not assumptions.</strong></p><p>This page is stronger when it acknowledges that Ferris has a published operating window.</p><p><strong>4. Keep Trent Hills licensing current.</strong></p><p>Local municipal licensing still applies even when the actual off-leash stop is in a provincial park.</p><p><strong>5. Stay conservative about unverified amenities.</strong></p><p>If Ontario Parks or Trent Hills do not publish it, the page should not claim it as fact.</p>";
  const faqs = "<p><strong>1. Is there an official off-leash dog area near Campbellford?</strong></p><p>Yes. Ontario Parks lists one fenced pet exercise area at Ferris Provincial Park near Campbellford.</p><p><strong>2. Where is the Ferris pet exercise area located?</strong></p><p>Ontario Parks says it is near the day-use parking lot between Ranney Falls Trail and the picnic shelter area.</p><p><strong>3. Are dogs allowed off leash anywhere else in Ferris Provincial Park?</strong></p><p>No. Ontario Parks says pets must remain on a leash in all other areas of the park.</p><p><strong>4. Do Campbellford dog owners need a municipal dog licence?</strong></p><p>Yes. Trent Hills requires all dogs to be licensed each year.</p><p><strong>5. What are the current Trent Hills dog-licence fees?</strong></p><p>As of Saturday, August 15, 2026, Trent Hills lists $20 for one altered dog and $35 for one unaltered dog on a yearly licence.</p><p><strong>6. Is Ferris open year-round for off-leash visits?</strong></p><p>No. Ontario Parks currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026, so confirm the season before visiting.</p>";
  const metaDescription = "Source-backed guide to Campbellford dog park access, covering Ferris Provincial Park's fenced off-leash area, 2026 operating dates, and current Trent Hills dog-licensing requirements.";

  city.seoTitle = "Campbellford Dog Park Access and Trent Hills Rules | LeashFree.ca";
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
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
    "SEO Title Tag": "Campbellford Dog Park Access and Trent Hills Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Campbellford dog park access, covering Ferris Provincial Park's fenced off-leash area, 2026 operating dates, and current Trent Hills dog-licensing requirements.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Saturday, August 15, 2026, Campbellford is best treated as a Ferris Provincial Park access page rather than a generic city dog-park roundup. Ontario Parks lists one fenced off-leash pet exercise area at Ferris, while Trent Hills separately requires annual dog licensing for local owners.</p>",
    "About Section": "<p>The earlier Campbellford page had the right corrective instinct but still read too much like a generic city guide. The strongest primary-source evidence points to Ferris Provincial Park near Campbellford. Ontario Parks says Ferris has one designated pet exercise area near the day-use parking lot between Ranney Falls Trail and the picnic shelter area, and describes it as a fenced off-leash area with grass and trees. The same page is explicit that pets must remain on a leash everywhere else in the park. Ontario Parks also currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026, which matters because this is not a year-round municipal park assumption.</p><p>For local compliance, the Municipality of Trent Hills requires all dogs to be licensed each year through its dog-licensing program. The current published yearly fees are $20 for one altered dog and $35 for one unaltered dog. Put together, the useful Campbellford page is not a long list of unverified park claims. It is a precise guide to the one clearly documented nearby off-leash area plus the local licensing rule dog owners still need to follow.</p>",
    "Featured Park 1": "campbellford-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Spring: Ferris operates on published seasonal dates, so early-season visits should start with a quick check that the park is open.<br>- Summer: the fenced pet exercise area sits near the day-use parking lot, which makes shorter off-leash stops practical during warm-weather trips.<br>- Fall: Ferris stays useful while the park is open, but the operating window still matters because Ontario Parks posts a defined seasonal closing date.<br>- Winter: Ferris is not a dependable year-round off-leash answer in the current official listing, so assume on-leash alternatives are needed when the park is closed.</p>",
    "Park Rules": "<p><strong>Use the designated off-leash area only:</strong> Ontario Parks says Ferris has one fenced pet exercise area and that pets must remain on leash in all other areas of the park.</p><p><strong>Keep dog licences current:</strong> Trent Hills requires all dogs to be licensed each year under the municipal dog-licensing by-law.</p><p><strong>Respect the seasonal operating window:</strong> Ontario Parks currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026.</p><p><strong>Check conditions before relying on the facility:</strong> Ontario Parks says facility hours and availability are subject to change.</p>",
    "City Website": "https://www.ontarioparks.ca/park/ferris/facilities",
    "Dog Park Etiquettes": "<p><strong>1. Treat Ferris as the verified off-leash answer.</strong></p><p>The primary-source case here is Ferris Provincial Park, not unsupported older mentions of other local dog parks.</p><p><strong>2. Leash up immediately outside the exercise area.</strong></p><p>Ontario Parks is explicit that dogs must remain on a leash everywhere else in Ferris.</p><p><strong>3. Plan around the park season, not assumptions.</strong></p><p>This page is stronger when it acknowledges that Ferris has a published operating window.</p><p><strong>4. Keep Trent Hills licensing current.</strong></p><p>Local municipal licensing still applies even when the actual off-leash stop is in a provincial park.</p><p><strong>5. Stay conservative about unverified amenities.</strong></p><p>If Ontario Parks or Trent Hills do not publish it, the page should not claim it as fact.</p>",
    "Dog Park FAQs": "<p><strong>1. Is there an official off-leash dog area near Campbellford?</strong></p><p>Yes. Ontario Parks lists one fenced pet exercise area at Ferris Provincial Park near Campbellford.</p><p><strong>2. Where is the Ferris pet exercise area located?</strong></p><p>Ontario Parks says it is near the day-use parking lot between Ranney Falls Trail and the picnic shelter area.</p><p><strong>3. Are dogs allowed off leash anywhere else in Ferris Provincial Park?</strong></p><p>No. Ontario Parks says pets must remain on a leash in all other areas of the park.</p><p><strong>4. Do Campbellford dog owners need a municipal dog licence?</strong></p><p>Yes. Trent Hills requires all dogs to be licensed each year.</p><p><strong>5. What are the current Trent Hills dog-licence fees?</strong></p><p>As of Saturday, August 15, 2026, Trent Hills lists $20 for one altered dog and $35 for one unaltered dog on a yearly licence.</p><p><strong>6. Is Ferris open year-round for off-leash visits?</strong></p><p>No. Ontario Parks currently lists Ferris' 2026 operating dates as May 8, 2026 to October 18, 2026, so confirm the season before visiting.</p>",
    "Nearby Cities": "Trent Hills, Cobourg",
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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

function updateReviewQueue() {
  const rows = parseCsv(fs.readFileSync(reviewQueueCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/campbellford/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Campbellford city page and refreshed backlog files.");
