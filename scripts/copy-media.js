import fs from "node:fs";
import path from "node:path";
import { GENERATED_DIR, MEDIA_MAP_PATH, ROOT_DIR, SITE_DIR, ensureDir, escapeMd, readJson, writeJson } from "./lib.js";

const writeMode = process.argv.includes("--write");
const dryRun = !writeMode;
const mediaMap = fs.existsSync(MEDIA_MAP_PATH) ? readJson(MEDIA_MAP_PATH) : { items: [] };
const copied = [];
const skipped = [];
const conflicts = [];

function absFromRoot(relativePath) {
  return path.join(ROOT_DIR, relativePath.replace(/\//g, path.sep));
}

function absPublic(publicPath) {
  return path.join(SITE_DIR, "public", publicPath.replace(/^\//, "").replace(/\//g, path.sep));
}

function fileHashLike(file) {
  const stat = fs.statSync(file);
  return `${stat.size}:${stat.mtimeMs}`;
}

function filesIdentical(source, dest) {
  if (!fs.existsSync(source) || !fs.existsSync(dest)) return false;
  if (fs.statSync(source).size !== fs.statSync(dest).size) return false;
  return fs.readFileSync(source).equals(fs.readFileSync(dest));
}

function uniqueDestination(dest) {
  if (!fs.existsSync(dest)) return dest;
  const parsed = path.parse(dest);
  for (let index = 2; index < 1000; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not create conflict-free destination for ${dest}`);
}

function publicFromAbs(file) {
  return `/${path.relative(path.join(SITE_DIR, "public"), file).replace(/\\/g, "/")}`;
}

function shouldCopy(item) {
  return (
    item.originalSourcePath &&
    item.publicPath &&
    (item.matchConfidence === "high" || item.matchConfidence === "medium") &&
    (item.matchStatus === "copy_ready" || item.matchStatus === "published" || item.status === "matched")
  );
}

for (const item of mediaMap.items || []) {
  if (!shouldCopy(item)) {
    skipped.push({
      item,
      reason: item.originalSourcePath ? `not copy eligible (${item.matchConfidence || "none"})` : "no matched source file"
    });
    continue;
  }

  const source = absFromRoot(item.originalSourcePath);
  if (!fs.existsSync(source)) {
    skipped.push({ item, reason: "matched source file is missing" });
    continue;
  }

  let dest = absPublic(item.publicPath);
  let finalPublicPath = item.publicPath;
  let action = "copy";

  if (fs.existsSync(dest)) {
    if (filesIdentical(source, dest)) {
      action = "already exists";
    } else {
      const nextDest = uniqueDestination(dest);
      conflicts.push({
        requestedPublicPath: item.publicPath,
        resolvedPublicPath: publicFromAbs(nextDest),
        source: item.originalSourcePath
      });
      dest = nextDest;
      finalPublicPath = publicFromAbs(nextDest);
      action = "copy with suffix";
    }
  }

  if (writeMode && action !== "already exists") {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(source, dest);
  }

  item.publicPath = finalPublicPath;
  item.publicPathReady = writeMode ? fs.existsSync(dest) : fs.existsSync(dest);
  item.status = item.publicPathReady ? "published" : "copy_ready";
  item.matchStatus = item.publicPathReady ? "published" : "copy_ready";
  item.notes = [...(item.notes || []), dryRun ? `Dry run would ${action} to ${finalPublicPath}.` : `${action} to ${finalPublicPath}.`];

  copied.push({
    item,
    action,
    source: item.originalSourcePath,
    destination: path.relative(ROOT_DIR, dest).replace(/\\/g, "/"),
    publicPath: finalPublicPath,
    sourceFingerprint: fileHashLike(source)
  });
}

if (writeMode) {
  mediaMap.generatedAt = new Date().toISOString();
  mediaMap.items = mediaMap.items || [];
  mediaMap.missingLocalFiles = mediaMap.items.filter((item) => !item.originalSourcePath);
  mediaMap.unresolvedItems = mediaMap.items.filter((item) => !item.publicPathReady);
  writeJson(MEDIA_MAP_PATH, mediaMap);
}

const summary = {
  generatedAt: new Date().toISOString(),
  mode: dryRun ? "dry-run" : "write",
  copiedCount: copied.filter((row) => row.action !== "already exists").length,
  alreadyExistsCount: copied.filter((row) => row.action === "already exists").length,
  eligibleCount: copied.length,
  skippedCount: skipped.length,
  conflictCount: conflicts.length
};

const report = [
  "# Phase 5 Media Copy Report\n",
  `Generated at: ${summary.generatedAt}`,
  `- Mode: ${summary.mode}`,
  `- Eligible media rows: ${summary.eligibleCount}`,
  `- Files copied: ${summary.copiedCount}`,
  `- Already present: ${summary.alreadyExistsCount}`,
  `- Skipped rows: ${summary.skippedCount}`,
  `- Filename conflicts resolved: ${summary.conflictCount}`,
  "\n## Copied / Copy-Ready Sample\n",
  ...(copied.length
    ? copied
        .slice(0, 120)
        .map((row) => `- ${escapeMd(row.action)}: ${escapeMd(row.source)} -> ${escapeMd(row.publicPath)} (${escapeMd(row.item.matchConfidence)})`)
    : ["- None"]),
  "\n## Skipped Summary\n",
  ...Object.entries(
    skipped.reduce((acc, row) => {
      acc[row.reason] = (acc[row.reason] || 0) + 1;
      return acc;
    }, {})
  ).map(([reason, count]) => `- ${escapeMd(reason)}: ${count}`),
  "\n## Conflicts\n",
  ...(conflicts.length
    ? conflicts.map((row) => `- ${escapeMd(row.requestedPublicPath)} -> ${escapeMd(row.resolvedPublicPath)}`)
    : ["- None"])
];

ensureDir(GENERATED_DIR);
fs.writeFileSync(path.join(GENERATED_DIR, "media-copy-report.md"), `${report.join("\n")}\n`);
fs.writeFileSync(path.join(ROOT_DIR, "migration-prep", "phase-5-media-copy-report.md"), `${report.join("\n")}\n`);

console.log(
  `${dryRun ? "Dry run" : "Copied media"}: ${summary.eligibleCount} eligible, ${summary.copiedCount} copied, ${summary.alreadyExistsCount} already present, ${summary.skippedCount} skipped, ${summary.conflictCount} conflicts`
);
