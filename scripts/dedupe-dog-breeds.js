import path from "node:path";
import { GENERATED_DIR, readJson, writeJson } from "./lib.js";

const dogBreedsPath = path.join(GENERATED_DIR, "dog-breeds.json");

const duplicateMap = {
  "miniature-american-shepherd-2": "miniature-american-shepherd"
};

const dogBreeds = readJson(dogBreedsPath);
const slugs = new Set(dogBreeds.map((item) => item.slug));
const deduped = dogBreeds.filter((item) => {
  const canonicalSlug = duplicateMap[item.slug];
  return !canonicalSlug || !slugs.has(canonicalSlug);
});

writeJson(dogBreedsPath, deduped);

console.log(`Removed ${dogBreeds.length - deduped.length} duplicate dog breed profiles.`);
