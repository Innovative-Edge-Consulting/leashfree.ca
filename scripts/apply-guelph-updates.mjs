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
  if (source.includes('"guelph": "/images/cities/city-guelph-hero.png"')) return;
  const anchor = '  "etobicoke": "/images/cities/city-etobicoke-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "guelph": "/images/cities/city-guelph-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "guelph");
  if (!city) throw new Error("Guelph city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, Guelph's off-leash dog guidance is stronger when it follows the City of Guelph's current off-leash, licensing, and animal-control pages directly. The city currently distinguishes between fenced dog parks, unfenced leash-free areas, and shared sports-field access rules, so this page should reflect that actual operating model instead of claiming every official off-leash space is a fenced dog park.</p>";
  const about = "<p>Guelph's current off-leash structure is broader than a simple list of fenced dog parks. The City of Guelph's off-leash page says its fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m. and identifies Bristol Street Park at 220 Bristol Street and Peter Misersky Park on Hadati Road as the city's fenced options. The same official page also lists designated unfenced off-leash areas at Eramosa River Park, Lee Street Park, Riverside Park on the GRCA lands west of the Speed River and north of Woodlawn Road, Norm Jary Park, Margaret Greene Park, Centennial Park, Crane Park, and John Gamble Park in the hydro corridor. In addition, some unoccupied sports fields can be used for off-leash exercise, but dogs must be leashed immediately when someone enters to use the field for sports. That distinction matters because it changes what visitors should expect when choosing between a fenced enclosure, an open park area, and a temporarily available shared field.</p><p>The city's animal pages add the core compliance details. Guelph says residents must licence dogs and cats annually, and its animal licensing page says all dogs aged four months and older must be licensed and have the tag affixed at all times. That same page says dog licences are valid for one year from purchase and lists a $75 fine if a dog is not licensed under the bylaw. Guelph also makes clear that animal-control services are provided by the Guelph Humane Society, while the Animal Control Bylaw says no keeper may permit a dog to be leash-free except on their own property, with permission on another property, or in a city leash-free area operating under the city's requirements. Together, those source-backed rules are more useful than generic copy because they explain where off-leash activity is actually allowed, when fenced parks are open, and what licensing standard applies before you arrive.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Guelph's unfenced river and open-space leash-free areas can develop packed snow and icy patches, so footing matters more than speed.</li><li><strong>Spring:</strong> River-adjacent and turf-heavy parks often stay muddy longer, especially in shared open areas.</li><li><strong>Summer:</strong> Earlier visits help in both fenced parks and open off-leash areas when midday heat and field use increase.</li><li><strong>Fall:</strong> Sports-field sharing and leaf cover make it worth checking sightlines before unclipping in open areas.</li></ul>";
  const parkRules = "<p><strong>Know the site type before arriving:</strong> Guelph distinguishes fenced off-leash dog parks, designated unfenced off-leash areas, and some unoccupied sports fields with conditional off-leash use.</p><p><strong>Use fenced parks during published hours:</strong> the city says fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m.</p><p><strong>License dogs that meet the age requirement:</strong> Guelph says dogs four months and older must be licensed and wear the tag at all times.</p><p><strong>Follow the bylaw leash boundary:</strong> the Animal Control Bylaw says dogs cannot be leash-free except on private property with the right permission or in a designated city leash-free area.</p><p><strong>Respect sports-field sharing:</strong> if an unoccupied sports field is being used for off-leash exercise, dogs must be leashed immediately when another user arrives to use the field for sports.</p>";
  const etiquette = "<p><strong>1. Pick the right Guelph site type.</strong></p><p>Some dogs do better in a fenced enclosure like Peter Misersky Park, while others handle unfenced spaces only if recall is already reliable.</p><p><strong>2. Do not treat all listed spaces as equivalent.</strong></p><p>Guelph's official page separates fenced parks, unfenced parks, and temporary sports-field access for a reason.</p><p><strong>3. Keep field users first on shared sports spaces.</strong></p><p>The city explicitly says dogs must be leashed as soon as someone arrives to use an unoccupied field for sports.</p><p><strong>4. Show the licence standard in practice.</strong></p><p>If your dog is four months or older, Guelph expects an annual licence and tag, so do not arrive assuming park use is disconnected from licensing.</p><p><strong>5. Report true animal-control concerns to the correct body.</strong></p><p>Guelph routes animal-control services through the Guelph Humane Society rather than leaving users to guess.</p>";
  const faqs = "<p><strong>1. Are all official Guelph off-leash dog areas fenced?</strong></p><p>No. Guelph currently lists both fenced dog parks and designated unfenced off-leash areas.</p><p><strong>2. What are Guelph's fenced off-leash dog parks?</strong></p><p>As of July 29, 2026, the city lists Bristol Street Park and Peter Misersky Park as its fenced off-leash dog parks.</p><p><strong>3. What hours are Guelph's fenced dog parks open?</strong></p><p>The city says fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m.</p><p><strong>4. Does Guelph require dog licences?</strong></p><p>Yes. The city says dogs four months and older must be licensed annually and have the tag affixed at all times.</p><p><strong>5. What happens if a sports field is being used for dog exercise and another group arrives to play sports?</strong></p><p>Guelph says dogs must be leashed immediately when someone enters to use the field for sports.</p><p><strong>6. Who handles animal-control services in Guelph?</strong></p><p>The city says animal-control services are provided by the Guelph Humane Society.</p>";
  const metaDescription = "Source-backed guide to Guelph dog parks and off-leash rules, covering fenced and unfenced city-designated areas, park hours, annual dog licensing, sports-field sharing, and local animal-control contacts.";

  city.seoTitle = "Guelph Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Featured Park 1": ["peter-misersky-park"],
    "Featured Park 2": ["lee-street-park"],
    "Featured Park 3": ["margaret-greene-park"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "peter-misersky-park",
    "Featured Park 2": "lee-street-park",
    "Featured Park 3": "margaret-greene-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://guelph.ca/living/recreation/parks/leash-free-zones-for-dogs/",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Cambridge, Kitchener, Waterloo",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "guelph");
  if (!targetRow) throw new Error("Guelph city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Guelph Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Guelph dog parks and off-leash rules, covering fenced and unfenced city-designated areas, park hours, annual dog licensing, sports-field sharing, and local animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, Guelph's off-leash dog guidance is stronger when it follows the City of Guelph's current off-leash, licensing, and animal-control pages directly. The city currently distinguishes between fenced dog parks, unfenced leash-free areas, and shared sports-field access rules, so this page should reflect that actual operating model instead of claiming every official off-leash space is a fenced dog park.</p>",
    "About Section": "<p>Guelph's current off-leash structure is broader than a simple list of fenced dog parks. The City of Guelph's off-leash page says its fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m. and identifies Bristol Street Park at 220 Bristol Street and Peter Misersky Park on Hadati Road as the city's fenced options. The same official page also lists designated unfenced off-leash areas at Eramosa River Park, Lee Street Park, Riverside Park on the GRCA lands west of the Speed River and north of Woodlawn Road, Norm Jary Park, Margaret Greene Park, Centennial Park, Crane Park, and John Gamble Park in the hydro corridor. In addition, some unoccupied sports fields can be used for off-leash exercise, but dogs must be leashed immediately when someone enters to use the field for sports. That distinction matters because it changes what visitors should expect when choosing between a fenced enclosure, an open park area, and a temporarily available shared field.</p><p>The city's animal pages add the core compliance details. Guelph says residents must licence dogs and cats annually, and its animal licensing page says all dogs aged four months and older must be licensed and have the tag affixed at all times. That same page says dog licences are valid for one year from purchase and lists a $75 fine if a dog is not licensed under the bylaw. Guelph also makes clear that animal-control services are provided by the Guelph Humane Society, while the Animal Control Bylaw says no keeper may permit a dog to be leash-free except on their own property, with permission on another property, or in a city leash-free area operating under the city's requirements. Together, those source-backed rules are more useful than generic copy because they explain where off-leash activity is actually allowed, when fenced parks are open, and what licensing standard applies before you arrive.</p>",
    "Featured Park 1": "peter-misersky-park",
    "Featured Park 2": "lee-street-park",
    "Featured Park 3": "margaret-greene-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Guelph's unfenced river and open-space leash-free areas can develop packed snow and icy patches, so footing matters more than speed.</li><li><strong>Spring:</strong> River-adjacent and turf-heavy parks often stay muddy longer, especially in shared open areas.</li><li><strong>Summer:</strong> Earlier visits help in both fenced parks and open off-leash areas when midday heat and field use increase.</li><li><strong>Fall:</strong> Sports-field sharing and leaf cover make it worth checking sightlines before unclipping in open areas.</li></ul>",
    "Park Rules": "<p><strong>Know the site type before arriving:</strong> Guelph distinguishes fenced off-leash dog parks, designated unfenced off-leash areas, and some unoccupied sports fields with conditional off-leash use.</p><p><strong>Use fenced parks during published hours:</strong> the city says fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m.</p><p><strong>License dogs that meet the age requirement:</strong> Guelph says dogs four months and older must be licensed and wear the tag at all times.</p><p><strong>Follow the bylaw leash boundary:</strong> the Animal Control Bylaw says dogs cannot be leash-free except on private property with the right permission or in a designated city leash-free area.</p><p><strong>Respect sports-field sharing:</strong> if an unoccupied sports field is being used for off-leash exercise, dogs must be leashed immediately when another user arrives to use the field for sports.</p>",
    "City Website": "https://guelph.ca/living/recreation/parks/leash-free-zones-for-dogs/",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Pick the right Guelph site type.</strong></p><p>Some dogs do better in a fenced enclosure like Peter Misersky Park, while others handle unfenced spaces only if recall is already reliable.</p><p><strong>2. Do not treat all listed spaces as equivalent.</strong></p><p>Guelph's official page separates fenced parks, unfenced parks, and temporary sports-field access for a reason.</p><p><strong>3. Keep field users first on shared sports spaces.</strong></p><p>The city explicitly says dogs must be leashed as soon as someone arrives to use an unoccupied field for sports.</p><p><strong>4. Show the licence standard in practice.</strong></p><p>If your dog is four months or older, Guelph expects an annual licence and tag, so do not arrive assuming park use is disconnected from licensing.</p><p><strong>5. Report true animal-control concerns to the correct body.</strong></p><p>Guelph routes animal-control services through the Guelph Humane Society rather than leaving users to guess.</p>",
    "Dog Park FAQs": "<p><strong>1. Are all official Guelph off-leash dog areas fenced?</strong></p><p>No. Guelph currently lists both fenced dog parks and designated unfenced off-leash areas.</p><p><strong>2. What are Guelph's fenced off-leash dog parks?</strong></p><p>As of July 29, 2026, the city lists Bristol Street Park and Peter Misersky Park as its fenced off-leash dog parks.</p><p><strong>3. What hours are Guelph's fenced dog parks open?</strong></p><p>The city says fenced off-leash dog parks are open daily from 7 a.m. to 9 p.m.</p><p><strong>4. Does Guelph require dog licences?</strong></p><p>Yes. The city says dogs four months and older must be licensed annually and have the tag affixed at all times.</p><p><strong>5. What happens if a sports field is being used for dog exercise and another group arrives to play sports?</strong></p><p>Guelph says dogs must be leashed immediately when someone enters to use the field for sports.</p><p><strong>6. Who handles animal-control services in Guelph?</strong></p><p>The city says animal-control services are provided by the Guelph Humane Society.</p>",
    "Nearby Cities": "Cambridge, Kitchener, Waterloo",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/guelph/")];
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
console.log("Updated Guelph city page and refreshed backlog files.");
