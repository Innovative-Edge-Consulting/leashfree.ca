import posts from "../data/generated/blog-posts.json";
import breeds from "../data/generated/dog-breeds.json";
import groups from "../data/generated/breed-groups.json";
import parks from "../data/generated/parks.json";
import cities from "../data/generated/cities.json";
import provinces from "../data/generated/provinces.json";
import directories from "../data/generated/directories.json";
import dogNames from "../data/generated/dog-names.json";
import { withoutRedirectedRecords } from "./redirects.js";

export const SITE = "https://leashfree.ca";

function absoluteUrl(path) {
  return `${SITE}${path}`;
}

function itemUrl(item) {
  return item.canonicalUrl || absoluteUrl(item.routePath || "/");
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function maxDate(dates) {
  return dates.filter(Boolean).sort().at(-1) || "";
}

function itemLastmod(item) {
  return dateOnly(item.raw?.["Updated On"]);
}

function entry(loc, lastmod = "") {
  return { loc, lastmod };
}

function itemEntry(item) {
  return entry(itemUrl(item), itemLastmod(item));
}

function uniqueEntries(entries) {
  const seen = new Map();
  for (const item of entries) {
    const existing = seen.get(item.loc);
    if (!existing || item.lastmod > existing.lastmod) {
      seen.set(item.loc, item);
    }
  }
  return [...seen.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}

function sectionLastmod(entries) {
  return maxDate(entries.map((item) => item.lastmod));
}

const activeParks = withoutRedirectedRecords(parks);
const parkEntries = uniqueEntries(activeParks.map(itemEntry));
const locationEntries = uniqueEntries([...provinces.map(itemEntry), ...cities.map(itemEntry)]);
const breedEntries = uniqueEntries([...breeds.map(itemEntry), ...groups.map(itemEntry)]);
const directoryEntries = uniqueEntries(directories.map(itemEntry));
const blogEntries = uniqueEntries(posts.map(itemEntry));
const dogNameEntries = uniqueEntries(dogNames.map(itemEntry));

export const sitemapSections = [
  {
    slug: "core",
    label: "Core Pages",
    entries: uniqueEntries([
      entry(absoluteUrl("/"), maxDate([sectionLastmod(parkEntries), sectionLastmod(breedEntries), sectionLastmod(blogEntries)])),
      entry(absoluteUrl("/dog-parks/"), maxDate([sectionLastmod(parkEntries), sectionLastmod(locationEntries)])),
      entry(absoluteUrl("/dog-breeds/"), sectionLastmod(breedEntries)),
      entry(absoluteUrl("/dog-names/"), sectionLastmod(dogNameEntries)),
      entry(absoluteUrl("/dog-name-finder/"), sectionLastmod(dogNameEntries)),
      entry(absoluteUrl("/resources/")),
      entry(absoluteUrl("/resources/dog-breed-match-quiz/"), sectionLastmod(breedEntries)),
      entry(absoluteUrl("/resources/dog-calorie-calculator/")),
      entry(absoluteUrl("/resources/dog-gear-finder/")),
      entry(absoluteUrl("/blog/"), sectionLastmod(blogEntries)),
      entry(absoluteUrl("/directory/"), sectionLastmod(directoryEntries)),
      entry(absoluteUrl("/privacy-policy/")),
      entry(absoluteUrl("/terms-of-use/"))
    ])
  },
  {
    slug: "dog-parks",
    label: "Dog Parks",
    entries: parkEntries
  },
  {
    slug: "dog-park-locations",
    label: "Dog Park Locations",
    entries: locationEntries
  },
  {
    slug: "dog-breeds",
    label: "Dog Breeds",
    entries: breedEntries
  },
  {
    slug: "directory",
    label: "Directory",
    entries: directoryEntries
  },
  {
    slug: "blog",
    label: "Blog",
    entries: blogEntries
  },
  {
    slug: "dog-names",
    label: "Dog Names",
    entries: dogNameEntries
  }
];

export function getSitemapSection(slug) {
  return sitemapSections.find((section) => section.slug === slug);
}

export function renderSitemapIndex() {
  const sitemaps = sitemapSections.map((section) => ({
    loc: absoluteUrl(`/sitemaps/${section.slug}.xml`),
    lastmod: sectionLastmod(section.entries)
  }));

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map((item) => {
      const lastmod = item.lastmod ? `<lastmod>${xmlEscape(item.lastmod)}</lastmod>` : "";
      return `  <sitemap><loc>${xmlEscape(item.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("\n")}\n</sitemapindex>\n`;
}

export function renderUrlSet(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueEntries(entries)
    .map((item) => {
      const lastmod = item.lastmod ? `<lastmod>${xmlEscape(item.lastmod)}</lastmod>` : "";
      return `  <url><loc>${xmlEscape(item.loc)}</loc>${lastmod}</url>`;
    })
    .join("\n")}\n</urlset>\n`;
}

export function xmlResponse(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
