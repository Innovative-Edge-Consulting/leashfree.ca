import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const filePath = path.join(process.cwd(), "src", "data", "generated", "parks.json");
const parks = JSON.parse(fs.readFileSync(filePath, "utf8"));

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

function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "leashfree-coordinate-fix/1.0"
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cityProvinceLikelyMatch(result, city, province) {
  const hay = clean(result?.displayName).toLowerCase();
  const cityNeedle = clean(city).toLowerCase();
  const provinceNeedle = clean(province).toLowerCase();
  const provinceAliases = {
    ab: ["ab", "alberta"],
    bc: ["bc", "british columbia"],
    mb: ["mb", "manitoba"],
    nb: ["nb", "new brunswick"],
    nl: ["nl", "newfoundland and labrador"],
    ns: ["ns", "nova scotia"],
    nt: ["nt", "northwest territories"],
    nu: ["nu", "nunavut"],
    on: ["on", "ontario"],
    pe: ["pe", "prince edward island"],
    qc: ["qc", "quebec"],
    sk: ["sk", "saskatchewan"],
    yt: ["yt", "yukon"]
  };
  const provinceCandidates = provinceAliases[provinceNeedle] || [provinceNeedle];
  const provinceOk = !provinceNeedle || provinceCandidates.some((part) => hay.includes(part));
  const cityOk = !cityNeedle || hay.includes(cityNeedle);
  return cityOk && provinceOk;
}

function queryVariants(address, city, province) {
  const normalizedAddress = clean(address)
    .replace(/\bVancouve\b/gi, "Vancouver")
    .replace(/\bVanco\b/gi, "Vancouver")
    .replace(/\s+/g, " ")
    .trim();

  const variants = new Set([
    [normalizedAddress, city, province, "Canada"].filter(Boolean).join(", "),
    [normalizedAddress, city, "Canada"].filter(Boolean).join(", "),
    [normalizedAddress, province, "Canada"].filter(Boolean).join(", "),
    [normalizedAddress, "Canada"].filter(Boolean).join(", "),
    [normalizedAddress.replace(/\s*&\s*/g, " and "), city, province, "Canada"].filter(Boolean).join(", "),
    [normalizedAddress.replace(/\s*&\s*/g, " and "), city, "Canada"].filter(Boolean).join(", ")
  ]);

  return [...variants].filter(Boolean);
}

const unresolved = [];
let alreadyValid = 0;
let fixedFromGoogleUrl = 0;
let fixedFromGeocode = 0;

for (const park of parks) {
  const raw = park.raw || {};
  const currentLat = parseNumber(raw.latitude);
  const currentLng = parseNumber(raw.longitude);
  if (isValidCoordinate(currentLat, currentLng)) {
    alreadyValid += 1;
    continue;
  }

  const mapsUrl = clean(raw["Google Maps Link"] || raw["Google Maps link"] || raw["Map Link"]);
  const fromMapsUrl = extractCoordsFromGoogleMapsUrl(mapsUrl);
  if (fromMapsUrl) {
    raw.latitude = String(fromMapsUrl.lat);
    raw.longitude = String(fromMapsUrl.lng);
    park.latitude = fromMapsUrl.lat;
    park.longitude = fromMapsUrl.lng;
    park.raw = raw;
    fixedFromGoogleUrl += 1;
    continue;
  }

  const address = clean(raw["Street Address"]);
  const city = clean(raw.City);
  const province = clean(raw.Province);
  const queries = queryVariants(address, city, province);

  if (!queries.length) {
    unresolved.push({
      slug: park.slug,
      name: park.name,
      reason: "missing address query"
    });
    continue;
  }

  let geocoded = null;
  let usedQuery = "";
  for (const query of queries) {
    geocoded = await geocodeAddress(query);
    usedQuery = query;
    await sleep(250);
    if (geocoded && cityProvinceLikelyMatch(geocoded, city, province)) break;
    geocoded = null;
  }

  if (!geocoded) {
    unresolved.push({
      slug: park.slug,
      name: park.name,
      reason: "geocode no result",
      query: queries[0]
    });
    continue;
  }

  raw.latitude = String(geocoded.lat);
  raw.longitude = String(geocoded.lng);
  park.latitude = geocoded.lat;
  park.longitude = geocoded.lng;
  park.raw = raw;
  raw["Coordinate Source"] = `${geocoded.source}:${usedQuery}`;
  fixedFromGeocode += 1;
}

fs.writeFileSync(filePath, `${JSON.stringify(parks, null, 2)}\n`);

const report = {
  total: parks.length,
  alreadyValid,
  fixedFromGoogleUrl,
  fixedFromGeocode,
  unresolvedCount: unresolved.length,
  unresolved
};

const reportPath = path.join(process.cwd(), "reports", "park-coordinate-fix-report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
