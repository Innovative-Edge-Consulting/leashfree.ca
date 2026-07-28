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
  if (source.includes('"saskatoon": "/images/cities/city-saskatoon-hero.png"')) return;
  const anchor = '  "milton": "/images/cities/city-milton-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "saskatoon": "/images/cities/city-saskatoon-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "saskatoon");
  if (!city) throw new Error("Saskatoon city record not found.");

  const intro = "<p>Saskatoon has enough current official material to support a much stronger city guide than the generic page copy it had before. The City of Saskatoon publishes a current dog parks page, pet licensing page, enforcement guidance, and the current Animal Control Bylaw. That gives this page a defensible source base for both the off-leash network and the rules owners are expected to follow.</p>";
  const about = "<p>The City of Saskatoon describes its dog parks as naturalized spaces where dogs may be off-leash while under the control of their owner, and the city requires a valid dog license to access any dog park. Owners are also told to make sure vaccinations are up to date before visiting. That official framing matters because Saskatoon’s network is a mix of park styles rather than one standardized fenced format. Riverside and naturalized spaces such as Sutherland Beach and Silverwood serve dogs that do well on longer exploratory walks, while fenced sites such as Avalon give owners a more contained option.</p><p>The current city page also adds several practical details that improve this guide. Saskatoon says dogs must stay on leash when entering and exiting the park, owners must keep their dog within sight at all times, and any dog that becomes a nuisance must be leashed with a leash not exceeding two metres and removed from the off-leash area immediately. The city now also highlights two small-dog parks at Hyde Park and Charlottetown Park, both limited to dogs under 40 centimetres at the shoulder and under 9 kilograms. For 2026, Saskatoon is also warning visitors that parts of Silverwood Dog Park, including the north entrance, are affected by construction detours during the April to November construction season.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Saskatoon's naturalized parks can stay usable, but packed snow, wind exposure, and icy trail edges make river-adjacent footing less predictable.</li><li><strong>Spring:</strong> Thaw conditions can leave muddy access points and soft ground in naturalized parks such as Silverwood and Sutherland Beach.</li><li><strong>Summer:</strong> Bring water and watch river-adjacent dogs closely, especially at Sutherland Beach where the city specifically advises extra caution around the South Saskatchewan River.</li><li><strong>Fall:</strong> Cooler temperatures are usually ideal for longer off-leash sessions, but shared trails stay busy with walkers and cyclists, particularly at Silverwood.</li></ul>";
  const parkRules = "<p><strong>License first:</strong> Saskatoon requires a valid dog license to access any city dog park, and the city says vaccinations should be current before you visit.</p><p><strong>Leash at the edges:</strong> dogs are expected to stay on leash when entering and exiting the park.</p><p><strong>Maintain line-of-sight control:</strong> the city tells owners to keep their dog within sight and under control at all times.</p><p><strong>Remove nuisance dogs immediately:</strong> if a dog becomes a nuisance, Saskatoon says the owner must leash the dog with a leash not exceeding two metres and remove it from the off-leash area.</p><p><strong>Respect specialized areas:</strong> Hyde Park and Charlottetown Park are reserved for dogs under 40 centimetres at the shoulder and under 9 kilograms.</p>";
  const etiquette = "<p><strong>1. Treat Saskatoon's parks as mixed-format spaces.</strong></p><p>Some are fenced, while others are naturalized riverside or trail-oriented areas, so choose the park that matches your dog's recall and comfort level.</p><p><strong>2. Keep the leash on until you are fully inside.</strong></p><p>The city explicitly says dogs should be on leash when entering and exiting the park.</p><p><strong>3. Keep your dog in sight.</strong></p><p>Saskatoon treats active supervision as the baseline rule, especially in larger naturalized spaces that share habitat with wildlife.</p><p><strong>4. Take nuisance behaviour seriously.</strong></p><p>If a dog becomes a nuisance to people or animals, the city says the dog must be leashed with a leash not exceeding two metres and removed immediately.</p><p><strong>5. Read posted temporary notices.</strong></p><p>Silverwood has active 2026 construction impacts and detours, so current on-site signage matters before every visit.</p>";
  const faqs = "<p><strong>1. Does Saskatoon require a dog license for dog park access?</strong></p><p>Yes. The city says a valid dog license is required to access any dog park.</p><p><strong>2. Do dogs need to be vaccinated before visiting?</strong></p><p>Yes. Saskatoon says owners should ensure their dog has up-to-date vaccinations before visiting a dog park.</p><p><strong>3. Are there small-dog-only parks in Saskatoon?</strong></p><p>Yes. The city says Hyde Park and Charlottetown Park are limited to dogs under 40 centimetres at the shoulder and under 9 kilograms.</p><p><strong>4. What happens if a dog becomes a nuisance?</strong></p><p>The city says the dog must be leashed with a leash not exceeding two metres and removed from the off-leash area immediately.</p><p><strong>5. Is there any current construction affecting a Saskatoon dog park?</strong></p><p>Yes. Saskatoon says parts of Silverwood Dog Park, including the north entrance, are affected by 2026 construction detours during the April to November construction season.</p><p><strong>6. Are Saskatoon's dog parks all fenced?</strong></p><p>No. Saskatoon's network includes both fenced parks and naturalized off-leash spaces.</p>";
  const metaDescription = "Source-backed guide to dog parks in Saskatoon, Saskatchewan, covering current city rules, dog licensing, small-dog park limits, and the 2026 Silverwood construction notice.";

  city.seoTitle = "Dog Parks in Saskatoon, Saskatchewan | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Saskatchewan"],
    "Featured Park 1": ["sutherland-off-leash-dog-park"],
    "Featured Park 2": ["avalon-dog-park"],
    "Featured Park 3": ["silverwood-dog-park"],
    "Province Page": ["https://leashfree.ca/saskatchewan-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "sutherland-off-leash-dog-park",
    "Featured Park 2": "avalon-dog-park",
    "Featured Park 3": "silverwood-dog-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Martensville, Warman, Osler",
    "Updated On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "saskatoon");
  if (!targetRow) throw new Error("Saskatoon city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Saskatoon, Saskatchewan | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Saskatoon, Saskatchewan, covering current city rules, dog licensing, small-dog park limits, and the 2026 Silverwood construction notice.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Saskatoon has enough current official material to support a much stronger city guide than the generic page copy it had before. The City of Saskatoon publishes a current dog parks page, pet licensing page, enforcement guidance, and the current Animal Control Bylaw. That gives this page a defensible source base for both the off-leash network and the rules owners are expected to follow.</p>",
    "About Section": "<p>The City of Saskatoon describes its dog parks as naturalized spaces where dogs may be off-leash while under the control of their owner, and the city requires a valid dog license to access any dog park. Owners are also told to make sure vaccinations are up to date before visiting. That official framing matters because Saskatoon's network is a mix of park styles rather than one standardized fenced format. Riverside and naturalized spaces such as Sutherland Beach and Silverwood serve dogs that do well on longer exploratory walks, while fenced sites such as Avalon give owners a more contained option.</p><p>The current city page also adds several practical details that improve this guide. Saskatoon says dogs must stay on leash when entering and exiting the park, owners must keep their dog within sight at all times, and any dog that becomes a nuisance must be leashed with a leash not exceeding two metres and removed from the off-leash area immediately. The city now also highlights two small-dog parks at Hyde Park and Charlottetown Park, both limited to dogs under 40 centimetres at the shoulder and under 9 kilograms. For 2026, Saskatoon is also warning visitors that parts of Silverwood Dog Park, including the north entrance, are affected by construction detours during the April to November construction season.</p>",
    "Featured Park 1": "sutherland-off-leash-dog-park",
    "Featured Park 2": "avalon-dog-park",
    "Featured Park 3": "silverwood-dog-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Saskatoon's naturalized parks can stay usable, but packed snow, wind exposure, and icy trail edges make river-adjacent footing less predictable.</li><li><strong>Spring:</strong> Thaw conditions can leave muddy access points and soft ground in naturalized parks such as Silverwood and Sutherland Beach.</li><li><strong>Summer:</strong> Bring water and watch river-adjacent dogs closely, especially at Sutherland Beach where the city specifically advises extra caution around the South Saskatchewan River.</li><li><strong>Fall:</strong> Cooler temperatures are usually ideal for longer off-leash sessions, but shared trails stay busy with walkers and cyclists, particularly at Silverwood.</li></ul>",
    "Park Rules": "<p><strong>License first:</strong> Saskatoon requires a valid dog license to access any city dog park, and the city says vaccinations should be current before you visit.</p><p><strong>Leash at the edges:</strong> dogs are expected to stay on leash when entering and exiting the park.</p><p><strong>Maintain line-of-sight control:</strong> the city tells owners to keep their dog within sight and under control at all times.</p><p><strong>Remove nuisance dogs immediately:</strong> if a dog becomes a nuisance, Saskatoon says the owner must leash the dog with a leash not exceeding two metres and remove it from the off-leash area.</p><p><strong>Respect specialized areas:</strong> Hyde Park and Charlottetown Park are reserved for dogs under 40 centimetres at the shoulder and under 9 kilograms.</p>",
    "City Website": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Treat Saskatoon's parks as mixed-format spaces.</strong></p><p>Some are fenced, while others are naturalized riverside or trail-oriented areas, so choose the park that matches your dog's recall and comfort level.</p><p><strong>2. Keep the leash on until you are fully inside.</strong></p><p>The city explicitly says dogs should be on leash when entering and exiting the park.</p><p><strong>3. Keep your dog in sight.</strong></p><p>Saskatoon treats active supervision as the baseline rule, especially in larger naturalized spaces that share habitat with wildlife.</p><p><strong>4. Take nuisance behaviour seriously.</strong></p><p>If a dog becomes a nuisance to people or animals, the city says the dog must be leashed with a leash not exceeding two metres and removed immediately.</p><p><strong>5. Read posted temporary notices.</strong></p><p>Silverwood has active 2026 construction impacts and detours, so current on-site signage matters before every visit.</p>",
    "Dog Park FAQs": "<p><strong>1. Does Saskatoon require a dog license for dog park access?</strong></p><p>Yes. The city says a valid dog license is required to access any dog park.</p><p><strong>2. Do dogs need to be vaccinated before visiting?</strong></p><p>Yes. Saskatoon says owners should ensure their dog has up-to-date vaccinations before visiting a dog park.</p><p><strong>3. Are there small-dog-only parks in Saskatoon?</strong></p><p>Yes. The city says Hyde Park and Charlottetown Park are limited to dogs under 40 centimetres at the shoulder and under 9 kilograms.</p><p><strong>4. What happens if a dog becomes a nuisance?</strong></p><p>The city says the dog must be leashed with a leash not exceeding two metres and removed from the off-leash area immediately.</p><p><strong>5. Is there any current construction affecting a Saskatoon dog park?</strong></p><p>Yes. Saskatoon says parts of Silverwood Dog Park, including the north entrance, are affected by 2026 construction detours during the April to November construction season.</p><p><strong>6. Are Saskatoon's dog parks all fenced?</strong></p><p>No. Saskatoon's network includes both fenced parks and naturalized off-leash spaces.</p>",
    "Nearby Cities": "Martensville, Warman, Osler",
    "Updated On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/saskatoon/")];
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

console.log("Updated Saskatoon city page and refreshed backlog files.");
