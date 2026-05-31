import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const directoriesPath = path.join(process.cwd(), "src", "data", "generated", "directories.json");
const reportPath = path.join(process.cwd(), "reports", "directory-coordinate-fix-report.json");
const directories = JSON.parse(fs.readFileSync(directoriesPath, "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const unresolved = Array.isArray(report.unresolved) ? report.unresolved : [];

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
        { headers: { "User-Agent": "leashfree-directory-coordinate-retry/1.0" } },
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

function normalizeCity(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bst[.]?\b/g, "saint")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function provinceAliases(value) {
  const key = clean(value).toLowerCase();
  const aliases = {
    on: ["on", "ontario"],
    bc: ["bc", "british columbia"]
  };
  return aliases[key] || [key];
}

function resultLikelyMatch(displayName, city, province) {
  const hay = normalizeCity(displayName);
  const cityNeedle = normalizeCity(city);
  const provinceNeedles = provinceAliases(province);
  const provinceOk = !province || provinceNeedles.some((p) => hay.includes(p));
  if (!provinceOk) return false;
  if (!cityNeedle) return true;
  if (hay.includes(cityNeedle)) return true;
  const parts = cityNeedle.split(" ").filter(Boolean);
  return parts.length > 1 && parts.every((p) => hay.includes(p));
}

function stripUnit(address) {
  return clean(address)
    .replace(/\b(unit|suite|ste|apt|#)\s*[a-z0-9-]+,?\s*/gi, "")
    .replace(/\b[0-9]+-\s*(?=\d)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+,/g, ",");
}

function queryVariants(address, city, province, postalCode) {
  const provinceName = province.toLowerCase() === "bc" ? "British Columbia" : province.toLowerCase() === "on" ? "Ontario" : province;
  const a = clean(address);
  const a2 = stripUnit(a);
  const c = clean(city);
  const p = clean(postalCode);

  const set = new Set([
    [a, c, provinceName, p, "Canada"].filter(Boolean).join(", "),
    [a2, c, provinceName, p, "Canada"].filter(Boolean).join(", "),
    [a, c, provinceName, "Canada"].filter(Boolean).join(", "),
    [a2, c, provinceName, "Canada"].filter(Boolean).join(", "),
    [a, c, "Canada"].filter(Boolean).join(", "),
    [a2, c, "Canada"].filter(Boolean).join(", "),
    [a, provinceName, "Canada"].filter(Boolean).join(", "),
    [a2, provinceName, "Canada"].filter(Boolean).join(", "),
    [a, "Canada"].filter(Boolean).join(", "),
    [a2, "Canada"].filter(Boolean).join(", ")
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
  const city = clean(raw.City);
  const province = clean(raw.Province);
  const address = clean(raw["Street Address"]);
  const postalCodeMatch = address.match(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i);
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : "";
  const queries = queryVariants(address, city, province, postalCode);

  let hit = null;
  let usedQuery = "";
  for (const query of queries) {
    const geocoded = await geocodeAddress(query);
    usedQuery = query;
    await sleep(1100);
    if (geocoded && resultLikelyMatch(geocoded.displayName, city, province)) {
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
  raw["Coordinate Source"] = `nominatim-retry:${usedQuery}`;
  entry.raw = raw;
  fixed += 1;
}

fs.writeFileSync(directoriesPath, `${JSON.stringify(directories, null, 2)}\n`);

const retryReport = {
  retried,
  fixed,
  remaining: stillUnresolved.length,
  unresolved: stillUnresolved
};

const retryReportPath = path.join(process.cwd(), "reports", "directory-coordinate-retry-report.json");
fs.writeFileSync(retryReportPath, `${JSON.stringify(retryReport, null, 2)}\n`);

console.log(JSON.stringify(retryReport, null, 2));
