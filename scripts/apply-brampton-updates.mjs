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
  if (source.includes('"brampton": "/images/cities/city-brampton-hero.png"')) return;
  const updated = source.replace(
    '  "belleville": "/images/cities/city-belleville-hero.png",\n',
    '  "belleville": "/images/cities/city-belleville-hero.png",\n  "brampton": "/images/cities/city-brampton-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "brampton");
  if (!city) throw new Error("Brampton city record not found.");

  const intro = "<p>Brampton's official animal-services and parks pages confirm that the city maintains designated leash-free areas rather than a single off-leash site. The current parks overview says Brampton manages seven leash-free areas, and the park directory specifically identifies leash-free amenities at parks including Chris Gibson Park, Duggan Park, White Spruce Park, and Bramalea Ltd Community Park.</p>";
  const about = "<p>The previous Brampton page was broadly directionally correct, but it lacked current official detail. The City of Brampton now states that it manages seven leash-free areas city-wide. The park directory confirms leash-free amenities at multiple locations, including Chris Gibson Park, Duggan Park, White Spruce Park, Bramalea Ltd Community Park, Camden Park East, and Fletchers Green Community Park. That gives Brampton one of the broader municipal off-leash networks among the city pages in this backlog.</p><p>The city's animal-services rules are also specific. Brampton requires dogs and cats to be licensed with the city, and dogs must be kept on leash whenever they are on any property other than their own except in designated leash-free areas. The off-leash rules require dogs using leash-free parks to be vaccinated, licensed, and neutered or spayed. Brampton also bars aggressive dogs and children under ten from leash-free parks, and it warns that owners who let dogs run at large or go off leash in undesignated areas can face fines of up to $5,000 per offence.</p>";
  const seasonalTips = "<p>- Spring: Wet turf and thaw conditions can make some Brampton leash-free areas messier than usual, especially where parks are embedded in larger athletic-field complexes.<br>- Summer: Brampton's larger park network makes early-morning and evening visits practical when daytime heat is higher.<br>- Fall: Cooler temperatures are often ideal for active dogs, and Brampton's multi-park network gives owners more flexibility if one site feels crowded.<br>- Winter: Brampton keeps a year-round park network, but snow, ice, and reduced daylight can affect footing and visibility even when a leash-free area remains open.</p>";
  const parkRules = "<p><strong>Use designated leash-free areas only:</strong> Brampton says dogs must be on leash on any property other than their owner's except in leash-free areas.</p><p><strong>Meet the access requirements:</strong> the city's off-leash page says dogs must be vaccinated, licensed, and neutered or spayed before using leash-free parks.</p><p><strong>No aggressive dogs:</strong> Brampton does not allow dogs that are aggressive to humans or other animals, or that have a history of biting, in leash-free parks.</p><p><strong>Mind the age rule and enforcement risk:</strong> young children less than ten years old are not permitted in leash-free parks, and the city says off-leash use in undesignated areas can lead to fines up to $5,000 per offence.</p>";
  const etiquette = "<p><strong>1. Choose a confirmed city site.</strong></p><p>Brampton has enough official leash-free areas that there is no reason to rely on unofficial off-leash use in undesignated spaces.</p><p><strong>2. Treat licensing as a hard requirement.</strong></p><p>The city requires dogs to be licensed, and the off-leash access rules explicitly repeat that licensed status is required before park use.</p><p><strong>3. Respect the child-safety rule.</strong></p><p>Brampton's off-leash policy does not permit children under ten in leash-free parks, so plan family visits accordingly.</p><p><strong>4. Be conservative about dog temperament.</strong></p><p>The city's standard is not just current behaviour in the moment; it also excludes dogs with a history of biting.</p><p><strong>5. Use the multi-park network to avoid crowding.</strong></p><p>Because Brampton has several official options, switching locations is usually better than forcing a tense visit in an overcrowded enclosure.</p>";
  const faqs = "<p><strong>1. How many leash-free areas does Brampton currently say it has?</strong></p><p>The city's parks overview currently says Brampton manages seven leash-free areas.</p><p><strong>2. Which Brampton parks officially list leash-free amenities?</strong></p><p>The city park directory currently shows leash-free areas at parks including Chris Gibson Park, Duggan Park, White Spruce Park, Bramalea Ltd Community Park, Camden Park East, and Fletchers Green Community Park.</p><p><strong>3. Do dogs need to be licensed in Brampton?</strong></p><p>Yes. Brampton says dogs and cats are required to be licensed with the city.</p><p><strong>4. Can a dog be off leash outside a designated park?</strong></p><p>No. Brampton says dogs must be on leash on property other than the owner's except in leash-free areas, and off-leash use in undesignated areas can trigger fines.</p><p><strong>5. What dogs are allowed in Brampton leash-free parks?</strong></p><p>The city's off-leash rules say dogs must be vaccinated, licensed, and neutered or spayed, and aggressive dogs or dogs with a history of biting are not allowed.</p><p><strong>6. Are young children allowed inside Brampton leash-free parks?</strong></p><p>No. The city does not permit children less than ten years old in leash-free parks.</p>";
  const metaDescription = "Find Brampton dog park rules, official leash-free area guidance, and current licensing requirements from City of Brampton sources. This Brampton guide covers the city's seven leash-free areas and key off-leash rules.";

  city.seoTitle = "Dog Parks in Brampton, Ontario | Off-Leash Guide";
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
    "Featured Park 1": "chris-gibson-park",
    "Featured Park 2": "duggan-park",
    "Featured Park 3": "white-spruce-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.brampton.ca/en/residents/Animal-Services/Pages/Off-Leash-Parks.aspx",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Mississauga, Caledon, Vaughan",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "brampton");
  if (!targetRow) throw new Error("Brampton city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Brampton, Ontario | Off-Leash Guide",
    "Meta Description": "Find Brampton dog park rules, official leash-free area guidance, and current licensing requirements from City of Brampton sources. This Brampton guide covers the city's seven leash-free areas and key off-leash rules.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Brampton's official animal-services and parks pages confirm that the city maintains designated leash-free areas rather than a single off-leash site. The current parks overview says Brampton manages seven leash-free areas, and the park directory specifically identifies leash-free amenities at parks including Chris Gibson Park, Duggan Park, White Spruce Park, and Bramalea Ltd Community Park.</p>",
    "About Section": "<p>The previous Brampton page was broadly directionally correct, but it lacked current official detail. The City of Brampton now states that it manages seven leash-free areas city-wide. The park directory confirms leash-free amenities at multiple locations, including Chris Gibson Park, Duggan Park, White Spruce Park, Bramalea Ltd Community Park, Camden Park East, and Fletchers Green Community Park. That gives Brampton one of the broader municipal off-leash networks among the city pages in this backlog.</p><p>The city's animal-services rules are also specific. Brampton requires dogs and cats to be licensed with the city, and dogs must be kept on leash whenever they are on any property other than their own except in designated leash-free areas. The off-leash rules require dogs using leash-free parks to be vaccinated, licensed, and neutered or spayed. Brampton also bars aggressive dogs and children under ten from leash-free parks, and it warns that owners who let dogs run at large or go off leash in undesignated areas can face fines of up to $5,000 per offence.</p>",
    "Featured Park 1": "chris-gibson-park",
    "Featured Park 2": "duggan-park",
    "Featured Park 3": "white-spruce-park",
    "Seasonal Tips": "<p>- Spring: Wet turf and thaw conditions can make some Brampton leash-free areas messier than usual, especially where parks are embedded in larger athletic-field complexes.<br>- Summer: Brampton's larger park network makes early-morning and evening visits practical when daytime heat is higher.<br>- Fall: Cooler temperatures are often ideal for active dogs, and Brampton's multi-park network gives owners more flexibility if one site feels crowded.<br>- Winter: Brampton keeps a year-round park network, but snow, ice, and reduced daylight can affect footing and visibility even when a leash-free area remains open.</p>",
    "Park Rules": "<p><strong>Use designated leash-free areas only:</strong> Brampton says dogs must be on leash on any property other than their owner's except in leash-free areas.</p><p><strong>Meet the access requirements:</strong> the city's off-leash page says dogs must be vaccinated, licensed, and neutered or spayed before using leash-free parks.</p><p><strong>No aggressive dogs:</strong> Brampton does not allow dogs that are aggressive to humans or other animals, or that have a history of biting, in leash-free parks.</p><p><strong>Mind the age rule and enforcement risk:</strong> young children less than ten years old are not permitted in leash-free parks, and the city says off-leash use in undesignated areas can lead to fines up to $5,000 per offence.</p>",
    "City Website": "https://www.brampton.ca/en/residents/Animal-Services/Pages/Off-Leash-Parks.aspx",
    "Dog Park Etiquettes": "<p><strong>1. Choose a confirmed city site.</strong></p><p>Brampton has enough official leash-free areas that there is no reason to rely on unofficial off-leash use in undesignated spaces.</p><p><strong>2. Treat licensing as a hard requirement.</strong></p><p>The city requires dogs to be licensed, and the off-leash access rules explicitly repeat that licensed status is required before park use.</p><p><strong>3. Respect the child-safety rule.</strong></p><p>Brampton's off-leash policy does not permit children under ten in leash-free parks, so plan family visits accordingly.</p><p><strong>4. Be conservative about dog temperament.</strong></p><p>The city's standard is not just current behaviour in the moment; it also excludes dogs with a history of biting.</p><p><strong>5. Use the multi-park network to avoid crowding.</strong></p><p>Because Brampton has several official options, switching locations is usually better than forcing a tense visit in an overcrowded enclosure.</p>",
    "Dog Park FAQs": "<p><strong>1. How many leash-free areas does Brampton currently say it has?</strong></p><p>The city's parks overview currently says Brampton manages seven leash-free areas.</p><p><strong>2. Which Brampton parks officially list leash-free amenities?</strong></p><p>The city park directory currently shows leash-free areas at parks including Chris Gibson Park, Duggan Park, White Spruce Park, Bramalea Ltd Community Park, Camden Park East, and Fletchers Green Community Park.</p><p><strong>3. Do dogs need to be licensed in Brampton?</strong></p><p>Yes. Brampton says dogs and cats are required to be licensed with the city.</p><p><strong>4. Can a dog be off leash outside a designated park?</strong></p><p>No. Brampton says dogs must be on leash on property other than the owner's except in leash-free areas, and off-leash use in undesignated areas can trigger fines.</p><p><strong>5. What dogs are allowed in Brampton leash-free parks?</strong></p><p>The city's off-leash rules say dogs must be vaccinated, licensed, and neutered or spayed, and aggressive dogs or dogs with a history of biting are not allowed.</p><p><strong>6. Are young children allowed inside Brampton leash-free parks?</strong></p><p>No. The city does not permit children less than ten years old in leash-free parks.</p>",
    "Nearby Cities": "Mississauga, Caledon, Vaughan",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/brampton/")];
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

console.log("Updated Brampton city page and refreshed backlog files.");
