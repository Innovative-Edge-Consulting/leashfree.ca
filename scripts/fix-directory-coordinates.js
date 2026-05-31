import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const filePath = path.join(process.cwd(), "src", "data", "generated", "directories.json");
const directories = JSON.parse(fs.readFileSync(filePath, "utf8"));

const processAll = process.env.ALL_DIRECTORIES === "1";
const targets = processAll ? directories : directories.filter((d) => String(d.id || "").startsWith("starter-"));

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

function extractCoordsFromGoogleMapsUrl(url) {
  if (!url) return null;

  let match = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (match) {
    const lat = parseNumber(match[1]);
    const lng = parseNumber(match[2]);
    if (isValidCoordinate(lat, lng)) return { lat, lng, source: "google_maps_link_3d4d" };
  }

  match = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),/);
  if (match) {
    const lat = parseNumber(match[1]);
    const lng = parseNumber(match[2]);
    if (isValidCoordinate(lat, lng)) return { lat, lng, source: "google_maps_link_at" };
  }

  return null;
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
        {
          headers: {
            "User-Agent": "leashfree-directory-coordinate-fix/1.0"
          }
        },
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
              resolve({
                lat,
                lng,
                displayName: clean(first.display_name),
                source: "nominatim"
              });
            } catch {
              resolve(null);
            }
          });
        }
      )
      .on("error", () => resolve(null));
  });
}

function provinceAliases(value) {
  const key = clean(value).toLowerCase();
  const aliases = {
    on: ["on", "ontario"],
    bc: ["bc", "british columbia"],
    ab: ["ab", "alberta"],
    qc: ["qc", "quebec", "québec"],
    mb: ["mb", "manitoba"],
    sk: ["sk", "saskatchewan"],
    ns: ["ns", "nova scotia"],
    nb: ["nb", "new brunswick"],
    nl: ["nl", "newfoundland and labrador"],
    pe: ["pe", "prince edward island"],
    yt: ["yt", "yukon"],
    nt: ["nt", "northwest territories"],
    nu: ["nu", "nunavut"]
  };
  return aliases[key] || [key];
}

function cityProvinceLikelyMatch(result, city, province) {
  const hay = clean(result?.displayName).toLowerCase();
  const cityNeedle = clean(city).toLowerCase();
  const provinceCandidates = provinceAliases(province);
  const provinceOk = !province || provinceCandidates.some((part) => hay.includes(part));
  const cityOk = !cityNeedle || hay.includes(cityNeedle);
  return cityOk && provinceOk;
}

function queryVariants(address, city, province) {
  const a = clean(address).replace(/\s+/g, " ").trim();
  const c = clean(city);
  const p = clean(province);
  const provinceName = p.toLowerCase() === "bc" ? "British Columbia" : p.toLowerCase() === "on" ? "Ontario" : p;
  const normalized = a.replace(/\s*&\s*/g, " and ");

  const variants = new Set([
    [a, c, provinceName, "Canada"].filter(Boolean).join(", "),
    [a, c, p, "Canada"].filter(Boolean).join(", "),
    [a, c, "Canada"].filter(Boolean).join(", "),
    [a, provinceName, "Canada"].filter(Boolean).join(", "),
    [a, "Canada"].filter(Boolean).join(", "),
    [normalized, c, provinceName, "Canada"].filter(Boolean).join(", "),
    [normalized, c, "Canada"].filter(Boolean).join(", ")
  ]);

  return [...variants].filter(Boolean);
}

let alreadyValid = 0;
let fixedFromGoogleUrl = 0;
let fixedFromGeocode = 0;
const unresolved = [];
let processed = 0;

for (const entry of targets) {
  processed += 1;
  const raw = entry.raw || {};
  const lat = parseNumber(raw.Latitude);
  const lng = parseNumber(raw.Longitude);

  if (isValidCoordinate(lat, lng)) {
    alreadyValid += 1;
    continue;
  }

  const mapsUrl = clean(raw["Google Maps Link"]);
  const fromMapsUrl = extractCoordsFromGoogleMapsUrl(mapsUrl);
  if (fromMapsUrl) {
    raw.Latitude = String(fromMapsUrl.lat);
    raw.Longitude = String(fromMapsUrl.lng);
    raw["Coordinate Source"] = fromMapsUrl.source;
    entry.raw = raw;
    fixedFromGoogleUrl += 1;
    continue;
  }

  const address = clean(raw["Street Address"]);
  const city = clean(raw.City);
  const province = clean(raw.Province);
  const queries = queryVariants(address, city, province);

  if (!queries.length) {
    unresolved.push({ slug: entry.slug, name: entry.name, reason: "missing address query" });
    continue;
  }

  let geocoded = null;
  let usedQuery = "";
  for (const query of queries) {
    geocoded = await geocodeAddress(query);
    usedQuery = query;
    await sleep(1100);
    if (geocoded && cityProvinceLikelyMatch(geocoded, city, province)) break;
    geocoded = null;
  }

  if (!geocoded) {
    unresolved.push({ slug: entry.slug, name: entry.name, reason: "geocode no result", query: queries[0] });
    continue;
  }

  raw.Latitude = String(geocoded.lat);
  raw.Longitude = String(geocoded.lng);
  raw["Coordinate Source"] = `${geocoded.source}:${usedQuery}`;
  entry.raw = raw;
  fixedFromGeocode += 1;

  if (processed % 25 === 0) {
    fs.writeFileSync(filePath, `${JSON.stringify(directories, null, 2)}\n`);
  }
}

fs.writeFileSync(filePath, `${JSON.stringify(directories, null, 2)}\n`);

const report = {
  totalDirectories: directories.length,
  processedTargets: targets.length,
  alreadyValid,
  fixedFromGoogleUrl,
  fixedFromGeocode,
  unresolvedCount: unresolved.length,
  unresolved
};

const reportPath = path.join(process.cwd(), "reports", "directory-coordinate-fix-report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
