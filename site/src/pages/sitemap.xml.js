import posts from "../data/generated/blog-posts.json";
import breeds from "../data/generated/dog-breeds.json";
import groups from "../data/generated/breed-groups.json";
import parks from "../data/generated/parks.json";
import cities from "../data/generated/cities.json";
import provinces from "../data/generated/provinces.json";
import directories from "../data/generated/directories.json";
import dogNames from "../data/generated/dog-names.json";

const SITE = "https://leashfree.ca";

function url(path) {
  return `${SITE}${path}`;
}

function itemUrl(item) {
  return item.canonicalUrl || url(item.routePath || "/");
}

export function GET() {
  const urls = [
    url("/"),
    url("/dog-parks/"),
    url("/dog-breeds/"),
    url("/dog-names/"),
    url("/dog-name-finder/"),
    url("/resources/"),
    url("/resources/dog-calorie-calculator/"),
    url("/resources/dog-gear-finder/"),
    url("/blog/"),
    url("/directory/"),
    ...parks.map(itemUrl),
    ...cities.map(itemUrl),
    ...provinces.map(itemUrl),
    ...posts.map(itemUrl),
    ...breeds.map(itemUrl),
    ...groups.map(itemUrl),
    ...dogNames.map(itemUrl),
    ...directories.map(itemUrl)
  ];

  const uniqueUrls = [...new Set(urls)].sort();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls
    .map((entry) => `  <url><loc>${entry}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
