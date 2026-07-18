import posts from "../data/blog-posts.js";
import breeds from "../data/generated/dog-breeds.json";
import groups from "../data/generated/breed-groups.json";
import parks from "../data/generated/parks.json";
import cities from "../data/generated/cities.json";
import provinces from "../data/generated/provinces.json";
import directories from "../data/generated/directories.json";
import dogNames from "../data/generated/dog-names.json";
import manualDogNameGuides from "../data/manual-dog-name-guides.json";
import insuranceProviders from "../data/generated/pet-insurance-providers.json";
import { cleanText, isPublishedNow } from "./content.js";
import { withoutRedirectedRecords } from "./redirects.js";

const corePages = [
  ["Find dog parks and pet resources across Canada", "/", "Explore parks, breeds, dog names, services, calculators, and practical dog care guidance.", "Tools"],
  ["Dog Parks in Canada", "/dog-parks/", "Search leash-free and off-leash dog parks by city, province, address, and amenity.", "Parks"],
  ["Dog Breeds", "/dog-breeds/", "Compare dog breed size, temperament, activity level, care needs, and household fit.", "Breeds"],
  ["Dog Names", "/dog-names/", "Browse dog name ideas by breed, style, meaning, and theme.", "Dog names"],
  ["Dog Name Finder", "/dog-name-finder/", "Get personalized dog name ideas for your puppy.", "Tools"],
  ["Dog Services Directory", "/directory/", "Find veterinarians, rescues, shelters, groomers, trainers, and other Canadian dog services.", "Services"],
  ["Dog Care Guides", "/blog/", "Practical guidance about dog health, behaviour, training, feeding, safety, and care.", "Guides"],
  ["Dog Owner Resources", "/resources/", "Calculators, quizzes, finders, comparisons, and planning tools for Canadian dog owners.", "Tools"],
  ["Dog Breed Match Quiz", "/resources/dog-breed-match-quiz/", "Find breeds that may fit your home, schedule, activity level, and preferences.", "Tools"],
  ["Dog Calorie Calculator", "/resources/dog-calorie-calculator/", "Estimate your dog's daily calorie needs using weight, age, and activity level.", "Tools"],
  ["Dog Cost Calculator Canada", "/resources/dog-cost-calculator-canada/", "Estimate the monthly and annual cost of owning a dog in Canada.", "Tools"],
  ["Dog Food Comparison Canada", "/dog-food-comparison-canada/", "Compare Canadian dog food products, nutrition, ingredients, and estimated feeding cost.", "Tools"],
  ["Dog Gear Finder", "/resources/dog-gear-finder/", "Find practical dog gear for walking, travel, play, and safety.", "Tools"],
  ["Dog Breed Guessing Game", "/games/dog-breed-guessing-game/", "Test your dog breed knowledge with a visual guessing game.", "Tools"],
  ["Pet Insurance in Canada", "/dog-insurance-canada/", "Compare pet insurance providers, coverage, deductibles, and plan details.", "Tools"]
];

const clean = (value) => cleanText(String(value || "")).replace(/\s+/g, " ").trim();

function keywordSummary(item) {
  const ignored = /^(collection|locale|item|created|updated|published|archived|draft|slug|source)/i;
  const source = [item.body, ...Object.entries(item.raw || {}).filter(([key]) => !ignored.test(key)).map(([, value]) => value)].join(" ");
  const words = clean(source).toLowerCase().match(/[a-z0-9][a-z0-9'&-]*/g) || [];
  return [...new Set(words)].slice(0, 280).join(" ");
}

function record(item, type) {
  const title = clean(item.title || item.name || item.raw?.["Park Header"] || item.raw?.["H1 Header"]);
  const description = clean(item.description || item.metaDescription || item.raw?.["Breed Summary"] || item.raw?.["Summary (Intro Copy)"]).slice(0, 240);
  const url = String(item.routePath || item.canonicalUrl || "").replace(/^https?:\/\/[^/]+/i, "");
  if (!title || !url) return null;
  return { title, url, description, type, keywords: keywordSummary(item) };
}

function records(items, type) {
  return items.map((item) => record(item, type)).filter(Boolean);
}

export function createSearchIndex() {
  const index = [
    ...corePages.map(([title, url, description, type]) => ({ title, url, description, type, keywords: `${title} ${description}`.toLowerCase() })),
    ...records(posts.filter((post) => isPublishedNow(post)), "Guides"),
    ...records(breeds, "Breeds"),
    ...records(groups, "Breeds"),
    ...records(withoutRedirectedRecords(parks), "Parks"),
    ...records(cities, "Locations"),
    ...records(provinces, "Locations"),
    ...records(directories, "Services"),
    ...records([...manualDogNameGuides, ...dogNames], "Dog names"),
    ...records(insuranceProviders, "Services")
  ];

  const unique = new Map();
  for (const item of index) {
    if (!unique.has(item.url)) unique.set(item.url, item);
  }
  return [...unique.values()];
}
