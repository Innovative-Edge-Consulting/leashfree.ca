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
  for (const [key, value] of Object.entries(updates)) {
    raw[key] = value;
  }
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"winnipeg": "/images/cities/city-winnipeg-hero.png"')) return;
  const anchor = '  "woodstock": "/images/cities/city-woodstock-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "winnipeg": "/images/cities/city-winnipeg-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "winnipeg");
  if (!city) throw new Error("Winnipeg city record not found.");

  const intro = "<p>Winnipegâ€™s official dog-park rules are clearer and more specific than the old thin page suggested. As of Wednesday, July 29, 2026, the City of Winnipeg says dogs may run off leash only on private property with permission or in designated city off-leash areas, requires licensing for dogs over six months old, and treats most off-leash areas as open from 7 a.m. to 11 p.m. unless a site is posted differently.</p>";
  const about = "<p>Winnipeg does have a substantial off-leash network, but the current city guidance matters more than generic park hype. The Animal Services and parks pages say off-leash access is legal only in designated areas, and the city also makes clear that not every dog park is fenced unless specifically indicated. That is an important distinction in Winnipeg because the network includes a mix of neighborhood parks, larger natural spaces, and a smaller number of more formal fenced enclosures.</p><p>The cityâ€™s current material also gives this page fresher factual anchors than the older copy had. Animal Services says all dogs and cats over the age of six months must be licensed, and the cityâ€™s pet-licensing system says those licences must be renewed annually, with two-year licences available in some cases. The cityâ€™s off-leash guidance and FAQ also tie park use to current owner responsibility: dogs must stay leashed outside the designated off-leash boundary, owners remain legally responsible for their dog and any injury or damage caused, aggressive dogs are not permitted, owners must carry a leash and pick up waste, and standard off-leash hours are 7 a.m. to 11 p.m. unless posted otherwise. Winnipegâ€™s network is also still evolving. On July 4, 2026, the city announced the opening of Bridgwater Trails Dog Park in Shaheed Bhagat Singh Park at 360 Appleford Gate, a fully fenced one-hectare off-leash area with dedicated spaces for large and small dogs. That opening is useful because it confirms the city is still expanding the system rather than treating it as static.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Winnipeg off-leash outings can stay viable year-round, but open prairie wind, icy footing, and deeper snow can change how usable larger unfenced spaces feel.</li><li><strong>Spring:</strong> Thaw periods can create muddy entrances and soft ground, especially in larger natural parks and river-adjacent areas.</li><li><strong>Summer:</strong> Use early or later parts of the day when possible, especially in exposed parks with less shade.</li><li><strong>Fall:</strong> Cooler weather is often ideal for longer off-leash sessions, but shorter daylight makes the cityâ€™s 7 a.m. to 11 p.m. operating window more relevant for planning.</li></ul>";
  const parkRules = "<p><strong>Use off-leash access only in designated areas:</strong> Winnipeg says dogs may only run off leash on private property with permission or in the cityâ€™s designated off-leash dog areas.</p><p><strong>Keep dogs leashed outside the off-leash boundary:</strong> the city reminds owners that dogs must be on leash outside the designated area.</p><p><strong>Do not assume every off-leash park is fenced:</strong> Winnipeg says off-leash areas are not fenced unless otherwise indicated.</p><p><strong>Carry identification and keep licences current:</strong> the city requires dogs over six months old to be licensed and says pet licences must be renewed on schedule.</p><p><strong>Follow the standard use rules:</strong> owners remain legally responsible for their dogs, aggressive dogs are not permitted, waste must be picked up, and most off-leash areas are open from 7 a.m. to 11 p.m. unless posted otherwise.</p>";
  const etiquette = "<p><strong>1. Treat Winnipeg as a designated-area city.</strong></p><p>The city is explicit that dogs cannot simply be run off leash in ordinary park space because a field looks open.</p><p><strong>2. Be more cautious in unfenced areas.</strong></p><p>Because Winnipeg says many off-leash areas are not fenced unless specifically indicated, recall and handler awareness matter more than in a small enclosed run.</p><p><strong>3. Keep the transition space tidy and controlled.</strong></p><p>The city expects dogs to be leashed outside the off-leash boundary, which includes parking and approach areas.</p><p><strong>4. Match the park to the dog.</strong></p><p>A busy fenced urban site like the newer Bridgwater Trails Dog Park is a different experience from a larger open multi-use off-leash space.</p><p><strong>5. Keep your admin current.</strong></p><p>Licensing is part of responsible use in Winnipeg, not a separate paperwork issue that only matters after a problem occurs.</p>";
  const faqs = "<p><strong>1. Where can dogs legally be off leash in Winnipeg?</strong></p><p>The city says dogs may only be off leash on private property with permission or in designated Winnipeg off-leash dog areas.</p><p><strong>2. Do Winnipeg dogs need a licence?</strong></p><p>Yes. The city says dogs and cats over six months of age must be licensed.</p><p><strong>3. Are all Winnipeg off-leash parks fenced?</strong></p><p>No. The city says off-leash areas are not fenced unless otherwise indicated.</p><p><strong>4. What are the usual hours for Winnipeg off-leash areas?</strong></p><p>The cityâ€™s off-leash FAQ says the standard hours are 7 a.m. to 11 p.m. unless a site is posted differently.</p><p><strong>5. What is one of Winnipegâ€™s newest official dog parks?</strong></p><p>Bridgwater Trails Dog Park in Shaheed Bhagat Singh Park officially opened on July 4, 2026 as a fully fenced one-hectare off-leash area with separate spaces for large and small dogs.</p><p><strong>6. Who should owners contact if they need city animal-services help?</strong></p><p>Winnipeg Animal Services directs residents to contact 311 for animal concerns, licensing help, and off-leash information.</p>";
  const metaDescription = "Official-source guide to Winnipeg dog parks and off-leash areas, covering where off-leash access is legal, fencing expectations, 7 a.m. to 11 p.m. standard hours, dog-licensing rules, and the July 4, 2026 opening of Bridgwater Trails Dog Park.";

  city.seoTitle = "Winnipeg Dog Parks and Off-Leash Areas | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Manitoba"],
    "Province Page": ["https://leashfree.ca/manitoba-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "kilcona-park",
    "Featured Park 2": "bonnycastle-park",
    "Featured Park 3": "westview-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://legacy.winnipeg.ca/cms/animal/off-leash-dog-areas.stm",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Selkirk, Portage la Prairie, Brandon",
    "Updated On": "Wed Jul 29 2026 18:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 18:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "winnipeg");
  if (!targetRow) throw new Error("Winnipeg city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Winnipeg Dog Parks and Off-Leash Areas | LeashFree.ca",
    "Meta Description": "Official-source guide to Winnipeg dog parks and off-leash areas, covering where off-leash access is legal, fencing expectations, 7 a.m. to 11 p.m. standard hours, dog-licensing rules, and the July 4, 2026 opening of Bridgwater Trails Dog Park.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Winnipegâ€™s official dog-park rules are clearer and more specific than the old thin page suggested. As of Wednesday, July 29, 2026, the City of Winnipeg says dogs may run off leash only on private property with permission or in designated city off-leash areas, requires licensing for dogs over six months old, and treats most off-leash areas as open from 7 a.m. to 11 p.m. unless a site is posted differently.</p>",
    "About Section": "<p>Winnipeg does have a substantial off-leash network, but the current city guidance matters more than generic park hype. The Animal Services and parks pages say off-leash access is legal only in designated areas, and the city also makes clear that not every dog park is fenced unless specifically indicated. That is an important distinction in Winnipeg because the network includes a mix of neighborhood parks, larger natural spaces, and a smaller number of more formal fenced enclosures.</p><p>The cityâ€™s current material also gives this page fresher factual anchors than the older copy had. Animal Services says all dogs and cats over the age of six months must be licensed, and the cityâ€™s pet-licensing system says those licences must be renewed annually, with two-year licences available in some cases. The cityâ€™s off-leash guidance and FAQ also tie park use to current owner responsibility: dogs must stay leashed outside the designated off-leash boundary, owners remain legally responsible for their dog and any injury or damage caused, aggressive dogs are not permitted, owners must carry a leash and pick up waste, and standard off-leash hours are 7 a.m. to 11 p.m. unless posted otherwise. Winnipegâ€™s network is also still evolving. On July 4, 2026, the city announced the opening of Bridgwater Trails Dog Park in Shaheed Bhagat Singh Park at 360 Appleford Gate, a fully fenced one-hectare off-leash area with dedicated spaces for large and small dogs. That opening is useful because it confirms the city is still expanding the system rather than treating it as static.</p>",
    "Featured Park 1": "kilcona-park",
    "Featured Park 2": "bonnycastle-park",
    "Featured Park 3": "westview-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Winnipeg off-leash outings can stay viable year-round, but open prairie wind, icy footing, and deeper snow can change how usable larger unfenced spaces feel.</li><li><strong>Spring:</strong> Thaw periods can create muddy entrances and soft ground, especially in larger natural parks and river-adjacent areas.</li><li><strong>Summer:</strong> Use early or later parts of the day when possible, especially in exposed parks with less shade.</li><li><strong>Fall:</strong> Cooler weather is often ideal for longer off-leash sessions, but shorter daylight makes the cityâ€™s 7 a.m. to 11 p.m. operating window more relevant for planning.</li></ul>",
    "Park Rules": "<p><strong>Use off-leash access only in designated areas:</strong> Winnipeg says dogs may only run off leash on private property with permission or in the cityâ€™s designated off-leash dog areas.</p><p><strong>Keep dogs leashed outside the off-leash boundary:</strong> the city reminds owners that dogs must be on leash outside the designated area.</p><p><strong>Do not assume every off-leash park is fenced:</strong> Winnipeg says off-leash areas are not fenced unless otherwise indicated.</p><p><strong>Carry identification and keep licences current:</strong> the city requires dogs over six months old to be licensed and says pet licences must be renewed on schedule.</p><p><strong>Follow the standard use rules:</strong> owners remain legally responsible for their dogs, aggressive dogs are not permitted, waste must be picked up, and most off-leash areas are open from 7 a.m. to 11 p.m. unless posted otherwise.</p>",
    "City Website": "https://legacy.winnipeg.ca/cms/animal/off-leash-dog-areas.stm",
    "Dog Park Etiquettes": "<p><strong>1. Treat Winnipeg as a designated-area city.</strong></p><p>The city is explicit that dogs cannot simply be run off leash in ordinary park space because a field looks open.</p><p><strong>2. Be more cautious in unfenced areas.</strong></p><p>Because Winnipeg says many off-leash areas are not fenced unless specifically indicated, recall and handler awareness matter more than in a small enclosed run.</p><p><strong>3. Keep the transition space tidy and controlled.</strong></p><p>The city expects dogs to be leashed outside the off-leash boundary, which includes parking and approach areas.</p><p><strong>4. Match the park to the dog.</strong></p><p>A busy fenced urban site like the newer Bridgwater Trails Dog Park is a different experience from a larger open multi-use off-leash space.</p><p><strong>5. Keep your admin current.</strong></p><p>Licensing is part of responsible use in Winnipeg, not a separate paperwork issue that only matters after a problem occurs.</p>",
    "Dog Park FAQs": "<p><strong>1. Where can dogs legally be off leash in Winnipeg?</strong></p><p>The city says dogs may only be off leash on private property with permission or in designated Winnipeg off-leash dog areas.</p><p><strong>2. Do Winnipeg dogs need a licence?</strong></p><p>Yes. The city says dogs and cats over six months of age must be licensed.</p><p><strong>3. Are all Winnipeg off-leash parks fenced?</strong></p><p>No. The city says off-leash areas are not fenced unless otherwise indicated.</p><p><strong>4. What are the usual hours for Winnipeg off-leash areas?</strong></p><p>The cityâ€™s off-leash FAQ says the standard hours are 7 a.m. to 11 p.m. unless a site is posted differently.</p><p><strong>5. What is one of Winnipegâ€™s newest official dog parks?</strong></p><p>Bridgwater Trails Dog Park in Shaheed Bhagat Singh Park officially opened on July 4, 2026 as a fully fenced one-hectare off-leash area with separate spaces for large and small dogs.</p><p><strong>6. Who should owners contact if they need city animal-services help?</strong></p><p>Winnipeg Animal Services directs residents to contact 311 for animal concerns, licensing help, and off-leash information.</p>",
    "Nearby Cities": "Selkirk, Portage la Prairie, Brandon",
    "Updated On": "Wed Jul 29 2026 18:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 18:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/winnipeg/")];
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

console.log("Updated Winnipeg city page and refreshed backlog files.");
