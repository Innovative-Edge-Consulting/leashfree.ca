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
  const text = decodeHtmlEntities(normalizeMojibake(String(value || fallback || ""))
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
  return decodeHtmlEntities(normalizeMojibake(String(value || ""))
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

export function normalizeMojibake(value) {
  const input = String(value || "");
  if (!input) return "";

  const replacements = [
    [/Ã¢â‚¬â„¢/g, "'"],
    [/Ã¢â‚¬Ëœ/g, "'"],
    [/Ã¢â‚¬Å“/g, "\""],
    [/Ã¢â‚¬Â/g, "\""],
    [/Ã¢â‚¬â€œ/g, "–"],
    [/Ã¢â‚¬â€/g, "—"],
    [/Ã¢â‚¬Â¦/g, "..."],
    [/Ã‚Â°/g, "°"],
    [/Ã‚Â/g, ""],
    [/Ã¢Ë†â€™/g, "−"],
    [/Ã¢Å“â€Ã¯Â¸Â/g, "•"],
    [/Ã¢â‚¬Â/g, ""],
    [/Ã°Å¸ÂÂ¾/g, ""],
    [/Ã°Å¸â€™Â¡/g, "💡"],
    [/Ã°Å¸â€˜â€°/g, "👉"],
    [/Ã¢Å“â€¦/g, "✅"]
  ];

  let current = input;

  const suspicious = /[ÃÂâÅðŸ]/;
  const suspiciousCount = (text) => (text.match(/[ÃÂâÅðŸ]/g) || []).length;

  for (let index = 0; index < 3; index += 1) {
    if (!suspicious.test(current)) break;
    try {
      const repaired = decodeWindows1252Mojibake(current);
      if (!repaired || repaired === current) break;
      if (suspiciousCount(repaired) > suspiciousCount(current)) break;
      current = repaired;
    } catch {
      break;
    }
  }

  for (const [pattern, replacement] of replacements) {
    current = current.replace(pattern, replacement);
  }

  return current;
}

function decodeWindows1252Mojibake(value) {
  const bytes = windows1252Bytes(value);
  return Buffer.from(bytes).toString("utf8");
}

function windows1252Bytes(value) {
  const windows1252 = new Map([
    [0x20AC, 0x80],
    [0x201A, 0x82],
    [0x0192, 0x83],
    [0x201E, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02C6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8A],
    [0x2039, 0x8B],
    [0x0152, 0x8C],
    [0x017D, 0x8E],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201C, 0x93],
    [0x201D, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02DC, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9A],
    [0x203A, 0x9B],
    [0x0153, 0x9C],
    [0x017E, 0x9E],
    [0x0178, 0x9F]
  ]);
  const bytes = [];

  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0xFF) {
      bytes.push(codePoint);
      continue;
    }

    const byte = windows1252.get(codePoint);
    if (byte !== undefined) {
      bytes.push(byte);
      continue;
    }

    bytes.push(...Buffer.from(char, "utf8"));
  }

  return bytes;
}

export function firstValue(...values) {
  return values.find((value) => String(value || "").trim()) || "";
}

export function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function isPublishedNow(item, now = new Date()) {
  const value = item?.raw?.["Published On"] || item?.publishedDate || item?.date;
  if (!value) return true;

  const publishedAt = new Date(value);
  if (Number.isNaN(publishedAt.getTime())) return true;

  return publishedAt.getTime() <= now.getTime();
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
