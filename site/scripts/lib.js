import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT_DIR = path.resolve(SITE_DIR, "..");
export const GENERATED_DIR = path.join(SITE_DIR, "src", "data", "generated");
export const MEDIA_MAP_PATH = path.join(SITE_DIR, "src", "data", "media-map.json");
export const CMS_SCHEMA_PATH = path.join(ROOT_DIR, "migration-prep", "cms-schema-summary.json");
export const MEDIA_TRACKER_PATH = path.join(ROOT_DIR, "migration-prep", "manual-media-tracker.csv");
export const MEDIA_INVENTORY_PATH = path.join(ROOT_DIR, "migration-prep", "media-inventory.json");
export const ROOT_MEDIA_DIR = path.join(ROOT_DIR, "cms-exports", "CMS Media");
export const EXPORT_MEDIA_DIR = path.join(
  ROOT_DIR,
  "LeashFree-Webflow-Backup-2026-05-26",
  "02-cms-csv-exports",
  "CMS Media"
);

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    const next = clean[index + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        field += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((cell) => cell !== ""));
}

export function rowToObject(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function collectionFileName(collectionName) {
  const explicit = {
    "Blog Categories": "blog-categories.json",
    "Blog Posts": "blog-posts.json",
    "Blog Tags": "blog-tags.json",
    "Breed Groups": "breed-groups.json",
    Categories: "categories.json",
    "City Pages": "cities.json",
    Directories: "directories.json",
    "Dog Breeds": "dog-breeds.json",
    "Dog Parks": "parks.json",
    "Pet Insurance Providers": "pet-insurance-providers.json",
    Provinces: "provinces.json"
  };

  return explicit[collectionName] || `${slugify(collectionName)}.json`;
}

export function collectionRoutePrefix(collectionName) {
  const prefixes = {
    "Blog Categories": "/blog/category/",
    "Blog Posts": "/blog/",
    "Blog Tags": "/blog/tag/",
    "Breed Groups": "/dog-breeds/group/",
    Categories: "/directory/",
    "City Pages": "/dog-parks/",
    Directories: "/directory/",
    "Dog Breeds": "/dog-breeds/",
    "Dog Parks": "/dog-parks/",
    "Pet Insurance Providers": "/dog-insurance-canada/",
    Provinces: "/dog-parks/"
  };

  return prefixes[collectionName] || `/${slugify(collectionName)}/`;
}

export function canonicalFor(collectionName, slug) {
  const prefix = collectionRoutePrefix(collectionName);
  return `https://leashfree.ca${prefix}${slug}/`;
}

export function excerpt(value, fallback = "", maxLength = 180) {
  const text = String(value || fallback || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export function getDescription(raw) {
  return (
    raw["Meta Description"] ||
    raw["Post Summary"] ||
    raw["Intro Paragraph"] ||
    raw["Description"] ||
    raw["Breed Summary"] ||
    raw["Short Description"] ||
    raw["Summary (Intro Copy)"] ||
    raw["Intro Description"] ||
    ""
  );
}

export function getSeoDescription(raw, collectionName, name) {
  const direct = getDescription(raw);
  if (direct) return excerpt(direct);

  const fallbacks = {
    "Pet Insurance Providers": `${name} pet insurance provider information for Canadian dog owners.`,
    Provinces: `Browse dog parks and city dog park guides for ${name}.`,
    "Dog Parks": `${name} dog park information, amenities, location details, and owner review notes.`,
    "City Pages": `Browse off-leash dog parks and dog-friendly information for ${name}.`,
    "Dog Breeds": `${name} dog breed profile, traits, care, training, and health information.`,
    "Blog Posts": `${name} from LeashFree.ca.`,
    Directories: `${name} directory listing on LeashFree.ca.`
  };

  return fallbacks[collectionName] || `${name} on LeashFree.ca.`;
}

export function getBody(raw) {
  return (
    raw["Rich Text Body"] ||
    raw["About Section"] ||
    raw["Long Description"] ||
    raw["Breed History"] ||
    raw["Description"] ||
    raw["FAQ (Group)"] ||
    ""
  );
}

export function referenceFieldNames(collectionName) {
  const fields = {
    "Blog Posts": ["Category", "Blog Tags"],
    "City Pages": ["Province", "Featured Park 1", "Featured Park 2", "Featured Park 3", "Province Page", "Nearby Cities"],
    Directories: ["Category", "Province", "City", "Service Tags"],
    "Dog Breeds": ["Breed Group", "Breed Group Reference", "Tags"],
    "Dog Parks": ["City", "Province", "Tags"],
    "Pet Insurance Providers": ["ProvincesAvailable"]
  };

  return fields[collectionName] || [];
}

export function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFiles(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

export function escapeMd(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
