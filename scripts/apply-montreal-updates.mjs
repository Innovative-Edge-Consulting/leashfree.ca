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
  if (source.includes('"montreal": "/images/cities/city-montreal-hero.png"')) return;

  const updated = source.replace(
    '  "morden": "/images/cities/city-morden-hero.png",\n',
    '  "morden": "/images/cities/city-morden-hero.png",\n  "montreal": "/images/cities/city-montreal-hero.png",\n'
  );

  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "montreal");
  if (!city) throw new Error("Montreal city record not found.");

  const intro = "<p>Montreal has one of the largest municipal dog-park networks in Canada. The City of Montreal says dog parks are the only public places where dogs may run off leash, and its official places directory currently lists 70 dog parks across the city’s boroughs.</p>";
  const about = "<p>Montreal dog owners need to plan around city-wide animal rules as well as borough-level park conditions. The city requires a dog licence, a city-issued tag worn at all times, and for dogs over 6 months old, microchipping plus spay or neuter status unless an exemption applies. In public places outside designated dog parks, dogs must stay on a leash no longer than 1.85 metres, and dogs weighing 20 kg or more must also wear a halter or harness attached to that leash.</p><p>For off-leash visits, Montreal’s official dog-park guidance is consistent across boroughs: keep your dog leashed until inside the park, supervise closely, pick up waste immediately, and make sure your dog does not disturb nearby residents. The city also prohibits bringing more than two dogs at a time, feeding dogs in the park, using toys or sticks around other dogs, or entering with a female in heat or a dog showing symptoms of illness.</p>";
  const seasonalTips = "<p>- Winter: Dog parks remain available city-wide, but Montreal specifically notes that snow removal inside dog parks must be handled by dog owners.<br>- Spring: Expect muddy ground and thaw conditions in some fenced runs, especially in natural-surface parks.<br>- Summer: Amenities vary by borough and park, so check the official Montreal dog-park listing before relying on fountains or play features.<br>- Fall: Cooler temperatures usually make city dog parks more comfortable for longer exercise sessions, but keep your dog leashed until fully inside the fenced area.</p>";
  const parkRules = "<p><strong>Montreal off-leash basics:</strong> dogs may run free only in designated dog parks. Keep your dog on leash until you are inside the park, supervise at all times, and pick up droppings right away.</p><p><strong>City-wide limits:</strong> you may bring a maximum of two dogs at a time. Dogs must wear their city-issued tag, and Montreal requires licensing for every dog plus microchipping and spay/neuter status for dogs over 6 months old unless an exemption applies.</p><p><strong>Not allowed in the dog park:</strong> food, toys or sticks when other dogs are present, females in heat, sick dogs, or dogs that bother the other dogs in the park. Children 12 and under are not advised to enter.</p>";
  const etiquette = "<p><strong>1. Keep the leash on until the gate closes behind you.</strong></p><p>Montreal instructs owners to keep dogs leashed until they are inside the dog park.</p><p><strong>2. Watch noise and arousal levels.</strong></p><p>The city expects dogs not to disturb the surrounding neighbourhood, so repeated barking, howling, or rough play should be interrupted early.</p><p><strong>3. Skip toys when the park is shared.</strong></p><p>Montreal specifically warns against using toys or sticks in the presence of other dogs because they can trigger competition and aggression.</p><p><strong>4. Bring only healthy, park-ready dogs.</strong></p><p>Do not bring a dog that is sick, in heat, or unable to cope well with a busy off-leash environment.</p><p><strong>5. Clean up immediately.</strong></p><p>Waste pickup is mandatory and is one of the easiest ways to keep neighbourhood support for dog parks strong.</p>";
  const faqs = "<p><strong>1. How many official dog parks does Montreal have?</strong></p><p>The City of Montreal’s official places directory currently lists 70 dog parks, and its dog-ownership topic page says there are more than 65 across the city.</p><p><strong>2. Can I let my dog off leash anywhere else in Montreal?</strong></p><p>No. Montreal says dog parks are the only public places where your dog may run free.</p><p><strong>3. Do I need a Montreal dog licence to use a dog park?</strong></p><p>Yes. The city requires every dog owner to hold a valid dog licence and says dogs must wear their city-issued tag at all times.</p><p><strong>4. Are microchipping and spay/neuter required?</strong></p><p>Yes for dogs over 6 months old, unless a documented exemption applies.</p><p><strong>5. How many dogs can one person bring into a Montreal dog park?</strong></p><p>Montreal’s rule is a maximum of two dogs at a time.</p><p><strong>6. What leash rule applies before and after the dog park?</strong></p><p>In public places, dogs must stay on a leash no longer than 1.85 metres, and Montreal says to keep your dog leashed until you are inside the dog park.</p>";
  const metaDescription = "Find official Montreal dog park rules, licensing requirements, and the city’s current dog-park map. Montreal lists 70 dog parks and requires tags, licensing, and off-leash use only in designated parks.";

  city.seoTitle = "Dog Parks in Montreal, Quebec | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Quebec"],
    "Province Page": ["https://leashfree.ca/quebec-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "parc-de-la-louisianne-dog-park",
    "Featured Park 2": "parc-du-sault-au-recollet-dog-park",
    "Featured Park 3": "parc-jeanne-mance-dog-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://montreal.ca/en/places?listType=map&mtl_content.lieux.installation.code=PACH&orderBy=dc_title",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Laval, Longueuil, Brossard",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "montreal");
  if (!targetRow) throw new Error("Montreal city CSV row not found.");

  const updates = new Map(Object.entries({
    "SEO Title Tag": "Dog Parks in Montreal, Quebec | Off-Leash Guide",
    "Meta Description": "Find official Montreal dog park rules, licensing requirements, and the city’s current dog-park map. Montreal lists 70 dog parks and requires tags, licensing, and off-leash use only in designated parks.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Montreal has one of the largest municipal dog-park networks in Canada. The City of Montreal says dog parks are the only public places where dogs may run off leash, and its official places directory currently lists 70 dog parks across the city’s boroughs.</p>",
    "About Section": "<p>Montreal dog owners need to plan around city-wide animal rules as well as borough-level park conditions. The city requires a dog licence, a city-issued tag worn at all times, and for dogs over 6 months old, microchipping plus spay or neuter status unless an exemption applies. In public places outside designated dog parks, dogs must stay on a leash no longer than 1.85 metres, and dogs weighing 20 kg or more must also wear a halter or harness attached to that leash.</p><p>For off-leash visits, Montreal’s official dog-park guidance is consistent across boroughs: keep your dog leashed until inside the park, supervise closely, pick up waste immediately, and make sure your dog does not disturb nearby residents. The city also prohibits bringing more than two dogs at a time, feeding dogs in the park, using toys or sticks around other dogs, or entering with a female in heat or a dog showing symptoms of illness.</p>",
    "Featured Park 1": "parc-de-la-louisianne-dog-park",
    "Featured Park 2": "parc-du-sault-au-recollet-dog-park",
    "Featured Park 3": "parc-jeanne-mance-dog-park",
    "Seasonal Tips": "<p>- Winter: Dog parks remain available city-wide, but Montreal specifically notes that snow removal inside dog parks must be handled by dog owners.<br>- Spring: Expect muddy ground and thaw conditions in some fenced runs, especially in natural-surface parks.<br>- Summer: Amenities vary by borough and park, so check the official Montreal dog-park listing before relying on fountains or play features.<br>- Fall: Cooler temperatures usually make city dog parks more comfortable for longer exercise sessions, but keep your dog leashed until fully inside the fenced area.</p>",
    "Park Rules": "<p><strong>Montreal off-leash basics:</strong> dogs may run free only in designated dog parks. Keep your dog on leash until you are inside the park, supervise at all times, and pick up droppings right away.</p><p><strong>City-wide limits:</strong> you may bring a maximum of two dogs at a time. Dogs must wear their city-issued tag, and Montreal requires licensing for every dog plus microchipping and spay/neuter status for dogs over 6 months old unless an exemption applies.</p><p><strong>Not allowed in the dog park:</strong> food, toys or sticks when other dogs are present, females in heat, sick dogs, or dogs that bother the other dogs in the park. Children 12 and under are not advised to enter.</p>",
    "City Website": "https://montreal.ca/en/places?listType=map&mtl_content.lieux.installation.code=PACH&orderBy=dc_title",
    "Dog Park Etiquettes": "<p><strong>1. Keep the leash on until the gate closes behind you.</strong></p><p>Montreal instructs owners to keep dogs leashed until they are inside the dog park.</p><p><strong>2. Watch noise and arousal levels.</strong></p><p>The city expects dogs not to disturb the surrounding neighbourhood, so repeated barking, howling, or rough play should be interrupted early.</p><p><strong>3. Skip toys when the park is shared.</strong></p><p>Montreal specifically warns against using toys or sticks in the presence of other dogs because they can trigger competition and aggression.</p><p><strong>4. Bring only healthy, park-ready dogs.</strong></p><p>Do not bring a dog that is sick, in heat, or unable to cope well with a busy off-leash environment.</p><p><strong>5. Clean up immediately.</strong></p><p>Waste pickup is mandatory and is one of the easiest ways to keep neighbourhood support for dog parks strong.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official dog parks does Montreal have?</strong></p><p>The City of Montreal’s official places directory currently lists 70 dog parks, and its dog-ownership topic page says there are more than 65 across the city.</p><p><strong>2. Can I let my dog off leash anywhere else in Montreal?</strong></p><p>No. Montreal says dog parks are the only public places where your dog may run free.</p><p><strong>3. Do I need a Montreal dog licence to use a dog park?</strong></p><p>Yes. The city requires every dog owner to hold a valid dog licence and says dogs must wear their city-issued tag at all times.</p><p><strong>4. Are microchipping and spay/neuter required?</strong></p><p>Yes for dogs over 6 months old, unless a documented exemption applies.</p><p><strong>5. How many dogs can one person bring into a Montreal dog park?</strong></p><p>Montreal’s rule is a maximum of two dogs at a time.</p><p><strong>6. What leash rule applies before and after the dog park?</strong></p><p>In public places, dogs must stay on a leash no longer than 1.85 metres, and Montreal says to keep your dog leashed until you are inside the dog park.</p>",
    "Nearby Cities": "Laval, Longueuil, Brossard",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  }));

  for (const [field, value] of updates.entries()) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }

  fs.writeFileSync(cityCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const pageIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/montreal/")];
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

console.log("Updated Montreal city page, backlog CSV, and backlog summary.");
