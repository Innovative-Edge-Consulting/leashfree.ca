import fs from "node:fs";

const parksJsonPath = "src/data/generated/parks.json";
const parkCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const reviewQueueCsvPath = "reports/content-review-queue.csv";
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
        .join(","),
    )
    .join("\n")}\n`;
}

function getContent() {
  const seoTitle = "King's Mill Park | Etobicoke, ON | LeashFree.ca";
  const metaDescription =
    "Current Toronto source-backed note for King's Mill Park: it is a real Humber valley park in Etobicoke, but current City sources reviewed on August 21, 2026 do not confirm it as a designated off-leash area.";
  const intro =
    "<p>King's Mill Park is a real Humber valley park in Etobicoke, but current City of Toronto sources reviewed on <strong>Friday, August 21, 2026</strong> do <strong>not</strong> confirm it as a designated dogs off-leash area. Toronto's current rules require dogs to be <strong>on leash in parks unless they are inside a designated off-leash area</strong>.</p>";
  const body =
    "<p>This route needed a factual correction rather than a generic leash-free expansion. The older page described King's Mill Park as an off-leash destination, but the current City sources reviewed on August 21, 2026 did not verify that status. Toronto's current <strong>Dogs Off-Leash</strong> enforcement page says dogs must be on leash in parks and may only be off leash inside <strong>designated dogs off-leash areas</strong>. Toronto's current <strong>Responsible Dog Ownership</strong> page repeats the same rule. During this review, no current City source examined named King's Mill Park as one of those designated off-leash areas.</p><p>The park itself is still legitimate and worth documenting accurately. Toronto's current real-estate <strong>Leases and Licences</strong> page includes a listing for <strong>King's Mill Park watercraft rental, 5 Old Mill Road</strong>, which confirms the park as an active civic recreation site tied to the Humber River corridor. That fits the page's wooded-valley identity better than the older unsupported dog-park claims.</p><p>Toronto's broader park rules also matter here. The City's current <strong>Park &amp; Trail Rules &amp; Etiquette</strong> guidance says Toronto parks are closed between <strong>midnight and 5:30 a.m.</strong>. Combined with the off-leash rules above, the safer reading is straightforward: King's Mill Park is suitable for <strong>on-leash walks</strong> through the Humber valley landscape unless posted signage onsite specifically identifies a designated off-leash area.</p><p>The practical takeaway is simple. Treat King's Mill Park as a scenic Toronto park for on-leash walks, not as a confirmed off-leash dog park. This update improves trust by replacing unsupported leash-free wording with current Toronto rules and a current City reference confirming the park itself.</p>";
  const notes =
    "<p>Primary sources reviewed on Friday, August 21, 2026: https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for Toronto's current rule that dogs must be on leash in parks unless in a designated dogs off-leash area; https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dogs-in-the-city/responsible-dog-ownership/ for the current public rule that dogs must be leashed in public unless in a designated dogs off-leash area; https://www.toronto.ca/business-economy/doing-business-with-the-city/real-estate-services-delegated-approval-forms/leases-and-licences/ for the current City listing referencing King's Mill Park watercraft rental at 5 Old Mill Road; and https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ for the current rule that Toronto parks are closed between midnight and 5:30 a.m. These current sources did not confirm King's Mill Park as a designated off-leash area.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();
  const faqs = "<p><strong>1. Is King's Mill Park currently listed as a Toronto off-leash area?</strong></p><p>Yes. Toronto's 2025 Dogs Off-Leash Strategy lists King's Mill Park as a designated off-leash area in Ward 3.</p><p><strong>2. Can dogs be off leash throughout the park?</strong></p><p>No. Off-leash use applies only within the designated area. Keep dogs leashed while entering, leaving, or using other park spaces.</p><p><strong>3. Is the off-leash area confirmed as fenced?</strong></p><p>The reviewed current strategy confirms the designation but does not provide a site-specific fence description for this page. Check posted boundaries and gates on arrival.</p><p><strong>4. Are water, parking, benches, and waste bins confirmed?</strong></p><p>The reviewed sources did not confirm those site-specific amenities. Bring water and waste bags, and verify conditions onsite.</p><p><strong>5. What rules apply inside the area?</strong></p><p>Toronto requires dogs to be licensed and vaccinated, kept within sight and under control, and not left unattended. Owners must clean up waste.</p><p><strong>6. What hours should I plan for?</strong></p><p>Toronto parks are generally closed between midnight and 5:30 a.m.; confirm posted signage and temporary notices before visiting.</p>";

  park.title = "King's Mill Park | Etobicoke";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Toronto"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "toronto", "etobicoke", "humber-river", "dogs-on-leash"],
  };

  Object.assign(park.raw, {
    "Park Name": "King's Mill Park",
    "Park Header": "King's Mill Park | Etobicoke",
    "Park type": "City Park",
    Description: body,
    "Street Address": "5 Old Mill Road area",
    latitude: "43.647283072885905",
    longitude: "-79.49734035002312",
    City: "Etobicoke",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Wooded trails, paved paths, and valley green space",
    Size: "Large river valley park",
    "Water source available": "River corridor nearby",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - mature tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5:30 a.m. to midnight",
    "Seasonal Restrictions": "Dogs must remain on leash unless inside a designated dogs off-leash area",
    "Park Website or Source": "https://www.toronto.ca/business-economy/doing-business-with-the-city/real-estate-services-delegated-approval-forms/leases-and-licences/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Kings+Mill+Park+Etobicoke+ON",
    Tags: "integrity-correction,toronto,etobicoke,humber-river,dogs-on-leash",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    Media: "",
    "Reviewed On": "Fri Aug 21 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Fri Aug 21 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
  const correctedSeo = "King's Mill Park Off-Leash Area | Etobicoke, ON | LeashFree.ca";
  const correctedMeta = "Current Toronto source-backed guide to King's Mill Park's designated dogs off-leash area in the Humber valley.";
  const correctedIntro = "<p>King's Mill Park is a Toronto park with a <strong>designated dogs off-leash area</strong> in Etobicoke's Humber valley. Dogs must remain leashed outside the designated area.</p>";
  const correctedBody = "<p>Toronto's current <strong>Dog Off-Leash Strategy</strong> lists King's Mill Park as a designated off-leash area in Ward 3. This is the current City position and supersedes older reports about proposed or unsuitable sites. Use the designated area for supervised off-leash play, and keep your dog leashed while entering, leaving, or using the rest of the park.</p><p>The City strategy describes Toronto off-leash areas as places for dogs to exercise, play and socialize. Toronto's current rules require dogs in off-leash areas to be vaccinated and licensed, kept within sight and under control, and not left unattended. Follow posted boundaries and entrance signage, carry a leash, and dispose of waste in the appropriate bins.</p><p>King's Mill Park sits in the Humber valley and is part of Toronto's wider waterfront and ravine recreation network. The park and its off-leash area may have different boundaries and operating conditions, so check onsite signs before releasing a dog. Toronto parks are generally closed from midnight to 5:30 a.m.</p>";
  const correctedNotes = "<p>Primary sources reviewed on Saturday, August 22, 2026: https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254205.pdf, Toronto's current Dog Off-Leash Strategy listing King's Mill Park as an off-leash area in Ward 3; https://www.toronto.ca/city-government/planning-development/construction-new-facilities/park-facility-projects/dogs-off-leash-strategy/ for current OLA operating, access, design, and maintenance guidance; https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for current Toronto off-leash rules; and https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ for current park hours and etiquette. A 2010 report discussed a King's Mill site as a proposal that was not suitable under the criteria then being applied. The newer 2025 City strategy lists King's Mill Park as an established off-leash area, so this page follows the current strategy while preserving the historical conflict in the research record.</p>";
  park.seoTitle = correctedSeo; park.metaDescription = correctedMeta; park.description = correctedIntro; park.body = correctedBody; park.references = { City: ["Toronto"], Province: ["Ontario"], Tags: ["off-leash", "toronto", "etobicoke", "humber-valley"] };
  Object.assign(park.raw, { Description: correctedBody, "Park type": "Designated Dogs Off-Leash Area", "Street Address": "105 Riverwood Parkway", latitude: "43.647139375282876", longitude: "-79.49734036569039", City: "Toronto", Province: "Ontario", "Postal Code": "M8Y 4E9", Fenced: "Verify current boundaries on arrival", "Separate Small Dog Area": "Unknown - verify on arrival", "Water source available": "Unknown - verify on arrival", "Bag Dispensers": "Unknown - verify on arrival", "Seasonal Restrictions": "Dogs must remain within the designated off-leash area and under control", "Park Website or Source": "https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254205.pdf", "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=105+Riverwood+Parkway+Toronto+ON", Tags: "off-leash,toronto,etobicoke,humber-valley", "Notes / Comments": correctedNotes, "Public Notes": "Current Toronto strategy confirms King's Mill Park as a designated off-leash area. Keep dogs leashed outside the designated boundaries and follow posted signage.", "Intro Paragraph": correctedIntro, "Dog Park FAQs": faqs, "Meta Title": correctedSeo, "Meta Description": correctedMeta, "Reviewed On": "Sat Aug 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "Updated On": "Sat Aug 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)" });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "kings-mill-park-etobicoke");
  if (!park) throw new Error("King's Mill Park Etobicoke record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "kings-mill-park-etobicoke");
  if (!targetRow) throw new Error("King's Mill Park Etobicoke CSV row not found.");
  const park = { raw: {} };
  applyParkFields(park);
  for (const [field, value] of Object.entries(park.raw)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-mill-park-etobicoke/")];
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

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`,
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

function updateReviewQueue() {
  const rows = parseCsv(fs.readFileSync(reviewQueueCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-mill-park-etobicoke/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated King's Mill Park Etobicoke and refreshed backlog files.");
