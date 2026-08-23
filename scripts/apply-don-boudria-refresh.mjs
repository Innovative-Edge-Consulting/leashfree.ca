import fs from "node:fs";

const slug = "don-boudria-park";
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const faqs = `<p><strong>1. Is Don Boudria Park an off-leash dog park?</strong></p><p>No. Ottawa's current dogs-in-parks information classifies this park as not designated for off-leash use. Keep dogs leashed and under control.</p><p><strong>2. What address does Ottawa publish?</strong></p><p>The current municipal record identifies Don Boudria Park at 655 Décoeur Drive, Ottawa.</p><p><strong>3. What dog rule applies here?</strong></p><p>Ottawa's Dogs on Leash designation means dogs may enter but must remain on leash. Dogs must also stay at least five metres from children's play areas and pools.</p><p><strong>4. Is the park accessible?</strong></p><p>The current Ottawa park record marks Don Boudria Park as accessible.</p><p><strong>5. Are parking, water, benches, washrooms, and waste bins confirmed?</strong></p><p>The reviewed current sources did not confirm those site-specific amenities. Verify conditions on arrival and bring water and waste bags.</p><p><strong>6. What hours should I expect?</strong></p><p>Ottawa parks generally close overnight; check posted signs for the current hours and any temporary closure notices.</p>`;
const notes = `<p>Primary sources reviewed on August 23, 2026: <a href="https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/dogs-parks">City of Ottawa dogs-in-parks guidance</a>, <a href="https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks">City of Ottawa dogs-in-parks map</a>, <a href="https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077">Animal Care and Control By-law</a>, and the current Ottawa Parks Inventory record. These sources support the 655 Décoeur Drive address, accessible status, and on-leash/not-designated classification; site-specific amenities remain unconfirmed.</p>`;
function parse(text){const out=[];let row=[],value="",q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){value+='"';i++;}else if(c==='"')q=false;else value+=c;}else if(c==='"')q=true;else if(c===','){row.push(value);value='';}else if(c==='\n'){row.push(value.replace(/\r$/,''));out.push(row);row=[];value='';}else value+=c;}if(value.length||row.length){row.push(value.replace(/\r$/,''));out.push(row);}return out;}
function csv(rows){return rows.map(row=>row.map(v=>{v=String(v??'');return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v;}).join(',')).join('\n')+'\n';}
const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find(p => p.slug === slug);
if (!park) throw new Error("Don Boudria Park record not found");
park.raw["Dog Park FAQs"] = faqs;
park.raw["Notes / Comments"] = notes;
park.raw["Reviewed On"] = "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
park.raw["Updated On"] = "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
fs.writeFileSync(jsonPath, `${JSON.stringify(parks, null, 2)}\n`);
const rows = parse(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0];
const row = rows.find((r, i) => i && r[headers.indexOf("slug")] === slug);
if (!row) throw new Error("Don Boudria Park CSV row not found");
for (const [key, value] of [["Dog Park FAQs", faqs], ["Notes / Comments", notes], ["Reviewed On", "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"], ["Updated On", "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"]]) { const i = headers.indexOf(key); if (i >= 0) row[i] = value; }
fs.writeFileSync(csvPath, csv(rows));
console.log("Refreshed Don Boudria Park FAQs and review date.");
