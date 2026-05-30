export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function excerpt(value, fallback = "", maxLength = 220) {
  const text = decodeHtmlEntities(String(value || fallback || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export function cityPath(city) {
  return city?.slug ? `/dog-parks/${city.slug}/` : "";
}

export function provincePath(province) {
  return province?.slug ? `/dog-parks/${province.slug}/` : "";
}

export function findByName(items, name) {
  const wanted = slugify(name);
  return items.find((item) => slugify(item.name) === wanted || item.slug === wanted);
}

export function stripHtml(value) {
  return decodeHtmlEntities(String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

export function decodeHtmlEntities(value) {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\""
  };

  return String(value || "").replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return entities[normalized] || match;
  });
}

export function firstValue(...values) {
  return values.find((value) => String(value || "").trim()) || "";
}

export function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `https://leashfree.ca${item.href}` : undefined
    }))
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LeashFree.ca",
    url: "https://leashfree.ca",
    description: "Canadian dog park, dog breed, and pet resource directory.",
    inLanguage: "en-CA"
  };
}
