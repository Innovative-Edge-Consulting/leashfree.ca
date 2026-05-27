import fs from "node:fs";
import path from "node:path";
import { GENERATED_DIR, ROOT_DIR, SITE_DIR, ensureDir, escapeMd } from "./lib.js";

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
const sitemapText = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const redirectsPath = path.join(PUBLIC_DIR, "_redirects");
const redirectSources = new Set(
  fs.existsSync(redirectsPath)
    ? fs
        .readFileSync(redirectsPath, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => line.split(/\s+/)[0])
    : []
);
const sitemapRoutes = new Set(
  [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1]).pathname;
    } catch {
      return "";
    }
  }).filter(Boolean)
);

const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromHtmlFile(file);
  const title = firstMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const metaDescription = firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const canonical = firstMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  const ogTitle = firstMatch(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
  const ogDescription = firstMatch(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const textLength = stripTags(html).length;
  const internalLinks = allAttrs(html, "a", "href").filter(isInternalLink);
  const imageSources = allAttrs(html, "img", "src").filter(isInternalLink);
  const brokenInternalLinks = internalLinks.filter((href) => {
    const cleanHref = href.split("#")[0].split("?")[0];
    if (redirectSources.has(cleanHref)) return false;
    const target = distFileForRoute(href);
    return target && !fs.existsSync(target);
  });
  const redirectCoveredLinks = internalLinks.filter((href) => redirectSources.has(href.split("#")[0].split("?")[0]));
  const brokenImages = imageSources.filter((src) => {
    const target = fileForPublicPath(src);
    return target && !fs.existsSync(target);
  });
  const placeholderImages = imageSources.filter((src) => src.includes("/images/placeholders/"));
  const canonicalExpected = route === "/404.html" ? "" : `${SITE_URL}${route}`;
  const missingFromSitemap = route !== "/404.html" && !sitemapRoutes.has(route);

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
    brokenImages,
    placeholderImages,
    missingTitle: !title,
    missingMetaDescription: !metaDescription,
    missingH1: h1Count === 0,
    multipleH1s: h1Count > 1,
    shortContent: textLength < shortContentThreshold,
    canonicalMismatch: Boolean(canonicalExpected && canonical && canonical !== canonicalExpected),
    missingOgTags: !ogTitle || !ogDescription,
    missingFromSitemap
  };
});

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
  brokenImages: pages.reduce((total, page) => total + page.brokenImages.length, 0),
  placeholderImagePages: pages.filter((page) => page.placeholderImages.length > 0).length,
  emptyOrVeryShortPages: pages.filter((page) => page.shortContent).length,
  canonicalMismatches: pages.filter((page) => page.canonicalMismatch).length,
  missingOpenGraphTags: pages.filter((page) => page.missingOgTags).length,
  routesMissingFromSitemap: pages.filter((page) => page.missingFromSitemap).length
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
      page.missingFromSitemap
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
  `- Broken image paths: ${issueCounts.brokenImages}`,
  `- Pages using placeholder images: ${issueCounts.placeholderImagePages}`,
  `- Empty or very short pages: ${issueCounts.emptyOrVeryShortPages}`,
  `- Canonical mismatches: ${issueCounts.canonicalMismatches}`,
  `- Pages missing Open Graph title/description: ${issueCounts.missingOpenGraphTags}`,
  `- Routes missing from sitemap: ${issueCounts.routesMissingFromSitemap}`,
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
          page.missingFromSitemap ? "missing sitemap" : ""
        ].filter(Boolean);
        return `- ${escapeMd(page.route)}: ${escapeMd(flags.join(", "))}`;
      })
    : ["- None"]),
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
    "broken_images",
    "placeholder_images",
    "canonical",
    "missing_from_sitemap",
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
    page.brokenImages.join("; "),
    page.placeholderImages.length,
    page.canonical,
    page.missingFromSitemap ? "yes" : "no",
    [
      page.shortContent ? "short content" : "",
      page.canonicalMismatch ? "canonical mismatch" : "",
      page.missingOgTags ? "missing OG tags" : ""
    ].filter(Boolean).join("; ")
  ])
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "qa-page-report.md"), `${report.join("\n")}\n`);
fs.writeFileSync(path.join(ROOT_DIR, "migration-prep", "phase-6-page-qa-report.md"), `${report.join("\n")}\n`);
fs.writeFileSync(path.join(GENERATED_DIR, "qa-page-details.csv"), `${csvRows.map(csvLine).join("\n")}\n`);

console.log(
  `QA checked ${pages.length} pages: ${issueCounts.brokenInternalLinks} broken links, ${issueCounts.brokenImages} broken images, ${issueCounts.placeholderImagePages} placeholder-image pages`
);
