import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distIndexPath = path.join(rootDir, "dist", "index.html");
const reportDir = path.join(rootDir, "reports");

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? match[1] : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLocalUrl(url) {
  if (!url || !url.startsWith("/")) return null;
  if (!url.startsWith("/images/")) return null;
  return url.split("?")[0].split("#")[0];
}

function extractSrcsetUrls(value) {
  return unique(
    String(value || "")
      .split(",")
      .map((entry) => normalizeLocalUrl(entry.trim().split(/\s+/)[0]))
  );
}

async function statLocalUrl(url) {
  const filePath = path.join(rootDir, "dist", url.replace(/^\//, "").replaceAll("/", path.sep));
  try {
    const stats = await fs.stat(filePath);
    return { url, filePath, size: stats.size };
  } catch {
    return { url, filePath, size: null };
  }
}

async function main() {
  const html = await fs.readFile(distIndexPath, "utf8");
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const pictureTags = [...html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi)].map((match) => match[0]);

  const localImgSrcs = unique(imgTags.map((tag) => normalizeLocalUrl(attr(tag, "src"))));
  const localImgSrcsets = unique(imgTags.flatMap((tag) => extractSrcsetUrls(attr(tag, "srcset"))));
  const eagerImgSrcs = unique(
    imgTags
      .filter((tag) => /loading="eager"/i.test(tag) || /fetchpriority="high"/i.test(tag))
      .map((tag) => normalizeLocalUrl(attr(tag, "src")))
  );

  const localPictureSourceUrls = unique(
    pictureTags.flatMap((tag) => [...tag.matchAll(/<source\b[^>]*srcset="([^"]*)"/gi)].flatMap((match) => extractSrcsetUrls(match[1])))
  );

  const allReferencedLocalUrls = unique([
    ...localImgSrcs,
    ...localImgSrcsets,
    ...localPictureSourceUrls
  ]);

  const fileStats = await Promise.all(allReferencedLocalUrls.map(statLocalUrl));
  const sizeByUrl = new Map(fileStats.map((item) => [item.url, item.size]));

  const optimizedFallbacks = localImgSrcs.filter((url) => url.startsWith("/images/optimized/"));
  const rawFallbacks = localImgSrcs.filter((url) => !url.startsWith("/images/optimized/"));
  const originalRawFallbacks = rawFallbacks.filter((url) => /-original\.(png|jpe?g|webp)$/i.test(url));
  const eagerStats = eagerImgSrcs.map((url) => ({ url, size: sizeByUrl.get(url) ?? null }));
  const referencedSorted = [...fileStats]
    .filter((item) => Number.isFinite(item.size))
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0));

  const totals = {
    uniqueLocalAssets: allReferencedLocalUrls.length,
    localImgFallbacks: localImgSrcs.length,
    optimizedFallbacks: optimizedFallbacks.length,
    rawFallbacks: rawFallbacks.length,
    originalRawFallbacks: originalRawFallbacks.length,
    eagerLocalFallbackBytes: eagerStats.reduce((sum, item) => sum + (item.size || 0), 0),
    totalReferencedLocalBytes: referencedSorted.reduce((sum, item) => sum + (item.size || 0), 0)
  };

  const reportDate = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(reportDir, `homepage-image-audit-${reportDate}.md`);

  const lines = [
    `# Homepage image audit (${reportDate})`,
    "",
    "## Summary",
    "",
    `- Homepage local image fallback sources: ${totals.localImgFallbacks}`,
    `- Optimized fallback sources: ${totals.optimizedFallbacks}`,
    `- Raw fallback sources: ${totals.rawFallbacks}`,
    `- Raw *-original* fallback sources: ${totals.originalRawFallbacks}`,
    `- Unique referenced local image assets across src/srcset/picture sources: ${totals.uniqueLocalAssets}`,
    `- Eager local fallback payload: ${formatBytes(totals.eagerLocalFallbackBytes)}`,
    `- Total referenced local asset bytes in homepage markup: ${formatBytes(totals.totalReferencedLocalBytes)}`,
    "",
    "## Eager local fallback images",
    "",
    ...(
      eagerStats.length
        ? eagerStats.map((item) => `- \`${item.url}\` — ${formatBytes(item.size || 0)}`)
        : ["- None"]
    ),
    "",
    "## Largest referenced local assets",
    "",
    ...(
      referencedSorted.slice(0, 15).map((item) => `- \`${item.url}\` — ${formatBytes(item.size || 0)}`)
    ),
    ""
  ];

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`Homepage audit written: ${path.relative(rootDir, reportPath)}`);
  console.log(JSON.stringify({
    reportPath: path.relative(rootDir, reportPath),
    ...totals
  }, null, 2));
}

await main();
