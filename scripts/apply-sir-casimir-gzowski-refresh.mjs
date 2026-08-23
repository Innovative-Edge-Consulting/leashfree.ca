import fs from "node:fs";

const jsonPath = "src/data/generated/parks.json";
const redirectPath = "src/data/generated/implemented-redirects.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const faqs = `<p><strong>1. Is Sir Casimir Gzowski Park currently listed as an off-leash area?</strong></p><p>Yes. Toronto's 2025 Dogs Off-Leash Strategy lists Sir Casimir Gzowski Park as an off-leash area in Ward 4.</p><p><strong>2. Is the off-leash area fenced?</strong></p><p>The City's current city-wide study identifies the off-leash area as fenced. Check the posted entrance and boundary signs when you arrive.</p><p><strong>3. Can dogs be off leash throughout the waterfront park?</strong></p><p>No. Off-leash access applies only within the designated area. Dogs must be leashed elsewhere in the park and on surrounding waterfront paths.</p><p><strong>4. Is there a separate small-dog area?</strong></p><p>The reviewed City study does not record a separate small-dog area.</p><p><strong>5. Are parking, water, benches, washrooms, and waste bins confirmed?</strong></p><p>The reviewed current sources did not confirm those site-specific amenities. Verify conditions on arrival and bring water and waste bags.</p><p><strong>6. What hours should I plan for?</strong></p><p>Toronto parks are generally closed between midnight and 5:30 a.m.; confirm posted signs and temporary notices before visiting.</p>`;
const notes = `<p>Primary sources reviewed on August 23, 2026: <a href="https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254205.pdf">Toronto's 2025 Dogs Off-Leash Strategy</a>, <a href="https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254206.pdf">the City-wide off-leash study</a>, <a href="https://www.toronto.ca/legdocs/mmis/2022/ie/bgrd/backgroundfile-225886.pdf">the Western Waterfront Master Plan update</a>, and <a href="https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/">Toronto's current dog rules</a>. These sources support the designated fenced off-leash area and the canonical Toronto page; the shorter legacy route now redirects here.</p>`;
const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find(p => p.slug === "sir-casimir-gzowski-park-etobicoke");
if (!park) throw new Error("Canonical Sir Casimir Gzowski Park record not found");
park.raw["Dog Park FAQs"] = faqs;
park.raw["Notes / Comments"] = notes;
park.raw["Reviewed On"] = "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
park.raw["Updated On"] = "Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
fs.writeFileSync(jsonPath, `${JSON.stringify(parks, null, 2)}\n`);
const redirects = JSON.parse(fs.readFileSync(redirectPath, "utf8"));
if (!redirects.some(r => r.sourceRoute === "/dog-parks/sir-casimir-gzowski-park/")) redirects.push({ sourceRoute: "/dog-parks/sir-casimir-gzowski-park/", targetRoute: "/dog-parks/sir-casimir-gzowski-park-etobicoke/", status: 301, duplicateGroupKey: "park-name-city|sir casimir gzowski park|toronto|ontario" });
fs.writeFileSync(redirectPath, `${JSON.stringify(redirects, null, 2)}\n`);
function parse(text){const out=[];let row=[],value="",q=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){value+='"';i++;}else if(c==='"')q=false;else value+=c;}else if(c==='"')q=true;else if(c===','){row.push(value);value='';}else if(c==='\n'){row.push(value.replace(/\r$/,''));out.push(row);row=[];value='';}else value+=c;}if(value.length||row.length){row.push(value.replace(/\r$/,''));out.push(row);}return out;}
function csv(rows){return rows.map(row=>row.map(v=>{v=String(v??'');return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v;}).join(',')).join('\n')+'\n';}
const rows = parse(fs.readFileSync(csvPath, "utf8")); const headers = rows[0]; const row = rows.find((r,i)=>i && r[headers.indexOf("slug")] === "sir-casimir-gzowski-park-etobicoke");
if (!row) throw new Error("Canonical Sir Casimir Gzowski Park CSV row not found");
for (const [key,value] of [["Dog Park FAQs",faqs],["Notes / Comments",notes],["Reviewed On","Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"],["Updated On","Sun Aug 23 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"]]) { const i=headers.indexOf(key); if(i>=0) row[i]=value; }
fs.writeFileSync(csvPath, csv(rows));
console.log("Refreshed Sir Casimir Gzowski Park FAQs, source review, and redirect.");
