import fs from "node:fs";
import path from "node:path";
import { GENERATED_DIR, SITE_DIR, ensureDir, escapeMd } from "./lib.js";

const DIST_DIR = path.join(SITE_DIR, "dist");
const PUBLIC_DIR = path.join(SITE_DIR, "public");
const SITE_URL = "https://leashfree.ca";
const shortContentThreshold = 220;

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...listFiles(full));
    else found.push(full);
  }
  return found;
}

function routeFromHtmlFile(file) {
  const rel = path.relative(DIST_DIR, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.replace(/\/index\.html$/, "/")}`;
  return `/${rel}`;
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function firstMatch(html, pattern) {
  return decodeHtml(html.match(pattern)?.[1] || "");
}

function allAttrs(html, tagName, attrName) {
  const results = [];
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  const attrPattern = new RegExp(`\\b${attrName}\\s*=\\s*(["'])(.*?)\\1`, "i");
  for (const tag of html.match(tagPattern) || []) {
    const attr = tag.match(attrPattern);
    if (attr) results.push(decodeHtml(attr[2]));
  }
  return results;
}

function tagAttr(tag, attrName) {
  const attr = tag.match(new RegExp(`\\b${attrName}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return decodeHtml(attr?.[2] || "");
}

function firstTagAttr(html, tagName, matchAttrName, matchAttrValue, returnAttrName) {
  const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  for (const tag of html.match(tagPattern) || []) {
    if (tagAttr(tag, matchAttrName).toLowerCase() === matchAttrValue.toLowerCase()) {
      return tagAttr(tag, returnAttrName);
    }
  }
  return "";
}

function fileForPublicPath(src) {
  const clean = src.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return null;
  return path.join(PUBLIC_DIR, clean.replace(/^\//, "").replace(/\//g, path.sep));
}

function distFileForRoute(route) {
  const clean = route.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return null;
  if (clean === "/") return path.join(DIST_DIR, "index.html");
  if (path.extname(clean)) return path.join(DIST_DIR, clean.replace(/^\//, "").replace(/\//g, path.sep));
  return path.join(DIST_DIR, clean.replace(/^\//, "").replace(/\//g, path.sep), "index.html");
}

function distFileForSitemapUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.origin !== SITE_URL) return null;
    return path.join(DIST_DIR, parsed.pathname.replace(/^\//, "").replace(/\//g, path.sep));
  } catch {
    return null;
  }
}

function locsFromXml(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeHtml(match[1]));
}

function sitemapRoutesFromIndex(file) {
  if (!fs.existsSync(file)) return new Set();

  const xml = fs.readFileSync(file, "utf8");
  const sitemapFiles = xml.includes("<sitemapindex")
    ? locsFromXml(xml)
        .map(distFileForSitemapUrl)
        .filter(Boolean)
    : [file];

  const routes = new Set();
  for (const sitemapFile of sitemapFiles) {
    if (!fs.existsSync(sitemapFile)) continue;
    const sitemapXml = fs.readFileSync(sitemapFile, "utf8");
    for (const loc of locsFromXml(sitemapXml)) {
      try {
        routes.add(new URL(loc).pathname);
      } catch {
        // Ignore malformed sitemap URLs; other QA checks will surface coverage issues.
      }
    }
  }

  return routes;
}

function normalizeRoute(routePath) {
  if (!routePath) return "";
  const clean = String(routePath).split("#")[0].split("?")[0];
  if (clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
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
        source: normalizeRoute(source),
        target: normalizeRoute(target),
        status
      };
    });
}

function readRedirectPlan(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")).map((item) => ({
      source: normalizeRoute(item.sourceRoute),
      target: normalizeRoute(item.targetRoute),
      confidenceScore: item.confidenceScore
    }));
  } catch {
    return [];
  }
}

function isInternalLink(href) {
  return href.startsWith("/") && !href.startsWith("//");
}

function csvLine(row) {
  return row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error("dist folder does not exist. Run npm run build before npm run qa:pages.");
}

const htmlFiles = listFiles(DIST_DIR).filter((file) => file.endsWith(".html"));
const sitemapPath = path.join(DIST_DIR, "sitemap.xml");
const redirectsPath = path.join(PUBLIC_DIR, "_redirects");
const redirectPlanPath = path.join(SITE_DIR, "reports", "redirect-plan.json");
const redirectRules = readRedirectRules(redirectsPath);
const redirectPlan = readRedirectPlan(redirectPlanPath);
const redirectRuleMap = new Map(redirectRules.map((item) => [item.source, item]));
const implementedRedirects = redirectPlan
  .map((item) => ({ ...item, rule: redirectRuleMap.get(item.source) }))
  .filter((item) => item.rule && item.rule.target === item.target && item.rule.status === "301");
const redirectSources = new Set(redirectRules.map((item) => item.source));
const implementedRedirectSources = new Set(implementedRedirects.map((item) => item.source));
const sitemapRoutes = sitemapRoutesFromIndex(sitemapPath);

const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromHtmlFile(file);
  const title = firstMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const metaDescription = firstTagAttr(html, "meta", "name", "description", "content");
  const canonical = firstTagAttr(html, "link", "rel", "canonical", "href");
  const ogTitle = firstTagAttr(html, "meta", "property", "og:title", "content");
  const ogDescription = firstTagAttr(html, "meta", "property", "og:description", "content");
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const textLength = stripTags(html).length;
  const internalLinks = allAttrs(html, "a", "href").filter(isInternalLink);
  const imageSources = allAttrs(html, "img", "src").filter(isInternalLink);
  const brokenInternalLinks = internalLinks.filter((href) => {
    const cleanHref = normalizeRoute(href);
    if (redirectSources.has(cleanHref)) return false;
    const target = distFileForRoute(href);
    return target && !fs.existsSync(target);
  });
  const redirectCoveredLinks = internalLinks.filter((href) => redirectSources.has(normalizeRoute(href)));
  const implementedRedirectCoveredLinks = internalLinks.filter((href) => implementedRedirectSources.has(normalizeRoute(href)));
  const brokenImages = imageSources.filter((src) => {
    const target = fileForPublicPath(src);
    return target && !fs.existsSync(target);
  });
  const placeholderImages = imageSources.filter((src) => src.includes("/images/placeholders/"));
  const canonicalExpected = route === "/404.html" ? "" : `${SITE_URL}${route}`;
  const isRedirectedActivePage = implementedRedirectSources.has(route);
  const missingFromSitemap = route !== "/404.html" && !isRedirectedActivePage && !sitemapRoutes.has(route);

  return {
    route,
    title,
    metaDescription,
    canonical,
    ogTitle,
    ogDescription,
    h1Count,
    textLength,
    brokenInternalLinks,
    redirectCoveredLinks,
    implementedRedirectCoveredLinks,
    brokenImages,
    placeholderImages,
    missingTitle: !title,
    missingMetaDescription: !metaDescription,
    missingH1: h1Count === 0,
    multipleH1s: h1Count > 1,
    shortContent: textLength < shortContentThreshold,
    canonicalMismatch: Boolean(canonicalExpected && canonical && canonical !== canonicalExpected),
    missingOgTags: !ogTitle || !ogDescription,
    missingFromSitemap,
    isRedirectedActivePage
  };
});

const redirectValidation = {
  implementedRedirects: implementedRedirects.length,
  permanentRedirects: implementedRedirects.filter((item) => item.rule.status === "301").length,
  sourceInSitemap: implementedRedirects.filter((item) => sitemapRoutes.has(item.source)).map((item) => item.source),
  sourceActivePages: implementedRedirects.filter((item) => fs.existsSync(distFileForRoute(item.source))).map((item) => item.source),
  missingTargets: implementedRedirects.filter((item) => !fs.existsSync(distFileForRoute(item.target))).map((item) => item.target),
  sameRouteRedirects: implementedRedirects.filter((item) => item.source === item.target).map((item) => item.source),
  redirectChains: implementedRedirects.filter((item) => redirectSources.has(item.target)).map((item) => `${item.source} -> ${item.target}`),
  planMissingRules: redirectPlan.filter((item) => !redirectRuleMap.has(item.source)).map((item) => item.source)
};

const titleCounts = pages.reduce((acc, page) => {
  if (page.title) acc[page.title] = (acc[page.title] || 0) + 1;
  return acc;
}, {});
const descriptionCounts = pages.reduce((acc, page) => {
  if (page.metaDescription) acc[page.metaDescription] = (acc[page.metaDescription] || 0) + 1;
  return acc;
}, {});
const duplicateTitles = Object.entries(titleCounts).filter(([, count]) => count > 1);
const duplicateDescriptions = Object.entries(descriptionCounts).filter(([, count]) => count > 1);

const issueCounts = {
  missingTitle: pages.filter((page) => page.missingTitle).length,
  missingMetaDescription: pages.filter((page) => page.missingMetaDescription).length,
  duplicateTitles: duplicateTitles.length,
  duplicateMetaDescriptions: duplicateDescriptions.length,
  missingH1: pages.filter((page) => page.missingH1).length,
  multipleH1s: pages.filter((page) => page.multipleH1s).length,
  brokenInternalLinks: pages.reduce((total, page) => total + page.brokenInternalLinks.length, 0),
  redirectCoveredInternalLinks: pages.reduce((total, page) => total + page.redirectCoveredLinks.length, 0),
  implementedRedirectCoveredInternalLinks: pages.reduce((total, page) => total + page.implementedRedirectCoveredLinks.length, 0),
  brokenImages: pages.reduce((total, page) => total + page.brokenImages.length, 0),
  placeholderImagePages: pages.filter((page) => page.placeholderImages.length > 0).length,
  emptyOrVeryShortPages: pages.filter((page) => page.shortContent).length,
  canonicalMismatches: pages.filter((page) => page.canonicalMismatch).length,
  missingOpenGraphTags: pages.filter((page) => page.missingOgTags).length,
  routesMissingFromSitemap: pages.filter((page) => page.missingFromSitemap).length,
  redirectedActivePages: pages.filter((page) => page.isRedirectedActivePage).length,
  redirectSourcesInSitemap: redirectValidation.sourceInSitemap.length,
  redirectMissingTargets: redirectValidation.missingTargets.length,
  redirectChains: redirectValidation.redirectChains.length
};

const issuePageSample = pages
  .filter(
    (page) =>
      page.missingTitle ||
      page.missingMetaDescription ||
      page.missingH1 ||
      page.multipleH1s ||
      page.brokenInternalLinks.length ||
      page.brokenImages.length ||
      page.placeholderImages.length ||
      page.shortContent ||
      page.canonicalMismatch ||
      page.missingOgTags ||
      page.missingFromSitemap ||
      page.isRedirectedActivePage
  )
  .slice(0, 120);

const report = [
  "# QA Page Report\n",
  `Generated at: ${new Date().toISOString()}`,
  `- HTML pages checked: ${pages.length}`,
  `- Sitemap routes found: ${sitemapRoutes.size}`,
  `- Missing title tags: ${issueCounts.missingTitle}`,
  `- Missing meta descriptions: ${issueCounts.missingMetaDescription}`,
  `- Duplicate title groups: ${issueCounts.duplicateTitles}`,
  `- Duplicate meta description groups: ${issueCounts.duplicateMetaDescriptions}`,
  `- Missing H1: ${issueCounts.missingH1}`,
  `- Multiple H1s: ${issueCounts.multipleH1s}`,
  `- Broken internal links: ${issueCounts.brokenInternalLinks}`,
  `- Redirect-covered internal links: ${issueCounts.redirectCoveredInternalLinks}`,
  `- Implemented-redirect internal links: ${issueCounts.implementedRedirectCoveredInternalLinks}`,
  `- Broken image paths: ${issueCounts.brokenImages}`,
  `- Pages using placeholder images: ${issueCounts.placeholderImagePages}`,
  `- Empty or very short pages: ${issueCounts.emptyOrVeryShortPages}`,
  `- Canonical mismatches: ${issueCounts.canonicalMismatches}`,
  `- Pages missing Open Graph title/description: ${issueCounts.missingOpenGraphTags}`,
  `- Routes missing from sitemap: ${issueCounts.routesMissingFromSitemap}`,
  `- Implemented safe redirects: ${redirectValidation.implementedRedirects}`,
  `- Redirect source routes still built as active pages: ${issueCounts.redirectedActivePages}`,
  `- Redirect source routes still in sitemap: ${issueCounts.redirectSourcesInSitemap}`,
  `- Redirect targets missing: ${issueCounts.redirectMissingTargets}`,
  `- Redirect chains: ${issueCounts.redirectChains}`,
  `- Redirect plan entries missing production rules: ${redirectValidation.planMissingRules.length}`,
  "\n## Issue Page Sample\n",
  ...(issuePageSample.length
    ? issuePageSample.map((page) => {
        const flags = [
          page.missingTitle ? "missing title" : "",
          page.missingMetaDescription ? "missing description" : "",
          page.missingH1 ? "missing H1" : "",
          page.multipleH1s ? "multiple H1s" : "",
          page.brokenInternalLinks.length ? `${page.brokenInternalLinks.length} broken links` : "",
          page.brokenImages.length ? `${page.brokenImages.length} broken images` : "",
          page.placeholderImages.length ? "placeholder image" : "",
          page.shortContent ? "short content" : "",
          page.canonicalMismatch ? "canonical mismatch" : "",
          page.missingOgTags ? "missing OG" : "",
          page.missingFromSitemap ? "missing sitemap" : "",
          page.isRedirectedActivePage ? "redirected route still active" : ""
        ].filter(Boolean);
        return `- ${escapeMd(page.route)}: ${escapeMd(flags.join(", "))}`;
      })
    : ["- None"]),
  "\n## Redirect Validation\n",
  `- Implemented redirects: ${redirectValidation.implementedRedirects}`,
  `- Permanent redirects: ${redirectValidation.permanentRedirects}`,
  `- Source routes in sitemap: ${redirectValidation.sourceInSitemap.length ? redirectValidation.sourceInSitemap.map(escapeMd).join(", ") : "None"}`,
  `- Source routes still active: ${redirectValidation.sourceActivePages.length ? redirectValidation.sourceActivePages.map(escapeMd).join(", ") : "None"}`,
  `- Missing targets: ${redirectValidation.missingTargets.length ? redirectValidation.missingTargets.map(escapeMd).join(", ") : "None"}`,
  `- Same-route redirects: ${redirectValidation.sameRouteRedirects.length ? redirectValidation.sameRouteRedirects.map(escapeMd).join(", ") : "None"}`,
  `- Redirect chains: ${redirectValidation.redirectChains.length ? redirectValidation.redirectChains.map(escapeMd).join(", ") : "None"}`,
  `- Plan entries missing production rules: ${redirectValidation.planMissingRules.length ? redirectValidation.planMissingRules.map(escapeMd).join(", ") : "None"}`,
  "\n## Duplicate Title Groups Sample\n",
  ...(duplicateTitles.length ? duplicateTitles.slice(0, 40).map(([title, count]) => `- ${escapeMd(title)} (${count})`) : ["- None"]),
  "\n## Duplicate Meta Description Groups Sample\n",
  ...(duplicateDescriptions.length ? duplicateDescriptions.slice(0, 40).map(([description, count]) => `- ${escapeMd(description)} (${count})`) : ["- None"])
];

const csvRows = [
  [
    "route",
    "title",
    "meta_description",
    "h1_count",
    "text_length",
    "broken_internal_links",
    "redirect_covered_links",
    "implemented_redirect_covered_links",
    "broken_images",
    "placeholder_images",
    "canonical",
    "missing_from_sitemap",
    "redirected_active_page",
    "notes"
  ],
  ...pages.map((page) => [
    page.route,
    page.title,
    page.metaDescription,
    page.h1Count,
    page.textLength,
    page.brokenInternalLinks.join("; "),
    page.redirectCoveredLinks.join("; "),
    page.implementedRedirectCoveredLinks.join("; "),
    page.brokenImages.join("; "),
    page.placeholderImages.length,
    page.canonical,
    page.missingFromSitemap ? "yes" : "no",
    page.isRedirectedActivePage ? "yes" : "no",
    [
      page.shortContent ? "short content" : "",
      page.canonicalMismatch ? "canonical mismatch" : "",
      page.missingOgTags ? "missing OG tags" : "",
      page.isRedirectedActivePage ? "redirected route still active" : ""
    ].filter(Boolean).join("; ")
  ])
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "qa-page-report.md"), `${report.join("\n")}\n`);
fs.writeFileSync(path.join(GENERATED_DIR, "qa-page-details.csv"), `${csvRows.map(csvLine).join("\n")}\n`);

console.log(
  `QA checked ${pages.length} pages: ${issueCounts.brokenInternalLinks} broken links, ${issueCounts.brokenImages} broken images, ${issueCounts.placeholderImagePages} placeholder-image pages`
);
