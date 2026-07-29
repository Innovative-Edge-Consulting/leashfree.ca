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
  if (source.includes('"new-westminster": "/images/cities/city-new-westminster-hero.png"')) return;
  const anchor = '  "brandon": "/images/cities/city-brandon-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "new-westminster": "/images/cities/city-new-westminster-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "new-westminster");
  if (!city) throw new Error("New Westminster city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, New Westminster's off-leash page should be built from the city's current park and animal-services material rather than from generic Royal City copy. The city now publishes a specific off-leash network, current licence fees for 2026, and rule language that is detailed enough to make this page genuinely useful.</p>";
  const about = "<p>New Westminster currently provides a larger off-leash network than the old thin page suggested. The city's off-leash dog areas page says New Westminster recognizes the importance of dogs to residents by providing nine off-leash dog areas. The same page specifically notes that Moody Park and Queen's Park include separation gates that can either create a small or shy dog area or open into one larger shared area, depending on user consent and active use. The city also lists named off-leash areas including Hume Park, Moody Park, Quayside, Queensborough, Queen's Park, Simcoe Park, Victoria Hill, Westburnco, and West Side, while separately noting that the Albert Crescent Park pilot project has concluded and that Victoria Hill's site at 260 Ross Drive operates on a secured five-year lease. That is much stronger factual framing than describing New Westminster as having only a vague handful of dog parks.</p><p>The animal-services rules are equally clear. New Westminster says all dogs in the city require a licence, and its current dog-licence fees page lists 2026 rates that are valid from January 1 to December 31: $39 for a first-time intact dog licence, $73 for an intact renewal on or before March 1, $94 after March 1, $29 for a sterilized first-time licence or renewal on or before March 1, and $38 after March 1, with certified service dogs at no charge when documentation is provided. The city's leash bylaw summary adds that dogs are required by law to be leashed when off their owner's property except in designated off-leash areas. On the off-leash rules page, the city says dogs must be accompanied by and under the control of their owner, off-leash use is permitted within the fenced area only, vicious dogs are not permitted within the fenced area, aggressive dogs must be muzzled and removed if they show aggression, owners must pick up after dogs and fill any holes they dig, and smoking is prohibited in or within 15 metres of the fenced area. Those are specific, enforceable expectations that belong on the city page.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Urban off-leash areas in New Westminster stay usable, but wet cold conditions and muddy edges are common around lower-elevation parks.</li><li><strong>Spring:</strong> River-adjacent and sloped sites can stay soft longer, so shoes and towels matter more than extra distance.</li><li><strong>Summer:</strong> Smaller fenced city parks can get busy quickly, so early or late visits usually work better for reactive or shy dogs.</li><li><strong>Fall:</strong> Cooler temperatures are ideal, but leaf cover and moisture can reduce footing in treed and sloped enclosures.</li></ul>";
  const parkRules = "<p><strong>License your dog:</strong> New Westminster says all dogs in the city require a licence.</p><p><strong>Keep dogs leashed outside designated areas:</strong> the city says dogs must be leashed off their owner's property except in designated off-leash areas.</p><p><strong>Stay inside the fenced boundary:</strong> off-leash use is permitted within the fenced area only.</p><p><strong>Maintain control:</strong> all dogs must be accompanied by and under the control of their owner.</p><p><strong>Remove aggressive dogs and follow site conduct rules:</strong> vicious dogs are not permitted, aggressive dogs must be muzzled and removed if they show aggression, owners must pick up waste, fill holes, and avoid smoking in or within 15 metres of the fenced area.</p>";
  const etiquette = "<p><strong>1. Match your dog to the urban site.</strong></p><p>New Westminster's off-leash areas are woven into dense neighbourhood parks, so comfort with tighter spaces matters more than in larger suburban fields.</p><p><strong>2. Use the separation-gate system correctly.</strong></p><p>At Moody Park and Queen's Park, the city explicitly allows the optional gate to support small or shy dogs when users need it.</p><p><strong>3. Treat the fence line as the legal boundary.</strong></p><p>The city says off-leash use is permitted within the fenced area only, so unclipping early or drifting outside the enclosure is not a minor detail.</p><p><strong>4. Remove problems quickly.</strong></p><p>New Westminster's rules are direct about aggressive behaviour and do not leave much room for waiting to see if things settle down.</p><p><strong>5. Use maintenance reporting channels when the site needs work.</strong></p><p>The city routes maintenance issues through See Click Fix, which is more useful than leaving problems unreported.</p>";
  const faqs = "<p><strong>1. How many off-leash dog areas does New Westminster currently provide?</strong></p><p>As of July 29, 2026, the city says it provides nine off-leash dog areas.</p><p><strong>2. Which New Westminster parks have optional separation gates for small or shy dogs?</strong></p><p>The city specifically says Moody Park and Queen's Park offer separation gates that can create a small or shy dog area.</p><p><strong>3. Do dogs in New Westminster need a licence?</strong></p><p>Yes. The city says all dogs in New Westminster require a licence.</p><p><strong>4. What are the current 2026 New Westminster dog licence fees?</strong></p><p>For 2026, the city lists first-time rates of $39 for an intact dog and $29 for a sterilized dog, with renewal rates that depend on sterilization status and whether renewal is completed by March 1.</p><p><strong>5. Can dogs be off leash anywhere outside the city's designated areas?</strong></p><p>No. New Westminster says dogs are required by law to be leashed when off their owner's property except in designated off-leash areas.</p><p><strong>6. Who should owners contact about maintenance issues in off-leash parks?</strong></p><p>The city's off-leash page directs residents to report site maintenance issues using See Click Fix.</p>";
  const metaDescription = "Source-backed guide to New Westminster dog parks and off-leash rules, covering the city's nine off-leash areas, 2026 dog licence fees, leash bylaw limits, separation-gate parks, and site rules.";

  city.seoTitle = "New Westminster Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Featured Park 1": ["hume-park"],
    "Featured Park 2": ["moody-park-new-westminster"],
    "Featured Park 3": ["queens-park-new-westminster"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "hume-park",
    "Featured Park 2": "moody-park-new-westminster",
    "Featured Park 3": "queens-park-new-westminster",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Burnaby, Surrey, Coquitlam",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "new-westminster");
  if (!targetRow) throw new Error("New Westminster city CSV row not found.");
  const updates = {
    "SEO Title Tag": "New Westminster Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to New Westminster dog parks and off-leash rules, covering the city's nine off-leash areas, 2026 dog licence fees, leash bylaw limits, separation-gate parks, and site rules.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, New Westminster's off-leash page should be built from the city's current park and animal-services material rather than from generic Royal City copy. The city now publishes a specific off-leash network, current licence fees for 2026, and rule language that is detailed enough to make this page genuinely useful.</p>",
    "About Section": "<p>New Westminster currently provides a larger off-leash network than the old thin page suggested. The city's off-leash dog areas page says New Westminster recognizes the importance of dogs to residents by providing nine off-leash dog areas. The same page specifically notes that Moody Park and Queen's Park include separation gates that can either create a small or shy dog area or open into one larger shared area, depending on user consent and active use. The city also lists named off-leash areas including Hume Park, Moody Park, Quayside, Queensborough, Queen's Park, Simcoe Park, Victoria Hill, Westburnco, and West Side, while separately noting that the Albert Crescent Park pilot project has concluded and that Victoria Hill's site at 260 Ross Drive operates on a secured five-year lease. That is much stronger factual framing than describing New Westminster as having only a vague handful of dog parks.</p><p>The animal-services rules are equally clear. New Westminster says all dogs in the city require a licence, and its current dog-licence fees page lists 2026 rates that are valid from January 1 to December 31: $39 for a first-time intact dog licence, $73 for an intact renewal on or before March 1, $94 after March 1, $29 for a sterilized first-time licence or renewal on or before March 1, and $38 after March 1, with certified service dogs at no charge when documentation is provided. The city's leash bylaw summary adds that dogs are required by law to be leashed when off their owner's property except in designated off-leash areas. On the off-leash rules page, the city says dogs must be accompanied by and under the control of their owner, off-leash use is permitted within the fenced area only, vicious dogs are not permitted within the fenced area, aggressive dogs must be muzzled and removed if they show aggression, owners must pick up after dogs and fill any holes they dig, and smoking is prohibited in or within 15 metres of the fenced area. Those are specific, enforceable expectations that belong on the city page.</p>",
    "Featured Park 1": "hume-park",
    "Featured Park 2": "moody-park-new-westminster",
    "Featured Park 3": "queens-park-new-westminster",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Urban off-leash areas in New Westminster stay usable, but wet cold conditions and muddy edges are common around lower-elevation parks.</li><li><strong>Spring:</strong> River-adjacent and sloped sites can stay soft longer, so shoes and towels matter more than extra distance.</li><li><strong>Summer:</strong> Smaller fenced city parks can get busy quickly, so early or late visits usually work better for reactive or shy dogs.</li><li><strong>Fall:</strong> Cooler temperatures are ideal, but leaf cover and moisture can reduce footing in treed and sloped enclosures.</li></ul>",
    "Park Rules": "<p><strong>License your dog:</strong> New Westminster says all dogs in the city require a licence.</p><p><strong>Keep dogs leashed outside designated areas:</strong> the city says dogs must be leashed off their owner's property except in designated off-leash areas.</p><p><strong>Stay inside the fenced boundary:</strong> off-leash use is permitted within the fenced area only.</p><p><strong>Maintain control:</strong> all dogs must be accompanied by and under the control of their owner.</p><p><strong>Remove aggressive dogs and follow site conduct rules:</strong> vicious dogs are not permitted, aggressive dogs must be muzzled and removed if they show aggression, owners must pick up waste, fill holes, and avoid smoking in or within 15 metres of the fenced area.</p>",
    "City Website": "https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Match your dog to the urban site.</strong></p><p>New Westminster's off-leash areas are woven into dense neighbourhood parks, so comfort with tighter spaces matters more than in larger suburban fields.</p><p><strong>2. Use the separation-gate system correctly.</strong></p><p>At Moody Park and Queen's Park, the city explicitly allows the optional gate to support small or shy dogs when users need it.</p><p><strong>3. Treat the fence line as the legal boundary.</strong></p><p>The city says off-leash use is permitted within the fenced area only, so unclipping early or drifting outside the enclosure is not a minor detail.</p><p><strong>4. Remove problems quickly.</strong></p><p>New Westminster's rules are direct about aggressive behaviour and do not leave much room for waiting to see if things settle down.</p><p><strong>5. Use maintenance reporting channels when the site needs work.</strong></p><p>The city routes maintenance issues through See Click Fix, which is more useful than leaving problems unreported.</p>",
    "Dog Park FAQs": "<p><strong>1. How many off-leash dog areas does New Westminster currently provide?</strong></p><p>As of July 29, 2026, the city says it provides nine off-leash dog areas.</p><p><strong>2. Which New Westminster parks have optional separation gates for small or shy dogs?</strong></p><p>The city specifically says Moody Park and Queen's Park offer separation gates that can create a small or shy dog area.</p><p><strong>3. Do dogs in New Westminster need a licence?</strong></p><p>Yes. The city says all dogs in New Westminster require a licence.</p><p><strong>4. What are the current 2026 New Westminster dog licence fees?</strong></p><p>For 2026, the city lists first-time rates of $39 for an intact dog and $29 for a sterilized dog, with renewal rates that depend on sterilization status and whether renewal is completed by March 1.</p><p><strong>5. Can dogs be off leash anywhere outside the city's designated areas?</strong></p><p>No. New Westminster says dogs are required by law to be leashed when off their owner's property except in designated off-leash areas.</p><p><strong>6. Who should owners contact about maintenance issues in off-leash parks?</strong></p><p>The city's off-leash page directs residents to report site maintenance issues using See Click Fix.</p>",
    "Nearby Cities": "Burnaby, Surrey, Coquitlam",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/new-westminster/")];
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
console.log("Updated New Westminster city page and refreshed backlog files.");
