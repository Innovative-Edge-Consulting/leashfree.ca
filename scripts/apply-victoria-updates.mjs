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
  if (source.includes('"victoria": "/images/cities/city-victoria-hero.png"')) return;
  const anchor = '  "new-westminster": "/images/cities/city-new-westminster-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "victoria": "/images/cities/city-victoria-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "victoria");
  if (!city) throw new Error("Victoria city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, Victoria’s dog-park page is best handled as a rules-and-access page built directly from City of Victoria sources. The city publishes current leash-optional areas, seasonal beach restrictions, animal-control contacts, and dog-licensing requirements, which makes it possible to write a much stronger city guide than the older generic coastal summary.</p>";
  const about = "<p>Victoria’s official dog access rules are more specific than the old page suggested. The City of Victoria says all dogs must be on a leash in the city except in designated leash-optional areas or within enclosed spaces on private property. The city currently says there are 15 leash-optional dog parks in Victoria, and that responsible dog owners can exercise their dogs off-leash in those areas during designated times. The same official page adds that each leash-optional area has a trash bin and a dispenser stocked with biodegradable dog bags. Victoria also publishes area-specific restrictions that matter in practice. For example, at Dallas Road Waterfront the leash-optional area is located between the multi-use path and the seaside path, dogs must be on-leash on the pathway and anywhere south of the pathway, and the beach itself is an on-leash area because the waterfront sits within a federal migratory bird sanctuary. At Gonzales Beach, dogs are required to be on leash and are not permitted on the beach at all from June 1 to August 31. At Banfield Park, the leash-optional area sits between the basketball court and the Victoria West Community Centre parking lot and follows seasonal hours: April 1 to September 30 from 6 a.m. to 9 a.m. and 5 p.m. to 10 p.m., and October 1 to March 31 from 6 a.m. to 10 p.m.</p><p>Victoria’s licensing and enforcement material is equally useful. The city says all dogs over the age of four months must be licensed in Victoria. Its current licence page is framed as a 2026 renewal page, but the published fee table on that same page is labeled 2025 licence fees; as of July 29, 2026, the page lists $30 for a neutered or spayed dog and $40 for an unaltered dog if purchased in January or February, and $50 for a neutered or spayed dog and $60 for an unaltered dog if purchased from March to December. The city also says owners of unlicensed dogs can be fined up to $125 per day for non-compliance. For reporting, Victoria Animal Control Services conducts regular patrols in parks and public spaces, and the city directs dog-related concerns to 250-414-0233. On Dallas Road specifically, the city warns that owners who fail to control their pet or follow off-leash rules may face fines from $100 to $300. Those city-backed details are more useful than broad claims about Victoria being dog friendly, because they tell visitors exactly how to use leash-optional spaces legally and responsibly.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Victoria’s milder climate keeps parks usable, but wet ground and slick shoreline edges are common in off-leash areas.</li><li><strong>Spring:</strong> Wildlife-sensitive waterfront areas need extra care as migratory birds and nesting activity become more relevant.</li><li><strong>Summer:</strong> Seasonal beach restrictions matter more than heat alone, especially at Gonzales Beach and along Dallas Road.</li><li><strong>Fall:</strong> Cooler weather is excellent for longer park visits, but coastal wind and mud still matter in exposed off-leash areas.</li></ul>";
  const parkRules = "<p><strong>Keep dogs leashed except in designated leash-optional areas:</strong> Victoria says all dogs must be on a leash in the city unless they are in designated leash-optional areas or enclosed private property.</p><p><strong>License dogs over four months old:</strong> the city requires licensing for all dogs over the age of four months.</p><p><strong>Follow area-specific restrictions:</strong> Dallas Road and other waterfront areas have stricter leash boundaries and wildlife protection rules.</p><p><strong>Respect seasonal beach limits:</strong> Gonzales Beach requires leashes and prohibits dogs entirely on the beach from June 1 to August 31.</p><p><strong>Carry control into the off-leash area:</strong> the city says owners must control dogs at all times, pick up after them, stop them from jumping on people, and keep them leashed outside designated areas.</p>";
  const etiquette = "<p><strong>1. Treat Victoria as a posted-rule city.</strong></p><p>The difference between legal and illegal off-leash use often comes down to a very specific path, field edge, or seasonal time window.</p><p><strong>2. Do not treat beaches and waterfront paths as one zone.</strong></p><p>Victoria distinguishes between the leash-optional strip, the path system, and the beach in places like Dallas Road.</p><p><strong>3. Keep wildlife sensitivity in mind.</strong></p><p>Several waterfront rules exist because these areas are important bird habitat, not because the city is being arbitrary.</p><p><strong>4. Use the seasonal schedule, not assumptions.</strong></p><p>Banfield Park and beach-adjacent areas are good examples of locations where off-leash access changes with season or time of day.</p><p><strong>5. Use Animal Control when there is a real problem.</strong></p><p>Victoria publishes a direct reporting number and actively patrols parks, so serious issues should not be left to informal park-user enforcement.</p>";
  const faqs = "<p><strong>1. How many leash-optional dog parks does Victoria currently list?</strong></p><p>As of July 29, 2026, the City of Victoria says there are 15 leash-optional dog parks in Victoria.</p><p><strong>2. Are dogs generally allowed off leash throughout Victoria parks?</strong></p><p>No. The city says dogs must be on a leash except in designated leash-optional areas or enclosed private property.</p><p><strong>3. Does Victoria require dog licences?</strong></p><p>Yes. The city says all dogs over the age of four months must be licensed.</p><p><strong>4. What are the current dog licence fees shown on Victoria’s licence page?</strong></p><p>As of July 29, 2026, Victoria’s 2026 renewal page currently displays a fee table labeled 2025 licence fees, listing $30 and $40 in January and February depending on whether the dog is altered, and $50 and $60 from March to December.</p><p><strong>5. Are there special rules at Dallas Road Waterfront?</strong></p><p>Yes. Victoria says the leash-optional area is between the multi-use path and the seaside path, while the path and the beach remain on-leash areas.</p><p><strong>6. Who should owners call about dog-related concerns in Victoria parks?</strong></p><p>The city directs dog-related concerns to Victoria Animal Control Services at 250-414-0233.</p>";
  const metaDescription = "Source-backed guide to Victoria dog parks and leash-optional rules, covering the city’s 15 off-leash areas, beach and wildlife restrictions, dog licensing, current published fee table, and animal-control contacts.";

  city.seoTitle = "Victoria Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Featured Park 1": ["banfield-park-victoria"],
    "Featured Park 2": ["beacon-hill-park-victoria"],
    "Featured Park 3": ["alexander-park-victoria"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "banfield-park-victoria",
    "Featured Park 2": "beacon-hill-park-victoria",
    "Featured Park 3": "alexander-park-victoria",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.victoria.ca/parks-recreation/our-parks/dogs-parks",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Saanich, Oak Bay, Esquimalt",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "victoria");
  if (!targetRow) throw new Error("Victoria city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Victoria Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Victoria dog parks and leash-optional rules, covering the city’s 15 off-leash areas, beach and wildlife restrictions, dog licensing, current published fee table, and animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, Victoria’s dog-park page is best handled as a rules-and-access page built directly from City of Victoria sources. The city publishes current leash-optional areas, seasonal beach restrictions, animal-control contacts, and dog-licensing requirements, which makes it possible to write a much stronger city guide than the older generic coastal summary.</p>",
    "About Section": "<p>Victoria’s official dog access rules are more specific than the old page suggested. The City of Victoria says all dogs must be on a leash in the city except in designated leash-optional areas or within enclosed spaces on private property. The city currently says there are 15 leash-optional dog parks in Victoria, and that responsible dog owners can exercise their dogs off-leash in those areas during designated times. The same official page adds that each leash-optional area has a trash bin and a dispenser stocked with biodegradable dog bags. Victoria also publishes area-specific restrictions that matter in practice. For example, at Dallas Road Waterfront the leash-optional area is located between the multi-use path and the seaside path, dogs must be on-leash on the pathway and anywhere south of the pathway, and the beach itself is an on-leash area because the waterfront sits within a federal migratory bird sanctuary. At Gonzales Beach, dogs are required to be on leash and are not permitted on the beach at all from June 1 to August 31. At Banfield Park, the leash-optional area sits between the basketball court and the Victoria West Community Centre parking lot and follows seasonal hours: April 1 to September 30 from 6 a.m. to 9 a.m. and 5 p.m. to 10 p.m., and October 1 to March 31 from 6 a.m. to 10 p.m.</p><p>Victoria’s licensing and enforcement material is equally useful. The city says all dogs over the age of four months must be licensed in Victoria. Its current licence page is framed as a 2026 renewal page, but the published fee table on that same page is labeled 2025 licence fees; as of July 29, 2026, the page lists $30 for a neutered or spayed dog and $40 for an unaltered dog if purchased in January or February, and $50 for a neutered or spayed dog and $60 for an unaltered dog if purchased from March to December. The city also says owners of unlicensed dogs can be fined up to $125 per day for non-compliance. For reporting, Victoria Animal Control Services conducts regular patrols in parks and public spaces, and the city directs dog-related concerns to 250-414-0233. On Dallas Road specifically, the city warns that owners who fail to control their pet or follow off-leash rules may face fines from $100 to $300. Those city-backed details are more useful than broad claims about Victoria being dog friendly, because they tell visitors exactly how to use leash-optional spaces legally and responsibly.</p>",
    "Featured Park 1": "banfield-park-victoria",
    "Featured Park 2": "beacon-hill-park-victoria",
    "Featured Park 3": "alexander-park-victoria",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Victoria’s milder climate keeps parks usable, but wet ground and slick shoreline edges are common in off-leash areas.</li><li><strong>Spring:</strong> Wildlife-sensitive waterfront areas need extra care as migratory birds and nesting activity become more relevant.</li><li><strong>Summer:</strong> Seasonal beach restrictions matter more than heat alone, especially at Gonzales Beach and along Dallas Road.</li><li><strong>Fall:</strong> Cooler weather is excellent for longer park visits, but coastal wind and mud still matter in exposed off-leash areas.</li></ul>",
    "Park Rules": "<p><strong>Keep dogs leashed except in designated leash-optional areas:</strong> Victoria says all dogs must be on a leash in the city unless they are in designated leash-optional areas or enclosed private property.</p><p><strong>License dogs over four months old:</strong> the city requires licensing for all dogs over the age of four months.</p><p><strong>Follow area-specific restrictions:</strong> Dallas Road and other waterfront areas have stricter leash boundaries and wildlife protection rules.</p><p><strong>Respect seasonal beach limits:</strong> Gonzales Beach requires leashes and prohibits dogs entirely on the beach from June 1 to August 31.</p><p><strong>Carry control into the off-leash area:</strong> the city says owners must control dogs at all times, pick up after them, stop them from jumping on people, and keep them leashed outside designated areas.</p>",
    "City Website": "https://www.victoria.ca/parks-recreation/our-parks/dogs-parks",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Treat Victoria as a posted-rule city.</strong></p><p>The difference between legal and illegal off-leash use often comes down to a very specific path, field edge, or seasonal time window.</p><p><strong>2. Do not treat beaches and waterfront paths as one zone.</strong></p><p>Victoria distinguishes between the leash-optional strip, the path system, and the beach in places like Dallas Road.</p><p><strong>3. Keep wildlife sensitivity in mind.</strong></p><p>Several waterfront rules exist because these areas are important bird habitat, not because the city is being arbitrary.</p><p><strong>4. Use the seasonal schedule, not assumptions.</strong></p><p>Banfield Park and beach-adjacent areas are good examples of locations where off-leash access changes with season or time of day.</p><p><strong>5. Use Animal Control when there is a real problem.</strong></p><p>Victoria publishes a direct reporting number and actively patrols parks, so serious issues should not be left to informal park-user enforcement.</p>",
    "Dog Park FAQs": "<p><strong>1. How many leash-optional dog parks does Victoria currently list?</strong></p><p>As of July 29, 2026, the City of Victoria says there are 15 leash-optional dog parks in Victoria.</p><p><strong>2. Are dogs generally allowed off leash throughout Victoria parks?</strong></p><p>No. The city says dogs must be on a leash except in designated leash-optional areas or enclosed private property.</p><p><strong>3. Does Victoria require dog licences?</strong></p><p>Yes. The city says all dogs over the age of four months must be licensed.</p><p><strong>4. What are the current dog licence fees shown on Victoria’s licence page?</strong></p><p>As of July 29, 2026, Victoria’s 2026 renewal page currently displays a fee table labeled 2025 licence fees, listing $30 and $40 in January and February depending on whether the dog is altered, and $50 and $60 from March to December.</p><p><strong>5. Are there special rules at Dallas Road Waterfront?</strong></p><p>Yes. Victoria says the leash-optional area is between the multi-use path and the seaside path, while the path and the beach remain on-leash areas.</p><p><strong>6. Who should owners call about dog-related concerns in Victoria parks?</strong></p><p>The city directs dog-related concerns to Victoria Animal Control Services at 250-414-0233.</p>",
    "Nearby Cities": "Saanich, Oak Bay, Esquimalt",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/victoria/")];
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
console.log("Updated Victoria city page and refreshed backlog files.");
