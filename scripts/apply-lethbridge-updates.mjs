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
  if (source.includes('"lethbridge": "/images/cities/city-lethbridge-hero.png"')) return;
  const anchor = '  "edmonton": "/images/cities/city-edmonton-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "lethbridge": "/images/cities/city-lethbridge-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "lethbridge");
  if (!city) throw new Error("Lethbridge city record not found.");

  const reviewedAt = "Wed Jul 29 2026 21:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro =
    "<p>As of Wednesday, July 29, 2026, Lethbridge should be treated as a city with a clearly published five-park off-leash system, plus more current animal-control and licensing rules than the older page reflected. The strongest official sources now tie dog-park access, licensing, household limits, and control expectations together much more directly.</p>";
  const about =
    "<p>The City of Lethbridge's current dog-parks page says the city has five dog parks. That alone makes the older generic copy too vague, because the city now gives concise, park-specific facts for each one. Scenic Drive Dog Run is identified off Scenic Drive South at 11 Avenue South and uses a 2 kilometre limestone pathway loop in the coulees. Peenaquim Park Off-Leash Area is at the north end of Peenaquim Park and lets visitors choose between a 1 acre fenced area and a 2 kilometre limestone pathway along the river's edge. Park 'n' Bark is a fenced site of about 5.5 acres with a paved loop, hills, agility equipment, and accessible seating. Popson Park Off-Leash Area sits between the boat launch and picnic shelter and gives dogs river access inside a much larger river-valley setting. Riverstone Dog Park is a fenced site of about 1.5 acres with pathways, accessible seating, dog play equipment, and water fountains for both people and dogs, but the city also warns that it may close during heavy rain or snow melt because it sits in a dry storm-water retention facility.</p><p>The rules around those parks are also clearer now. Lethbridge says dogs must be on leash in all public spaces unless they are in one of the off-leash areas, aggressive dogs are not allowed, and owners must keep dogs on leash until they are past the marker signs because the off-leash areas sit inside shared park spaces. The city adds a specific river-valley warning that rattlesnakes may be present from spring to fall, especially in west-side parks. On licensing, the city's animal-licences page says all dogs 6 months of age or older must be registered and renewed yearly, with licences expiring December 31 and renewed before January 1. The city-linked Community Animal Services licensing page states that the current Animal Care and Control Bylaw 6475 came into force on May 1, 2025, limits households to two adult dogs unless a Dog Fancier's Licence has been issued, and lists current yearly dog registration fees of $50 for a dog that is not fixed and has no microchip or tattoo, $45 if not fixed but identified, $25 if fixed but not identified, $20 if fixed and identified, and $150 for an aggressive dog, with service dogs free. That gives Lethbridge this page's real factual backbone: a defined five-park network, shared-space leash transitions, coulee and rattlesnake context, and a current licensing regime tied to the post-2025 bylaw.</p>";
  const seasonalTips =
    "<ul><li><strong>Winter:</strong> wind, ice, and snow-packed coulee routes can make limestone loops and slopes much more technical than they look in summer.</li><li><strong>Spring:</strong> snow melt matters in both the coulees and Riverstone, where the city says the dog park may close during heavy rain or snow melt events.</li><li><strong>Summer:</strong> exposed prairie heat and dry conditions can build quickly, so river access and early visit timing matter more here than generic city copy suggests.</li><li><strong>Fall:</strong> cooler weather helps with longer outings, but rattlesnake awareness can still matter in river-valley and west-side areas until the season fully turns.</li></ul>";
  const parkRules =
    "<p><strong>Keep dogs leashed outside designated off-leash areas:</strong> Lethbridge says dogs must be on leash in all public spaces unless they are in one of the off-leash areas.</p><p><strong>Use marker signs properly:</strong> the city tells owners to keep dogs on leash until they are past the marker signs because these off-leash areas sit inside shared park spaces.</p><p><strong>Aggressive dogs are not allowed:</strong> Lethbridge says aggressive dogs are not allowed and the behaviour of your dog is your responsibility.</p><p><strong>Plan for natural hazards:</strong> the city warns that rattlesnakes may be present in river-valley parks from spring to fall, especially west-side areas.</p><p><strong>Keep licensing current:</strong> the city says dogs 6 months of age or older must be registered and renewed yearly.</p>";
  const etiquette =
    "<p><strong>1. Treat Lethbridge as a terrain-specific dog-park city.</strong></p><p>This is not a one-format system. Some parks are fenced urban sites, while others are coulee or river-edge routes where footing, grade, and natural hazards matter.</p><p><strong>2. Respect leash transitions before the fun part starts.</strong></p><p>The city explicitly tells owners to stay on leash until they are past the marker signs, which means legal entry and exit behaviour is part of responsible off-leash use.</p><p><strong>3. Match the dog to the park.</strong></p><p>A fenced one-acre section, a 5.5-acre run, and a 2 kilometre coulee loop do not ask the same things of a dog or handler.</p><p><strong>4. Do not ignore rattlesnake context.</strong></p><p>Lethbridge is unusually explicit about this risk, especially in river-valley and west-side settings, so seasonal hazard awareness belongs in planning, not as an afterthought.</p><p><strong>5. Treat licensing and dog-count limits as part of park readiness.</strong></p><p>The current bylaw framework is stricter and clearer than the old copy suggested, including yearly registration and household limits unless you hold the required additional licence.</p>";
  const faqs =
    "<p><strong>1. How many official dog parks does Lethbridge currently list?</strong></p><p>As of July 29, 2026, the City of Lethbridge says it has five dog parks.</p><p><strong>2. Are dogs allowed off leash elsewhere in Lethbridge parks?</strong></p><p>No. The city says dogs must be on leash in all public spaces unless they are in one of the designated off-leash areas.</p><p><strong>3. Does Lethbridge require dog licences?</strong></p><p>Yes. The city says all dogs 6 months of age or older must be registered and renewed yearly.</p><p><strong>4. What are the current Lethbridge yearly dog registration fees?</strong></p><p>As of July 29, 2026, the city-linked Community Animal Services page lists $50 for a dog that is not fixed and has no microchip or tattoo, $45 if not fixed but identified, $25 if fixed but not identified, $20 if fixed and identified, $150 for an aggressive dog, and free licensing for a service dog.</p><p><strong>5. Are there natural hazard warnings for Lethbridge dog parks?</strong></p><p>Yes. The city says rattlesnakes may be present in river-valley parks from spring to fall, especially on the west side.</p><p><strong>6. Can Riverstone Dog Park close because of weather?</strong></p><p>Yes. The city says Riverstone may close during heavy rain or snow melt because it sits in a dry storm-water retention facility.</p>";
  const metaDescription =
    "Source-backed guide to Lethbridge dog parks and off-leash rules, covering the city's five official dog parks, coulee and river-valley access, leash-transition rules, rattlesnake warnings, and current dog licensing requirements.";

  city.seoTitle = "Lethbridge Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Featured Park 1": ["scenic-drive-dog-run"],
    "Featured Park 2": ["popson-park-off-leash-area"],
    "Featured Park 3": ["park-n-bark-off-leash-dog-area"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "scenic-drive-dog-run",
    "Featured Park 2": "popson-park-off-leash-area",
    "Featured Park 3": "park-n-bark-off-leash-dog-area",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Medicine Hat, Calgary, St. Albert",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "lethbridge");
  if (!targetRow) throw new Error("Lethbridge city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Lethbridge Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description":
      "Source-backed guide to Lethbridge dog parks and off-leash rules, covering the city's five official dog parks, coulee and river-valley access, leash-transition rules, rattlesnake warnings, and current dog licensing requirements.",
    "Hero Image": "",
    "Intro Paragraph":
      "<p>As of Wednesday, July 29, 2026, Lethbridge should be treated as a city with a clearly published five-park off-leash system, plus more current animal-control and licensing rules than the older page reflected. The strongest official sources now tie dog-park access, licensing, household limits, and control expectations together much more directly.</p>",
    "About Section":
      "<p>The City of Lethbridge's current dog-parks page says the city has five dog parks. That alone makes the older generic copy too vague, because the city now gives concise, park-specific facts for each one. Scenic Drive Dog Run is identified off Scenic Drive South at 11 Avenue South and uses a 2 kilometre limestone pathway loop in the coulees. Peenaquim Park Off-Leash Area is at the north end of Peenaquim Park and lets visitors choose between a 1 acre fenced area and a 2 kilometre limestone pathway along the river's edge. Park 'n' Bark is a fenced site of about 5.5 acres with a paved loop, hills, agility equipment, and accessible seating. Popson Park Off-Leash Area sits between the boat launch and picnic shelter and gives dogs river access inside a much larger river-valley setting. Riverstone Dog Park is a fenced site of about 1.5 acres with pathways, accessible seating, dog play equipment, and water fountains for both people and dogs, but the city also warns that it may close during heavy rain or snow melt because it sits in a dry storm-water retention facility.</p><p>The rules around those parks are also clearer now. Lethbridge says dogs must be on leash in all public spaces unless they are in one of the off-leash areas, aggressive dogs are not allowed, and owners must keep dogs on leash until they are past the marker signs because the off-leash areas sit inside shared park spaces. The city adds a specific river-valley warning that rattlesnakes may be present from spring to fall, especially in west-side parks. On licensing, the city's animal-licences page says all dogs 6 months of age or older must be registered and renewed yearly, with licences expiring December 31 and renewed before January 1. The city-linked Community Animal Services licensing page states that the current Animal Care and Control Bylaw 6475 came into force on May 1, 2025, limits households to two adult dogs unless a Dog Fancier's Licence has been issued, and lists current yearly dog registration fees of $50 for a dog that is not fixed and has no microchip or tattoo, $45 if not fixed but identified, $25 if fixed but not identified, $20 if fixed and identified, and $150 for an aggressive dog, with service dogs free. That gives Lethbridge this page's real factual backbone: a defined five-park network, shared-space leash transitions, coulee and rattlesnake context, and a current licensing regime tied to the post-2025 bylaw.</p>",
    "Featured Park 1": "scenic-drive-dog-run",
    "Featured Park 2": "popson-park-off-leash-area",
    "Featured Park 3": "park-n-bark-off-leash-dog-area",
    "Seasonal Tips":
      "<ul><li><strong>Winter:</strong> wind, ice, and snow-packed coulee routes can make limestone loops and slopes much more technical than they look in summer.</li><li><strong>Spring:</strong> snow melt matters in both the coulees and Riverstone, where the city says the dog park may close during heavy rain or snow melt events.</li><li><strong>Summer:</strong> exposed prairie heat and dry conditions can build quickly, so river access and early visit timing matter more here than generic city copy suggests.</li><li><strong>Fall:</strong> cooler weather helps with longer outings, but rattlesnake awareness can still matter in river-valley and west-side areas until the season fully turns.</li></ul>",
    "Park Rules":
      "<p><strong>Keep dogs leashed outside designated off-leash areas:</strong> Lethbridge says dogs must be on leash in all public spaces unless they are in one of the off-leash areas.</p><p><strong>Use marker signs properly:</strong> the city tells owners to keep dogs on leash until they are past the marker signs because these off-leash areas sit inside shared park spaces.</p><p><strong>Aggressive dogs are not allowed:</strong> Lethbridge says aggressive dogs are not allowed and the behaviour of your dog is your responsibility.</p><p><strong>Plan for natural hazards:</strong> the city warns that rattlesnakes may be present in river-valley parks from spring to fall, especially west-side areas.</p><p><strong>Keep licensing current:</strong> the city says dogs 6 months of age or older must be registered and renewed yearly.</p>",
    "City Website": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes":
      "<p><strong>1. Treat Lethbridge as a terrain-specific dog-park city.</strong></p><p>This is not a one-format system. Some parks are fenced urban sites, while others are coulee or river-edge routes where footing, grade, and natural hazards matter.</p><p><strong>2. Respect leash transitions before the fun part starts.</strong></p><p>The city explicitly tells owners to stay on leash until they are past the marker signs, which means legal entry and exit behaviour is part of responsible off-leash use.</p><p><strong>3. Match the dog to the park.</strong></p><p>A fenced one-acre section, a 5.5-acre run, and a 2 kilometre coulee loop do not ask the same things of a dog or handler.</p><p><strong>4. Do not ignore rattlesnake context.</strong></p><p>Lethbridge is unusually explicit about this risk, especially in river-valley and west-side settings, so seasonal hazard awareness belongs in planning, not as an afterthought.</p><p><strong>5. Treat licensing and dog-count limits as part of park readiness.</strong></p><p>The current bylaw framework is stricter and clearer than the old copy suggested, including yearly registration and household limits unless you hold the required additional licence.</p>",
    "Dog Park FAQs":
      "<p><strong>1. How many official dog parks does Lethbridge currently list?</strong></p><p>As of July 29, 2026, the City of Lethbridge says it has five dog parks.</p><p><strong>2. Are dogs allowed off leash elsewhere in Lethbridge parks?</strong></p><p>No. The city says dogs must be on leash in all public spaces unless they are in one of the designated off-leash areas.</p><p><strong>3. Does Lethbridge require dog licences?</strong></p><p>Yes. The city says all dogs 6 months of age or older must be registered and renewed yearly.</p><p><strong>4. What are the current Lethbridge yearly dog registration fees?</strong></p><p>As of July 29, 2026, the city-linked Community Animal Services page lists $50 for a dog that is not fixed and has no microchip or tattoo, $45 if not fixed but identified, $25 if fixed but not identified, $20 if fixed and identified, $150 for an aggressive dog, and free licensing for a service dog.</p><p><strong>5. Are there natural hazard warnings for Lethbridge dog parks?</strong></p><p>Yes. The city says rattlesnakes may be present in river-valley parks from spring to fall, especially on the west side.</p><p><strong>6. Can Riverstone Dog Park close because of weather?</strong></p><p>Yes. The city says Riverstone may close during heavy rain or snow melt because it sits in a dry storm-water retention facility.</p>",
    "Nearby Cities": "Medicine Hat, Calgary, St. Albert",
    "Updated On": "Wed Jul 29 2026 21:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 21:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lethbridge/")];
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
console.log("Updated Lethbridge city page and refreshed backlog files.");
