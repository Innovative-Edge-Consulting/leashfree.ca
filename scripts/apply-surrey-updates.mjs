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
  if (source.includes('"surrey": "/images/cities/city-surrey-hero.png"')) return;
  const anchor = '  "barrie": "/images/cities/city-barrie-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "surrey": "/images/cities/city-surrey-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "surrey");
  if (!city) throw new Error("Surrey city record not found.");

  const reviewedAt = "Wed Jul 29 2026 23:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro =
    "<p>As of Wednesday, July 29, 2026, Surrey should be treated as a large official off-leash network with clear current city rules, not just a generic collection of fenced dog parks. The strongest Surrey pages now support a city guide built around the published 19 dog off-leash areas, the exceptions to full fencing, seasonal beach rules, and current licensing requirements.</p>";
  const about =
    "<p>The City of Surrey's current dog off-leash page says Surrey has designated dog off-leash areas in each of its communities and publishes a list of 19 specific sites. Those include Bear Creek, Blackie Spit, Bolivar, Clayton, Dogwood, Forsyth, Fraser View, Freedom, Hawthorne Rotary, Joe Brown, Kennedy, Latimer, Nicomekl, Panorama, Serpentine, Tannery, Tynehead Regional Park, Unwin, and Wills Brook. That is a better factual base than the older copy claiming \"over 20\" parks. Surrey also gives important nuance that most directories miss: all dog off-leash parks are fully fenced except Freedom, Tannery, and Dogwood. That means a Surrey city guide should not casually describe the whole system as uniformly fenced.</p><p>The city also gives this page stronger rule detail than the older draft had. Surrey says dogs must be kept on a leash in Surrey parks except in designated off-leash areas, and that dog off-leash areas are open from dawn until dusk. The city notes that owners with dogs off-leash in undesignated areas are subject to fines up to $2,000. On beaches, Surrey's responsible pet ownership page says dogs are not allowed on Surrey beaches between May 15 and September 15 each year, with one important exception: the off-leash area at Blackie Spit Park. Surrey also says all dogs over the age of 3 months must be licensed and wear the licence at all times. On the current dog-licensing page, the city lists annual fees of $90.50 for a dog male or female and $58.00 for a neutered male or spayed female, with separate categories for seniors, registered service dogs, and dogs deemed guard, aggressive, vicious, or dangerous. These official pages support a much more defensible Surrey guide: a large citywide network, but one where users need to understand fencing differences, seasonal beach restrictions, leash rules outside designated areas, and up-to-date licensing.</p>";
  const seasonalTips =
    "<ul><li><strong>Winter:</strong> Surrey stays more accessible than colder inland cities, but muddy trails and soft ground matter in larger natural off-leash areas.</li><li><strong>Spring:</strong> shoulder-season rain can change footing fast in unfenced or trail-style parks, especially before summer dries them out.</li><li><strong>Summer:</strong> May 15 to September 15 is the key seasonal restriction for beaches, with Blackie Spit as the published exception.</li><li><strong>Fall:</strong> cooler weather improves longer walks, but shorter daylight makes boundary awareness more important in larger or less-contained sites.</li></ul>";
  const parkRules =
    "<p><strong>Use only designated off-leash areas:</strong> Surrey says dogs must be kept on a leash in Surrey parks except in designated off-leash areas.</p><p><strong>Know the fencing exceptions:</strong> the city says all dog off-leash parks are fully fenced except Freedom, Tannery, and Dogwood.</p><p><strong>Follow the published hours:</strong> Surrey says dog off-leash areas are open from dawn until dusk.</p><p><strong>Respect beach-season restrictions:</strong> dogs are not allowed on Surrey beaches from May 15 to September 15, except in the off-leash area at Blackie Spit Park.</p><p><strong>Keep licensing current:</strong> Surrey says all dogs over the age of 3 months must be licensed and wear the licence at all times.</p>";
  const etiquette =
    "<p><strong>1. Treat Surrey as a network, not one kind of dog park.</strong></p><p>This city has everything from highly structured fenced parks to less-contained natural spaces, so the right park depends on your dog's recall and handling needs.</p><p><strong>2. Do not assume every Surrey off-leash site is fully fenced.</strong></p><p>The city explicitly identifies three exceptions, which means containment assumptions can create real risk.</p><p><strong>3. Use Blackie Spit carefully and seasonally.</strong></p><p>It is the important exception to Surrey's summer beach prohibition, so owners should understand exactly why it is different from ordinary beach access.</p><p><strong>4. Keep tags and leash discipline sorted before arrival.</strong></p><p>Surrey's rules are straightforward: licensed dog, leash outside designated off-leash areas, and no improvising in undesignated spaces.</p><p><strong>5. Match the park to the dog's temperament.</strong></p><p>Large natural parks, small-dog sections, and urban fenced runs all exist in Surrey, and owners should choose accordingly rather than treating them as interchangeable.</p>";
  const faqs =
    "<p><strong>1. How many official dog off-leash areas does Surrey currently list?</strong></p><p>As of July 29, 2026, the City of Surrey lists 19 designated dog off-leash areas.</p><p><strong>2. Are all Surrey dog off-leash parks fully fenced?</strong></p><p>No. Surrey says all are fully fenced except Freedom, Tannery, and Dogwood.</p><p><strong>3. What are the operating hours for Surrey off-leash areas?</strong></p><p>Surrey says dog off-leash areas are open from dawn until dusk.</p><p><strong>4. Does Surrey require dog licences?</strong></p><p>Yes. The city says all dogs over the age of 3 months must be licensed and wear the licence at all times.</p><p><strong>5. What are the current Surrey dog licence fees?</strong></p><p>As of July 29, 2026, Surrey lists $90.50 annually for a dog male or female and $58.00 annually for a neutered male or spayed female.</p><p><strong>6. Are dogs allowed on Surrey beaches in summer?</strong></p><p>No, not generally. Surrey says dogs are not allowed on Surrey beaches from May 15 to September 15, except in the off-leash area at Blackie Spit Park.</p>";
  const metaDescription =
    "Source-backed guide to Surrey dog parks and off-leash rules, covering the city's 19 official off-leash areas, fencing exceptions, current hours, beach restrictions, and dog licensing requirements.";

  city.seoTitle = "Surrey Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Featured Park 1": ["blackie-spit-surrey"],
    "Featured Park 2": ["serpentine-dog-leash-park"],
    "Featured Park 3": ["joe-brown-park"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "blackie-spit-surrey",
    "Featured Park 2": "serpentine-dog-leash-park",
    "Featured Park 3": "joe-brown-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.surrey.ca/parks-recreation/parks/park-features-amenities/dog-off-leash-areas",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "White Rock, Delta, Langley",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "surrey");
  if (!targetRow) throw new Error("Surrey city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Surrey Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description":
      "Source-backed guide to Surrey dog parks and off-leash rules, covering the city's 19 official off-leash areas, fencing exceptions, current hours, beach restrictions, and dog licensing requirements.",
    "Hero Image": "",
    "Intro Paragraph":
      "<p>As of Wednesday, July 29, 2026, Surrey should be treated as a large official off-leash network with clear current city rules, not just a generic collection of fenced dog parks. The strongest Surrey pages now support a city guide built around the published 19 dog off-leash areas, the exceptions to full fencing, seasonal beach rules, and current licensing requirements.</p>",
    "About Section":
      "<p>The City of Surrey's current dog off-leash page says Surrey has designated dog off-leash areas in each of its communities and publishes a list of 19 specific sites. Those include Bear Creek, Blackie Spit, Bolivar, Clayton, Dogwood, Forsyth, Fraser View, Freedom, Hawthorne Rotary, Joe Brown, Kennedy, Latimer, Nicomekl, Panorama, Serpentine, Tannery, Tynehead Regional Park, Unwin, and Wills Brook. That is a better factual base than the older copy claiming \"over 20\" parks. Surrey also gives important nuance that most directories miss: all dog off-leash parks are fully fenced except Freedom, Tannery, and Dogwood. That means a Surrey city guide should not casually describe the whole system as uniformly fenced.</p><p>The city also gives this page stronger rule detail than the older draft had. Surrey says dogs must be kept on a leash in Surrey parks except in designated off-leash areas, and that dog off-leash areas are open from dawn until dusk. The city notes that owners with dogs off-leash in undesignated areas are subject to fines up to $2,000. On beaches, Surrey's responsible pet ownership page says dogs are not allowed on Surrey beaches between May 15 and September 15 each year, with one important exception: the off-leash area at Blackie Spit Park. Surrey also says all dogs over the age of 3 months must be licensed and wear the licence at all times. On the current dog-licensing page, the city lists annual fees of $90.50 for a dog male or female and $58.00 for a neutered male or spayed female, with separate categories for seniors, registered service dogs, and dogs deemed guard, aggressive, vicious, or dangerous. These official pages support a much more defensible Surrey guide: a large citywide network, but one where users need to understand fencing differences, seasonal beach restrictions, leash rules outside designated areas, and up-to-date licensing.</p>",
    "Featured Park 1": "blackie-spit-surrey",
    "Featured Park 2": "serpentine-dog-leash-park",
    "Featured Park 3": "joe-brown-park",
    "Seasonal Tips":
      "<ul><li><strong>Winter:</strong> Surrey stays more accessible than colder inland cities, but muddy trails and soft ground matter in larger natural off-leash areas.</li><li><strong>Spring:</strong> shoulder-season rain can change footing fast in unfenced or trail-style parks, especially before summer dries them out.</li><li><strong>Summer:</strong> May 15 to September 15 is the key seasonal restriction for beaches, with Blackie Spit as the published exception.</li><li><strong>Fall:</strong> cooler weather improves longer walks, but shorter daylight makes boundary awareness more important in larger or less-contained sites.</li></ul>",
    "Park Rules":
      "<p><strong>Use only designated off-leash areas:</strong> Surrey says dogs must be kept on a leash in Surrey parks except in designated off-leash areas.</p><p><strong>Know the fencing exceptions:</strong> the city says all dog off-leash parks are fully fenced except Freedom, Tannery, and Dogwood.</p><p><strong>Follow the published hours:</strong> Surrey says dog off-leash areas are open from dawn until dusk.</p><p><strong>Respect beach-season restrictions:</strong> dogs are not allowed on Surrey beaches from May 15 to September 15, except in the off-leash area at Blackie Spit Park.</p><p><strong>Keep licensing current:</strong> Surrey says all dogs over the age of 3 months must be licensed and wear the licence at all times.</p>",
    "City Website": "https://www.surrey.ca/parks-recreation/parks/park-features-amenities/dog-off-leash-areas",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes":
      "<p><strong>1. Treat Surrey as a network, not one kind of dog park.</strong></p><p>This city has everything from highly structured fenced parks to less-contained natural spaces, so the right park depends on your dog's recall and handling needs.</p><p><strong>2. Do not assume every Surrey off-leash site is fully fenced.</strong></p><p>The city explicitly identifies three exceptions, which means containment assumptions can create real risk.</p><p><strong>3. Use Blackie Spit carefully and seasonally.</strong></p><p>It is the important exception to Surrey's summer beach prohibition, so owners should understand exactly why it is different from ordinary beach access.</p><p><strong>4. Keep tags and leash discipline sorted before arrival.</strong></p><p>Surrey's rules are straightforward: licensed dog, leash outside designated off-leash areas, and no improvising in undesignated spaces.</p><p><strong>5. Match the park to the dog's temperament.</strong></p><p>Large natural parks, small-dog sections, and urban fenced runs all exist in Surrey, and owners should choose accordingly rather than treating them as interchangeable.</p>",
    "Dog Park FAQs":
      "<p><strong>1. How many official dog off-leash areas does Surrey currently list?</strong></p><p>As of July 29, 2026, the City of Surrey lists 19 designated dog off-leash areas.</p><p><strong>2. Are all Surrey dog off-leash parks fully fenced?</strong></p><p>No. Surrey says all are fully fenced except Freedom, Tannery, and Dogwood.</p><p><strong>3. What are the operating hours for Surrey off-leash areas?</strong></p><p>Surrey says dog off-leash areas are open from dawn until dusk.</p><p><strong>4. Does Surrey require dog licences?</strong></p><p>Yes. The city says all dogs over the age of 3 months must be licensed and wear the licence at all times.</p><p><strong>5. What are the current Surrey dog licence fees?</strong></p><p>As of July 29, 2026, Surrey lists $90.50 annually for a dog male or female and $58.00 annually for a neutered male or spayed female.</p><p><strong>6. Are dogs allowed on Surrey beaches in summer?</strong></p><p>No, not generally. Surrey says dogs are not allowed on Surrey beaches from May 15 to September 15, except in the off-leash area at Blackie Spit Park.</p>",
    "Nearby Cities": "White Rock, Delta, Langley",
    "Updated On": "Wed Jul 29 2026 23:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 23:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/surrey/")];
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
console.log("Updated Surrey city page and refreshed backlog files.");
