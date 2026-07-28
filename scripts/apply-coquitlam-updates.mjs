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
  if (source.includes('"coquitlam": "/images/cities/city-coquitlam-hero.png"')) return;
  const anchor = '  "hamilton": "/images/cities/city-hamilton-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "coquitlam": "/images/cities/city-coquitlam-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "coquitlam");
  if (!city) throw new Error("Coquitlam city record not found.");

  const intro = "<p>Coquitlamâ€™s official off-leash guidance is much more specific than the current thin page. As of Tuesday, July 28, 2026, the city publishes six active off-leash parks and trails, a separate licence requirement for resident dogs over six months old, and clear rules on leash control, wildlife protection, waste pickup, and where off-leash access is actually permitted.</p>";
  const about = "<p>The City of Coquitlamâ€™s current leash and off-leash guidance says dogs must be on leash everywhere unless a posted sign designates the area as off leash. That matters because Coquitlam is not treating general parkland as casually leash-optional. Instead, the city maintains a defined network of off-leash options that currently includes Bramble Park, Glen Park, Leigh Park, Miller Park, Mundy Park, and Ridge Park. Most of these spaces are open daily from dawn to dusk, while Mundy Park adds a more detailed trail rule: all trails in the park are off leash from dawn to 10 a.m. except the trails signed for off-leash access from dawn to dusk, the trails leading to Mundy Lake where dogs are prohibited at all times, and the Mundy Park Community Path where dogs must stay on leash at all times.</p><p>The city also publishes practical use rules that are worth carrying into the guide. Coquitlam says dog owners are responsible for their dogâ€™s behaviour, must maintain control at all times, should not let dogs disturb wildlife or sensitive habitat areas, and should avoid bringing toys and food into the off-leash area when other dogs are present. Dogs identified as aggressive or vicious under the Animal Care and Control Bylaw are not allowed off leash. On the administrative side, all dogs residing in Coquitlam over six months of age must be licensed every year, and the city says a minimum $150 penalty can be issued if a dog is found unlicensed. Bylaw Services handles animal-control concerns at 604-927-3580, while the Coquitlam Animal Shelter can help with licensing questions at 604-927-7387.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Dawn-to-dusk access means shorter usable daylight in fenced areas, and forested sections can stay muddy or slick after freezing weather.</li><li><strong>Spring:</strong> Trail edges and grassy runs can soften quickly, so expect wetter footing at parks like Ridge, Miller, and Mundy.</li><li><strong>Summer:</strong> Coquitlam specifically warns owners not to leave dogs exposed to high temperatures for long periods, so earlier visits are the safer choice on hot days.</li><li><strong>Fall:</strong> Leaf cover and wetter trails make strong recall more important, especially in unfenced sections and along shared paths.</li></ul>";
  const parkRules = "<p><strong>Use off-leash access only where signs allow it:</strong> Coquitlam says dogs must be on leash everywhere unless a posted notice designates the area as off leash.</p><p><strong>Keep control of your dog at all times:</strong> the city explicitly states owners are responsible for behaviour and must maintain control.</p><p><strong>Protect habitat and wildlife:</strong> Coquitlam tells owners not to let dogs disturb wildlife or sensitive habitat areas.</p><p><strong>Do not treat every Mundy Park trail the same way:</strong> the city allows off-leash trail access from dawn to 10 a.m. with specific signed exceptions, while the trails to Mundy Lake prohibit dogs and the Community Path remains on leash at all times.</p><p><strong>Keep licences current:</strong> resident dogs over six months old must be licensed annually, and the city says an unlicensed dog can trigger a minimum $150 penalty.</p>";
  const etiquette = "<p><strong>1. Read the posted sign before unclipping the leash.</strong></p><p>Coquitlamâ€™s rule framework is location-based, so a dog-friendly park is not automatically an off-leash park.</p><p><strong>2. Be more deliberate at wildlife-sensitive edges.</strong></p><p>The city specifically tells owners not to let dogs disturb wildlife or sensitive habitat, which matters in trail and ravine-adjacent spaces.</p><p><strong>3. Keep group play simple.</strong></p><p>Coquitlam advises against bringing toys and food into off-leash areas when other dogs are present, which is a practical way to reduce conflict.</p><p><strong>4. Treat Mundy Park as a rule-heavy site, not a generic trail walk.</strong></p><p>Mundy has different rules for ordinary trails, signed off-leash trails, the Community Path, and the trails leading to Mundy Lake.</p><p><strong>5. Keep your licence and identification current.</strong></p><p>The city ties responsible dog ownership to annual licensing for resident dogs over six months old, and the shelter uses that system to reunite lost pets.</p>";
  const faqs = "<p><strong>1. How many active off-leash parks and trails does Coquitlam officially list?</strong></p><p>As of Tuesday, July 28, 2026, the city lists six: Bramble Park, Glen Park, Leigh Park, Miller Park, Mundy Park, and Ridge Park.</p><p><strong>2. Are dogs allowed off leash anywhere in Coquitlam parks?</strong></p><p>No. The city says dogs must be on leash unless a posted notice designates the area as off leash.</p><p><strong>3. What is different about Mundy Park?</strong></p><p>Mundy has a fenced off-leash compound plus trail rules that vary by area. Most trails are off leash from dawn to 10 a.m., some signed trails allow longer off-leash access, the Community Path is always on leash, and the trails to Mundy Lake prohibit dogs.</p><p><strong>4. Do I need a dog licence in Coquitlam?</strong></p><p>Yes. The city says dogs residing in Coquitlam over six months old must be licensed every year.</p><p><strong>5. What happens if my dog is unlicensed?</strong></p><p>Coquitlam says a minimum penalty of $150 can be issued if a dog is found unlicensed.</p><p><strong>6. Who should I contact for animal-control or bylaw concerns?</strong></p><p>Coquitlam Bylaw Services lists 604-927-3580, and the Coquitlam Animal Shelter lists 604-927-7387 for licensing and shelter-related help.</p>";
  const metaDescription = "Official-source guide to Coquitlam dog parks and off-leash trails, including Bramble, Glen, Leigh, Miller, Mundy, and Ridge, plus leash rules, Mundy trail exceptions, annual dog licensing, and Coquitlam animal-control contacts.";

  city.seoTitle = "Coquitlam Dog Parks and Off-Leash Trails | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "Mundy Park",
    "Featured Park 2": "Glen Park",
    "Featured Park 3": "Ridge Park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Port Coquitlam, Port Moody, Burnaby",
    "Updated On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "coquitlam");
  if (!targetRow) throw new Error("Coquitlam city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Coquitlam Dog Parks and Off-Leash Trails | LeashFree.ca",
    "Meta Description": "Official-source guide to Coquitlam dog parks and off-leash trails, including Bramble, Glen, Leigh, Miller, Mundy, and Ridge, plus leash rules, Mundy trail exceptions, annual dog licensing, and Coquitlam animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Coquitlamâ€™s official off-leash guidance is much more specific than the current thin page. As of Tuesday, July 28, 2026, the city publishes six active off-leash parks and trails, a separate licence requirement for resident dogs over six months old, and clear rules on leash control, wildlife protection, waste pickup, and where off-leash access is actually permitted.</p>",
    "About Section": "<p>The City of Coquitlamâ€™s current leash and off-leash guidance says dogs must be on leash everywhere unless a posted sign designates the area as off leash. That matters because Coquitlam is not treating general parkland as casually leash-optional. Instead, the city maintains a defined network of off-leash options that currently includes Bramble Park, Glen Park, Leigh Park, Miller Park, Mundy Park, and Ridge Park. Most of these spaces are open daily from dawn to dusk, while Mundy Park adds a more detailed trail rule: all trails in the park are off leash from dawn to 10 a.m. except the trails signed for off-leash access from dawn to dusk, the trails leading to Mundy Lake where dogs are prohibited at all times, and the Mundy Park Community Path where dogs must stay on leash at all times.</p><p>The city also publishes practical use rules that are worth carrying into the guide. Coquitlam says dog owners are responsible for their dogâ€™s behaviour, must maintain control at all times, should not let dogs disturb wildlife or sensitive habitat areas, and should avoid bringing toys and food into the off-leash area when other dogs are present. Dogs identified as aggressive or vicious under the Animal Care and Control Bylaw are not allowed off leash. On the administrative side, all dogs residing in Coquitlam over six months of age must be licensed every year, and the city says a minimum $150 penalty can be issued if a dog is found unlicensed. Bylaw Services handles animal-control concerns at 604-927-3580, while the Coquitlam Animal Shelter can help with licensing questions at 604-927-7387.</p>",
    "Featured Park 1": "Mundy Park",
    "Featured Park 2": "Glen Park",
    "Featured Park 3": "Ridge Park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Dawn-to-dusk access means shorter usable daylight in fenced areas, and forested sections can stay muddy or slick after freezing weather.</li><li><strong>Spring:</strong> Trail edges and grassy runs can soften quickly, so expect wetter footing at parks like Ridge, Miller, and Mundy.</li><li><strong>Summer:</strong> Coquitlam specifically warns owners not to leave dogs exposed to high temperatures for long periods, so earlier visits are the safer choice on hot days.</li><li><strong>Fall:</strong> Leaf cover and wetter trails make strong recall more important, especially in unfenced sections and along shared paths.</li></ul>",
    "Park Rules": "<p><strong>Use off-leash access only where signs allow it:</strong> Coquitlam says dogs must be on leash everywhere unless a posted notice designates the area as off leash.</p><p><strong>Keep control of your dog at all times:</strong> the city explicitly states owners are responsible for behaviour and must maintain control.</p><p><strong>Protect habitat and wildlife:</strong> Coquitlam tells owners not to let dogs disturb wildlife or sensitive habitat areas.</p><p><strong>Do not treat every Mundy Park trail the same way:</strong> the city allows off-leash trail access from dawn to 10 a.m. with specific signed exceptions, while the trails to Mundy Lake prohibit dogs and the Community Path remains on leash at all times.</p><p><strong>Keep licences current:</strong> resident dogs over six months old must be licensed annually, and the city says an unlicensed dog can trigger a minimum $150 penalty.</p>",
    "City Website": "https://www.coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas",
    "Dog Park Etiquettes": "<p><strong>1. Read the posted sign before unclipping the leash.</strong></p><p>Coquitlamâ€™s rule framework is location-based, so a dog-friendly park is not automatically an off-leash park.</p><p><strong>2. Be more deliberate at wildlife-sensitive edges.</strong></p><p>The city specifically tells owners not to let dogs disturb wildlife or sensitive habitat, which matters in trail and ravine-adjacent spaces.</p><p><strong>3. Keep group play simple.</strong></p><p>Coquitlam advises against bringing toys and food into off-leash areas when other dogs are present, which is a practical way to reduce conflict.</p><p><strong>4. Treat Mundy Park as a rule-heavy site, not a generic trail walk.</strong></p><p>Mundy has different rules for ordinary trails, signed off-leash trails, the Community Path, and the trails leading to Mundy Lake.</p><p><strong>5. Keep your licence and identification current.</strong></p><p>The city ties responsible dog ownership to annual licensing for resident dogs over six months old, and the shelter uses that system to reunite lost pets.</p>",
    "Dog Park FAQs": "<p><strong>1. How many active off-leash parks and trails does Coquitlam officially list?</strong></p><p>As of Tuesday, July 28, 2026, the city lists six: Bramble Park, Glen Park, Leigh Park, Miller Park, Mundy Park, and Ridge Park.</p><p><strong>2. Are dogs allowed off leash anywhere in Coquitlam parks?</strong></p><p>No. The city says dogs must be on leash unless a posted notice designates the area as off leash.</p><p><strong>3. What is different about Mundy Park?</strong></p><p>Mundy has a fenced off-leash compound plus trail rules that vary by area. Most trails are off leash from dawn to 10 a.m., some signed trails allow longer off-leash access, the Community Path is always on leash, and the trails to Mundy Lake prohibit dogs.</p><p><strong>4. Do I need a dog licence in Coquitlam?</strong></p><p>Yes. The city says dogs residing in Coquitlam over six months old must be licensed every year.</p><p><strong>5. What happens if my dog is unlicensed?</strong></p><p>Coquitlam says a minimum penalty of $150 can be issued if a dog is found unlicensed.</p><p><strong>6. Who should I contact for animal-control or bylaw concerns?</strong></p><p>Coquitlam Bylaw Services lists 604-927-3580, and the Coquitlam Animal Shelter lists 604-927-7387 for licensing and shelter-related help.</p>",
    "Nearby Cities": "Port Coquitlam, Port Moody, Burnaby",
    "Updated On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/coquitlam/")];
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

console.log("Updated Coquitlam city page and refreshed backlog files.");
