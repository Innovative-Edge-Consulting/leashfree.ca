import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const directoriesPath = path.join(process.cwd(), "src", "data", "generated", "directories.json");
const retryReportPath = path.join(process.cwd(), "reports", "directory-coordinate-retry-report.json");
const directories = JSON.parse(fs.readFileSync(directoriesPath, "utf8"));
const retryReport = JSON.parse(fs.readFileSync(retryReportPath, "utf8"));
const unresolved = Array.isArray(retryReport.unresolved) ? retryReport.unresolved : [];

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

function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "leashfree-directory-coordinate-retry-pass3/1.0" } },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              const parsed = JSON.parse(body);
              if (!Array.isArray(parsed) || !parsed[0]) return resolve(null);
              const first = parsed[0];
              const lat = parseNumber(first.lat);
              const lng = parseNumber(first.lon);
              if (!isValidCoordinate(lat, lng)) return resolve(null);
              resolve({ lat, lng, displayName: clean(first.display_name) });
            } catch {
              resolve(null);
            }
          });
        }
      )
      .on("error", () => resolve(null));
  });
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

function provinceAliases(value) {
  const key = normalize(value);
  if (key === "on" || key === "ontario") return ["on", "ontario"];
  if (key === "bc" || key === "british columbia") return ["bc", "british columbia"];
  return [key];
}

function cityCandidates(city) {
  const key = normalize(city);
  const aliases = {
    "stoney creek": ["stoney creek", "hamilton"],
    "hannon": ["hannon", "hamilton"],
    orleans: ["orleans", "ottawa"],
    thornhill: ["thornhill", "vaughan", "markham"],
    unionville: ["unionville", "markham"],
    maple: ["maple", "vaughan"],
    clarksburg: ["clarksburg", "the blue mountains"],
    "fort langley": ["fort langley", "langley"],
    "sault ste marie": ["sault ste marie", "sault sainte marie"]
  };
  return aliases[key] || [key];
}

function likelyMatch(displayName, city, province) {
  const hay = normalize(displayName);
  const p = provinceAliases(province);
  const provinceOk = p.some((part) => hay.includes(part));
  if (!provinceOk) return false;
  const cc = cityCandidates(city);
  return cc.some((c) => c && hay.includes(c));
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

function buildQueries(entry) {
  const raw = entry.raw || {};
  const name = clean(entry.name);
  const city = clean(raw.City);
  const province = clean(raw.Province);
  const provinceName = province.toLowerCase() === "bc" ? "British Columbia" : province.toLowerCase() === "on" ? "Ontario" : province;
  const address = clean(raw["Street Address"]);
  const simpleAddress = stripUnitAndPostal(address);

  const set = new Set([
    [name, address, city, provinceName, "Canada"].filter(Boolean).join(", "),
    [name, simpleAddress, city, provinceName, "Canada"].filter(Boolean).join(", "),
    [name, city, provinceName, "Canada"].filter(Boolean).join(", "),
    [name, city, "Canada"].filter(Boolean).join(", "),
    [simpleAddress, city, provinceName, "Canada"].filter(Boolean).join(", "),
    [simpleAddress, city, "Canada"].filter(Boolean).join(", "),
    [address, city, provinceName, "Canada"].filter(Boolean).join(", "),
    [address, provinceName, "Canada"].filter(Boolean).join(", ")
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
  let hit = null;
  let usedQuery = "";

  for (const query of queries) {
    const geocoded = await geocodeAddress(query);
    usedQuery = query;
    await sleep(1100);
    if (geocoded && likelyMatch(geocoded.displayName, city, province)) {
      hit = geocoded;
      break;
    }
  }

  if (!hit) {
    stillUnresolved.push(item);
    continue;
  }

  raw.Latitude = String(hit.lat);
  raw.Longitude = String(hit.lng);
  raw["Coordinate Source"] = `nominatim-pass3:${usedQuery}`;
  entry.raw = raw;
  fixed += 1;
}

fs.writeFileSync(directoriesPath, `${JSON.stringify(directories, null, 2)}\n`);

const pass3Report = {
  retried,
  fixed,
  remaining: stillUnresolved.length,
  unresolved: stillUnresolved
};

const pass3Path = path.join(process.cwd(), "reports", "directory-coordinate-retry-pass3-report.json");
fs.writeFileSync(pass3Path, `${JSON.stringify(pass3Report, null, 2)}\n`);

console.log(JSON.stringify(pass3Report, null, 2));
