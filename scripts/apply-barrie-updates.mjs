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
  return `${rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(",")
    )
    .join("\n")}\n`;
}

function setRawFields(raw, updates) {
  for (const [key, value] of Object.entries(updates)) raw[key] = value;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"barrie": "/images/cities/city-barrie-hero.png"')) return;
  const anchor = '  "lethbridge": "/images/cities/city-lethbridge-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "barrie": "/images/cities/city-barrie-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "barrie");
  if (!city) throw new Error("Barrie city record not found.");

  const reviewedAt = "Wed Jul 29 2026 22:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro =
    "<p>As of Wednesday, July 29, 2026, Barrie should be treated as a city with two officially published Dog Off-Leash Recreation Areas rather than the older three-park generic setup. The strongest city sources now support a tighter guide built around those two DOLRAs, current pet-registration requirements, and Barrie's broader park and waterfront leash rules.</p>";
  const about =
    "<p>The City of Barrie's current DOLRA page says Barrie has two Dog Off-Leash Recreation Areas: one at Sunnidale Park and one beside Sadlon Arena on Bayview Drive. That directly contradicts the older draft that claimed Barrie had three fully fenced leash-free dog parks. The Bayview Drive DOLRA at 555 Bayview Drive is the more structured site. The city says it has three separate fenced areas: a 1 acre western pen with access gates to the small-dog pen and trail systems, a 0.25 acre middle pen reserved for dogs up to 30 pounds, and a larger 1.8 acre eastern pen open to all dogs. Barrie also says dogs are permitted off leash in the natural area beyond the pens, but that this larger area is not secure because of gaps under the fence line, water flows, and movements of small animals. That is exactly the kind of factual nuance the page was missing before.</p><p>Sunnidale Park DOLRA is different. The city describes it as a 7.15 acre natural rolling setting with earthen footpaths between Sunnidale Road and Coulter Street, notes that it is not wheelchair accessible, and says upgrades completed in 2020 included trail work, two permanent bridges, benches, and vegetation restoration. Barrie adds a practical warning that poison ivy may be found in both off-leash areas and that oil transferred to pet fur can also cause a rash. The city also states that streams in or near the DOLRAs are naturalized and that it does not monitor water quality there. On the ownership side, Barrie's current pet-registration page says residents are required to register their dogs, that by-law staff regularly visit DOLRAs to check tags, and that unregistered dogs can trigger fines from $150 to $5,000. The same page lists current lifetime fees of $64.67 per pet registration, $12.88 for contact-information changes, and $14.05 for replacement tags, with service dogs free. The city's animal-control by-law summary adds that dogs are allowed in non-waterfront parks on leash, and on walking paths only in Heritage Park, Allandale Station Park, and Centennial Park, while dogs are not permitted on city beaches. Put together, Barrie is best framed as a two-DOLRA system inside a city with stricter waterfront and registration rules than the old page suggested.</p>";
  const seasonalTips =
    "<ul><li><strong>Winter:</strong> Barrie's off-leash areas remain usable, but ice, packed snow, and hidden gaps in naturalized ground can make recall and footing more important.</li><li><strong>Spring:</strong> mud, overland water flow, and poison ivy regrowth are bigger practical issues than the old generic copy suggested.</li><li><strong>Summer:</strong> waterfront restrictions matter more because dogs are not permitted on city beaches even when owners want to pair park and lake visits.</li><li><strong>Fall:</strong> cooler weather is strong for longer outings, but leaf cover can make trail edges, poison ivy, and uneven terrain harder to spot.</li></ul>";
  const parkRules =
    "<p><strong>Use only the two published DOLRAs for off-leash activity:</strong> Barrie says dogs may run off leash in the Dog Off-Leash Recreation Areas at Sunnidale Park and Bayview Drive.</p><p><strong>Leash dogs when entering and exiting:</strong> the city says dogs must be leashed when entering and leaving the off-leash areas.</p><p><strong>Keep current registration tags on dogs:</strong> Barrie says all dogs must be wearing current registration tags and have up-to-date rabies vaccination.</p><p><strong>Follow handler limits:</strong> the city says no more than two dogs per owner are allowed within the DOLRA area.</p><p><strong>Respect broader city park rules:</strong> Barrie says dogs are allowed in non-waterfront parks on leash, but dogs are not permitted on city beaches.</p>";
  const etiquette =
    "<p><strong>1. Treat Barrie as a two-site system, not a vague multi-park city.</strong></p><p>The main quality problem on the old page was pretending there were more official off-leash sites than the city currently publishes.</p><p><strong>2. Match your dog to Bayview versus Sunnidale.</strong></p><p>Bayview gives you separate pens and a small-dog area, while Sunnidale is a larger natural rolling setting with footpaths and less structured containment.</p><p><strong>3. Do not confuse \"fenced\" with \"fully secure\" at Bayview.</strong></p><p>The city explicitly says the natural area beyond the pens is not secure, which matters for dogs with weak recall or prey drive.</p><p><strong>4. Take poison ivy and natural water seriously.</strong></p><p>Barrie is unusually direct that poison ivy may be present in both off-leash areas and that nearby creek water is not city-monitored.</p><p><strong>5. Keep tags current before you go.</strong></p><p>Barrie says by-law staff regularly visit DOLRAs to check pet tags, so registration is not background admin here.</p>";
  const faqs =
    "<p><strong>1. How many official Dog Off-Leash Recreation Areas does Barrie currently list?</strong></p><p>As of July 29, 2026, the City of Barrie says it has two DOLRAs: Bayview Drive and Sunnidale Park.</p><p><strong>2. Does Barrie have a small-dog area?</strong></p><p>Yes. The Bayview Drive DOLRA includes a 0.25 acre middle pen reserved for small dogs up to 30 pounds.</p><p><strong>3. Does Barrie require dog registration tags?</strong></p><p>Yes. The city says residents must register their dogs and that dogs in the DOLRAs must wear current registration tags.</p><p><strong>4. What are the current Barrie pet-registration fees?</strong></p><p>As of July 29, 2026, Barrie lists a lifetime pet registration fee of $64.67, a $12.88 fee to change contact information, and a $14.05 replacement-tag fee, with no fee for service dogs.</p><p><strong>5. Are dogs allowed on Barrie beaches?</strong></p><p>No. Barrie says dogs are not permitted on city beaches.</p><p><strong>6. Are there plant or water hazards to know about?</strong></p><p>Yes. The city warns that poison ivy may be found in both off-leash areas and says naturalized streams near the DOLRAs are not monitored for water quality.</p>";
  const metaDescription =
    "Source-backed guide to Barrie dog parks and off-leash rules, covering the city's two official DOLRAs, Bayview and Sunnidale details, pet registration requirements, poison ivy warnings, and beach restrictions.";

  city.seoTitle = "Barrie Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Featured Park 1": ["sunnidale-park"],
    "Featured Park 2": ["bayview-drive"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "sunnidale-park",
    "Featured Park 2": "bayview-drive",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/dog-leash-recreation-areas",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Tiny, Oshawa, Whitby",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "barrie");
  if (!targetRow) throw new Error("Barrie city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Barrie Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description":
      "Source-backed guide to Barrie dog parks and off-leash rules, covering the city's two official DOLRAs, Bayview and Sunnidale details, pet registration requirements, poison ivy warnings, and beach restrictions.",
    "Hero Image": "",
    "Intro Paragraph":
      "<p>As of Wednesday, July 29, 2026, Barrie should be treated as a city with two officially published Dog Off-Leash Recreation Areas rather than the older three-park generic setup. The strongest city sources now support a tighter guide built around those two DOLRAs, current pet-registration requirements, and Barrie's broader park and waterfront leash rules.</p>",
    "About Section":
      "<p>The City of Barrie's current DOLRA page says Barrie has two Dog Off-Leash Recreation Areas: one at Sunnidale Park and one beside Sadlon Arena on Bayview Drive. That directly contradicts the older draft that claimed Barrie had three fully fenced leash-free dog parks. The Bayview Drive DOLRA at 555 Bayview Drive is the more structured site. The city says it has three separate fenced areas: a 1 acre western pen with access gates to the small-dog pen and trail systems, a 0.25 acre middle pen reserved for dogs up to 30 pounds, and a larger 1.8 acre eastern pen open to all dogs. Barrie also says dogs are permitted off leash in the natural area beyond the pens, but that this larger area is not secure because of gaps under the fence line, water flows, and movements of small animals. That is exactly the kind of factual nuance the page was missing before.</p><p>Sunnidale Park DOLRA is different. The city describes it as a 7.15 acre natural rolling setting with earthen footpaths between Sunnidale Road and Coulter Street, notes that it is not wheelchair accessible, and says upgrades completed in 2020 included trail work, two permanent bridges, benches, and vegetation restoration. Barrie adds a practical warning that poison ivy may be found in both off-leash areas and that oil transferred to pet fur can also cause a rash. The city also states that streams in or near the DOLRAs are naturalized and that it does not monitor water quality there. On the ownership side, Barrie's current pet-registration page says residents are required to register their dogs, that by-law staff regularly visit DOLRAs to check tags, and that unregistered dogs can trigger fines from $150 to $5,000. The same page lists current lifetime fees of $64.67 per pet registration, $12.88 for contact-information changes, and $14.05 for replacement tags, with service dogs free. The city's animal-control by-law summary adds that dogs are allowed in non-waterfront parks on leash, and on walking paths only in Heritage Park, Allandale Station Park, and Centennial Park, while dogs are not permitted on city beaches. Put together, Barrie is best framed as a two-DOLRA system inside a city with stricter waterfront and registration rules than the old page suggested.</p>",
    "Featured Park 1": "sunnidale-park",
    "Featured Park 2": "bayview-drive",
    "Featured Park 3": "",
    "Seasonal Tips":
      "<ul><li><strong>Winter:</strong> Barrie's off-leash areas remain usable, but ice, packed snow, and hidden gaps in naturalized ground can make recall and footing more important.</li><li><strong>Spring:</strong> mud, overland water flow, and poison ivy regrowth are bigger practical issues than the old generic copy suggested.</li><li><strong>Summer:</strong> waterfront restrictions matter more because dogs are not permitted on city beaches even when owners want to pair park and lake visits.</li><li><strong>Fall:</strong> cooler weather is strong for longer outings, but leaf cover can make trail edges, poison ivy, and uneven terrain harder to spot.</li></ul>",
    "Park Rules":
      "<p><strong>Use only the two published DOLRAs for off-leash activity:</strong> Barrie says dogs may run off leash in the Dog Off-Leash Recreation Areas at Sunnidale Park and Bayview Drive.</p><p><strong>Leash dogs when entering and exiting:</strong> the city says dogs must be leashed when entering and leaving the off-leash areas.</p><p><strong>Keep current registration tags on dogs:</strong> Barrie says all dogs must be wearing current registration tags and have up-to-date rabies vaccination.</p><p><strong>Follow handler limits:</strong> the city says no more than two dogs per owner are allowed within the DOLRA area.</p><p><strong>Respect broader city park rules:</strong> Barrie says dogs are allowed in non-waterfront parks on leash, but dogs are not permitted on city beaches.</p>",
    "City Website": "https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/dog-leash-recreation-areas",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes":
      "<p><strong>1. Treat Barrie as a two-site system, not a vague multi-park city.</strong></p><p>The main quality problem on the old page was pretending there were more official off-leash sites than the city currently publishes.</p><p><strong>2. Match your dog to Bayview versus Sunnidale.</strong></p><p>Bayview gives you separate pens and a small-dog area, while Sunnidale is a larger natural rolling setting with footpaths and less structured containment.</p><p><strong>3. Do not confuse \"fenced\" with \"fully secure\" at Bayview.</strong></p><p>The city explicitly says the natural area beyond the pens is not secure, which matters for dogs with weak recall or prey drive.</p><p><strong>4. Take poison ivy and natural water seriously.</strong></p><p>Barrie is unusually direct that poison ivy may be present in both off-leash areas and that nearby creek water is not city-monitored.</p><p><strong>5. Keep tags current before you go.</strong></p><p>Barrie says by-law staff regularly visit DOLRAs to check pet tags, so registration is not background admin here.</p>",
    "Dog Park FAQs":
      "<p><strong>1. How many official Dog Off-Leash Recreation Areas does Barrie currently list?</strong></p><p>As of July 29, 2026, the City of Barrie says it has two DOLRAs: Bayview Drive and Sunnidale Park.</p><p><strong>2. Does Barrie have a small-dog area?</strong></p><p>Yes. The Bayview Drive DOLRA includes a 0.25 acre middle pen reserved for small dogs up to 30 pounds.</p><p><strong>3. Does Barrie require dog registration tags?</strong></p><p>Yes. The city says residents must register their dogs and that dogs in the DOLRAs must wear current registration tags.</p><p><strong>4. What are the current Barrie pet-registration fees?</strong></p><p>As of July 29, 2026, Barrie lists a lifetime pet registration fee of $64.67, a $12.88 fee to change contact information, and a $14.05 replacement-tag fee, with no fee for service dogs.</p><p><strong>5. Are dogs allowed on Barrie beaches?</strong></p><p>No. Barrie says dogs are not permitted on city beaches.</p><p><strong>6. Are there plant or water hazards to know about?</strong></p><p>Yes. The city warns that poison ivy may be found in both off-leash areas and says naturalized streams near the DOLRAs are not monitored for water quality.</p>",
    "Nearby Cities": "Tiny, Oshawa, Whitby",
    "Updated On": "Wed Jul 29 2026 22:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 22:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/barrie/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));
  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || "";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
  const sectionRows = countBy("contentType")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`
    )
    .join("\n");
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
console.log("Updated Barrie city page and refreshed backlog files.");
