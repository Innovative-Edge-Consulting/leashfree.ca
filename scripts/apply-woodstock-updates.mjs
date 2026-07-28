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
  if (source.includes('"woodstock": "/images/cities/city-woodstock-hero.png"')) return;
  const anchor = '  "warman": "/images/cities/city-warman-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "woodstock": "/images/cities/city-woodstock-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "woodstock");
  if (!city) throw new Error("Woodstock city record not found.");

  const intro = "<p>Woodstock has more official dog-park detail than the current page reflects. The City of Woodstock publishes a dedicated dog parks page, animal rules summary, dog identification guidance, and municipal code references. That makes it possible to replace the one-park narrative with a more accurate city guide built around the three current leash-free parks and the city's current identification and leash requirements.</p>";
  const about = "<p>The previous Woodstock page treated Roth Park as the city's main leash-free destination and downplayed the rest of the network. The current City of Woodstock dog parks page says Woodstock has three leash-free dog parks, all fully fenced, all with double-gated entry and garbage cans: Henry Street Dog Park at 400 Henry Street, Roth Park at 680 Highland Drive on the south shore of Pittock Lake, and Cowan Sportsplex Dog Park at 895 Ridgewood Drive. The city also publishes useful park-specific details. Henry Street is the largest at 6.4 acres with separate areas for large and small dogs plus a seasonal water spout from May 1 through Thanksgiving weekend. Roth Park is 2.47 acres and has public washrooms available from May 1 through Thanksgiving weekend. Cowan Sportsplex is the simplest of the three, but the city highlights its walking pathway and ample parking.</p><p>Woodstock's wider animal rules are also more specific than the old page suggested. The city's animal rules page says pets may not run at large and must be on a leash when off the owner's property unless they are in a designated leash-free area. It also says Woodstock residents are no longer required to buy a city-issued dog tag as of January 1, 2022, but dogs must still be identifiable through a personalized tag with owner contact information or a microchip under Municipal Code Chapter 0212. The same city pages also set a household limit of three domestic dogs and two domestic cats, or two domestic dogs and three domestic cats, older than four months.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Fenced parks remain usable, but snow and ice can make gates and high-traffic paths slippery.</li><li><strong>Spring:</strong> Henry Street and Roth Park can get wet and soft during thaw, especially around naturalized edges and reservoir-side ground.</li><li><strong>Summer:</strong> Woodstock's three-park network makes it easier to choose between a larger natural setting like Henry Street or Roth Park and a quicker stop at Cowan Sportsplex.</li><li><strong>Fall:</strong> Roth Park stays especially attractive in cooler weather, but seasonal washroom and water-service windows matter because some amenities run only through Thanksgiving weekend.</li></ul>";
  const parkRules = "<p><strong>Treat Woodstock as a three-park city:</strong> the city currently publishes Henry Street, Roth Park, and Cowan Sportsplex as its leash-free dog parks.</p><p><strong>Expect fully fenced entries at each park:</strong> Woodstock says all three leash-free dog parks are fully fenced and have double-gated entry.</p><p><strong>Follow the posted off-leash conduct rules:</strong> the city prohibits food and toys in the off-leash area and says handlers are responsible for their dogs' actions at all times.</p><p><strong>Know the dog eligibility rules:</strong> Woodstock says dogs over seven months must be spayed or neutered, and aggressive dogs, females in heat, puppies under four months, and sick dogs are not permitted.</p><p><strong>Keep identification and leash rules straight outside the park:</strong> once you leave the leash-free area, dogs must not run at large and must be leashed, and they still need owner identification by personalized tag or microchip.</p>";
  const etiquette = "<p><strong>1. Pick the park that matches the visit.</strong></p><p>Henry Street is the most structured option with separate large- and small-dog sections, while Roth Park and Cowan Sportsplex work better for different access and outing styles.</p><p><strong>2. Do not carry normal park habits into the off-leash enclosure.</strong></p><p>Woodstock explicitly bans food and toys in the off-leash area, which is stricter than many generic dog-park assumptions.</p><p><strong>3. Treat dog control as continuous.</strong></p><p>The city says dogs must stay under control and within sight of their handler at all times.</p><p><strong>4. Use the seasonal amenities accurately.</strong></p><p>Henry Street's water spout and Roth Park washrooms are seasonal, both published as available from May 1 through Thanksgiving weekend.</p><p><strong>5. Do not confuse identification with the old tag system.</strong></p><p>Woodstock ended the city-issued dog-tag purchase requirement on January 1, 2022, but owners still need a personalized tag or microchip to comply with Chapter 0212.</p>";
  const faqs = "<p><strong>1. How many leash-free dog parks does Woodstock currently publish?</strong></p><p>The city currently publishes three leash-free dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>Woodstock lists Henry Street Dog Park, Roth Park, and Cowan Sportsplex Dog Park.</p><p><strong>3. Are they fenced?</strong></p><p>Yes. The city says all three are fully fenced and have double-gated entry.</p><p><strong>4. Does Woodstock still require a city-issued dog tag?</strong></p><p>No. Since January 1, 2022, owners are no longer required to buy a city-issued dog tag, but dogs still need a personalized tag with owner contact information or a microchip.</p><p><strong>5. Which park has a separate small-dog section?</strong></p><p>The city says Henry Street has separate sections for large dogs and small dogs.</p><p><strong>6. What leash rule applies outside the dog parks?</strong></p><p>Woodstock says pets are not allowed to run at large and must be on a leash when off the owner's property unless they are in a designated leash-free area.</p>";
  const metaDescription = "Source-backed guide to dog parks in Woodstock, Ontario, covering Henry Street, Roth Park, and Cowan Sportsplex, plus current leash-free park rules, dog identification requirements, and Municipal Code Chapter 0212.";

  city.seoTitle = "Dog Parks in Woodstock, Ontario | Off-Leash Guide";
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
    "Featured Park 1": "henry-street-dog-park",
    "Featured Park 2": "roth-park",
    "Featured Park 3": "cowan-sportsplex-dog-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.cityofwoodstock.ca/recreation-culture/parks-trails-and-sports-fields/dog-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Ingersoll, Tillsonburg, Stratford",
    "Updated On": "Sun Jul 26 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "woodstock");
  if (!targetRow) throw new Error("Woodstock city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Woodstock, Ontario | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Woodstock, Ontario, covering Henry Street, Roth Park, and Cowan Sportsplex, plus current leash-free park rules, dog identification requirements, and Municipal Code Chapter 0212.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Woodstock has more official dog-park detail than the current page reflects. The City of Woodstock publishes a dedicated dog parks page, animal rules summary, dog identification guidance, and municipal code references. That makes it possible to replace the one-park narrative with a more accurate city guide built around the three current leash-free parks and the city's current identification and leash requirements.</p>",
    "About Section": "<p>The previous Woodstock page treated Roth Park as the city's main leash-free destination and downplayed the rest of the network. The current City of Woodstock dog parks page says Woodstock has three leash-free dog parks, all fully fenced, all with double-gated entry and garbage cans: Henry Street Dog Park at 400 Henry Street, Roth Park at 680 Highland Drive on the south shore of Pittock Lake, and Cowan Sportsplex Dog Park at 895 Ridgewood Drive. The city also publishes useful park-specific details. Henry Street is the largest at 6.4 acres with separate areas for large and small dogs plus a seasonal water spout from May 1 through Thanksgiving weekend. Roth Park is 2.47 acres and has public washrooms available from May 1 through Thanksgiving weekend. Cowan Sportsplex is the simplest of the three, but the city highlights its walking pathway and ample parking.</p><p>Woodstock's wider animal rules are also more specific than the old page suggested. The city's animal rules page says pets may not run at large and must be on a leash when off the owner's property unless they are in a designated leash-free area. It also says Woodstock residents are no longer required to buy a city-issued dog tag as of January 1, 2022, but dogs must still be identifiable through a personalized tag with owner contact information or a microchip under Municipal Code Chapter 0212. The same city pages also set a household limit of three domestic dogs and two domestic cats, or two domestic dogs and three domestic cats, older than four months.</p>",
    "Featured Park 1": "henry-street-dog-park",
    "Featured Park 2": "roth-park",
    "Featured Park 3": "cowan-sportsplex-dog-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Fenced parks remain usable, but snow and ice can make gates and high-traffic paths slippery.</li><li><strong>Spring:</strong> Henry Street and Roth Park can get wet and soft during thaw, especially around naturalized edges and reservoir-side ground.</li><li><strong>Summer:</strong> Woodstock's three-park network makes it easier to choose between a larger natural setting like Henry Street or Roth Park and a quicker stop at Cowan Sportsplex.</li><li><strong>Fall:</strong> Roth Park stays especially attractive in cooler weather, but seasonal washroom and water-service windows matter because some amenities run only through Thanksgiving weekend.</li></ul>",
    "Park Rules": "<p><strong>Treat Woodstock as a three-park city:</strong> the city currently publishes Henry Street, Roth Park, and Cowan Sportsplex as its leash-free dog parks.</p><p><strong>Expect fully fenced entries at each park:</strong> Woodstock says all three leash-free dog parks are fully fenced and have double-gated entry.</p><p><strong>Follow the posted off-leash conduct rules:</strong> the city prohibits food and toys in the off-leash area and says handlers are responsible for their dogs' actions at all times.</p><p><strong>Know the dog eligibility rules:</strong> Woodstock says dogs over seven months must be spayed or neutered, and aggressive dogs, females in heat, puppies under four months, and sick dogs are not permitted.</p><p><strong>Keep identification and leash rules straight outside the park:</strong> once you leave the leash-free area, dogs must not run at large and must be leashed, and they still need owner identification by personalized tag or microchip.</p>",
    "City Website": "https://www.cityofwoodstock.ca/recreation-culture/parks-trails-and-sports-fields/dog-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Pick the park that matches the visit.</strong></p><p>Henry Street is the most structured option with separate large- and small-dog sections, while Roth Park and Cowan Sportsplex work better for different access and outing styles.</p><p><strong>2. Do not carry normal park habits into the off-leash enclosure.</strong></p><p>Woodstock explicitly bans food and toys in the off-leash area, which is stricter than many generic dog-park assumptions.</p><p><strong>3. Treat dog control as continuous.</strong></p><p>The city says dogs must stay under control and within sight of their handler at all times.</p><p><strong>4. Use the seasonal amenities accurately.</strong></p><p>Henry Street's water spout and Roth Park washrooms are seasonal, both published as available from May 1 through Thanksgiving weekend.</p><p><strong>5. Do not confuse identification with the old tag system.</strong></p><p>Woodstock ended the city-issued dog-tag purchase requirement on January 1, 2022, but owners still need a personalized tag or microchip to comply with Chapter 0212.</p>",
    "Dog Park FAQs": "<p><strong>1. How many leash-free dog parks does Woodstock currently publish?</strong></p><p>The city currently publishes three leash-free dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>Woodstock lists Henry Street Dog Park, Roth Park, and Cowan Sportsplex Dog Park.</p><p><strong>3. Are they fenced?</strong></p><p>Yes. The city says all three are fully fenced and have double-gated entry.</p><p><strong>4. Does Woodstock still require a city-issued dog tag?</strong></p><p>No. Since January 1, 2022, owners are no longer required to buy a city-issued dog tag, but dogs still need a personalized tag with owner contact information or a microchip.</p><p><strong>5. Which park has a separate small-dog section?</strong></p><p>The city says Henry Street has separate sections for large dogs and small dogs.</p><p><strong>6. What leash rule applies outside the dog parks?</strong></p><p>Woodstock says pets are not allowed to run at large and must be on a leash when off the owner's property unless they are in a designated leash-free area.</p>",
    "Nearby Cities": "Ingersoll, Tillsonburg, Stratford",
    "Updated On": "Sun Jul 26 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/woodstock/")];
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

console.log("Updated Woodstock city page and refreshed backlog files.");
