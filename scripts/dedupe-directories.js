import path from "node:path";
import { GENERATED_DIR, readJson, writeJson } from "./lib.js";

const directoriesPath = path.join(GENERATED_DIR, "directories.json");

const duplicateMap = {
  "animal-hospital-of-milton-e6f9b": "animal-hospital-of-milton",
  "hawkins-animal-hospital-milton": "hawkins-animal-hospital",
  "james-snow-animal-hospital-milton": "james-snow-animal-hospital",
  "thunder-bay-district-humane-society": "ontario-spca-and-humane-society-northwest-animal-centre"
};

const mergeFromDuplicate = new Set([
  "animal-hospital-of-milton-e6f9b",
  "hawkins-animal-hospital-milton",
  "james-snow-animal-hospital-milton"
]);

const metaDescriptionOverrides = {
  "toronto-animal-services-east-shelter":
    "Toronto Animal Services East Shelter in Scarborough provides adoption, pet redemption, surrender support, fostering and stray animal care.",
  "toronto-animal-services-north-shelter":
    "Toronto Animal Services North Shelter in North York provides adoption, pet redemption, surrender support, fostering and stray animal care.",
  "toronto-animal-services-west-shelter":
    "Toronto Animal Services West Shelter in Etobicoke provides adoption, pet redemption, surrender support, fostering and stray animal care."
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeCanonical(canonical, duplicate) {
  const merged = clone(canonical);
  const source = clone(duplicate);
  const canonicalSlug = canonical.slug;
  const canonicalId = canonical.id;
  const canonicalName = canonical.name;

  Object.assign(merged, source, {
    id: canonicalId,
    name: canonicalName,
    slug: canonicalSlug,
    title: source.title || canonical.title,
    canonicalUrl: `https://leashfree.ca/directory/${canonicalSlug}/`,
    routePath: `/directory/${canonicalSlug}/`
  });

  merged.raw = {
    ...source.raw,
    "Item ID": canonicalId,
    "Business Name": canonicalName,
    Slug: canonicalSlug,
    "Canonical URL": `https://leashfree.ca/directory/${canonicalSlug}/`
  };

  return merged;
}

const directories = readJson(directoriesPath);
const bySlug = new Map(directories.map((item) => [item.slug, item]));

for (const [duplicateSlug, canonicalSlug] of Object.entries(duplicateMap)) {
  const canonical = bySlug.get(canonicalSlug);
  const duplicate = bySlug.get(duplicateSlug);

  if (!canonical || !duplicate || !mergeFromDuplicate.has(duplicateSlug)) continue;
  bySlug.set(canonicalSlug, mergeCanonical(canonical, duplicate));
}

const deduped = directories
  .filter((item) => !Object.hasOwn(duplicateMap, item.slug))
  .map((item) => bySlug.get(item.slug) || item)
  .map((item) => {
    const metaDescription = metaDescriptionOverrides[item.slug];
    if (!metaDescription) return item;

    return {
      ...item,
      metaDescription,
      description: metaDescription,
      raw: {
        ...item.raw,
        "Meta Description": metaDescription,
        "Short Description": metaDescription
      }
    };
  });

writeJson(directoriesPath, deduped);

console.log(`Removed ${directories.length - deduped.length} duplicate directory listings.`);
