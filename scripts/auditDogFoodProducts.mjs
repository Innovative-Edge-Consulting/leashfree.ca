import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "dog-food-products.json");
const auditPath = path.join(rootDir, "src", "data", "dog-food-products.audit.json");
const shouldWrite = process.argv.includes("--write");

const allowedPublicStatuses = new Set(["verified", "nutrition_verified_price_estimated", "missing_price"]);
const blockedStatuses = new Set(["incomplete", "missing_calories", "unsupported"]);

const requiredTopLevelFields = [
  "id",
  "brand",
  "productName",
  "slug",
  "dataStatus",
  "productBasics",
  "ingredients",
  "guaranteedAnalysisAsFed",
  "calories",
  "packageAndPrice",
  "nutritionalAdequacy",
  "sources"
];

const nutritionFields = ["proteinMinPercent", "fatMinPercent", "fiberMaxPercent", "moistureMaxPercent"];
const priceFields = ["priceCad", "packageSizeKg", "retailerName", "retailerUrl", "priceCheckedAt"];
const ingredientFlagFields = [
  "containsChicken",
  "containsTurkey",
  "containsBeef",
  "containsPork",
  "containsLamb",
  "containsFish",
  "containsEgg",
  "containsDairy",
  "containsCorn",
  "containsWheat",
  "containsSoy",
  "containsPeas",
  "containsLentils",
  "containsPotatoes",
  "grainFree"
];

const prohibitedTerms = [
  "best",
  "healthiest",
  "recommended",
  "superior",
  "treats",
  "prevents",
  "cures",
  "allergy-friendly",
  "sensitive stomach friendly",
  "weight-loss food"
];

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isPresent = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isPositiveNumber = (value) => isFiniteNumber(value) && value > 0;

function calculateDryMatterValue(asFedPercent, moisturePercent) {
  if (!isFiniteNumber(asFedPercent) || !isFiniteNumber(moisturePercent) || moisturePercent < 0 || moisturePercent >= 100) {
    return null;
  }

  return roundTo((asFedPercent / (100 - moisturePercent)) * 100, 1);
}

function calculatePricePerKg(priceCad, packageSizeKg) {
  if (!isPositiveNumber(priceCad) || !isPositiveNumber(packageSizeKg)) return null;
  return roundTo(priceCad / packageSizeKg, 2);
}

function calculateCostPer1000Kcal(priceCad, packageSizeKg, kcalPerKg) {
  if (!isPositiveNumber(kcalPerKg)) return null;
  const pricePerKg = calculatePricePerKg(priceCad, packageSizeKg);
  if (pricePerKg === null) return null;
  return roundTo((pricePerKg * 1000) / kcalPerKg, 2);
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function addIssue(collection, severity, product, code, message, pathName = null) {
  collection.push({
    severity,
    productId: product?.id || null,
    productName: product?.brand && product?.productName ? `${product.brand} ${product.productName}` : product?.productName || null,
    code,
    path: pathName,
    message
  });
}

function sourceValue(sources, key) {
  if (isRecord(sources)) return sources[key] ?? null;
  if (!Array.isArray(sources)) return null;

  const bySupport = {
    brandProductUrl: "ingredients",
    brandNutritionUrl: "nutrition",
    retailerUrl: "price",
    packageImageUrl: "packageImage"
  };

  if (key === "sourceCheckedAt") {
    return sources.find((source) => source?.lastChecked)?.lastChecked ?? null;
  }

  const support = bySupport[key];
  return sources.find((source) => source?.supports?.includes(support))?.url ?? null;
}

function allStringFields(value, currentPath = "product") {
  if (typeof value === "string") return [{ path: currentPath, value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => allStringFields(item, `${currentPath}[${index}]`));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) => allStringFields(item, `${currentPath}.${key}`));
  }
  return [];
}

function includesProhibitedTerm(value, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(value);
}

function daysSince(dateString, now = new Date()) {
  if (!dateString || typeof dateString !== "string") return null;
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return (now.getTime() - parsed.getTime()) / 86400000;
}

function auditProduct(product, index, now) {
  const errors = [];
  const warnings = [];
  const calculations = {};
  const productLabel = product?.brand && product?.productName ? `${product.brand} ${product.productName}` : `product at index ${index}`;

  if (!isRecord(product)) {
    addIssue(errors, "error", { id: null, productName: productLabel }, "invalid_product", "Product must be an object.", `products[${index}]`);
    return { errors, warnings, calculations, isPublicEligible: false, isBlocked: true };
  }

  requiredTopLevelFields.forEach((field) => {
    if (!isPresent(product[field])) {
      addIssue(errors, "error", product, "missing_required_field", `${field} is required.`, `products[${index}].${field}`);
    }
  });

  let isPublicEligible = false;
  let isBlocked = true;
  if (!isPresent(product.dataStatus)) {
    addIssue(errors, "error", product, "missing_data_status", "dataStatus is required.", `products[${index}].dataStatus`);
  } else if (allowedPublicStatuses.has(product.dataStatus)) {
    isPublicEligible = true;
    isBlocked = false;
  } else {
    const statusKind = blockedStatuses.has(product.dataStatus) ? "blocked" : "unrecognized";
    addIssue(warnings, "warning", product, "blocked_data_status", `${product.dataStatus} is ${statusKind} and should be blocked from public display.`, `products[${index}].dataStatus`);
  }

  const analysis = isRecord(product.guaranteedAnalysisAsFed) ? product.guaranteedAnalysisAsFed : {};
  nutritionFields.forEach((field) => {
    if (!isFiniteNumber(analysis[field])) {
      addIssue(warnings, "warning", product, "missing_nutrition", `${field} is not listed.`, `products[${index}].guaranteedAnalysisAsFed.${field}`);
    }
  });

  const calories = isRecord(product.calories) ? product.calories : {};
  if (!isFiniteNumber(calories.kcalPerKg)) {
    addIssue(warnings, "warning", product, "missing_calories", "kcalPerKg is not listed.", `products[${index}].calories.kcalPerKg`);
  }

  const price = isRecord(product.packageAndPrice) ? product.packageAndPrice : {};
  priceFields.forEach((field) => {
    if (!isPresent(price[field])) {
      addIssue(warnings, "warning", product, "missing_price_field", `${field} is not listed.`, `products[${index}].packageAndPrice.${field}`);
    }
  });

  const sources = product.sources;
  const brandProductUrl = sourceValue(sources, "brandProductUrl");
  const sourceCheckedAt = sourceValue(sources, "sourceCheckedAt");
  const retailerUrl = sourceValue(sources, "retailerUrl") || price.retailerUrl;

  if (!isPresent(brandProductUrl)) {
    addIssue(warnings, "warning", product, "missing_brand_product_url", "brandProductUrl is not provided.", `products[${index}].sources.brandProductUrl`);
  }

  if (!isPresent(sourceCheckedAt)) {
    addIssue(warnings, "warning", product, "missing_source_checked_at", "sourceCheckedAt is not listed.", `products[${index}].sources.sourceCheckedAt`);
  }

  if (isPresent(price.priceCad) && !isPresent(retailerUrl)) {
    addIssue(warnings, "warning", product, "missing_retailer_url", "Product has a retailer price but no retailerUrl.", `products[${index}].packageAndPrice.retailerUrl`);
  }

  const ingredients = isRecord(product.ingredients) ? product.ingredients : {};
  if (!Array.isArray(ingredients.firstFive) || ingredients.firstFive.length === 0) {
    addIssue(warnings, "warning", product, "empty_first_five", "firstFive should not be empty.", `products[${index}].ingredients.firstFive`);
  } else if (ingredients.firstFive.length > 5) {
    addIssue(warnings, "warning", product, "too_many_first_five", "firstFive should contain no more than 5 items.", `products[${index}].ingredients.firstFive`);
  }

  if (!isPresent(ingredients.fullList)) {
    addIssue(warnings, "warning", product, "empty_ingredient_list", "full ingredient list should not be empty.", `products[${index}].ingredients.fullList`);
  }

  if (!Array.isArray(ingredients.mainProteins) || ingredients.mainProteins.length === 0) {
    addIssue(warnings, "warning", product, "empty_main_proteins", "mainProteins should not be empty.", `products[${index}].ingredients.mainProteins`);
  }

  ingredientFlagFields.forEach((field) => {
    if (ingredients[field] !== undefined && typeof ingredients[field] !== "boolean") {
      addIssue(warnings, "warning", product, "invalid_ingredient_flag", `${field} should be boolean where present.`, `products[${index}].ingredients.${field}`);
    }
  });

  const formulaText = [
    ...(Array.isArray(product.productBasics?.formulaType) ? product.productBasics.formulaType : []),
    product.productBasics?.foodType,
    product.productBasics?.lifeStage
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (ingredients.grainFree === true && /grain[-\s]?inclusive/.test(formulaText)) {
    addIssue(warnings, "warning", product, "grain_consistency", "grainFree is true but formula text appears grain-inclusive.", `products[${index}].ingredients.grainFree`);
  }

  calculations.dryMatterProtein = calculateDryMatterValue(analysis.proteinMinPercent, analysis.moistureMaxPercent);
  calculations.dryMatterFat = calculateDryMatterValue(analysis.fatMinPercent, analysis.moistureMaxPercent);
  calculations.dryMatterFibre = calculateDryMatterValue(analysis.fiberMaxPercent, analysis.moistureMaxPercent);
  calculations.pricePerKg = calculatePricePerKg(price.priceCad, price.packageSizeKg);
  calculations.costPer1000Kcal = calculateCostPer1000Kcal(price.priceCad, price.packageSizeKg, calories.kcalPerKg);

  if (calculations.dryMatterProtein !== null && (calculations.dryMatterProtein < 10 || calculations.dryMatterProtein > 60)) {
    addIssue(warnings, "warning", product, "dry_matter_protein_range", `Dry matter protein is ${calculations.dryMatterProtein}%, outside the audit range of 10% to 60%.`);
  }

  if (calculations.dryMatterFat !== null && (calculations.dryMatterFat < 3 || calculations.dryMatterFat > 40)) {
    addIssue(warnings, "warning", product, "dry_matter_fat_range", `Dry matter fat is ${calculations.dryMatterFat}%, outside the audit range of 3% to 40%.`);
  }

  if (product.productBasics?.foodType?.toLowerCase() === "dry" && isFiniteNumber(calories.kcalPerKg) && (calories.kcalPerKg < 2500 || calories.kcalPerKg > 5000)) {
    addIssue(warnings, "warning", product, "kcal_per_kg_range", `kcalPerKg is ${calories.kcalPerKg}, outside the dry food audit range of 2500 to 5000.`);
  }

  if (calculations.pricePerKg !== null && (calculations.pricePerKg < 2 || calculations.pricePerKg > 25)) {
    addIssue(warnings, "warning", product, "price_per_kg_range", `Price per kg is $${calculations.pricePerKg}, outside the audit range of $2 to $25.`);
  }

  if (calculations.costPer1000Kcal !== null && (calculations.costPer1000Kcal < 0.5 || calculations.costPer1000Kcal > 8)) {
    addIssue(warnings, "warning", product, "cost_per_1000_range", `Cost per 1,000 kcal is $${calculations.costPer1000Kcal}, outside the audit range of $0.50 to $8.`);
  }

  const priceAgeDays = daysSince(price.priceCheckedAt, now);
  if (priceAgeDays !== null && priceAgeDays > 30) {
    addIssue(warnings, "warning", product, "stale_price", `Price was checked ${Math.floor(priceAgeDays)} days ago and may have changed.`, `products[${index}].packageAndPrice.priceCheckedAt`);
  }

  allStringFields(product, `products[${index}]`).forEach((field) => {
    prohibitedTerms.forEach((term) => {
      if (includesProhibitedTerm(field.value, term)) {
        addIssue(
          warnings,
          "warning",
          product,
          "prohibited_language_review",
          `"${term}" appears in ${field.path}. Review manually if it is part of a real product name.`,
          field.path
        );
      }
    });
  });

  return { errors, warnings, calculations, isPublicEligible, isBlocked };
}

function addDuplicateIssues(products, key, severity, code, messagePrefix, issues) {
  const seen = new Map();
  products.forEach((product, index) => {
    if (!isRecord(product)) return;
    const value = key(product);
    if (!isPresent(value)) return;
    const normalized = String(value).trim().toLowerCase();
    const current = seen.get(normalized) || [];
    current.push({ product, index });
    seen.set(normalized, current);
  });

  for (const [value, matches] of seen.entries()) {
    if (matches.length <= 1) continue;
    matches.forEach(({ product, index }) => {
      addIssue(issues, severity, product, code, `${messagePrefix}: ${value}`, `products[${index}]`);
    });
  }
}

async function main() {
  const raw = (await readFile(dataPath, "utf8")).replace(/^\uFEFF/, "");
  const products = JSON.parse(raw);

  if (!Array.isArray(products)) {
    throw new Error("src/data/dog-food-products.json must contain a product array.");
  }

  const now = new Date();
  const productResults = products.map((product, index) => auditProduct(product, index, now));
  const errors = productResults.flatMap((result) => result.errors);
  const warnings = productResults.flatMap((result) => result.warnings);

  addDuplicateIssues(products, (product) => product.id, "error", "duplicate_id", "Duplicate id", errors);
  addDuplicateIssues(products, (product) => product.slug, "error", "duplicate_slug", "Duplicate slug", errors);
  addDuplicateIssues(products, (product) => `${product.brand || ""}::${product.productName || ""}`, "warning", "duplicate_brand_product_name", "Duplicate brand + productName", warnings);

  const publicProducts = productResults.filter((result) => result.isPublicEligible).length;
  const blockedProducts = productResults.filter((result) => result.isBlocked).length;

  const report = {
    generatedAt: now.toISOString(),
    dataFile: path.relative(rootDir, dataPath).replace(/\\/g, "/"),
    totals: {
      products: products.length,
      publicProducts,
      blockedProducts,
      errors: errors.length,
      warnings: warnings.length
    },
    errors,
    warnings,
    products: products.map((product, index) => ({
      id: product?.id || null,
      brand: product?.brand || null,
      productName: product?.productName || null,
      dataStatus: product?.dataStatus || null,
      isPublicEligible: productResults[index].isPublicEligible,
      isBlocked: productResults[index].isBlocked,
      calculations: productResults[index].calculations
    }))
  };

  console.log("Dog Food Product Data Audit");
  console.log("---------------------------");
  console.log(`Products: ${report.totals.products}`);
  console.log(`Public products: ${report.totals.publicProducts}`);
  console.log(`Blocked products: ${report.totals.blockedProducts}`);
  console.log(`Errors: ${report.totals.errors}`);
  console.log(`Warnings: ${report.totals.warnings}`);

  if (errors.length > 0) {
    console.log("\nErrors");
    errors.forEach((issue) => console.log(`- [${issue.code}] ${issue.productName || issue.productId || "Unknown product"}: ${issue.message}`));
  }

  if (warnings.length > 0) {
    console.log("\nWarnings");
    warnings.forEach((issue) => console.log(`- [${issue.code}] ${issue.productName || issue.productId || "Unknown product"}: ${issue.message}`));
  }

  if (shouldWrite) {
    await writeFile(auditPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nWrote ${path.relative(rootDir, auditPath).replace(/\\/g, "/")}`);
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
