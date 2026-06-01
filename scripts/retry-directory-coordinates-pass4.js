import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const directoriesPath = path.join(process.cwd(), "src", "data", "generated", "directories.json");
const unresolvedPath = path.join(process.cwd(), "reports", "directory-coordinate-retry-pass3-report.json");
const directories = JSON.parse(fs.readFileSync(directoriesPath, "utf8"));
const unresolvedReport = JSON.parse(fs.readFileSync(unresolvedPath, "utf8"));
const unresolved = Array.isArray(unresolvedReport.unresolved) ? unresolvedReport.unresolved : [];

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isValidCoordinate(lat, lng) {
  if (lat === null || lng === null) return false;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bst[.]?\b/g, "saint")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameTokens(name) {
  const stop = new Set(["animal", "hospital", "clinic", "veterinary", "services", "service", "pet", "care", "vet", "the", "and"]);
  return normalize(name)
    .split(" ")
    .filter((t) => t && !stop.has(t) && t.length > 2);
}

function stripUnitAndPostal(address) {
  return clean(address)
    .replace(/\b(unit|suite|ste|apt|#)\s*[a-z0-9-]+,?\s*/gi, "")
    .replace(/\b[0-9]+-\s*(?=\d)/g, "")
    .replace(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+,/g, ",");
}

function provinceAliases(value) {
  const key = normalize(value);
  if (key === "on" || key === "ontario") return ["on", "ontario"];
  if (key === "bc" || key === "british columbia") return ["bc", "british columbia"];
  return [key];
}

function provinceName(value) {
  const key = normalize(value);
  if (key === "on" || key === "ontario") return "Ontario";
  if (key === "bc" || key === "british columbia") return "British Columbia";
  return clean(value);
}

function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&addressdetails=1&q=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "leashfree-directory-coordinate-retry-pass4/1.0" } },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              const parsed = JSON.parse(body);
              if (!Array.isArray(parsed) || !parsed.length) return resolve([]);
              const mapped = parsed
                .map((r) => {
                  const lat = parseNumber(r.lat);
                  const lng = parseNumber(r.lon);
                  if (!isValidCoordinate(lat, lng)) return null;
                  return { lat, lng, displayName: clean(r.display_name) };
                })
                .filter(Boolean);
              resolve(mapped);
            } catch {
              resolve([]);
            }
          });
        }
      )
      .on("error", () => resolve([]));
  });
}

function bestCandidate(candidates, entryName, city, province) {
  const nameToks = nameTokens(entryName);
  const cityNorm = normalize(city);
  const provNeedles = provinceAliases(province);
  let best = null;

  for (const c of candidates) {
    const hay = normalize(c.displayName);
    const provOk = provNeedles.some((p) => hay.includes(p));
    if (!provOk) continue;
    const nameHits = nameToks.filter((t) => hay.includes(t)).length;
    const cityHit = cityNorm && hay.includes(cityNorm);
    const score = nameHits * 3 + (cityHit ? 2 : 0);
    if (nameHits < 2) continue;
    if (!best || score > best.score) best = { ...c, score };
  }

  return best;
}

function buildQueries(entry) {
  const raw = entry.raw || {};
  const name = clean(entry.name);
  const city = clean(raw.City);
  const province = provinceName(raw.Province);
  const address = clean(raw["Street Address"]);
  const simpleAddress = stripUnitAndPostal(address);

  const set = new Set([
    [name, address, city, province, "Canada"].filter(Boolean).join(", "),
    [name, simpleAddress, city, province, "Canada"].filter(Boolean).join(", "),
    [name, city, province, "Canada"].filter(Boolean).join(", "),
    [name, city, "Canada"].filter(Boolean).join(", "),
    [address, city, province, "Canada"].filter(Boolean).join(", "),
    [simpleAddress, city, province, "Canada"].filter(Boolean).join(", ")
  ]);
  return [...set].filter(Boolean);
}

let retried = 0;
let fixed = 0;
const stillUnresolved = [];

for (const item of unresolved) {
  const entry = directories.find((d) => d.slug === item.slug);
  if (!entry) continue;
  const raw = entry.raw || {};
  const lat = parseNumber(raw.Latitude);
  const lng = parseNumber(raw.Longitude);
  if (isValidCoordinate(lat, lng)) continue;

  retried += 1;
  const queries = buildQueries(entry);
  const city = clean(raw.City);
  const province = clean(raw.Province);
  let selected = null;
  let usedQuery = "";

  for (const query of queries) {
    const candidates = await geocodeAddress(query);
    await sleep(1100);
    const best = bestCandidate(candidates, entry.name, city, province);
    if (best) {
      selected = best;
      usedQuery = query;
      break;
    }
  }

  if (!selected) {
    stillUnresolved.push(item);
    continue;
  }

  raw.Latitude = String(selected.lat);
  raw.Longitude = String(selected.lng);
  raw["Coordinate Source"] = `nominatim-pass4:${usedQuery}`;
  entry.raw = raw;
  fixed += 1;
}

fs.writeFileSync(directoriesPath, `${JSON.stringify(directories, null, 2)}\n`);

const pass4Report = {
  retried,
  fixed,
  remaining: stillUnresolved.length,
  unresolved: stillUnresolved
};

const pass4Path = path.join(process.cwd(), "reports", "directory-coordinate-retry-pass4-report.json");
fs.writeFileSync(pass4Path, `${JSON.stringify(pass4Report, null, 2)}\n`);

console.log(JSON.stringify(pass4Report, null, 2));
