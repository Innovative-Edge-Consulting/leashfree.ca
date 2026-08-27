import fs from "node:fs";

const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";

function clean(value) {
  let text = String(value ?? "");
  const removals = [
    /This page needed (?:a|an) [^.]+ because [^.]+\.\s*/gi,
    /This route needed (?:a|an) [^.]+ because [^.]+\.\s*/gi,
    /This route required [^.]+ rather than [^.]+\.\s*/gi,
    /This page can be expanded with confidence because [^.]+\.\s*/gi,
    /This rewrite improves the page by [^.]+\.\s*/gi,
    /This update improves the page by [^.]+\.\s*/gi,
    /This initiative is stronger when [^.]+\.\s*/gi,
    /That is materially different from the older thin (?:copy|page), which [^.]+\.\s*/gi,
    /Treating it as [^.]+ was a classification shortcut, not a source-backed description of what the site actually is\.\s*/gi,
    /The page also needs a location correction\.\s*/gi,
    /That makes the more accurate page angle straightforward:\s*/gi,
    /The main correction for this page is that\s*/gi,
    /The main correction on this page is [^.]+\.\s*/gi,
    /The main correction here is [^.]+\.\s*/gi,
    /The main correction on this page is [^.]+\.\s*/gi,
    /The key correction for this page is that\s*/gi,
    /The key correction on this page is that\s*/gi,
    /The key correction on this page is [^.]+\.\s*/gi,
    /The key correction for this page is [^.]+\.\s*/gi,
    /The most important correction on this page is that\s*/gi,
    /The main quality fix on this page is\s*/gi,
    /The key factual correction for this page is that\s*/gi,
    /The current [^.]+\. That is the most important correction to make on this page\.\s*/gi,
    /This page needed a factual reset\.\s*/gi,
    /This page needed a classification correction [^.]+\.\s*/gi,
    /This page needed a full reset [^.]+\.\s*/gi,
    /This page needed a reset [^.]+\.\s*/gi,
    /This route needed an integrity correction [^.]+\.\s*/gi,
    /This route needed a factual correction [^.]+\.\s*/gi,
    /The strongest current source set available for this page supports\s*/gi,
    /For dog owners, the practical takeaway is straightforward:\s*this page should be treated as a\s*/gi,
    /For visitors, the practical takeaway is straightforward:\s*/gi,
    /This page should not continue presenting [^.]+\.\s*/gi,
    /This page is best treated as a correction page rather than a destination recommendation\.\s*/gi,
    /This route is best treated as a correction page rather than a destination recommendation\.\s*/gi,
    /[^.]*older thin (?:copy|page|profile|version)[^.]*\.\s*/gi,
    /[^.]*older record[^.]*\.\s*/gi,
    /[^.]*much stronger(?: than| context than| structure than)[^.]*\.\s*/gi,
    /[^.]*more useful than the older[^.]*\.\s*/gi,
    /[^.]*rather than more generic dog-park copy[^.]*\.\s*/gi
    ,/This rewrite improves trust by [^.]+\.\s*/gi
    ,/This correction improves [^.]+\.\s*/gi
    ,/This kind of correction improves [^.]+\.\s*/gi
    ,/This update improves trust by [^.]+\.\s*/gi
    ,/That matters more for [^.]+\.\s*/gi
    ,/For dog owners, the practical takeaway is straightforward\.\s*/gi
    ,/For visitors, the practical value of this page is now accuracy\.\s*/gi
    ,/[^.]*much stronger detail than the older[^.]*\.\s*/gi
    ,/[^.]*significantly stronger than the older thin draft\.\s*/gi
    ,/[^.]*improves trust[^.]*\.\s*/gi
    ,/[^.]*more useful result than expanding[^.]*\.\s*/gi
    ,/[^.]*more useful than adding[^.]*\.\s*/gi
    ,/[^.]*stronger factual base than as an invented dog-park profile[^.]*\.\s*/gi
    ,/[^.]*the practical takeaway is straightforward:\s*/gi
    ,/[^.]*the practical takeaway is simple:\s*/gi
    ,/[^.]*key quality fix on this page is [^.]*\.[\s]*/gi
    ,/[^.]*most important quality improvement on this page is [^.]*\.[\s]*/gi
    ,/[^.]*strongest update on this page is [^.]*\.[\s]*/gi
    ,/[^.]*stronger factual base than [^.]*\.[\s]*/gi
    ,/[^.]*older page described [^.]*, but [^.]*\.[\s]*/gi
    ,/[^.]*older page [^.]*\.[\s]*/gi
    ,/[^.]*older version [^.]*\.[\s]*/gi
    ,/[^.]*stale local record[^.]*\.[\s]*/gi
    ,/[^.]*generic dog-park filler[^.]*\.[\s]*/gi
    ,/[^.]*the page works best as [^.]*\.[\s]*/gi
    ,/[^.]*this page works best as [^.]*\.[\s]*/gi
    ,/[^.]*the stronger factual framing is [^.]*\.[\s]*/gi
    ,/[^.]*the stronger current framing is [^.]*\.[\s]*/gi
    ,/[^.]*the better use of this profile is [^.]*\.[\s]*/gi
    ,/[^.]*that gives the page a stronger [^.]*\.[\s]*/gi
    ,/[^.]*this page now reflects [^.]*instead of [^.]*\.[\s]*/gi
    ,/[^.]*this page now sticks closely to [^.]*instead of [^.]*\.[\s]*/gi
    ,/[^.]*the practical value of this page is [^.]*\.[\s]*/gi
    ,/[^.]*this is a useful correction page [^.]*\.[\s]*/gi
    ,/[^.]*rather than an invented dog-park profile[^.]*\.[\s]*/gi
    ,/The biggest quality fix on this page is geographic:\s*/gi
    ,/The second important correction is the type of off-leash experience\.\s*/gi
    ,/That corrects both the municipality and the old local context on the existing LeashFree\.ca record\.\s*/gi
    ,/That means the older description of [^.]+ was inaccurate\.\s*/gi
    ,/The old record presented [^.]+, but /gi
    ,/That makes this a useful correction page rather than a destination recommendation for dog owners\.\s*/gi
    ,/The main correction for this page is simple:\s*/gi
    ,/That gives this page a stronger factual base as a general park guide than as an invented dog-park profile\.\s*/gi
    ,/Based on the city sources reviewed on [^.]+, those details should not be treated as confirmed\.\s*/gi
    ,/The strongest current Town source for this page is [^.]+, which /gi
    ,/There is, however, a source-quality issue that matters\.\s*/gi
    ,/Rather than guess, this rewrite keeps the page tightly scoped to what is directly supported:\s*/gi
    ,/Because the Town does not clearly publish detailed amenity information[^.]+, earlier unsupported claims about [^.]+ have been removed\.\s*/gi
    ,/That combination gives this record a stronger municipal footing than the older version, which depended on [^.]+\.\s*/gi
    ,/Recent city notices add useful current context that the old page missed\.\s*/gi
    ,/This update replaces thin filler with what Lethbridge actually publishes now:\s*/gi
    ,/This page therefore treats Rushdale Park as a /gi
    ,/which is stronger and more current than the older page&apos;s unsupported [^.]+\.\s*/gi
    ,/which is a much more useful description than a vague [^.]+\.\s*/gi
    ,/This update replaces generic filler with the city&apos;s current facts:\s*/gi
    ,/The previous page copy was directionally right about [^.]+, but it lacked [^.]+\.\s*/gi
    ,/That source-backed framing is better than generic filler because it tells visitors what kind of outing this really is\.\s*/gi
    ,/The official image set also reinforces that character by [^.]+\.\s*/gi
    ,/That matters because it validates the leash-free designation at the municipal level rather than relying on third-party trail descriptions or old listings\.\s*/gi
    ,/The official rules are also more useful than generic filler copy\.\s*/gi
    ,/Because the city source validates the designation but does not currently publish a detailed on-page amenity breakdown for this location, this update avoids overclaiming features that are not clearly supported by the municipal pages\.\s*/gi
    ,/Instead, it improves quality by anchoring the page to confirmed facts:\s*/gi
    ,/This makes the page materially stronger for organic search because it now answers the practical questions a visitor would check first:\s*/gi
    ,/This is the right people-first treatment for the page\.\s*/gi
    ,/Instead of pretending the city publishes more than it does, the update keeps the page aligned with the city&apos;s current wording:\s*/gi
    ,/Those details should anchor this page rather than generic filler about being [^.]+\.\s*/gi
    ,/This update replaces unsupported copy with the city&apos;s current [^.]+\.\s*/gi
    ,/which is stronger and more current than the older page&apos;s unsupported [^.]+\.\s*/gi
    ,/That same notice said both the small dog area and the main area were getting equipment, which is stronger evidence for a separate small-dog section than the older page&apos;s unsupported [^.]+\.\s*/gi
    ,/This page now uses the city&apos;s current construction and rules pages instead of generic filler copy\.\s*/gi
    ,/That broader framing is a better fit for [^.]+ than pretending the city publishes a detailed facility sheet when it does not\.\s*/gi
    ,/The current Saskatoon dog-park rules are also more useful than generic filler\.\s*/gi
    ,/Burnaby&apos;s current dog off-leash page makes Bell Park more specific than the old thin copy suggested\.\s*/gi
    ,/The update improves this page by replacing generic filler with the city&apos;s actual description:\s*[^.]+\.\s*That is what helps the page function as a real local guide\.\s*/gi
    ,/which is better source-backed detail than the older filler copy\.\s*/gi
    ,/That official framing matters because visitor expectations are different inside a provincial park\.\s*/gi
    ,/The useful factual takeaway is simple:\s*/gi
    ,/That matters more than generic filler about amenities because it tells visitors what kind of site this actually is:\s*/gi
    ,/Instead of pretending the city publishes more than it does, the update keeps the page aligned with the city&apos;s current wording:\s*/gi
    ,/which is stronger evidence for a separate small-dog section than the older page&apos;s unsupported [^.]*(?:\.|&quot;No&quot; field for water\.)\s*/gi
    ,/This update replaces unsupported copy with the city&apos;s current [^.]+\.\s*/gi
    ,/This update replaces generic filler with the city&apos;s current facts:\s*[^.]+\.\s*/gi
    ,/Those are the details that should anchor this page rather than generic filler about being [^.]+\.\s*/gi
    ,/[^.]*old thin copy[^.]*\.\s*/gi
    ,/The previous page copy treated this as [^.]+\.\s*/gi
    ,/which is stronger evidence for a separate small-dog section than the older page&apos;s unsupported [^.]+\.\s*/gi
    ,/That same notice said both the small dog area and the main area were getting equipment, which is stronger evidence for a separate small-dog section than the older page&apos;s unsupported &quot;No&quot; field\.\s*/gi
    ,/ the current location, scale, surfaced loop, equipment, accessibility features, and the city&apos;s current operating guidance for safe use\.\s*/gi
    ,/which is stronger and more current than the older page&apos;s unsupported &quot;No&quot; field for water\.\s*/gi
    ,/This update replaces generic filler with the city&apos;s current facts: exact location, separated small and large dog sections, square-metre sizing, benches, edge-path connection, and the recent maintenance notice\.\s*/gi
    ,/, which is stronger evidence for a separate small-dog section than the older page&apos;s unsupported &quot;No&quot; field\.\s*/gi
    ,/, which is stronger and more current than the older page&apos;s unsupported &quot;No&quot; field for water\.\s*/gi
    ,/[^.!?]*\b(?:old|older|previous|prior|former|stale|outdated|legacy)\s+(?:page|copy|draft|listing|record|version|stub|description|filler|details|claims|framing|profile)[^.!?]*[.!?]\s*/gi
    ,/[^.!?]*\b(?:This update|This rewrite|The update|The rewrite|This correction|This improvement)[^.!?]*[.!?]\s*/gi
    ,/[^.!?]*\b(?:research|sources reviewed|source set|reviewed on)\b[^.!?]*[.!?]\s*/gi
    ,/[^.!?]*\b(?:quality improvement|quality fix|factual correction|source-backed framing|organic search)\b[^.!?]*[.!?]\s*/gi
    ,/[^.!?]*\bLeashFree\.ca\b[^.!?]*[.!?]\s*/gi
  ];
  for (const pattern of removals) text = text.replace(pattern, "");
  return text.replace(/<p>\s*<\/p>/gi, "").replace(/\s{2,}/g, " ");
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let changed = 0;
for (const park of parks) {
  const before = JSON.stringify([park.body, park.description, park.raw?.Description, park.raw?.["Intro Paragraph"]]);
  park.body = clean(park.body);
  park.description = clean(park.description);
  if (park.raw) {
    if (park.raw.Description) park.raw.Description = clean(park.raw.Description);
    if (park.raw["Intro Paragraph"]) park.raw["Intro Paragraph"] = clean(park.raw["Intro Paragraph"]);
  }
  if (before !== JSON.stringify([park.body, park.description, park.raw?.Description, park.raw?.["Intro Paragraph"]])) changed += 1;
}
fs.writeFileSync(jsonPath, `${JSON.stringify(parks, null, 2)}\n`);

function parse(text) { const out=[]; let row=[], value="", quoted=false; for(let i=0;i<text.length;i+=1){const c=text[i],n=text[i+1]; if(quoted){if(c==='"'&&n==='"'){value+='"';i+=1;}else if(c==='"')quoted=false;else value+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(value);value="";}else if(c==='\n'){row.push(value.replace(/\r$/,""));out.push(row);row=[];value="";}else value+=c;}if(value.length||row.length){row.push(value.replace(/\r$/,""));out.push(row);}return out; }
function stringify(rows) { return `${rows.map(row=>row.map(v=>{const value=String(v??"");return /[",\n]/.test(value)?`"${value.replace(/"/g,'""')}"`:value;}).join(",")).join("\n")}\n`; }
const rows = parse(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0];
const slugIndex = headers.indexOf("slug");
const descriptionIndex = headers.indexOf("Description");
const introIndex = headers.indexOf("Intro Paragraph");
for (const row of rows.slice(1)) { if (!row.length) continue; if (descriptionIndex >= 0) row[descriptionIndex] = clean(row[descriptionIndex]); if (introIndex >= 0) row[introIndex] = clean(row[introIndex]); }
fs.writeFileSync(csvPath, stringify(rows));
console.log(`Sanitized published park copy in ${changed} generated records and synchronized CSV descriptions.`);
