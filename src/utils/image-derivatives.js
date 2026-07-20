import manifest from "../data/generated/image-derivatives.json";

const images = manifest?.images || {};

function isLocalImagePath(src) {
  return typeof src === "string" && src.startsWith("/images/");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSrcset(entries = []) {
  return entries.map((entry) => `${entry.src} ${entry.width}w`).join(", ");
}

export function resolveOptimizedImage(src) {
  if (!isLocalImagePath(src)) return null;

  const entry = images[src];
  if (!entry) return null;

  const fallbackEntries = entry.variants?.[entry.fallbackFormat] || [];
  const sourceSets = ["avif", "webp"]
    .map((format) => {
      const variants = entry.variants?.[format] || [];
      if (variants.length === 0) return null;
      return {
        type: `image/${format}`,
        srcset: toSrcset(variants)
      };
    })
    .filter(Boolean);

  return {
    src: entry.fallbackSrc || src,
    srcset: toSrcset(fallbackEntries),
    sourceSets,
    width: entry.width,
    height: entry.height
  };
}

export function renderOptimizedImageHtml(src, {
  alt = "",
  loading = "lazy",
  sizes,
  className = ""
} = {}) {
  const derived = resolveOptimizedImage(src);
  const attrs = [
    className ? `class="${escapeHtml(className)}"` : "",
    `src="${escapeHtml(derived?.src || src || "")}"`,
    derived?.srcset ? `srcset="${escapeHtml(derived.srcset)}"` : "",
    sizes ? `sizes="${escapeHtml(sizes)}"` : "",
    `alt="${escapeHtml(alt)}"`,
    `loading="${escapeHtml(loading)}"`,
    'decoding="async"'
  ].filter(Boolean).join(" ");

  if (!derived?.sourceSets?.length) {
    return `<img ${attrs}>`;
  }

  const sources = derived.sourceSets
    .map((source) => `<source type="${escapeHtml(source.type)}" srcset="${escapeHtml(source.srcset)}"${sizes ? ` sizes="${escapeHtml(sizes)}"` : ""}>`)
    .join("");

  return `<picture>${sources}<img ${attrs}></picture>`;
}
