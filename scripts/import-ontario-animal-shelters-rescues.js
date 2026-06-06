import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { canonicalFor, readJson, slugify, writeJson } from "./lib.js";

const ROOT = process.cwd();
const DIRECTORIES_PATH = path.join(ROOT, "src", "data", "generated", "directories.json");
const CITIES_PATH = path.join(ROOT, "src", "data", "generated", "cities.json");
const DEFAULT_SOURCE_FILES = [
  "C:/Users/cjame/Downloads/ontario_animal_shelters_rescues_batch_1.json",
  "C:/Users/cjame/Downloads/ontario_animal_shelters_rescues_batch_2.json",
  "C:/Users/cjame/Downloads/ontario_animal_shelters_rescues_batch_3.json"
];
const SOURCE_FILES = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SOURCE_FILES;
const reportSuffix = SOURCE_FILES
  .map((file) => path.basename(file, path.extname(file)).match(/batch_(\d+)/)?.[1] || "")
  .filter(Boolean)
  .join("-");
const REPORT_PATH = path.join(
  ROOT,
  "reports",
  `ontario-animal-shelters-rescues-import${reportSuffix ? `-batches-${reportSuffix}` : ""}-report.json`
);

const directories = readJson(DIRECTORIES_PATH);
const cities = readJson(CITIES_PATH);
const citySlugSet = new Set(cities.map((city) => city.slug).filter(Boolean));
const incoming = SOURCE_FILES.flatMap((file) => readJson(file));

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCoordinate(lat, lng) {
  if (lat === null || lng === null) return false;
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excerpt(value, maxLength = 160) {
  const text = clean(value).replace(/\s+/g, " ");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function titleCaseDay(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function formatHours(hours) {
  if (!hours || typeof hours !== "object") return "";
  const orderedDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const lines = orderedDays
    .filter((day) => clean(hours[day]))
    .map((day) => `${titleCaseDay(day)}: ${clean(hours[day])}`);
  return lines.length ? `<p>${lines.map(escapeHtml).join("<br />")}</p>` : "";
}

function serviceAreaText(serviceAreas) {
  if (!Array.isArray(serviceAreas) || !serviceAreas.length) return "";
  return serviceAreas.map((value) => clean(value)).filter(Boolean).join(", ");
}

function normalizeWebsite(url) {
  const value = clean(url);
  if (!value) return "";
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.hostname.toLowerCase()}${pathname}`;
  } catch {
    return value.toLowerCase().replace(/\/+$/, "");
  }
}

function addressLine(item) {
  return [
    clean(item.address?.street),
    clean(item.address?.city),
    clean(item.address?.province),
    clean(item.address?.postalCode),
    clean(item.address?.country) === "CA" ? "Canada" : clean(item.address?.country)
  ]
    .filter(Boolean)
    .join(", ");
}

function cleanStreetForGeocode(value) {
  return clean(value)
    .replace(/\bc\/o\s+/gi, "")
    .replace(/\bP\.?\s*O\.?\s*Box\s+\w+[, ]*/gi, "")
    .replace(/\bBox\s+\w+[, ]*/gi, "")
    .replace(/\bRR\s*\d+[, ]*/gi, "")
    .replace(/\b(unit|suite|ste)\s+[a-z0-9-]+/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/^,\s*|\s*,\s*$/g, "")
    .trim();
}

function googleMapsLink(item, lat, lng) {
  if (isValidCoordinate(lat, lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const address = addressLine(item);
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";
}

function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "leashfree-ontario-shelter-import/1.0"
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
                type: clean(first.type),
                className: clean(first.class)
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

function cityProvinceMatch(displayName, city, province) {
  const hay = normalize(displayName);
  const cityKey = normalize(city);
  const provinceKey = normalize(province);
  const provinceOk = !provinceKey || hay.includes(provinceKey) || (provinceKey === "on" && hay.includes("ontario"));
  const cityOk = !cityKey || hay.includes(cityKey);
  return cityOk && provinceOk;
}

function nameLikelyMatch(displayName, businessName) {
  const hay = normalize(displayName);
  const name = normalize(businessName);
  if (!name) return false;
  if (hay.includes(name)) return true;
  const parts = name.split(" ").filter((part) => part.length > 2);
  return parts.length >= 2 && parts.every((part) => hay.includes(part));
}

function geocodeQueries(item) {
  const street = clean(item.address?.street);
  const streetClean = cleanStreetForGeocode(street);
  const city = clean(item.address?.city);
  const province = clean(item.address?.province) || "ON";
  const postalCode = clean(item.address?.postalCode);
  const name = clean(item.name);
  const country = "Canada";

  const queries = new Set();

  if (street) {
    queries.add([street, city, province, postalCode, country].filter(Boolean).join(", "));
    queries.add([street, city, province, country].filter(Boolean).join(", "));
    queries.add([name, street, city, province, country].filter(Boolean).join(", "));
    if (streetClean && streetClean !== street) {
      queries.add([streetClean, city, province, postalCode, country].filter(Boolean).join(", "));
      queries.add([streetClean, city, province, country].filter(Boolean).join(", "));
      queries.add([name, streetClean, city, province, country].filter(Boolean).join(", "));
    }
  } else {
    queries.add([name, city, province, postalCode, country].filter(Boolean).join(", "));
    queries.add([name, city, province, country].filter(Boolean).join(", "));
  }

  if (city) {
    queries.add([name, city, province, country].filter(Boolean).join(", "));
  }

  return [...queries].filter(Boolean);
}

async function resolveCoordinates(item, { requireNameMatch = false } = {}) {
  const providedLat = parseNumber(item.location?.latitude);
  const providedLng = parseNumber(item.location?.longitude);
  if (isValidCoordinate(providedLat, providedLng)) {
    return { lat: providedLat, lng: providedLng, source: "source-json" };
  }

  const street = clean(item.address?.street);
  const city = clean(item.address?.city);
  const province = clean(item.address?.province) || "ON";

  for (const query of geocodeQueries(item)) {
    const result = await geocode(query);
    await sleep(1100);
    if (!result) continue;
    if (!cityProvinceMatch(result.displayName, city, province)) continue;
    if (!street && requireNameMatch && !nameLikelyMatch(result.displayName, item.name)) continue;
    return { lat: result.lat, lng: result.lng, source: `nominatim:${query}` };
  }

  return null;
}

function buildBody(item) {
  const description = clean(item.description);
  const serviceAreas = serviceAreaText(item.serviceAreas);
  const attributes = [];

  if (item.attributes?.appointmentRequired === true) attributes.push("Appointments required");
  if (item.attributes?.wheelchairAccessible === true) attributes.push("Wheelchair accessible");
  if (item.attributes?.womenOwned === true) attributes.push("Women owned");

  const parts = [];
  if (description) parts.push(`<p>${escapeHtml(description)}</p>`);
  if (serviceAreas) parts.push(`<p><strong>Service areas:</strong> ${escapeHtml(serviceAreas)}</p>`);
  if (attributes.length) parts.push(`<p><strong>Attributes:</strong> ${escapeHtml(attributes.join(", "))}</p>`);
  return parts.join("");
}

function buildRaw(item, slug, coords) {
  const provinceDisplay = clean(item.address?.province) === "ON" ? "Ontario" : clean(item.address?.province);
  return {
    "Business Name": clean(item.name),
    Slug: slug,
    "Collection ID": "",
    "Locale ID": "",
    "Item ID": `manual-import-${slug}`,
    Archived: "false",
    Draft: "false",
    "Created On": new Date().toISOString(),
    "Updated On": new Date().toISOString(),
    "Published On": "",
    Category: "animal-shelters-and-rescues",
    Province: provinceDisplay,
    City: clean(item.address?.city),
    "Street Address": [
      clean(item.address?.street),
      clean(item.address?.city),
      provinceDisplay,
      clean(item.address?.postalCode)
    ]
      .filter(Boolean)
      .join(", "),
    Latitude: coords?.lat != null ? String(coords.lat) : "",
    Longitude: coords?.lng != null ? String(coords.lng) : "",
    "Primary Website URL": clean(item.contact?.website),
    "Affiliate URL": "",
    Phone: clean(item.contact?.phone),
    Email: clean(item.contact?.email),
    "Instagram URL": clean(item.social?.instagram),
    "Facebook URL": clean(item.social?.facebook),
    "Google Maps Link": googleMapsLink(item, coords?.lat ?? null, coords?.lng ?? null),
    "Short Description": clean(item.description),
    "Long Description": buildBody(item),
    Hours: formatHours(item.hours),
    "Service Tags": serviceAreaText(item.serviceAreas),
    "Featured Image": "",
    Gallery: "",
    "Feature Rank": "0",
    "CTA Label": "Visit Website",
    "SEO Title": `${clean(item.name)} – Animal Shelter & Rescue in ${clean(item.address?.city) || "Ontario"}`,
    "Meta Description": excerpt(clean(item.description) || `${clean(item.name)} animal shelter and rescue listing in Ontario.`),
    "OG Title": "",
    "OG Description": ""
  };
}

function makeReferences(item) {
  const refs = {
    Category: ["animal-shelters-and-rescues"],
    Province: ["on"]
  };
  const citySlug = slugify(clean(item.address?.city));
  if (citySlug && citySlugSet.has(citySlug)) refs.City = [citySlug];
  return refs;
}

function makeRecord(item, slug, coords) {
  const raw = buildRaw(item, slug, coords);
  const description = clean(item.description);
  return {
    id: `manual-import-${slug}`,
    name: clean(item.name),
    slug,
    title: clean(item.name),
    seoTitle: raw["SEO Title"],
    metaDescription: raw["Meta Description"],
    description,
    body: raw["Long Description"],
    collection: "Directories",
    sourceFile: SOURCE_FILES.map((file) => path.basename(file)).join(", "),
    canonicalUrl: canonicalFor("Directories", slug),
    routePath: new URL(canonicalFor("Directories", slug)).pathname,
    media: [],
    references: makeReferences(item),
    raw,
    warnings: coords ? [] : ["Missing coordinates after geocoding."]
  };
}

const existingBySlug = new Map(directories.map((item) => [item.slug, item]));
const existingByName = new Map(directories.map((item) => [normalize(item.name), item]));
const existingByAddress = new Map(
  directories
    .map((item) => [
      normalize(
        [item.raw?.["Street Address"], item.raw?.City, item.raw?.Province]
          .filter(Boolean)
          .join(", ")
      ),
      item
    ])
    .filter(([address]) => address)
);

const report = {
  sourceFiles: SOURCE_FILES,
  incomingCount: incoming.length,
  duplicatesSkipped: [],
  existingUpdated: [],
  added: [],
  unresolvedCoordinates: []
};

const pendingAdditions = [];

for (const item of incoming) {
  const websiteKey = normalizeWebsite(item.contact?.website);
  const addressKey = normalize(
    [item.address?.street, item.address?.city, item.address?.province, item.address?.postalCode]
      .filter(Boolean)
      .join(", ")
  );
  const existing =
    existingByName.get(normalize(item.name)) ||
    (!clean(item.address?.street) && websiteKey
      ? directories.find(
          (record) =>
            normalize(item.name) === normalize(record.name) &&
            websiteKey === normalizeWebsite(record.raw?.["Primary Website URL"])
        ) || null
      : null) ||
    (addressKey ? existingByAddress.get(addressKey) : null);

  if (existing) {
    report.duplicatesSkipped.push({ name: item.name, slug: existing.slug });

    const hasCoords = isValidCoordinate(parseNumber(existing.raw?.Latitude), parseNumber(existing.raw?.Longitude));
    if (!hasCoords) {
      pendingAdditions.push({ kind: "update-existing", item, existing });
    }
    continue;
  }

  let slug = slugify(item.name);
  const citySlug = slugify(clean(item.address?.city));
  if (existingBySlug.has(slug)) slug = citySlug ? `${slug}-${citySlug}` : `${slug}-on`;
  let suffix = 2;
  while (existingBySlug.has(slug)) {
    slug = citySlug ? `${slugify(item.name)}-${citySlug}-${suffix}` : `${slugify(item.name)}-on-${suffix}`;
    suffix += 1;
  }

  pendingAdditions.push({ kind: "add", item, slug });
  existingBySlug.set(slug, true);
}

for (const entry of pendingAdditions) {
  const requireNameMatch = !clean(entry.item.address?.street);
  const coords = await resolveCoordinates(entry.item, { requireNameMatch });

  if (entry.kind === "update-existing") {
    if (coords) {
      entry.existing.raw.Latitude = String(coords.lat);
      entry.existing.raw.Longitude = String(coords.lng);
      entry.existing.raw["Coordinate Source"] = coords.source;
      report.existingUpdated.push({ name: entry.existing.name, slug: entry.existing.slug, source: coords.source });
    } else {
      report.unresolvedCoordinates.push({ name: entry.existing.name, slug: entry.existing.slug, kind: "existing" });
    }
    continue;
  }

  const record = makeRecord(entry.item, entry.slug, coords);
  if (coords) {
    record.raw["Coordinate Source"] = coords.source;
  } else {
    report.unresolvedCoordinates.push({ name: record.name, slug: record.slug, kind: "new" });
  }

  directories.push(record);
  report.added.push({ name: record.name, slug: record.slug, hasCoordinates: Boolean(coords) });
}

directories.sort((left, right) => left.name.localeCompare(right.name));

writeJson(DIRECTORIES_PATH, directories);

report.finalDirectoryCount = directories.length;
report.addedCount = report.added.length;
report.updatedCount = report.existingUpdated.length;
report.unresolvedCount = report.unresolvedCoordinates.length;

writeJson(REPORT_PATH, report);

console.log(JSON.stringify(report, null, 2));
