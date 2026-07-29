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
  if (source.includes('"edmonton": "/images/cities/city-edmonton-hero.png"')) return;
  const anchor = '  "white-rock": "/images/cities/city-white-rock-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "edmonton": "/images/cities/city-edmonton-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "edmonton");
  if (!city) throw new Error("Edmonton city record not found.");

  const reviewedAt = "Wed Jul 29 2026 20:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro =
    "<p>As of Wednesday, July 29, 2026, Edmonton should be treated as one of Canada's largest official off-leash systems, but it is governed by stricter current bylaw language than the older generic page reflected. The current City of Edmonton pages now tie off-leash access, licensing, and owner responsibility together much more clearly.</p>";
  const about =
    "<p>Edmonton's current off-leash page says the city has over 60 off-leash areas spread across neighbourhood parks and the river valley, which is a stronger and more current claim than the older copy about \"over 40\" areas. The city specifically positions these spaces as designated off-leash areas rather than casual dog-friendly zones, and it reminds visitors to know the posted boundaries because dogs must be on leash when entering or leaving those boundaries. That matters in Edmonton because many popular destinations such as Terwillegar, Buena Vista, Gold Bar, Hermitage, and Mill Creek connect trails, open parkland, and shared-use routes where the boundary line is part of the rule set.</p><p>The ownership rules are also clearer now. Edmonton's Responsible Pet Ownership page says dogs are not allowed to be loose unless they are on your property or in a designated off-leash area, and says dogs are not allowed on playgrounds, sports fields, or golf courses. That same page says the fine for violating the loose-dog bylaw is $100. The city also states that all dogs and cats 6 months or older must have a valid pet licence and tags. On the current pet licence page, Edmonton lists dog licence fees of $38 annually for a spayed or neutered dog, $19 annually for seniors or income assistance in that same altered category, and $78 annually for a non-spayed or non-neutered dog, with higher listed fees for nuisance or vicious dogs and free licensing for guide or service dogs. The off-leash page adds that vicious dogs are not allowed in off-leash areas and must be leashed and muzzled any time they are outside the owner's property. Edmonton also notes that wildlife is present in all parks, owners must prevent chasing, and dogs should be leashed if a coyote is seen. Taken together, those official pages support a much more factual Edmonton guide: a large city network, but one that only works if users respect designated boundaries, leash transitions, wildlife, and current licensing rules.</p>";
  const seasonalTips =
    "<ul><li><strong>Winter:</strong> many Edmonton off-leash areas stay usable, but ice, packed snow, and river-valley slopes change footing quickly.</li><li><strong>Spring:</strong> thaw season can make low trails muddy and river-adjacent access points soft or flooded.</li><li><strong>Summer:</strong> early starts are better for exposed valley routes, and wildlife awareness matters more when dogs are ranging farther from owners.</li><li><strong>Fall:</strong> cooler temperatures help with longer trail outings, but shorter daylight makes boundary awareness more important in larger off-leash systems.</li></ul>";
  const parkRules =
    "<p><strong>Use only designated off-leash areas:</strong> Edmonton says dogs may be loose only on your property or in a designated off-leash area.</p><p><strong>Leash dogs at the boundaries:</strong> the city tells visitors to know the posted boundaries and says dogs must be on leash when entering or leaving off-leash area boundaries.</p><p><strong>Keep dogs out of restricted public spaces:</strong> Edmonton says dogs are not allowed on playgrounds, sports fields, or golf courses.</p><p><strong>Keep control at all times:</strong> the off-leash page says your dog's behaviour is your responsibility, your dog must stay in sight, and all Edmonton parks are shared-use.</p><p><strong>Respect wildlife and other users:</strong> the city says wildlife is present in all parks, dogs must not be allowed to chase, and owners should leash their dog if they see a coyote.</p>";
  const etiquette =
    "<p><strong>1. Treat Edmonton as a boundary-driven off-leash city.</strong></p><p>The biggest mistake here is assuming a large river-valley setting means dogs can be off leash everywhere. Edmonton's rule is still designation first.</p><p><strong>2. Plan for leash transitions, not just off-leash time.</strong></p><p>The city explicitly calls out entry and exit boundaries, so a good visit starts with knowing exactly where the legal off-leash section begins and ends.</p><p><strong>3. Expect shared-use conditions.</strong></p><p>Many Edmonton off-leash areas sit inside broader park systems used by walkers, cyclists, and families, so recall and line-of-sight control matter more than raw space.</p><p><strong>4. Take wildlife warnings seriously.</strong></p><p>The city's coyote guidance is not filler. River-valley and ravine areas can change quickly depending on season, time of day, and animal activity.</p><p><strong>5. Keep licensing current before using the network.</strong></p><p>Edmonton ties responsible ownership to pet licensing and tags, so using the city's off-leash system without a valid licence is an avoidable compliance problem.</p>";
  const faqs =
    "<p><strong>1. How many official off-leash areas does Edmonton currently list?</strong></p><p>As of July 29, 2026, Edmonton's off-leash page says the city has over 60 off-leash areas.</p><p><strong>2. Can dogs be off leash anywhere in Edmonton parks?</strong></p><p>No. Edmonton says dogs may be loose only on your property or in a designated off-leash area.</p><p><strong>3. Does Edmonton require dog licences?</strong></p><p>Yes. The city says all dogs and cats 6 months or older must have a valid pet licence and tags.</p><p><strong>4. What are the current Edmonton dog licence fees?</strong></p><p>As of July 29, 2026, Edmonton lists $38 annually for a spayed or neutered dog and $78 annually for a non-spayed or non-neutered dog, with a $19 reduced annual fee for seniors or income assistance in the altered category.</p><p><strong>5. Are vicious dogs allowed in Edmonton off-leash areas?</strong></p><p>No. Edmonton says vicious dogs are not allowed in off-leash areas and must be leashed and muzzled outside the owner's property.</p><p><strong>6. What should owners do if they see a coyote?</strong></p><p>Edmonton says to leash your dog if you see a coyote.</p>";
  const metaDescription =
    "Source-backed guide to Edmonton dog parks and off-leash rules, covering the city's 60-plus designated off-leash areas, leash-boundary rules, pet licensing, wildlife guidance, and current municipal bylaws.";

  city.seoTitle = "Edmonton Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Featured Park 1": ["terwillegar-off-leash-dog-park"],
    "Featured Park 2": ["buena-vista-park-off-leash-dog-park"],
    "Featured Park 3": ["gold-bar-park-off-leash-area"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "terwillegar-off-leash-dog-park",
    "Featured Park 2": "buena-vista-park-off-leash-dog-park",
    "Featured Park 3": "gold-bar-park-off-leash-area",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "St. Albert, Sherwood Park, Leduc",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "edmonton");
  if (!targetRow) throw new Error("Edmonton city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Edmonton Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description":
      "Source-backed guide to Edmonton dog parks and off-leash rules, covering the city's 60-plus designated off-leash areas, leash-boundary rules, pet licensing, wildlife guidance, and current municipal bylaws.",
    "Hero Image": "",
    "Intro Paragraph":
      "<p>As of Wednesday, July 29, 2026, Edmonton should be treated as one of Canada's largest official off-leash systems, but it is governed by stricter current bylaw language than the older generic page reflected. The current City of Edmonton pages now tie off-leash access, licensing, and owner responsibility together much more clearly.</p>",
    "About Section":
      "<p>Edmonton's current off-leash page says the city has over 60 off-leash areas spread across neighbourhood parks and the river valley, which is a stronger and more current claim than the older copy about \"over 40\" areas. The city specifically positions these spaces as designated off-leash areas rather than casual dog-friendly zones, and it reminds visitors to know the posted boundaries because dogs must be on leash when entering or leaving those boundaries. That matters in Edmonton because many popular destinations such as Terwillegar, Buena Vista, Gold Bar, Hermitage, and Mill Creek connect trails, open parkland, and shared-use routes where the boundary line is part of the rule set.</p><p>The ownership rules are also clearer now. Edmonton's Responsible Pet Ownership page says dogs are not allowed to be loose unless they are on your property or in a designated off-leash area, and says dogs are not allowed on playgrounds, sports fields, or golf courses. That same page says the fine for violating the loose-dog bylaw is $100. The city also states that all dogs and cats 6 months or older must have a valid pet licence and tags. On the current pet licence page, Edmonton lists dog licence fees of $38 annually for a spayed or neutered dog, $19 annually for seniors or income assistance in that same altered category, and $78 annually for a non-spayed or non-neutered dog, with higher listed fees for nuisance or vicious dogs and free licensing for guide or service dogs. The off-leash page adds that vicious dogs are not allowed in off-leash areas and must be leashed and muzzled any time they are outside the owner's property. Edmonton also notes that wildlife is present in all parks, owners must prevent chasing, and dogs should be leashed if a coyote is seen. Taken together, those official pages support a much more factual Edmonton guide: a large city network, but one that only works if users respect designated boundaries, leash transitions, wildlife, and current licensing rules.</p>",
    "Featured Park 1": "terwillegar-off-leash-dog-park",
    "Featured Park 2": "buena-vista-park-off-leash-dog-park",
    "Featured Park 3": "gold-bar-park-off-leash-area",
    "Seasonal Tips":
      "<ul><li><strong>Winter:</strong> many Edmonton off-leash areas stay usable, but ice, packed snow, and river-valley slopes change footing quickly.</li><li><strong>Spring:</strong> thaw season can make low trails muddy and river-adjacent access points soft or flooded.</li><li><strong>Summer:</strong> early starts are better for exposed valley routes, and wildlife awareness matters more when dogs are ranging farther from owners.</li><li><strong>Fall:</strong> cooler temperatures help with longer trail outings, but shorter daylight makes boundary awareness more important in larger off-leash systems.</li></ul>",
    "Park Rules":
      "<p><strong>Use only designated off-leash areas:</strong> Edmonton says dogs may be loose only on your property or in a designated off-leash area.</p><p><strong>Leash dogs at the boundaries:</strong> the city tells visitors to know the posted boundaries and says dogs must be on leash when entering or leaving off-leash area boundaries.</p><p><strong>Keep dogs out of restricted public spaces:</strong> Edmonton says dogs are not allowed on playgrounds, sports fields, or golf courses.</p><p><strong>Keep control at all times:</strong> the off-leash page says your dog's behaviour is your responsibility, your dog must stay in sight, and all Edmonton parks are shared-use.</p><p><strong>Respect wildlife and other users:</strong> the city says wildlife is present in all parks, dogs must not be allowed to chase, and owners should leash their dog if they see a coyote.</p>",
    "City Website": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes":
      "<p><strong>1. Treat Edmonton as a boundary-driven off-leash city.</strong></p><p>The biggest mistake here is assuming a large river-valley setting means dogs can be off leash everywhere. Edmonton's rule is still designation first.</p><p><strong>2. Plan for leash transitions, not just off-leash time.</strong></p><p>The city explicitly calls out entry and exit boundaries, so a good visit starts with knowing exactly where the legal off-leash section begins and ends.</p><p><strong>3. Expect shared-use conditions.</strong></p><p>Many Edmonton off-leash areas sit inside broader park systems used by walkers, cyclists, and families, so recall and line-of-sight control matter more than raw space.</p><p><strong>4. Take wildlife warnings seriously.</strong></p><p>The city's coyote guidance is not filler. River-valley and ravine areas can change quickly depending on season, time of day, and animal activity.</p><p><strong>5. Keep licensing current before using the network.</strong></p><p>Edmonton ties responsible ownership to pet licensing and tags, so using the city's off-leash system without a valid licence is an avoidable compliance problem.</p>",
    "Dog Park FAQs":
      "<p><strong>1. How many official off-leash areas does Edmonton currently list?</strong></p><p>As of July 29, 2026, Edmonton's off-leash page says the city has over 60 off-leash areas.</p><p><strong>2. Can dogs be off leash anywhere in Edmonton parks?</strong></p><p>No. Edmonton says dogs may be loose only on your property or in a designated off-leash area.</p><p><strong>3. Does Edmonton require dog licences?</strong></p><p>Yes. The city says all dogs and cats 6 months or older must have a valid pet licence and tags.</p><p><strong>4. What are the current Edmonton dog licence fees?</strong></p><p>As of July 29, 2026, Edmonton lists $38 annually for a spayed or neutered dog and $78 annually for a non-spayed or non-neutered dog, with a $19 reduced annual fee for seniors or income assistance in the altered category.</p><p><strong>5. Are vicious dogs allowed in Edmonton off-leash areas?</strong></p><p>No. Edmonton says vicious dogs are not allowed in off-leash areas and must be leashed and muzzled outside the owner's property.</p><p><strong>6. What should owners do if they see a coyote?</strong></p><p>Edmonton says to leash your dog if you see a coyote.</p>",
    "Nearby Cities": "St. Albert, Sherwood Park, Leduc",
    "Updated On": "Wed Jul 29 2026 20:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 20:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/edmonton/")];
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
console.log("Updated Edmonton city page and refreshed backlog files.");
