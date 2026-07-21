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

function clampVariants(variants = [], maxWidth) {
  if (!maxWidth || !Number.isFinite(maxWidth) || maxWidth <= 0) return variants;
  const filtered = variants.filter((entry) => entry.width <= maxWidth);
  if (filtered.length > 0) return filtered;
  return variants.length > 0 ? [variants[0]] : [];
}

function scaledHeight(width, originalWidth, originalHeight) {
  if (!width || !originalWidth || !originalHeight) return originalHeight;
  return Math.round((originalHeight * width) / originalWidth);
}

export function resolveOptimizedImage(src, { maxWidth } = {}) {
  if (!isLocalImagePath(src)) return null;

  const entry = images[src];
  if (!entry) return null;

  const fallbackEntries = clampVariants(entry.variants?.[entry.fallbackFormat] || [], maxWidth);
  const fallbackAsset = fallbackEntries[fallbackEntries.length - 1];
  const sourceSets = ["avif", "webp"]
    .map((format) => {
      const variants = clampVariants(entry.variants?.[format] || [], maxWidth);
      if (variants.length === 0) return null;
      return {
        type: `image/${format}`,
        srcset: toSrcset(variants)
      };
    })
    .filter(Boolean);

  return {
    src: fallbackAsset?.src || entry.fallbackSrc || src,
    srcset: toSrcset(fallbackEntries),
    sourceSets,
    width: fallbackAsset?.width || entry.width,
    height: scaledHeight(fallbackAsset?.width || entry.width, entry.width, entry.height)
  };
}

export function renderOptimizedImageHtml(src, {
  alt = "",
  loading = "lazy",
  sizes,
  className = "",
  maxWidth
} = {}) {
  const derived = resolveOptimizedImage(src, { maxWidth });
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
