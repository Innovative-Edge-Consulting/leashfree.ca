import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const publicImagesDir = path.join(rootDir, "public", "images");
const outputRootDir = path.join(publicImagesDir, "optimized");
const manifestPath = path.join(rootDir, "src", "data", "generated", "image-derivatives.json");

const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const WIDTH_CANDIDATES = [160, 240, 320, 480, 640, 800, 960, 1200, 1600, 2000];
const TARGETED_WIDTH_CANDIDATES = [480, 960, 1600];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function publicPathFromAbsolute(filePath) {
  const relativePath = path.relative(path.join(rootDir, "public"), filePath);
  return `/${toPosix(relativePath)}`;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (absolutePath === outputRootDir) continue;
      files.push(...await walk(absolutePath));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function parseArgs(argv) {
  const options = {
    files: [],
    widths: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--files") {
      const value = argv[index + 1] || "";
      options.files = value.split(",").map((entry) => entry.trim()).filter(Boolean);
      index += 1;
      continue;
    }

    if (arg.startsWith("--files=")) {
      options.files = arg.slice("--files=".length).split(",").map((entry) => entry.trim()).filter(Boolean);
      continue;
    }

    if (arg === "--widths") {
      const value = argv[index + 1] || "";
      options.widths = value.split(",").map((entry) => Number.parseInt(entry.trim(), 10)).filter((entry) => Number.isFinite(entry) && entry > 0);
      index += 1;
      continue;
    }

    if (arg.startsWith("--widths=")) {
      options.widths = arg.slice("--widths=".length).split(",").map((entry) => Number.parseInt(entry.trim(), 10)).filter((entry) => Number.isFinite(entry) && entry > 0);
    }
  }

  return options;
}

function resolveInputFile(filePath) {
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(rootDir, filePath);
}

function targetWidths(width, widthCandidates, { includeOriginal = true } = {}) {
  const widths = widthCandidates.filter((candidate) => candidate < width);
  if (includeOriginal || widths.length === 0) widths.push(width);
  return [...new Set(widths)].sort((a, b) => a - b);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeVariant(pipeline, format, outputFile) {
  await ensureDir(path.dirname(outputFile));

  if (format === "avif") {
    await pipeline.avif({ quality: 50, effort: 7 }).toFile(outputFile);
    return;
  }

  if (format === "webp") {
    await pipeline.webp({ quality: 72, effort: 6 }).toFile(outputFile);
    return;
  }

  if (format === "png") {
    await pipeline.png({ compressionLevel: 9, effort: 9, palette: true, quality: 80 }).toFile(outputFile);
    return;
  }

  await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(outputFile);
}

async function optimizeFile(filePath, widthCandidates, { includeOriginal = true } = {}) {
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  if (!width || !height) return null;

  const hasAlpha = Boolean(metadata.hasAlpha);
  const inputExtension = path.extname(filePath).toLowerCase();
  const fallbackFormat = hasAlpha && inputExtension !== ".jpg" && inputExtension !== ".jpeg" ? "png" : "jpg";
  const widths = targetWidths(width, widthCandidates, { includeOriginal });
  const publicSrc = publicPathFromAbsolute(filePath);
  const relativeFromImages = path.relative(publicImagesDir, filePath);
  const parsed = path.parse(relativeFromImages);
  const baseOutputDir = path.join(outputRootDir, parsed.dir, parsed.name);

  const formats = fallbackFormat === "png"
    ? ["avif", "webp", "png"]
    : ["avif", "webp", "jpg"];

  const variants = Object.fromEntries(formats.map((format) => [format, []]));

  for (const variantWidth of widths) {
    const resizeOptions = {
      width: variantWidth,
      fit: "inside",
      withoutEnlargement: true
    };

    for (const format of formats) {
      const outputFile = path.join(baseOutputDir, `${variantWidth}.${format}`);
      await writeVariant(
        sharp(filePath, { animated: false }).resize(resizeOptions),
        format,
        outputFile
      );

      variants[format].push({
        width: variantWidth,
        src: publicPathFromAbsolute(outputFile)
      });
    }
  }

  return {
    src: publicSrc,
    width,
    height,
    fallbackFormat,
    fallbackSrc: variants[fallbackFormat][variants[fallbackFormat].length - 1]?.src || publicSrc,
    variants
  };
}

async function loadExistingManifest() {
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      generatedAt: parsed.generatedAt || new Date().toISOString(),
      images: parsed.images || {}
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      images: {}
    };
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetedMode = options.files.length > 0;
  const widthCandidates = options.widths?.length
    ? options.widths
    : targetedMode
      ? TARGETED_WIDTH_CANDIDATES
      : WIDTH_CANDIDATES;
  const includeOriginal = !targetedMode;

  const rasterFiles = targetedMode
    ? options.files.map(resolveInputFile)
      .filter((filePath) => RASTER_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
    : (await walk(publicImagesDir))
      .filter((filePath) => RASTER_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));

  const manifest = targetedMode
    ? await loadExistingManifest()
    : {
        generatedAt: new Date().toISOString(),
        images: {}
      };

  for (const filePath of rasterFiles) {
    const optimized = await optimizeFile(filePath, widthCandidates, { includeOriginal });
    if (!optimized) continue;
    manifest.images[optimized.src] = {
      width: optimized.width,
      height: optimized.height,
      fallbackFormat: optimized.fallbackFormat,
      fallbackSrc: optimized.fallbackSrc,
      variants: optimized.variants
    };
  }

  manifest.generatedAt = new Date().toISOString();

  await ensureDir(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(targetedMode
    ? `Optimized ${rasterFiles.length} targeted image(s) with widths ${widthCandidates.join(", ")}`
    : `Optimized ${Object.keys(manifest.images).length} images`);
}

await main();
