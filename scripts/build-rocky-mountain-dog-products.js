import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sitemapUrl = "https://rockymountaindog.com/sitemap_products_1.xml?from=952856969252&to=9426364629236";
const outputPath = path.join("src", "data", "generated", "rocky-mountain-dog-products.json");
const affiliateRef = "ladlcphb";

const decodeXml = (value = "") =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const stripTags = (value = "") => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const slugFromUrl = (url) => {
  const parsed = new URL(url);
  return parsed.pathname.split("/").filter(Boolean).at(-1) || "";
};

const inferCategory = (title, slug) => {
  const haystack = `${title} ${slug}`.toLowerCase();
  if (haystack.includes("leash") || haystack.includes("grab handle")) return "Leashes";
  if (haystack.includes("collar") || haystack.includes("martingale")) return "Collars";
  if (haystack.includes("harness") || haystack.includes("backpack") || haystack.includes("sport sack")) return "Harnesses & packs";
  if (haystack.includes("bandana") || haystack.includes("patch") || haystack.includes("sticker")) return "Accessories";
  if (haystack.includes("treat") || haystack.includes("jerky") || haystack.includes("sardine") || haystack.includes("biscuits")) return "Treats";
  if (haystack.includes("poo") || haystack.includes("poop") || haystack.includes("bag dispenser")) return "Cleanup";
  if (haystack.includes("cream") || haystack.includes("first aid") || haystack.includes("safety") || haystack.includes("goggles") || haystack.includes("earpro")) return "Safety & care";
  if (haystack.includes("toy") || haystack.includes("ball")) return "Toys";
  if (haystack.includes("bed") || haystack.includes("sleeping bag")) return "Beds & travel";
  if (haystack.includes("hoodie") || haystack.includes("shirt") || haystack.includes("hat") || haystack.includes("toque") || haystack.includes("tank")) return "Apparel";
  return "Adventure gear";
};

const productHref = (url) => {
  const source = new URL(url);
  return `https://rockymountaindog.ca${source.pathname}?ref=${affiliateRef}`;
};

const xml = await fetch(sitemapUrl).then((response) => {
  if (!response.ok) {
    throw new Error(`Unable to fetch ${sitemapUrl}: ${response.status} ${response.statusText}`);
  }
  return response.text();
});

const products = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map(([, block]) => {
    const loc = decodeXml(block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1] || "");
    if (!loc.includes("/products/")) return null;

    const title = stripTags(decodeXml(block.match(/<image:title>([\s\S]*?)<\/image:title>/)?.[1] || ""));
    const image = decodeXml(block.match(/<image:loc>([\s\S]*?)<\/image:loc>/)?.[1] || "");
    const caption = stripTags(decodeXml(block.match(/<image:caption>([\s\S]*?)<\/image:caption>/)?.[1] || ""));
    const lastmod = decodeXml(block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1] || "");
    const slug = slugFromUrl(loc);

    if (!title || !image || /carbon removal/i.test(title)) return null;

    return {
      title,
      slug,
      category: inferCategory(title, slug),
      sourceUrl: productHref(loc),
      image,
      caption,
      lastmod
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title));

const featuredCategoryOrder = ["Harnesses & packs", "Leashes", "Collars", "Safety & care", "Cleanup", "Beds & travel", "Toys"];
products.sort((a, b) => {
  const categoryScore = featuredCategoryOrder.indexOf(a.category) - featuredCategoryOrder.indexOf(b.category);
  if (featuredCategoryOrder.includes(a.category) && featuredCategoryOrder.includes(b.category) && categoryScore !== 0) {
    return categoryScore;
  }
  if (featuredCategoryOrder.includes(a.category)) return -1;
  if (featuredCategoryOrder.includes(b.category)) return 1;
  return a.title.localeCompare(b.title);
});

const categories = [...new Set(products.map((product) => product.category))].sort();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      source: sitemapUrl,
      generatedAt: new Date().toISOString(),
      affiliateRef,
      sponsorUrl: `https://rockymountaindog.ca/?ref=${affiliateRef}`,
      logoUrl: "https://rockymountaindog.ca/cdn/shop/files/Rocky-Mountain-Dog-logo-2025_300x300@2x.png?v=1750177034",
      brandColor: "#0378fc",
      categories,
      products
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log(`Wrote ${products.length} Rocky Mountain Dog products to ${outputPath}`);
