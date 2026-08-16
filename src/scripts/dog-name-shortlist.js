const STORAGE_KEY = "leashfree-dog-name-shortlist-v2";
const LEGACY_KEY = "leashfree-dog-name-shortlist";
const META_KEY = "leashfree-dog-name-shortlist-meta";
const CSV_URL = "/data/top-1000-dog-names-2026.csv";
let masterPromise;

const text = (value) => String(value || "").trim();
const key = (value) => text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normalize = (value) => text(value).toLowerCase();

function parseCSV(source) {
  const output = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n" || character === "\r") {
      if (field.length || row.length) { row.push(field); output.push(row); row = []; field = ""; }
      if (character === "\r" && source[index + 1] === "\n") index += 1;
    } else field += character;
  }
  if (field.length || row.length) { row.push(field); output.push(row); }
  return output;
}

export async function loadMasterNames() {
  if (!masterPromise) masterPromise = fetch(CSV_URL, { cache: "force-cache" }).then(async (response) => {
    if (!response.ok) throw new Error("Could not load dog names");
    const rows = parseCSV(await response.text()).filter((row) => row.some((cell) => text(cell)));
    const headings = rows.shift().map(text);
    return rows.map((row) => {
      const item = {}; headings.forEach((heading, index) => { item[heading] = text(row[index]); });
      const name = item.Name; const category = item["Name Category"] || item.Category || "Uncategorized";
      return { id: `${key(name)}-${key(category)}`, name, meaning: item.Description || "Meaning not yet available", gender: item["Ideal Gender"] || item.Gender || "Not specified", category, rank: Number(item.Rank) || null, sourceLabel: "Dog Names Database", sourceUrl: "/dog-names/", note: "", savedAt: "" };
    }).filter((item) => item.name);
  });
  return masterPromise;
}

function validRecord(record) {
  if (typeof record === "string") return { id: key(record), name: record, meaning: "Meaning not yet available", gender: "Not specified", category: "Saved name", sourceLabel: "Dog name guide", sourceUrl: location.pathname, note: "", savedAt: new Date().toISOString() };
  const name = text(record?.name); if (!name) return null;
  return { id: text(record.id) || `${key(name)}-${key(record.category || "saved")}`, name, meaning: text(record.meaning) || "Meaning not yet available", gender: text(record.gender) || "Not specified", category: text(record.category) || "Saved name", rank: Number(record.rank) || null, sourceLabel: text(record.sourceLabel) || "Dog name guide", sourceUrl: text(record.sourceUrl) || "/dog-names/", note: text(record.note), savedAt: text(record.savedAt) || new Date().toISOString() };
}

export function getShortlist() {
  let parsed = [];
  try { parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch {}
  if (!Array.isArray(parsed) || !parsed.length) {
    try { parsed = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]"); } catch {}
  }
  const seen = new Set();
  return (Array.isArray(parsed) ? parsed : []).map(validRecord).filter((record) => record && !seen.has(record.id) && seen.add(record.id));
}

export function setShortlist(records) {
  const clean = records.map(validRecord).filter(Boolean);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new CustomEvent("dog-shortlist-change", { detail: clean }));
  return clean;
}

function createButton(label, className, handler) {
  const button = document.createElement("button"); button.type = "button"; button.className = className; button.textContent = label; button.addEventListener("click", handler); return button;
}

function guideRecord(button, master) {
  const name = text(button.dataset.saveName);
  const category = text(button.dataset.category);
  const matches = master.filter((item) => normalize(item.name) === normalize(name));
  const exact = matches.find((item) => normalize(item.category) === normalize(category)) || matches[0];
  return validRecord({ ...exact, id: exact?.id || `${key(name)}-${key(category || "guide")}`, name, meaning: text(button.dataset.meaning) || exact?.meaning, gender: text(button.dataset.gender) || exact?.gender, category: category || exact?.category, sourceLabel: text(button.dataset.sourceLabel), sourceUrl: text(button.dataset.sourceUrl), savedAt: new Date().toISOString() });
}

export function initGuideShortlist() {
  const buttons = [...document.querySelectorAll("[data-save-name]")];
  const chips = document.querySelector("[data-shortlist-chips]");
  if (!buttons.length || !chips) return;
  const status = document.querySelector("[data-shortlist-status]"); const counters = [...document.querySelectorAll("[data-saved-count]")];
  const copyButton = document.querySelector("[data-copy-shortlist]"); const clearButton = document.querySelector("[data-clear-shortlist]");
  const search = document.querySelector("[data-additional-name-search]"); const gender = document.querySelector("[data-additional-gender]"); const category = document.querySelector("[data-additional-category]"); const results = document.querySelector("[data-additional-results]"); const resultStatus = document.querySelector("[data-additional-status]");
  let saved = getShortlist(); let master = [];
  const render = () => {
    const ids = new Set(saved.map((item) => item.id));
    buttons.forEach((button) => { const active = saved.some((item) => normalize(item.name) === normalize(button.dataset.saveName) && normalize(item.category) === normalize(button.dataset.category || item.category)); button.setAttribute("aria-pressed", String(active)); button.querySelector("span").textContent = active ? "♥" : "♡"; });
    counters.forEach((counter) => { counter.textContent = String(saved.length); });
    status.textContent = saved.length ? `${saved.length} name${saved.length === 1 ? "" : "s"} saved` : "No names saved yet";
    copyButton.disabled = !saved.length; clearButton.disabled = !saved.length;
    chips.replaceChildren(...saved.map((record) => createButton(`${record.name} ×`, "", () => { saved = setShortlist(saved.filter((item) => item.id !== record.id)); render(); renderSearch(); })));
    document.querySelectorAll("[data-master-add]").forEach((button) => { button.disabled = ids.has(button.dataset.masterAdd); button.textContent = button.disabled ? "Saved" : "Add"; });
  };
  const renderSearch = () => {
    if (!results || !master.length) return;
    const query = normalize(search.value); const selectedGender = gender.value; const selectedCategory = category.value;
    const matches = master.filter((item) => (!query || normalize(`${item.name} ${item.meaning}`).includes(query)) && (!selectedGender || item.gender === selectedGender) && (!selectedCategory || item.category === selectedCategory)).slice(0, 24);
    resultStatus.textContent = `${matches.length}${matches.length === 24 ? "+" : ""} matching names shown`;
    results.replaceChildren(...matches.map((record) => {
      const article = document.createElement("article"); const copy = document.createElement("div"); const title = document.createElement("strong"); const meaning = document.createElement("p"); const meta = document.createElement("small");
      title.textContent = record.name; meaning.textContent = record.meaning; meta.textContent = `${record.gender} · ${record.category}`; copy.append(title, meaning, meta);
      const add = createButton(saved.some((item) => item.id === record.id) ? "Saved" : "Add", "button secondary", () => { if (!saved.some((item) => item.id === record.id)) saved = setShortlist([...saved, { ...record, savedAt: new Date().toISOString() }]); render(); renderSearch(); });
      add.dataset.masterAdd = record.id; add.disabled = saved.some((item) => item.id === record.id); article.append(copy, add); return article;
    }));
  };
  loadMasterNames().then((records) => {
    master = records;
    const categories = [...new Set(master.map((item) => item.category))].sort(); categories.forEach((item) => { const option = document.createElement("option"); option.value = item; option.textContent = item; category?.append(option); });
    buttons.forEach((button) => button.addEventListener("click", () => { const record = guideRecord(button, master); const current = saved.find((item) => item.id === record.id) || saved.find((item) => normalize(item.name) === normalize(record.name) && normalize(item.category) === normalize(record.category)); saved = setShortlist(current ? saved.filter((item) => item.id !== current.id) : [...saved, record]); render(); renderSearch(); }));
    [search, gender, category].forEach((control) => control?.addEventListener("input", renderSearch)); render(); renderSearch();
  }).catch(() => { if (resultStatus) resultStatus.textContent = "Additional names could not be loaded."; });
  clearButton?.addEventListener("click", () => { saved = setShortlist([]); render(); renderSearch(); });
  copyButton?.addEventListener("click", async () => { await navigator.clipboard?.writeText(saved.map((item) => `${item.name} — ${item.meaning} (${item.gender}; ${item.category})`).join("\n")); const original = copyButton.textContent; copyButton.textContent = "Copied"; setTimeout(() => { copyButton.textContent = original; }, 1200); });
  window.addEventListener("dog-shortlist-change", (event) => { saved = event.detail; render(); renderSearch(); }); render();
}

function encodeShare(records) {
  const compact = records.map(({ name, meaning, gender, category, rank, sourceLabel, sourceUrl, note }) => ({ n:name, m:meaning, g:gender, c:category, r:rank, s:sourceLabel, u:sourceUrl, o:note }));
  const bytes = new TextEncoder().encode(JSON.stringify(compact)); let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function decodeShare(value) {
  try { const binary = atob(value.replace(/-/g,"+").replace(/_/g,"/")); const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0)); return JSON.parse(new TextDecoder().decode(bytes)).map((item) => validRecord({ name:item.n, meaning:item.m, gender:item.g, category:item.c, rank:item.r, sourceLabel:item.s, sourceUrl:item.u, note:item.o })); } catch { return []; }
}
function csvCell(value) { return `"${text(value).replace(/"/g, '""')}"`; }

export function initShortlistManager() {
  const root = document.querySelector("[data-shortlist-manager]"); if (!root) return;
  const params = new URLSearchParams(location.search); const shared = params.get("list") ? decodeShare(params.get("list")) : [];
  let records = shared.length ? shared : getShortlist();
  const body = root.querySelector("[data-manager-body]"); const empty = root.querySelector("[data-manager-empty]"); const tableWrap = root.querySelector("[data-manager-table]"); const count = root.querySelector("[data-manager-count]"); const dogInput = root.querySelector("[data-dog-label]"); const sharedNotice = root.querySelector("[data-shared-notice]");
  const comparison = root.querySelector("[data-comparison]"); const comparisonGrid = root.querySelector("[data-comparison-grid]"); const compareButton = root.querySelector("[data-compare-list]"); let selected = new Set();
  try { dogInput.value = JSON.parse(localStorage.getItem(META_KEY) || "{}").dogLabel || ""; } catch {}
  if (shared.length) sharedNotice.hidden = false;
  const persist = () => { if (!shared.length) records = setShortlist(records); };
  const render = () => {
    count.textContent = `${records.length} saved name${records.length === 1 ? "" : "s"}`; empty.hidden = records.length > 0; tableWrap.hidden = records.length === 0; body.replaceChildren(...records.map((record, index) => {
      const row = document.createElement("tr");
      const compareCell=document.createElement("td"); compareCell.dataset.label="Compare"; const check=document.createElement("input"); check.type="checkbox"; check.className="compare-check"; check.checked=selected.has(record.id); check.setAttribute("aria-label",`Compare ${record.name}`); check.addEventListener("change",()=>{if(check.checked&&selected.size>=5){check.checked=false;return;}check.checked?selected.add(record.id):selected.delete(record.id);renderComparison();}); compareCell.append(check); row.append(compareCell);
      [record.name, record.meaning, record.gender, record.category].forEach((value, cellIndex) => { const cell = document.createElement("td"); cell.dataset.label = ["Name","Meaning / why it fits","Ideal gender","Category"][cellIndex]; if (cellIndex === 0) { const link=document.createElement("a"); link.href=record.sourceUrl; link.textContent=value; cell.append(link); } else cell.textContent=value; row.append(cell); });
      const noteCell=document.createElement("td"); noteCell.dataset.label="Personal note"; const note=document.createElement("textarea"); note.rows=2; note.placeholder="Add a note"; note.value=record.note; note.addEventListener("change",()=>{records[index].note=note.value; persist();}); noteCell.append(note); row.append(noteCell);
      const actions=document.createElement("td"); actions.dataset.label="Actions"; actions.className="manager-actions"; actions.append(createButton("↑","icon-button",()=>{if(index){[records[index-1],records[index]]=[records[index],records[index-1]];persist();render();}}),createButton("↓","icon-button",()=>{if(index<records.length-1){[records[index+1],records[index]]=[records[index],records[index+1]];persist();render();}}),createButton("Remove","text-button",()=>{records.splice(index,1);persist();render();})); row.append(actions); return row;
    }));
  };
  const renderComparison = () => {
    const finalists=records.filter((record)=>selected.has(record.id)); comparison.hidden=!finalists.length;
    compareButton.textContent=finalists.length?`Compare finalists (${finalists.length})`:"Compare finalists";
    comparisonGrid.replaceChildren(...finalists.map((record)=>{const card=document.createElement("article");const title=document.createElement("h3");title.textContent=record.name;const list=document.createElement("dl");[["Meaning / why it fits",record.meaning],["Ideal gender",record.gender],["Category",record.category],["Popularity",record.rank?`#${record.rank} of 488`:"Not ranked"],["Personal note",record.note||"No note yet"]].forEach(([label,value])=>{const group=document.createElement("div");const term=document.createElement("dt");const detail=document.createElement("dd");term.textContent=label;detail.textContent=value;group.append(term,detail);list.append(group);});card.append(title,list);return card;}));
  };
  compareButton?.addEventListener("click",()=>{if(!selected.size)records.slice(0,Math.min(3,records.length)).forEach((record)=>selected.add(record.id));render();renderComparison();comparison?.scrollIntoView({behavior:"smooth",block:"start"});});
  root.querySelector("[data-close-comparison]")?.addEventListener("click",()=>{selected.clear();comparison.hidden=true;render();renderComparison();});
  root.querySelector("[data-save-shared]")?.addEventListener("click",()=>{records=setShortlist(records);params.delete("list");history.replaceState(null,"",`${location.pathname}${params.size?`?${params}`:""}`);sharedNotice.hidden=true;render();});
  root.querySelector("[data-print-list]")?.addEventListener("click",()=>window.print());
  root.querySelector("[data-copy-list]")?.addEventListener("click",async(event)=>{await navigator.clipboard?.writeText(records.map((item)=>`${item.name}\t${item.meaning}\t${item.gender}\t${item.category}${item.note?`\t${item.note}`:""}`).join("\n"));event.currentTarget.textContent="Copied";setTimeout(()=>event.currentTarget.textContent="Copy list",1200);});
  root.querySelector("[data-export-list]")?.addEventListener("click",()=>{const csv=[["Name","Meaning / why it fits","Ideal gender","Category","Personal note","Source"].map(csvCell).join(","),...records.map((item)=>[item.name,item.meaning,item.gender,item.category,item.note,item.sourceUrl].map(csvCell).join(","))].join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="dog-name-shortlist.csv";link.click();URL.revokeObjectURL(url);});
  root.querySelector("[data-share-list]")?.addEventListener("click",async(event)=>{const url=`${location.origin}${location.pathname}?list=${encodeShare(records)}`;if(navigator.share){try{await navigator.share({title:"Dog name shortlist",text:"Here are the dog names I shortlisted.",url});return;}catch{}}await navigator.clipboard?.writeText(url);event.currentTarget.textContent="Share link copied";setTimeout(()=>event.currentTarget.textContent="Share",1400);});
  root.querySelector("[data-clear-list]")?.addEventListener("click",()=>{records=[];setShortlist([]);render();});
  dogInput?.addEventListener("change",()=>localStorage.setItem(META_KEY,JSON.stringify({dogLabel:dogInput.value})));
  render(); renderComparison();
}
