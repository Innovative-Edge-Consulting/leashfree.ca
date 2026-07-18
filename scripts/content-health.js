import fs from "node:fs";
import path from "node:path";
import { GENERATED_DIR, SITE_DIR, ensureDir, escapeMd, readJson } from "./lib.js";

const SITE_URL = "https://leashfree.ca";
const DIST_DIR = path.join(SITE_DIR, "dist");
const PUBLIC_DIR = path.join(SITE_DIR, "public");
const REPORTS_DIR = path.join(SITE_DIR, "reports");
const now = new Date();
const reportWriteWarnings = [];

function mergeManualPosts(generatedPosts, ...manualSources) {
  const manualPosts = manualSources.flat();
  const manualSlugs = new Set(manualPosts.map((post) => post.slug).filter(Boolean));
  return [
    ...manualPosts.filter((post, index) =>
      manualPosts.findIndex((candidate) => candidate.slug === post.slug) === index),
    ...generatedPosts.filter((post) => !manualSlugs.has(post.slug))
  ];
}

const data = {
  posts: mergeManualPosts(
    readJson(path.join(GENERATED_DIR, "blog-posts.json")),
    readJson(path.join(SITE_DIR, "src", "data", "current-blog-posts.json")),
    readJson(path.join(SITE_DIR, "src", "data", "cloudflare-recovered-blog-posts.json")),
    readJson(path.join(SITE_DIR, "src", "data", "manual-blog-posts.json"))
  ),
  breeds: readJson(path.join(GENERATED_DIR, "dog-breeds.json")),
  groups: readJson(path.join(GENERATED_DIR, "breed-groups.json")),
  parks: readJson(path.join(GENERATED_DIR, "parks.json")),
  cities: readJson(path.join(GENERATED_DIR, "cities.json")),
  provinces: readJson(path.join(GENERATED_DIR, "provinces.json")),
  directories: readJson(path.join(GENERATED_DIR, "directories.json")),
  dogNames: readJson(path.join(GENERATED_DIR, "dog-names.json"))
};
const implementedRedirectRecords = readJson(path.join(GENERATED_DIR, "implemented-redirects.json"));
const implementedRedirectSourceRoutes = new Set(implementedRedirectRecords.map((item) => normalizeRoutePath(item.sourceRoute)));

const cityByName = new Map(data.cities.map((item) => [normalize(item.name), item]));
const provinceByName = new Map(data.provinces.map((item) => [normalize(item.name), item]));
const parksByCity = data.parks.reduce((acc, item) => {
  const key = normalize(item.raw?.City);
  if (!key) return acc;
  if (!acc.has(key)) acc.set(key, []);
  acc.get(key).push(item);
  return acc;
}, new Map());

const sectionConfigs = [
  {
    section: "core",
    label: "Core",
    riskLevel: "High",
    sectionWeight: 20,
    staleAfterDays: 180,
    thinWordThreshold: 250,
    entries: [
      corePage("/", "Home"),
      corePage("/dog-parks/", "Dog Parks"),
      corePage("/dog-breeds/", "Dog Breeds"),
      corePage("/dog-names/", "Dog Names"),
      corePage("/dog-name-finder/", "Dog Name Finder"),
      corePage("/resources/", "Resources"),
      corePage("/resources/dog-calorie-calculator/", "Dog Calorie Calculator"),
      corePage("/resources/dog-gear-finder/", "Dog Gear Finder"),
      corePage("/blog/", "Blog"),
      corePage("/directory/", "Directory")
    ]
  },
  {
    section: "dog-parks",
    label: "Dog Parks",
    riskLevel: "Very high",
    sectionWeight: 20,
    staleAfterDays: 180,
    thinWordThreshold: 180,
    entries: data.parks.map((record) => recordPage(record))
  },
  {
    section: "dog-park-locations",
    label: "Dog Park Locations",
    riskLevel: "High",
    sectionWeight: 18,
    staleAfterDays: 90,
    thinWordThreshold: 450,
    entries: [...data.provinces, ...data.cities].map((record) => recordPage(record))
  },
  {
    section: "directory",
    label: "Directory",
    riskLevel: "Medium-high",
    sectionWeight: 14,
    staleAfterDays: 180,
    thinWordThreshold: 120,
    entries: data.directories.map((record) => recordPage(record))
  },
  {
    section: "blog",
    label: "Blog",
    riskLevel: "Medium",
    sectionWeight: 10,
    staleAfterDays: 365,
    thinWordThreshold: 700,
    entries: data.posts.map((record) => recordPage(record))
  },
  {
    section: "dog-breeds",
    label: "Dog Breeds",
    riskLevel: "Medium-low",
    sectionWeight: 8,
    staleAfterDays: 365,
    thinWordThreshold: 600,
    entries: [...data.breeds, ...data.groups].map((record) => recordPage(record))
  },
  {
    section: "dog-names",
    label: "Dog Names",
    riskLevel: "Low",
    sectionWeight: 4,
    staleAfterDays: 365,
    thinWordThreshold: 500,
    entries: data.dogNames.map((record) => recordPage(record))
  }
];

function corePage(routePath, name) {
  return {
    record: null,
    name,
    routePath,
    canonicalUrl: `${SITE_URL}${routePath}`,
    contentType: "Core"
  };
}

function recordPage(record) {
  return {
    record,
    name: record.name,
    routePath: record.routePath,
    canonicalUrl: record.canonicalUrl || `${SITE_URL}${record.routePath}`,
    contentType: record.collection
  };
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeRoutePath(routePath) {
  if (!routePath) return "";
  const clean = String(routePath).split("#")[0].split("?")[0];
  if (clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = stripHtml(value);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function daysSince(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
}

function firstRawDate(raw, fields) {
  for (const field of fields) {
    const date = dateOnly(raw?.[field]);
    if (date) return date;
  }
  return "";
}

function distFileForRoute(routePath) {
  if (!routePath) return "";
  if (routePath === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, routePath.replace(/^\//, "").replace(/\/$/, ""), "index.html");
}

function renderedHtml(routePath) {
  const file = distFileForRoute(routePath);
  if (!file || !fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function firstMatch(html, pattern) {
  return stripHtml(html.match(pattern)?.[1] || "");
}

function linkHrefs(html) {
  const hrefs = [];
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const attr = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    if (attr) hrefs.push(attr[2]);
  }
  return hrefs;
}

function contentText(entry, html) {
  const { record } = entry;
  if (!record) {
    return stripHtml(html.replace(/<nav[\s\S]*?<\/nav>/gi, " ").replace(/<footer[\s\S]*?<\/footer>/gi, " "));
  }

  const raw = record.raw || {};
  const fields = [
    record.title,
    record.metaDescription,
    record.description,
    record.body,
    raw["Intro Paragraph"],
    raw["About Section"],
    raw["Rich Text Body"],
    raw["Long Description"],
    raw["Breed Summary"],
    raw["Breed History"],
    raw["Physical Characteristics"],
    raw.Grooming,
    raw["Exercise Needs"],
    raw["Training Tips"],
    raw["Nutrition & Diet"],
    raw["Health Concerns"],
    raw["Adoption & Breeders"],
    raw.FAQs,
    raw["Park Rules"],
    raw["Seasonal Tips"],
    raw["Dog Park FAQs"],
    raw["Notes / Comments"]
  ];

  return stripHtml(fields.filter(Boolean).join(" "));
}

function sourceUrl(entry) {
  const raw = entry.record?.raw || {};
  return (
    raw["Park Website or Source"] ||
    raw["City Website"] ||
    raw["Primary Website URL"] ||
    raw["Google Maps Link"] ||
    ""
  );
}

function requiredParkMissing(record) {
  const raw = record.raw || {};
  const required = {
    name: record.name,
    slug: record.slug,
    parkHeader: raw["Park Header"] || record.title,
    city: raw.City,
    province: raw.Province,
    addressOrLocation: raw["Street Address"] || raw["Notes / Comments"] || record.description,
    latitude: raw.latitude,
    longitude: raw.longitude,
    officialSource: raw["Park Website or Source"] || raw["Google Maps Link"],
    parkType: raw["Park type"],
    fenced: raw.Fenced,
    smallDogArea: raw["Separate Small Dog Area"],
    surface: raw["Surface type"],
    parking: raw["Parking Available"],
    water: raw["Water source available"],
    shade: raw["Shaded area"],
    rules: raw["Park Rules"] || raw["Notes / Comments"],
    reviewedOn: raw["Reviewed On"] || raw["Last Reviewed On"] || raw["Review Date"] || raw["Last Review Date"],
    updatedOn: raw["Updated On"]
  };
  return Object.entries(required)
    .filter(([, value]) => !String(value || "").trim())
    .map(([field]) => field);
}

function requiredLocationMissing(record) {
  const raw = record.raw || {};
  const required = {
    seoIntro: raw["Intro Paragraph"] || record.description,
    about: raw["About Section"] || record.body,
    rules: raw["Park Rules"],
    seasonalTips: raw["Seasonal Tips"],
    etiquette: raw["Dog Park Etiquettes"],
    officialSource: raw["City Website"],
    faq: raw["Dog Park FAQs"],
    reviewedOn: raw["Reviewed On"] || raw["Last Reviewed On"] || raw["Review Date"] || raw["Last Review Date"],
    updatedOn: raw["Updated On"]
  };
  return Object.entries(required)
    .filter(([, value]) => !String(value || "").trim())
    .map(([field]) => field);
}

function internalLinkIssues(entry, html) {
  const links = linkHrefs(html).filter((href) => href.startsWith("/") && !href.startsWith("//"));
  const missing = [];
  const { record } = entry;

  if (record?.collection === "Dog Parks") {
    const city = cityByName.get(normalize(record.raw?.City));
    const province = provinceByName.get(normalize(record.raw?.Province));
    if (city && !links.includes(city.routePath)) missing.push("city page");
    if (province && !links.includes(province.routePath)) missing.push("province page");
  }

  if (record?.collection === "City Pages") {
    const cityParks = parksByCity.get(normalize(record.name)) || [];
    if (cityParks.length && !links.some((href) => cityParks.some((park) => href === park.routePath))) {
      missing.push("park links");
    }
  }

  return { count: links.length, missing };
}

function pageDates(record) {
  const raw = record?.raw || {};
  return {
    createdOn: firstRawDate(raw, ["Created On"]),
    publishedOn: firstRawDate(raw, ["Published On"]),
    reviewedOn: firstRawDate(raw, ["Reviewed On", "Last Reviewed On", "Review Date", "Last Review Date"]),
    updatedOn: firstRawDate(raw, ["Updated On"]),
    lastmod: firstRawDate(raw, ["Updated On"])
  };
}

function profileChecks(entry, html, internalLinks) {
  const { record } = entry;
  if (record?.collection === "Dog Parks") {
    const missingFields = requiredParkMissing(record);
    return {
      qualityProfile: "dog-park",
      applicableChecks: [
        "name",
        "slug",
        "parkHeader",
        "city",
        "province",
        "addressOrLocation",
        "latitude",
        "longitude",
        "officialSource",
        "parkType",
        "fenced",
        "smallDogArea",
        "surface",
        "parking",
        "water",
        "shade",
        "rules",
        "reviewedOn",
        "updatedOn"
      ],
      passedChecks: 19 - missingFields.length,
      missingFields
    };
  }

  if (record?.collection === "City Pages") {
    const missingFields = requiredLocationMissing(record);
    const cityParkCount = parksByCity.get(normalize(record.name))?.length || 0;
    const missingRenderedBlocks = [
      cityParkCount === 0 ? "parkListingGrid" : "",
      internalLinks.missing.includes("park links") ? "parkListingLinks" : "",
      internalLinks.count < 5 ? "nearbyCityInternalLinks" : ""
    ].filter(Boolean);
    return {
      qualityProfile: "city-location",
      applicableChecks: [
        "seoIntro",
        "about",
        "rules",
        "seasonalTips",
        "etiquette",
        "officialSource",
        "nearbyCityInternalLinks",
        "faq",
        "parkListingGrid",
        "reviewedOn",
        "updatedOn"
      ],
      passedChecks: 11 - missingFields.length - missingRenderedBlocks.length,
      missingFields: [...missingFields, ...missingRenderedBlocks]
    };
  }

  return {
    qualityProfile: "general",
    applicableChecks: ["title", "metaDescription", "updatedOn", "renderedPage"],
    passedChecks: [
      entry.record?.seoTitle || entry.record?.title || firstMatch(html, /<title>([\s\S]*?)<\/title>/i),
      entry.record?.metaDescription || firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i),
      entry.record ? pageDates(entry.record).updatedOn : true,
      html
    ].filter(Boolean).length,
    missingFields: []
  };
}

function classifyIssues(pageLike) {
  const classifications = new Set();

  if (!pageLike.updatedOn || !pageLike.metaDescription || pageLike.missingInternalLinks.length) {
    classifications.add("safe-technical-fix");
  }
  if (pageLike.missingSourceUrl || pageLike.missingRequiredFields.some((field) => ["officialSource", "sourceUrl"].includes(field))) {
    classifications.add("needs-source-research");
  }
  if (pageLike.thinContent || pageLike.missingRequiredFields.some((field) => ["seoIntro", "about", "rules", "seasonalTips", "etiquette", "faq"].includes(field))) {
    classifications.add("needs-content-expansion");
  }
  if (pageLike.duplicateTitleCount > 1 || pageLike.duplicateMetaDescriptionCount > 1 || pageLike.possibleDuplicateCount > 1 || /-[a-f0-9]{5}$/i.test(pageLike.slug || "")) {
    classifications.add("possible-duplicate");
  }
  if (pageLike.stale || pageLike.missingRequiredFields.length || pageLike.dataQualityFlags.length) {
    classifications.add("needs-human-review");
  }

  return [...classifications];
}

function qualityStatus(pageLike) {
  if (pageLike.dataQualityFlags.length || pageLike.possibleDuplicateCount > 1) return "data-quality-risk";
  if (pageLike.duplicateTitleCount > 1 || pageLike.duplicateMetaDescriptionCount > 1) return "duplicate-risk";
  if (pageLike.missingSourceUrl) return "missing-source";
  if (pageLike.thinContent) return "thin-content";
  if (pageLike.qualityCompletionScore >= 95 && !pageLike.stale && pageLike.issueClassifications.length === 0) return "complete";
  return "needs-review";
}

function dataQualityFlags(entry, possibleDuplicateCount) {
  const flags = [];
  const raw = entry.record?.raw || {};
  if (possibleDuplicateCount > 1) flags.push("possible duplicate record");
  if (/-[a-f0-9]{5}$/i.test(entry.record?.slug || "")) flags.push("fallback-looking slug suffix");
  if (entry.record?.collection === "Dog Parks") {
    const city = raw.City || "";
    const province = raw.Province || "";
    if (!city || !province) flags.push("missing city/province mapping");
    if (entry.name && raw["Park Name"] && normalize(entry.name) !== normalize(raw["Park Name"])) {
      flags.push("record name differs from raw park name");
    }
  }
  return flags;
}

function duplicateDataKey(entry) {
  const raw = entry.record?.raw || {};
  return [entry.contentType, entry.name, raw.City, raw.Province].map(normalize).join("|");
}

function canonicalGroupKey(page) {
  if (page.contentType !== "Dog Parks") return "";
  const city = normalize(page.rawCity);
  const province = normalize(page.rawProvince);
  const name = normalize(page.name);
  const title = normalize(page.title);
  if (name && city) return `park-name-city|${name}|${city}|${province}`;
  if (title && city) return `park-title-city|${title}|${city}|${province}`;
  if (name) return `park-name|${name}`;
  return "";
}

function slugLooksGenerated(slug) {
  return /-[a-f0-9]{5}$/i.test(slug || "") || /-\d+$/.test(slug || "");
}

function slugQuality(page) {
  let score = 0;
  const slug = page.slug || "";
  const rawNameSlug = normalize(page.name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slugLooksGenerated(slug)) score += 20;
  if (slug.includes(rawNameSlug)) score += 15;
  if (page.sourceUrl) score += 15;
  if (page.rawLatitude && page.rawLongitude) score += 10;
  score += Math.min(20, page.qualityCompletionScore / 5);
  score += Math.min(10, page.wordCount / 50);
  score -= page.missingRequiredFields.length;
  return score;
}

function canonicalRiskTypes(page, group, hasSameNameDifferentCity) {
  const types = new Set();
  const sameName = group.filter((item) => normalize(item.name) === normalize(page.name));
  const sameTitle = group.filter((item) => normalize(item.title) === normalize(page.title));
  const sameMeta = group.filter((item) => normalize(item.metaDescription) === normalize(page.metaDescription));

  if (group.length > 1 && !hasSameNameDifferentCity) types.add("exact-duplicate");
  if (hasSameNameDifferentCity) types.add("same-name-different-city");
  if (page.rawParkName && normalize(page.name) !== normalize(page.rawParkName)) types.add("route-name-mismatch");
  if (slugLooksGenerated(page.slug)) types.add("generated-slug-risk");
  if (sameTitle.length > 1) types.add("title-only-duplicate");
  if (sameMeta.length > 1) types.add("meta-only-duplicate");
  if (!types.size) types.add("needs-human-review");
  return [...types];
}

function recommendedCanonicalAction(page, canonicalPage, riskTypes) {
  const isCanonical = page.routePath === canonicalPage.routePath;
  if (riskTypes.includes("same-name-different-city")) return "rename-title-meta";
  if (isCanonical && riskTypes.includes("same-name-different-city")) return "rename-title-meta";
  if (isCanonical) return "keep";
  if (riskTypes.includes("route-name-mismatch")) return "fix-data-mapping";
  if (riskTypes.includes("exact-duplicate") || riskTypes.includes("generated-slug-risk")) return "redirect-to-canonical";
  if (riskTypes.includes("title-only-duplicate") || riskTypes.includes("meta-only-duplicate")) return "rename-title-meta";
  if (page.missingSourceUrl) return "verify-source";
  return "human-review";
}

function canonicalConfidence(page, canonicalPage, group, riskTypes) {
  let score = 40;
  if (riskTypes.includes("exact-duplicate")) score += 25;
  if (riskTypes.includes("generated-slug-risk") && canonicalPage.routePath !== page.routePath) score += 15;
  if (normalize(page.rawCity) && normalize(page.rawCity) === normalize(canonicalPage.rawCity)) score += 10;
  if (normalize(page.rawProvince) && normalize(page.rawProvince) === normalize(canonicalPage.rawProvince)) score += 5;
  if (riskTypes.includes("route-name-mismatch")) score -= 20;
  if (riskTypes.includes("same-name-different-city")) score -= 25;
  if (group.length > 3) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildCanonicalAnalysis(pagesToAnalyze) {
  const dogParkPages = pagesToAnalyze.filter((page) => page.contentType === "Dog Parks");
  const citiesByName = dogParkPages.reduce((acc, page) => {
    const key = normalize(page.name);
    if (!key) return acc;
    if (!acc.has(key)) acc.set(key, new Set());
    acc.get(key).add(`${normalize(page.rawCity)}|${normalize(page.rawProvince)}`);
    return acc;
  }, new Map());
  const parkCandidates = pagesToAnalyze.filter(
    (page) =>
      page.contentType === "Dog Parks" &&
      (page.duplicateTitleCount > 1 ||
        page.duplicateMetaDescriptionCount > 1 ||
        page.possibleDuplicateCount > 1 ||
        page.dataQualityFlags.length ||
        slugLooksGenerated(page.slug))
  );

  const grouped = parkCandidates.reduce((acc, page) => {
    const key = canonicalGroupKey(page);
    if (!key) return acc;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(page);
    return acc;
  }, new Map());

  const pageRecommendations = new Map();
  const groups = [...grouped.entries()]
    .map(([groupKey, groupPages]) => {
      const sortedGroup = [...groupPages].sort((a, b) => slugQuality(b) - slugQuality(a) || a.routePath.localeCompare(b.routePath));
      const canonicalPage = sortedGroup[0];
      const candidates = sortedGroup.map((page) => {
        const hasSameNameDifferentCity = (citiesByName.get(normalize(page.name))?.size || 0) > 1;
        const riskTypes = canonicalRiskTypes(page, sortedGroup, hasSameNameDifferentCity);
        const recommendedAction = recommendedCanonicalAction(page, canonicalPage, riskTypes);
        const confidenceScore = canonicalConfidence(page, canonicalPage, sortedGroup, riskTypes);
        const recommendation = {
          routePath: page.routePath,
          name: page.name,
          slug: page.slug,
          title: page.title,
          city: page.rawCity,
          province: page.rawProvince,
          canonicalRiskType: riskTypes,
          recommendedCanonicalUrl: canonicalPage.canonicalUrl,
          recommendedAction,
          duplicateGroupKey: groupKey,
          duplicateGroupSize: sortedGroup.length,
          canonicalConfidenceScore: confidenceScore,
          safeCleanup: ["redirect-to-canonical", "rename-title-meta"].includes(recommendedAction) && confidenceScore >= 70 && !riskTypes.includes("route-name-mismatch"),
          humanReviewRequired:
            recommendedAction === "human-review" ||
            confidenceScore < 70 ||
            riskTypes.includes("route-name-mismatch") ||
            riskTypes.includes("needs-human-review")
        };
        pageRecommendations.set(page.routePath, recommendation);
        return recommendation;
      });

      return {
        duplicateGroupKey: groupKey,
        duplicateGroupSize: sortedGroup.length,
        recommendedCanonicalUrl: canonicalPage.canonicalUrl,
        recommendedCanonicalRoute: canonicalPage.routePath,
        canonicalConfidenceScore: Math.max(...candidates.map((item) => item.canonicalConfidenceScore)),
        candidates
      };
    })
    .sort((a, b) => b.duplicateGroupSize - a.duplicateGroupSize || a.duplicateGroupKey.localeCompare(b.duplicateGroupKey));

  return {
    groups,
    pageRecommendations,
    suspectedExactDuplicates: groups.flatMap((group) => group.candidates.filter((item) => item.canonicalRiskType.includes("exact-duplicate"))),
    routeNameMismatches: groups.flatMap((group) => group.candidates.filter((item) => item.canonicalRiskType.includes("route-name-mismatch"))),
    generatedSlugCandidates: groups.flatMap((group) => group.candidates.filter((item) => item.canonicalRiskType.includes("generated-slug-risk"))),
    safeCleanupCandidates: groups.flatMap((group) => group.candidates.filter((item) => item.safeCleanup)),
    humanReviewCandidates: groups.flatMap((group) => group.candidates.filter((item) => item.humanReviewRequired))
  };
}

function routeFromCanonicalUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function readRedirectRules(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, target, status = "302"] = line.split(/\s+/);
      return {
        sourceRoute: normalizeRoutePath(source),
        targetRoute: normalizeRoutePath(target),
        status
      };
    });
}

function redirectReason(candidate) {
  const risks = candidate.canonicalRiskType.join(", ");
  if (candidate.canonicalRiskType.includes("generated-slug-risk")) {
    return `High-confidence duplicate with generated-looking slug; risks: ${risks}`;
  }
  if (candidate.canonicalRiskType.includes("exact-duplicate")) {
    return `High-confidence exact duplicate; risks: ${risks}`;
  }
  return `High-confidence canonical cleanup candidate; risks: ${risks}`;
}

function buildRedirectPlan(canonicalAnalysisResult, redirectRuleMap) {
  return canonicalAnalysisResult.safeCleanupCandidates
    .filter(
      (candidate) =>
        candidate.recommendedAction === "redirect-to-canonical" &&
        candidate.safeCleanup &&
        !candidate.humanReviewRequired &&
        candidate.canonicalConfidenceScore >= 80
    )
    .map((candidate) => ({
      sourceRoute: normalizeRoutePath(candidate.routePath),
      targetRoute: routeFromCanonicalUrl(candidate.recommendedCanonicalUrl),
      sourceCanonicalUrl: `${SITE_URL}${candidate.routePath}`,
      targetCanonicalUrl: candidate.recommendedCanonicalUrl,
      confidenceScore: candidate.canonicalConfidenceScore,
      reason: redirectReason(candidate),
      duplicateGroupKey: candidate.duplicateGroupKey,
      implementationStatus:
        redirectRuleMap.get(normalizeRoutePath(candidate.routePath))?.targetRoute === routeFromCanonicalUrl(candidate.recommendedCanonicalUrl) &&
        redirectRuleMap.get(normalizeRoutePath(candidate.routePath))?.status === "301"
          ? "implemented"
          : "planned"
    }))
    .sort((a, b) => b.confidenceScore - a.confidenceScore || a.sourceRoute.localeCompare(b.sourceRoute));
}

function suggestedSeoTitle(candidate) {
  const location = [candidate.city, candidate.province].filter(Boolean).join(", ");
  const pageName = /dog park$/i.test(candidate.name) ? candidate.name : `${candidate.name} Dog Park`;
  if (!location) return `${pageName} | LeashFree.ca`;
  return `${pageName} in ${location} | LeashFree.ca`;
}

function suggestedMetaDescriptionDirection(candidate) {
  const location = [candidate.city, candidate.province].filter(Boolean).join(", ");
  const place = location ? `${candidate.name} in ${location}` : candidate.name;
  return `Write a source-backed, location-specific description for ${place} that distinguishes this page, confirms park type, rules, and notable amenities, and avoids reusing duplicate template copy.`;
}

function manualReviewReason(candidate) {
  if (candidate.canonicalRiskType.includes("same-name-different-city")) {
    return "Same park name appears in multiple cities, so this should stay separate and receive unique location-specific title/meta.";
  }
  if (candidate.canonicalRiskType.includes("generated-slug-risk")) {
    return "Generated-looking slug does not meet the safe redirect threshold or lacks a high-confidence duplicate target.";
  }
  if (candidate.canonicalRiskType.includes("title-only-duplicate") || candidate.canonicalRiskType.includes("meta-only-duplicate")) {
    return "Duplicate SEO text can likely be fixed with title/meta uniqueness instead of redirecting.";
  }
  if (candidate.canonicalConfidenceScore < 80) {
    return "Canonical confidence is below the automatic redirect planning threshold.";
  }
  return "The candidate needs human review before any canonical or metadata change.";
}

function buildManualCanonicalReview(canonicalAnalysisResult, redirectPlan) {
  const redirectSources = new Set(redirectPlan.map((item) => item.sourceRoute));
  const candidates = [
    ...canonicalAnalysisResult.humanReviewCandidates,
    ...canonicalAnalysisResult.generatedSlugCandidates.filter((candidate) => !redirectSources.has(candidate.routePath)),
    ...canonicalAnalysisResult.groups.flatMap((group) => group.candidates.filter((candidate) => candidate.recommendedAction === "rename-title-meta"))
  ];
  const byRoute = new Map();
  for (const candidate of candidates) {
    if (!redirectSources.has(candidate.routePath)) byRoute.set(candidate.routePath, candidate);
  }
  return [...byRoute.values()]
    .map((candidate) => ({
      routePath: candidate.routePath,
      name: candidate.name,
      city: candidate.city,
      province: candidate.province,
      canonicalRiskType: candidate.canonicalRiskType,
      recommendedAction: candidate.recommendedAction === "keep" ? "human-review" : candidate.recommendedAction,
      recommendedCanonicalUrl: candidate.recommendedCanonicalUrl,
      duplicateGroupKey: candidate.duplicateGroupKey,
      canonicalConfidenceScore: candidate.canonicalConfidenceScore,
      suggestedSeoTitle: suggestedSeoTitle(candidate),
      suggestedMetaDescriptionDirection: suggestedMetaDescriptionDirection(candidate),
      reasonNotAutoRedirected: manualReviewReason(candidate)
    }))
    .sort((a, b) => a.routePath.localeCompare(b.routePath));
}

function scorePage(entry, config, duplicateSeo, possibleDuplicateCount) {
  const html = renderedHtml(entry.routePath);
  const record = entry.record;
  const dates = pageDates(record);
  const effectiveReviewDate = dates.reviewedOn || dates.updatedOn || dates.publishedOn || dates.createdOn;
  const ageDays = daysSince(effectiveReviewDate);
  const text = contentText(entry, html);
  const words = wordCount(text);
  const title = record?.seoTitle || record?.title || firstMatch(html, /<title>([\s\S]*?)<\/title>/i) || entry.name;
  const metaDescription = record?.metaDescription || firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const source = sourceUrl(entry);
  const internalLinks = internalLinkIssues(entry, html);
  const reasons = [];
  const profile = profileChecks(entry, html, internalLinks);
  const missingFields = [...profile.missingFields];
  const slug = record?.slug || "";
  const flags = dataQualityFlags(entry, possibleDuplicateCount);
  let priorityScore = config.sectionWeight;

  if (ageDays === null) {
    priorityScore += 20;
    reasons.push("missing review/update date");
  } else if (ageDays > config.staleAfterDays) {
    priorityScore += entry.contentType === "City Pages" ? 30 : 25;
    reasons.push(`stale ${ageDays} days`);
  }

  if (words < config.thinWordThreshold) {
    priorityScore += 25;
    reasons.push(`thin content ${words} words`);
  }

  if (!dates.lastmod && record) {
    priorityScore += 12;
    reasons.push("missing updatedOn for sitemap lastmod");
  }

  if (duplicateSeo.titleCount > 1) {
    priorityScore += 15;
    reasons.push("duplicate SEO title");
  }

  if (duplicateSeo.metaCount > 1) {
    priorityScore += 15;
    reasons.push("duplicate meta description");
  }

  if (!metaDescription) {
    priorityScore += 15;
    reasons.push("missing meta description");
  }

  if (["Dog Parks", "City Pages", "Directories"].includes(entry.contentType) && !source) {
    priorityScore += 20;
    reasons.push("missing official/source URL");
  }

  if (record?.collection === "Dog Parks") {
    const missing = profile.missingFields;
    if (missing.length) {
      priorityScore += Math.min(30, 5 + missing.length * 2);
      reasons.push(`missing park fields: ${missing.slice(0, 6).join(", ")}`);
    }
  }

  if (record?.collection === "City Pages") {
    const missing = profile.missingFields;
    if (missing.length) {
      priorityScore += Math.min(25, 5 + missing.length * 3);
      reasons.push(`missing city fields: ${missing.join(", ")}`);
    }
  }

  if (internalLinks.missing.length) {
    priorityScore += 10;
    reasons.push(`missing internal links: ${internalLinks.missing.join(", ")}`);
  }

  if (!html) {
    priorityScore += 10;
    reasons.push("rendered HTML not found; run npm run build before auditing rendered signals");
  }

  if (flags.length) {
    priorityScore += 20;
    reasons.push(`data quality risk: ${flags.join(", ")}`);
  }

  const qualityCompletionScore = Math.max(
    0,
    Math.min(100, Math.round((Math.max(0, profile.passedChecks) / profile.applicableChecks.length) * 100))
  );
  const page = {
    section: config.section,
    sectionLabel: config.label,
    riskLevel: config.riskLevel,
    contentType: entry.contentType,
    name: entry.name,
    slug,
    rawParkName: record?.raw?.["Park Name"] || "",
    rawCity: record?.raw?.City || "",
    rawProvince: record?.raw?.Province || "",
    rawLatitude: record?.raw?.latitude || "",
    rawLongitude: record?.raw?.longitude || "",
    routePath: entry.routePath,
    canonicalUrl: entry.canonicalUrl,
    priorityScore,
    reasons,
    qualityProfile: profile.qualityProfile,
    qualityCompletionScore,
    qualityChecksTotal: profile.applicableChecks.length,
    qualityChecksPassed: Math.max(0, profile.passedChecks),
    qualityChecksMissing: profile.missingFields,
    wordCount: words,
    thinContent: words < config.thinWordThreshold,
    thinWordThreshold: config.thinWordThreshold,
    title,
    metaDescription,
    duplicateTitleCount: duplicateSeo.titleCount,
    duplicateMetaDescriptionCount: duplicateSeo.metaCount,
    sourceUrl: source,
    missingSourceUrl: ["Dog Parks", "City Pages", "Directories"].includes(entry.contentType) && !source,
    missingRequiredFields: missingFields,
    possibleDuplicateCount,
    dataQualityFlags: flags,
    internalLinkCount: internalLinks.count,
    missingInternalLinks: internalLinks.missing,
    reviewAgeDays: ageDays,
    stale: ageDays === null || ageDays > config.staleAfterDays,
    staleAfterDays: config.staleAfterDays,
    ...dates
  };
  page.issueClassifications = classifyIssues(page);
  page.qualityStatus = qualityStatus(page);
  return page;
}

function duplicateMaps(entries) {
  const titleCounts = new Map();
  const metaCounts = new Map();

  for (const entry of entries) {
    const html = renderedHtml(entry.routePath);
    const title = entry.record?.seoTitle || entry.record?.title || firstMatch(html, /<title>([\s\S]*?)<\/title>/i) || entry.name;
    const meta = entry.record?.metaDescription || firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (title) titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
    if (meta) metaCounts.set(meta, (metaCounts.get(meta) || 0) + 1);
  }

  return { titleCounts, metaCounts };
}

function csvLine(row) {
  return row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
}

function writeReport(file, content) {
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, content);
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      fs.renameSync(tempFile, file);
      return;
    } catch (error) {
      lastError = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }
  }
  try {
    fs.unlinkSync(tempFile);
  } catch {
    // Best effort cleanup only.
  }
  const pendingFile = `${file}.pending`;
  fs.writeFileSync(pendingFile, content);
  reportWriteWarnings.push(`Unable to update ${file}; wrote ${pendingFile}. Close any app that has the report open and rerun npm run content:health.`);
}

const allEntries = sectionConfigs.flatMap((config) => config.entries);
const activeEntries = allEntries.filter((entry) => !implementedRedirectSourceRoutes.has(normalizeRoutePath(entry.routePath)));
const duplicates = duplicateMaps(activeEntries);
const possibleDuplicateCounts = activeEntries.reduce((acc, entry) => {
  const key = duplicateDataKey(entry);
  acc.set(key, (acc.get(key) || 0) + 1);
  return acc;
}, new Map());
const redirectRules = readRedirectRules(path.join(PUBLIC_DIR, "_redirects"));
const redirectRuleMap = new Map(redirectRules.map((item) => [item.sourceRoute, item]));
const allPages = sectionConfigs
  .flatMap((config) =>
    config.entries.map((entry) => {
      const html = renderedHtml(entry.routePath);
      const title = entry.record?.seoTitle || entry.record?.title || firstMatch(html, /<title>([\s\S]*?)<\/title>/i) || entry.name;
      const meta = entry.record?.metaDescription || firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      return scorePage(entry, config, {
        titleCount: title ? duplicates.titleCounts.get(title) || 0 : 0,
        metaCount: meta ? duplicates.metaCounts.get(meta) || 0 : 0
      }, possibleDuplicateCounts.get(duplicateDataKey(entry)) || 1);
    })
  )
  .sort((a, b) => b.priorityScore - a.priorityScore || a.routePath.localeCompare(b.routePath));

const canonicalAnalysis = buildCanonicalAnalysis(allPages);
for (const page of allPages) {
  const recommendation = canonicalAnalysis.pageRecommendations.get(page.routePath);
  page.canonicalRiskType = recommendation?.canonicalRiskType || [];
  page.recommendedCanonicalUrl = recommendation?.recommendedCanonicalUrl || "";
  page.recommendedAction = recommendation?.recommendedAction || "";
  page.duplicateGroupKey = recommendation?.duplicateGroupKey || "";
  page.duplicateGroupSize = recommendation?.duplicateGroupSize || 0;
  page.canonicalConfidenceScore = recommendation?.canonicalConfidenceScore || 0;
  if (recommendation && !page.issueClassifications.includes("possible-duplicate")) {
    page.issueClassifications.push("possible-duplicate");
  }
  if (recommendation?.humanReviewRequired && !page.issueClassifications.includes("needs-human-review")) {
    page.issueClassifications.push("needs-human-review");
  }
}
const pages = allPages.filter((page) => !implementedRedirectSourceRoutes.has(normalizeRoutePath(page.routePath)));

const bySection = sectionConfigs.map((config) => {
  const sectionPages = pages.filter((page) => page.section === config.section);
  return {
    section: config.section,
    label: config.label,
    urls: sectionPages.length,
    riskLevel: config.riskLevel,
    averagePriorityScore: Math.round(sectionPages.reduce((total, page) => total + page.priorityScore, 0) / sectionPages.length),
    averageQualityCompletionScore: Math.round(sectionPages.reduce((total, page) => total + page.qualityCompletionScore, 0) / sectionPages.length),
    stalePages: sectionPages.filter((page) => page.stale).length,
    thinPages: sectionPages.filter((page) => page.thinContent).length,
    missingSourceUrls: sectionPages.filter((page) => page.missingSourceUrl).length,
    completePages: sectionPages.filter((page) => page.qualityStatus === "complete").length,
    needsReviewPages: sectionPages.filter((page) => page.qualityStatus === "needs-review").length,
    duplicateRiskPages: sectionPages.filter((page) => page.qualityStatus === "duplicate-risk").length,
    dataQualityRiskPages: sectionPages.filter((page) => page.qualityStatus === "data-quality-risk").length
  };
});

const duplicateTitleGroups = [...duplicates.titleCounts.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .map(([value, count]) => ({ value, count }));

const duplicateMetaDescriptionGroups = [...duplicates.metaCounts.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .map(([value, count]) => ({ value, count }));

const qualityStatusCounts = pages.reduce((acc, page) => {
  acc[page.qualityStatus] = (acc[page.qualityStatus] || 0) + 1;
  return acc;
}, {});

const issueClassificationCounts = pages.reduce((acc, page) => {
  for (const classification of page.issueClassifications) {
    acc[classification] = (acc[classification] || 0) + 1;
  }
  return acc;
}, {});

const duplicateCleanupCandidates = pages
  .filter((page) => page.duplicateTitleCount > 1 || page.duplicateMetaDescriptionCount > 1 || page.possibleDuplicateCount > 1 || page.dataQualityFlags.length)
  .sort((a, b) => b.priorityScore - a.priorityScore)
  .slice(0, 100);

const cityPagesMissingSources = pages
  .filter((page) => page.contentType === "City Pages" && page.missingSourceUrl)
  .sort((a, b) => b.priorityScore - a.priorityScore);

const parkPagesMissingAmenities = pages
  .filter((page) => page.contentType === "Dog Parks" && page.missingRequiredFields.some((field) => ["fenced", "smallDogArea", "surface", "parking", "water", "shade"].includes(field)))
  .sort((a, b) => b.missingRequiredFields.length - a.missingRequiredFields.length || b.priorityScore - a.priorityScore);

const closestToCompletion = pages
  .filter((page) => page.qualityCompletionScore >= 75 && page.qualityStatus !== "complete")
  .sort((a, b) => b.qualityCompletionScore - a.qualityCompletionScore || b.priorityScore - a.priorityScore)
  .slice(0, 50);

const redirectPlan = buildRedirectPlan(canonicalAnalysis, redirectRuleMap);
const manualCanonicalReview = buildManualCanonicalReview(canonicalAnalysis, redirectPlan);
const blockedCleanupCount = manualCanonicalReview.filter((candidate) => candidate.recommendedAction !== "rename-title-meta" || candidate.canonicalConfidenceScore < 80).length;
const implementedRedirectCount = redirectPlan.filter((item) => item.implementationStatus === "implemented").length;
const sitemapExclusionCount = implementedRedirectRecords.length;
const pageCountReconciliationNote =
  "QA counts built HTML files and includes /404.html. Content health counts active indexable content entries and excludes /404.html plus implemented redirect source routes.";

const summary = {
  generatedAt: now.toISOString(),
  totalPages: pages.length,
  sections: bySection,
  issueCounts: {
    stalePages: pages.filter((page) => page.stale).length,
    thinPages: pages.filter((page) => page.thinContent).length,
    missingSourceUrls: pages.filter((page) => page.missingSourceUrl).length,
    duplicateTitleGroups: duplicateTitleGroups.length,
    duplicateMetaDescriptionGroups: duplicateMetaDescriptionGroups.length,
    missingUpdatedOn: pages.filter((page) => !page.updatedOn && page.contentType !== "Core").length,
    missingInternalLinks: pages.filter((page) => page.missingInternalLinks.length).length,
    dataQualityRiskPages: pages.filter((page) => page.qualityStatus === "data-quality-risk").length,
    duplicateRiskPages: pages.filter((page) => page.qualityStatus === "duplicate-risk").length,
    canonicalCleanupGroups: canonicalAnalysis.groups.length,
    canonicalCleanupCandidates: canonicalAnalysis.groups.reduce((total, group) => total + group.candidates.length, 0),
    redirectReadyCount: redirectPlan.length,
    manualCanonicalReviewCount: manualCanonicalReview.length,
    blockedCleanupCount,
    implementedRedirects: implementedRedirectCount,
    sitemapExclusionCount
  },
  pageCountReconciliationNote,
  qualityStatusCounts,
  issueClassificationCounts
};

const jsonReport = {
  ...summary,
  scoringModel: {
    note: "Higher priorityScore means the page should be reviewed sooner. The audit does not rewrite content or update lastmod.",
    lastmodPolicy: "Sitemap lastmod should use updatedOn. reviewedOn is for confirmed checks that do not materially change content.",
    weights: {
      sectionImportance: "4-20 points depending on sitemap group",
      stale: "25 points, or 30 for stale city/location pages",
      thinContent: 25,
      missingSourceUrl: 20,
      duplicateTitle: 15,
      duplicateMetaDescription: 15,
      missingMetaDescription: 15,
      missingUpdatedOn: 12,
      missingInternalLinks: 10,
      missingRequiredFields: "Variable, capped by page type"
    }
  },
  duplicateTitleGroups,
  duplicateMetaDescriptionGroups,
  canonicalAnalysis: {
    groups: canonicalAnalysis.groups,
    suspectedExactDuplicates: canonicalAnalysis.suspectedExactDuplicates,
    routeNameMismatches: canonicalAnalysis.routeNameMismatches,
    generatedSlugCandidates: canonicalAnalysis.generatedSlugCandidates,
    safeCleanupCandidates: canonicalAnalysis.safeCleanupCandidates,
    humanReviewCandidates: canonicalAnalysis.humanReviewCandidates
  },
  duplicateCleanupCandidates,
  redirectPlan,
  manualCanonicalReview,
  cityPagesMissingSources,
  parkPagesMissingAmenities,
  closestToCompletion,
  pages
};

const queueRows = [
  [
    "priority_score",
    "section",
    "content_type",
    "route",
    "name",
    "risk_level",
    "review_age_days",
    "word_count",
    "quality_status",
    "quality_completion_score",
    "issue_classifications",
    "canonical_risk_type",
    "recommended_action",
    "recommended_canonical_url",
    "duplicate_group_key",
    "duplicate_group_size",
    "canonical_confidence_score",
    "missing_source_url",
    "missing_required_fields",
    "data_quality_flags",
    "reasons"
  ],
  ...pages.map((page) => [
    page.priorityScore,
    page.section,
    page.contentType,
    page.routePath,
    page.name,
    page.riskLevel,
    page.reviewAgeDays ?? "",
    page.wordCount,
    page.qualityStatus,
    page.qualityCompletionScore,
    page.issueClassifications.join("; "),
    page.canonicalRiskType.join("; "),
    page.recommendedAction,
    page.recommendedCanonicalUrl,
    page.duplicateGroupKey,
    page.duplicateGroupSize || "",
    page.canonicalConfidenceScore || "",
    page.missingSourceUrl ? "yes" : "no",
    page.missingRequiredFields.join("; "),
    page.dataQualityFlags.join("; "),
    page.reasons.join("; ")
  ])
];

const markdown = [
  "# Content Review Summary\n",
  `Generated at: ${summary.generatedAt}`,
  `- Total pages audited: ${summary.totalPages}`,
  `- Stale pages: ${summary.issueCounts.stalePages}`,
  `- Thin pages: ${summary.issueCounts.thinPages}`,
  `- Missing source URLs: ${summary.issueCounts.missingSourceUrls}`,
  `- Duplicate title groups: ${summary.issueCounts.duplicateTitleGroups}`,
  `- Duplicate meta description groups: ${summary.issueCounts.duplicateMetaDescriptionGroups}`,
  `- Missing updatedOn: ${summary.issueCounts.missingUpdatedOn}`,
  `- Data quality risk pages: ${summary.issueCounts.dataQualityRiskPages}`,
  `- Duplicate risk pages: ${summary.issueCounts.duplicateRiskPages}`,
  `- Canonical cleanup groups: ${summary.issueCounts.canonicalCleanupGroups}`,
  `- Canonical cleanup candidates: ${summary.issueCounts.canonicalCleanupCandidates}`,
  `- Redirect-ready cleanup candidates: ${summary.issueCounts.redirectReadyCount}`,
  `- Implemented redirects: ${summary.issueCounts.implementedRedirects}`,
  `- Manual canonical review candidates: ${summary.issueCounts.manualCanonicalReviewCount}`,
  `- Blocked cleanup candidates: ${summary.issueCounts.blockedCleanupCount}`,
  `- Sitemap exclusion count: ${summary.issueCounts.sitemapExclusionCount}`,
  `- QA/content-health page count note: ${escapeMd(summary.pageCountReconciliationNote)}`,
  "- Next recommended action: validate the implemented redirects in production preview, then continue with manual canonical review candidates before deleting any source records.",
  "\n## Counts by Sitemap Section\n",
  "| Section | URLs | Risk | Avg Score | Avg Quality | Complete | Stale | Thin | Missing Sources | Data Risk |",
  "| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...bySection.map(
    (item) =>
      `| ${escapeMd(item.label)} | ${item.urls} | ${escapeMd(item.riskLevel)} | ${item.averagePriorityScore} | ${item.averageQualityCompletionScore} | ${item.completePages} | ${item.stalePages} | ${item.thinPages} | ${item.missingSourceUrls} | ${item.dataQualityRiskPages} |`
  ),
  "\n## Quality Status Counts\n",
  ...Object.entries(qualityStatusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => `- ${escapeMd(status)}: ${count}`),
  "\n## Issue Classification Counts\n",
  ...Object.entries(issueClassificationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([classification, count]) => `- ${escapeMd(classification)}: ${count}`),
  "\n## Top 25 Review Queue\n",
  "| Score | Quality | Status | Section | Route | Main Reasons |",
  "| ---: | ---: | --- | --- | --- | --- |",
  ...pages
    .slice(0, 25)
    .map((page) => `| ${page.priorityScore} | ${page.qualityCompletionScore} | ${escapeMd(page.qualityStatus)} | ${escapeMd(page.sectionLabel)} | ${escapeMd(page.routePath)} | ${escapeMd(page.reasons.slice(0, 4).join("; "))} |`),
  "\n## Top Pages Closest to Completion\n",
  ...(closestToCompletion.length
    ? closestToCompletion
        .slice(0, 25)
        .map((page) => `- ${page.qualityCompletionScore}% ${escapeMd(page.routePath)}: ${escapeMd(page.qualityStatus)}; missing ${escapeMd(page.qualityChecksMissing.join(", ") || "minor review")}`)
    : ["- None"]),
  "\n## Major Data Issues\n",
  ...(duplicateCleanupCandidates.length
    ? duplicateCleanupCandidates
        .slice(0, 25)
        .map((page) => `- ${escapeMd(page.routePath)}: ${escapeMd([...page.dataQualityFlags, ...page.issueClassifications.filter((item) => item === "possible-duplicate")].join("; "))}`)
    : ["- None"]),
  "\n## Canonical Cleanup Summary\n",
  `- Duplicate groups: ${canonicalAnalysis.groups.length}`,
  `- Suspected exact duplicates: ${canonicalAnalysis.suspectedExactDuplicates.length}`,
  `- Route/name mismatches: ${canonicalAnalysis.routeNameMismatches.length}`,
  `- Generated slug candidates: ${canonicalAnalysis.generatedSlugCandidates.length}`,
  `- Safe cleanup candidates: ${canonicalAnalysis.safeCleanupCandidates.length}`,
  `- Human-review candidates: ${canonicalAnalysis.humanReviewCandidates.length}`,
  `- Redirect-ready candidates: ${redirectPlan.length}`,
  `- Implemented redirects: ${implementedRedirectCount}`,
  `- Manual canonical review candidates: ${manualCanonicalReview.length}`,
  `- Blocked cleanup candidates: ${blockedCleanupCount}`,
  `- Sitemap exclusions: ${sitemapExclusionCount}`,
  "\n## Redirect-Ready Cleanup Plan\n",
  ...(redirectPlan.length
    ? redirectPlan.map((item) => `- ${escapeMd(item.sourceRoute)} -> ${escapeMd(item.targetRoute)} (${item.confidenceScore}/100, ${escapeMd(item.implementationStatus)})`)
    : ["- None"]),
  "\n## Manual Canonical Review Plan\n",
  ...(manualCanonicalReview.length
    ? manualCanonicalReview.map((item) => `- ${escapeMd(item.routePath)}: ${escapeMd(item.recommendedAction)}; ${escapeMd(item.reasonNotAutoRedirected)}`)
    : ["- None"]),
  "\n## Duplicate / Canonical Cleanup Candidates\n",
  ...(duplicateCleanupCandidates.length
    ? duplicateCleanupCandidates
        .slice(0, 25)
        .map((page) => `- ${escapeMd(page.routePath)} (${escapeMd(page.name)}): ${escapeMd(page.recommendedAction || "review")}; canonical ${escapeMd(page.recommendedCanonicalUrl || "n/a")}; title dupes ${page.duplicateTitleCount}, meta dupes ${page.duplicateMetaDescriptionCount}, record dupes ${page.possibleDuplicateCount}`)
    : ["- None"]),
  "\n## Duplicate Title Groups\n",
  ...(duplicateTitleGroups.length
    ? duplicateTitleGroups.slice(0, 25).map((item) => `- ${item.count} pages: ${escapeMd(item.value)}`)
    : ["- None"]),
  "\n## Duplicate Meta Description Groups\n",
  ...(duplicateMetaDescriptionGroups.length
    ? duplicateMetaDescriptionGroups.slice(0, 25).map((item) => `- ${item.count} pages: ${escapeMd(item.value)}`)
    : ["- None"]),
  "\n## Thin Pages Sample\n",
  ...pages
    .filter((page) => page.thinContent)
    .slice(0, 25)
    .map((page) => `- ${escapeMd(page.routePath)} (${page.wordCount}/${page.thinWordThreshold} words)`),
  "\n## Missing Source URL Sample\n",
  ...pages
    .filter((page) => page.missingSourceUrl)
    .slice(0, 25)
    .map((page) => `- ${escapeMd(page.routePath)} (${escapeMd(page.contentType)})`),
  "\n## City Pages Missing Official Sources\n",
  ...(cityPagesMissingSources.length
    ? cityPagesMissingSources.slice(0, 25).map((page) => `- ${escapeMd(page.routePath)} (${page.priorityScore})`)
    : ["- None"]),
  "\n## Park Pages Missing Key Amenity Fields\n",
  ...(parkPagesMissingAmenities.length
    ? parkPagesMissingAmenities
        .slice(0, 25)
        .map((page) => `- ${escapeMd(page.routePath)}: ${escapeMd(page.missingRequiredFields.filter((field) => ["fenced", "smallDogArea", "surface", "parking", "water", "shade"].includes(field)).join(", "))}`)
    : ["- None"]),
  "\n## Stale Pages by Content Type\n",
  ...Object.entries(
    pages
      .filter((page) => page.stale)
      .reduce((acc, page) => {
        acc[page.contentType] = (acc[page.contentType] || 0) + 1;
        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `- ${escapeMd(type)}: ${count}`)
];

const qualityRules = [
  "# Content Quality Rules\n",
  "This audit defines quality completeness only. It does not rewrite page content, update reviewedOn, update updatedOn, or change sitemap lastmod.",
  "\n## Date Policy\n",
  "- createdOn: when the record was first created.",
  "- publishedOn: when the record first went live.",
  "- reviewedOn: when a human or trusted workflow verified the page and no meaningful content changed.",
  "- updatedOn: when meaningful page content changed.",
  "- sitemap lastmod: uses updatedOn only.",
  "\n## Dog Park Page Profile\n",
  "A dog park page is quality complete when these checks are present or intentionally set to a verified value such as Unknown: name, slug, parkHeader, city, province, address/location description, latitude, longitude, official source URL, park type, fenced, small dog area, surface type, parking, water access, shade, rules, reviewedOn, and updatedOn.",
  "\n## City / Dog Park Location Profile\n",
  "A city page is quality complete when these checks are present: SEO intro, about section, rules section, seasonal tips, dog park etiquette, official source URL, nearby/internal links, FAQ section, park listing/grid presence, reviewedOn, and updatedOn.",
  "\n## Quality Status Values\n",
  "- complete: quality score is at least 95, page is not stale, and no issue classifications are present.",
  "- needs-review: page has no major source, duplicate, thin-content, or data-quality blocker but still requires review.",
  "- thin-content: page is below its content-type word threshold.",
  "- missing-source: page is missing an expected official/source URL.",
  "- duplicate-risk: duplicate SEO title or meta description risk.",
  "- data-quality-risk: suspected duplicate record, fallback-looking slug, or mapping issue.",
  "\n## Issue Classifications\n",
  "- safe-technical-fix: deterministic metadata, link, or date-field issue.",
  "- needs-source-research: official/source URL or factual verification needed.",
  "- needs-content-expansion: page needs new human-reviewed content blocks.",
  "- possible-duplicate: likely duplicate record, slug, title, or meta issue.",
  "- needs-human-review: page is stale, incomplete, or data-risky enough to require review.",
  "\n## Operating Rule\n",
  "Daily or weekly automation should audit, prioritize, classify, and propose work. It should not automatically publish rewritten park or city content until source-backed content changes have been reviewed."
];

const redirectPlanReport = [
  "# Redirect Plan\n",
  `Generated at: ${summary.generatedAt}`,
  "This report tracks safe canonical redirects. It does not delete pages, change content, update reviewedOn, update updatedOn, or change sitemap lastmod.",
  "\n## Summary\n",
  `- Redirect-ready candidates: ${redirectPlan.length}`,
  `- Implemented redirects: ${implementedRedirectCount}`,
  `- Remaining planned redirects: ${redirectPlan.filter((item) => item.implementationStatus !== "implemented").length}`,
  `- Minimum confidence threshold: 80`,
  "- Included only when recommendedAction is redirect-to-canonical, safeCleanup is true, humanReviewRequired is false, and canonicalConfidenceScore is 80 or higher.",
  "\n## Planned Redirects\n",
  ...(redirectPlan.length
    ? [
        "| Source Route | Target Route | Confidence | Reason | Status |",
        "| --- | --- | ---: | --- | --- |",
        ...redirectPlan.map(
          (item) =>
            `| ${escapeMd(item.sourceRoute)} | ${escapeMd(item.targetRoute)} | ${item.confidenceScore} | ${escapeMd(item.reason)} | ${escapeMd(item.implementationStatus)} |`
        )
      ]
    : ["- None"])
];

const manualCanonicalReviewReport = [
  "# Manual Canonical Review\n",
  `Generated at: ${summary.generatedAt}`,
  "This is planning only. It recommends title/meta cleanup and source verification for candidates that should not be redirected automatically.",
  "\n## Summary\n",
  `- Manual review candidates: ${manualCanonicalReview.length}`,
  `- Same-name-different-city pages: ${manualCanonicalReview.filter((item) => item.canonicalRiskType.includes("same-name-different-city")).length}`,
  `- Generated slug candidates not safe to redirect: ${manualCanonicalReview.filter((item) => item.canonicalRiskType.includes("generated-slug-risk")).length}`,
  "\n## Same-Name Different-City Pages\n",
  ...(manualCanonicalReview.filter((item) => item.canonicalRiskType.includes("same-name-different-city")).length
    ? manualCanonicalReview
        .filter((item) => item.canonicalRiskType.includes("same-name-different-city"))
        .map((item) => `- ${escapeMd(item.name)} in ${escapeMd([item.city, item.province].filter(Boolean).join(", "))}: ${escapeMd(item.suggestedSeoTitle)}`)
    : ["- None"]),
  "\n## Generated Slug Candidates Not Safe To Redirect\n",
  ...(manualCanonicalReview.filter((item) => item.canonicalRiskType.includes("generated-slug-risk")).length
    ? manualCanonicalReview
        .filter((item) => item.canonicalRiskType.includes("generated-slug-risk"))
        .map((item) => `- ${escapeMd(item.routePath)} (${item.canonicalConfidenceScore}/100): ${escapeMd(item.reasonNotAutoRedirected)}`)
    : ["- None"]),
  "\n## Title / Meta Review Recommendations\n",
  ...(manualCanonicalReview.length
    ? [
        "| Route | Risk | Recommendation | Suggested SEO Title | Meta Description Direction | Why Manual |",
        "| --- | --- | --- | --- | --- | --- |",
        ...manualCanonicalReview.map(
          (item) =>
            `| ${escapeMd(item.routePath)} | ${escapeMd(item.canonicalRiskType.join(", "))} | ${escapeMd(item.recommendedAction)} | ${escapeMd(item.suggestedSeoTitle)} | ${escapeMd(item.suggestedMetaDescriptionDirection)} | ${escapeMd(item.reasonNotAutoRedirected)} |`
        )
      ]
    : ["- None"])
];

const redirectImplementationSummary = [
  "# Redirect Implementation Summary\n",
  `Generated at: ${summary.generatedAt}`,
  "This report confirms the safe redirect plan has been implemented as permanent static redirects while keeping source records available in the data for later review.",
  "\n## Summary\n",
  `- Implemented redirects: ${implementedRedirectCount}`,
  `- Redirect source routes excluded from active content audit: ${sitemapExclusionCount}`,
  `- Remaining manual canonical review candidates: ${manualCanonicalReview.length}`,
  `- Remaining blocked cleanup candidates: ${blockedCleanupCount}`,
  `- Page count reconciliation: ${summary.pageCountReconciliationNote}`,
  "\n## Implemented Permanent Redirects\n",
  ...(redirectPlan.filter((item) => item.implementationStatus === "implemented").length
    ? [
        "| Source Route | Target Route | Confidence | Status |",
        "| --- | --- | ---: | --- |",
        ...redirectPlan
          .filter((item) => item.implementationStatus === "implemented")
          .map((item) => `| ${escapeMd(item.sourceRoute)} | ${escapeMd(item.targetRoute)} | ${item.confidenceScore} | 301 implemented |`)
      ]
    : ["- None"]),
  "\n## Controls\n",
  "- Source content records were not deleted.",
  "- Redirect source routes are excluded from static dog park page generation and dog park sitemap entries.",
  "- Canonical target pages remain active and indexable.",
  "- No reviewedOn, updatedOn, or sitemap lastmod values were changed."
];

const duplicateCleanupReport = [
  "# Duplicate Canonical Cleanup\n",
  `Generated at: ${summary.generatedAt}`,
  "This is analysis only. It does not delete pages, create redirects, change content, update reviewedOn, update updatedOn, or change sitemap lastmod.",
  "\n## Summary\n",
  `- Duplicate groups: ${canonicalAnalysis.groups.length}`,
  `- Suspected exact duplicate candidates: ${canonicalAnalysis.suspectedExactDuplicates.length}`,
  `- Route/name mismatch candidates: ${canonicalAnalysis.routeNameMismatches.length}`,
  `- Generated slug candidates: ${canonicalAnalysis.generatedSlugCandidates.length}`,
  `- Safe cleanup candidates: ${canonicalAnalysis.safeCleanupCandidates.length}`,
  `- Human-review candidates: ${canonicalAnalysis.humanReviewCandidates.length}`,
  "\n## Duplicate Groups\n",
  ...(canonicalAnalysis.groups.length
    ? canonicalAnalysis.groups.map((group) => {
        const rows = [
          `### ${escapeMd(group.duplicateGroupKey)}`,
          `- Group size: ${group.duplicateGroupSize}`,
          `- Recommended canonical: ${escapeMd(group.recommendedCanonicalRoute)} (${group.canonicalConfidenceScore}/100)`,
          "| Route | Risk Type | Action | Confidence | Safe? |",
          "| --- | --- | --- | ---: | --- |",
          ...group.candidates.map(
            (candidate) =>
              `| ${escapeMd(candidate.routePath)} | ${escapeMd(candidate.canonicalRiskType.join(", "))} | ${escapeMd(candidate.recommendedAction)} | ${candidate.canonicalConfidenceScore} | ${candidate.safeCleanup ? "yes" : "no"} |`
          )
        ];
        return rows.join("\n");
      })
    : ["- None"]),
  "\n## Suspected Exact Duplicates\n",
  ...(canonicalAnalysis.suspectedExactDuplicates.length
    ? canonicalAnalysis.suspectedExactDuplicates.map(
        (candidate) =>
          `- ${escapeMd(candidate.routePath)} -> ${escapeMd(candidate.recommendedCanonicalUrl)} (${escapeMd(candidate.recommendedAction)}, ${candidate.canonicalConfidenceScore}/100)`
      )
    : ["- None"]),
  "\n## Route / Name Mismatches\n",
  ...(canonicalAnalysis.routeNameMismatches.length
    ? canonicalAnalysis.routeNameMismatches.map(
        (candidate) =>
          `- ${escapeMd(candidate.routePath)} (${escapeMd(candidate.name)}): ${escapeMd(candidate.recommendedAction)}`
      )
    : ["- None"]),
  "\n## Generated Slug Candidates\n",
  ...(canonicalAnalysis.generatedSlugCandidates.length
    ? canonicalAnalysis.generatedSlugCandidates.map(
        (candidate) =>
          `- ${escapeMd(candidate.routePath)} -> ${escapeMd(candidate.recommendedCanonicalUrl)} (${escapeMd(candidate.recommendedAction)}, ${candidate.canonicalConfidenceScore}/100)`
      )
    : ["- None"]),
  "\n## Safe Cleanup Candidates\n",
  ...(canonicalAnalysis.safeCleanupCandidates.length
    ? canonicalAnalysis.safeCleanupCandidates.map(
        (candidate) =>
          `- ${escapeMd(candidate.routePath)}: ${escapeMd(candidate.recommendedAction)} -> ${escapeMd(candidate.recommendedCanonicalUrl)}`
      )
    : ["- None"]),
  "\n## Human Review Required\n",
  ...(canonicalAnalysis.humanReviewCandidates.length
    ? canonicalAnalysis.humanReviewCandidates.map(
        (candidate) =>
          `- ${escapeMd(candidate.routePath)}: ${escapeMd(candidate.canonicalRiskType.join(", "))}; proposed ${escapeMd(candidate.recommendedAction)}`
      )
    : ["- None"])
];

ensureDir(REPORTS_DIR);
writeReport(path.join(REPORTS_DIR, "content-health.json"), `${JSON.stringify(jsonReport, null, 2)}\n`);
writeReport(path.join(REPORTS_DIR, "content-review-queue.csv"), `${queueRows.map(csvLine).join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "content-review-summary.md"), `${markdown.join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "content-quality-rules.md"), `${qualityRules.join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "duplicate-canonical-cleanup.md"), `${duplicateCleanupReport.join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "redirect-plan.json"), `${JSON.stringify(redirectPlan, null, 2)}\n`);
writeReport(path.join(REPORTS_DIR, "redirect-plan.md"), `${redirectPlanReport.join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "manual-canonical-review.md"), `${manualCanonicalReviewReport.join("\n")}\n`);
writeReport(path.join(REPORTS_DIR, "redirect-implementation-summary.md"), `${redirectImplementationSummary.join("\n")}\n`);

console.log(
  `Content health audited ${pages.length} pages: ${summary.issueCounts.stalePages} stale, ${summary.issueCounts.thinPages} thin, ${summary.issueCounts.missingSourceUrls} missing source URLs`
);
for (const warning of reportWriteWarnings) {
  console.warn(`Warning: ${warning}`);
}
