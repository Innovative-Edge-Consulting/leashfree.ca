import type { DataStatus, DogFoodProductForComparison } from "./dogFoodComparisonHighlights";

type ValidationResult = {
  isPublicDisplay: boolean;
  reasons: string[];
  product: DogFoodProductForComparison | null;
};

const PUBLIC_DATA_STATUSES: DataStatus[] = ["verified", "nutrition_verified_price_estimated", "missing_price"];
const BLOCKED_DATA_STATUSES = new Set(["incomplete", "missing_calories", "unsupported"]);

const requiredTopLevelFields = [
  "id",
  "brand",
  "productName",
  "slug",
  "dataStatus",
  "dataQualityNotes",
  "productBasics",
  "ingredients",
  "guaranteedAnalysisAsFed",
  "calories",
  "packageAndPrice",
  "nutritionalAdequacy",
  "sources"
];

const requiredProductBasicsFields = ["foodType", "lifeStage", "madeInCanada"];
const requiredIngredientFields = ["fullList", "firstFive", "mainProteins", "grainFree"];
const requiredAnalysisFields = ["proteinMinPercent", "fatMinPercent", "fiberMaxPercent", "moistureMaxPercent"];
const requiredCaloriesFields = ["kcalPerKg"];
const requiredPackageFields = ["packageSizeKg"];
const requiredSourceFields = ["brandProductUrl", "brandNutritionUrl", "sourceCheckedAt"];

const isRecord = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isPresent = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const isNumberOrNull = (value: unknown) => value === null || (typeof value === "number" && Number.isFinite(value));

function addMissingFields(reasons: string[], object: Record<string, any>, fields: string[], prefix: string) {
  fields.forEach((field) => {
    if (!isPresent(object[field])) {
      reasons.push(`${prefix}.${field} is required`);
    }
  });
}

function normalizeSources(product: Record<string, any>) {
  const sources = product.sources;
  if (Array.isArray(sources)) {
    return sources.map((source) => ({
      label: source.label || source.url || "Source",
      url: source.url || null,
      lastChecked: source.lastChecked || source.sourceCheckedAt || null,
      supports: Array.isArray(source.supports) ? source.supports : []
    }));
  }

  if (!isRecord(sources)) {
    return [];
  }

  const sourceCheckedAt = sources.sourceCheckedAt || null;
  const normalized = [
    {
      label: "Brand product page",
      url: sources.brandProductUrl || null,
      lastChecked: sourceCheckedAt,
      supports: ["ingredients", "nutrition", "calories"]
    },
    {
      label: "Brand nutrition page",
      url: sources.brandNutritionUrl || null,
      lastChecked: sourceCheckedAt,
      supports: ["nutrition", "calories"]
    },
    {
      label: "Retailer page",
      url: sources.retailerUrl || null,
      lastChecked: sourceCheckedAt,
      supports: ["price"]
    },
    {
      label: "Package image",
      url: sources.packageImageUrl || null,
      lastChecked: sourceCheckedAt,
      supports: ["packageImage"]
    }
  ].filter((source) => source.url);

  if (product.productBasics?.manufacturingClaimSourceUrl) {
    normalized.push({
      label: "Manufacturing claim source",
      url: product.productBasics.manufacturingClaimSourceUrl,
      lastChecked: sourceCheckedAt,
      supports: ["manufacturing"]
    });
  }

  return normalized;
}

function normalizeProduct(product: Record<string, any>): DogFoodProductForComparison {
  const basics = product.productBasics || {};
  const ingredients = product.ingredients || {};
  const sources = normalizeSources(product);

  return {
    id: product.id,
    brand: product.brand,
    productName: product.productName,
    slug: product.slug ?? null,
    dataQualityNotes: product.dataQualityNotes ?? null,
    status: {
      dataStatus: product.dataStatus,
      publicDisplay: true
    },
    productBasics: {
      foodType: basics.foodType ?? null,
      lifeStage: basics.lifeStage ?? null,
      mainProteins: ingredients.mainProteins || basics.mainProteins || [],
      grainFree: ingredients.grainFree ?? basics.grainFree ?? null,
      limitedIngredient: basics.formulaType?.some((value: string) => /limited|single/i.test(value)) ?? false,
      madeInCanada: basics.madeInCanada ?? null,
      manufacturingClaim: basics.manufacturingClaim ?? null,
      manufacturingNote: basics.manufacturingClaim || null,
      tags: basics.formulaType || []
    },
    ingredients: {
      fullList: ingredients.fullList ?? null,
      firstFive: ingredients.firstFive || [],
      ingredientFlags: {
        containsChicken: ingredients.containsChicken,
        containsBeef: ingredients.containsBeef,
        containsFish: ingredients.containsFish,
        containsEgg: ingredients.containsEgg,
        containsDairy: ingredients.containsDairy,
        containsGrain: ingredients.grainFree === null || ingredients.grainFree === undefined ? null : !ingredients.grainFree,
        containsPeas: ingredients.containsPeas,
        containsLentils: ingredients.containsLentils,
        containsPotatoes: ingredients.containsPotatoes,
        containsWheat: ingredients.containsWheat,
        containsCorn: ingredients.containsCorn,
        containsSoy: ingredients.containsSoy
      }
    },
    guaranteedAnalysisAsFed: product.guaranteedAnalysisAsFed || null,
    calories: product.calories || null,
    packageAndPrice: product.packageAndPrice || null,
    nutritionalAdequacy: product.nutritionalAdequacy || null,
    sources
  };
}

export function validateDogFoodProductForPublicDisplay(value: unknown): ValidationResult {
  const reasons: string[] = [];

  if (!isRecord(value)) {
    return { isPublicDisplay: false, reasons: ["Product must be an object"], product: null };
  }

  addMissingFields(reasons, value, requiredTopLevelFields, "product");

  const dataStatus = value.dataStatus;
  if (typeof dataStatus !== "string") {
    reasons.push("product.dataStatus must be a string");
  } else if (BLOCKED_DATA_STATUSES.has(dataStatus) || !PUBLIC_DATA_STATUSES.includes(dataStatus as DataStatus)) {
    reasons.push(`product.dataStatus '${dataStatus}' is not eligible for public display`);
  }

  if (isRecord(value.productBasics)) {
    addMissingFields(reasons, value.productBasics, requiredProductBasicsFields, "productBasics");
  }

  if (isRecord(value.ingredients)) {
    addMissingFields(reasons, value.ingredients, requiredIngredientFields, "ingredients");
  }

  if (isRecord(value.guaranteedAnalysisAsFed)) {
    addMissingFields(reasons, value.guaranteedAnalysisAsFed, requiredAnalysisFields, "guaranteedAnalysisAsFed");
    requiredAnalysisFields.forEach((field) => {
      if (!isNumberOrNull(value.guaranteedAnalysisAsFed[field])) {
        reasons.push(`guaranteedAnalysisAsFed.${field} must be a number`);
      }
    });
  }

  if (isRecord(value.calories)) {
    addMissingFields(reasons, value.calories, requiredCaloriesFields, "calories");
    if (!isNumberOrNull(value.calories.kcalPerKg) || value.calories.kcalPerKg === null) {
      reasons.push("calories.kcalPerKg must be a listed number");
    }
  }

  if (isRecord(value.packageAndPrice)) {
    addMissingFields(reasons, value.packageAndPrice, requiredPackageFields, "packageAndPrice");
    if (!isNumberOrNull(value.packageAndPrice.packageSizeKg) || value.packageAndPrice.packageSizeKg === null) {
      reasons.push("packageAndPrice.packageSizeKg must be a listed number");
    }
    if (dataStatus === "verified" && value.packageAndPrice.priceCad == null) {
      reasons.push("packageAndPrice.priceCad is required when dataStatus is verified");
    }
  }

  if (isRecord(value.sources)) {
    addMissingFields(reasons, value.sources, requiredSourceFields, "sources");
  } else if (Array.isArray(value.sources)) {
    if (!value.sources.some((source) => source?.url)) {
      reasons.push("sources must include at least one URL");
    }
  }

  return {
    isPublicDisplay: reasons.length === 0,
    reasons,
    product: reasons.length === 0 ? normalizeProduct(value) : null
  };
}

export function validateAndNormalizeDogFoodProducts(values: unknown[]) {
  const results = values.map(validateDogFoodProductForPublicDisplay);
  return {
    products: results.flatMap((result) => (result.product ? [result.product] : [])),
    blocked: results.filter((result) => !result.isPublicDisplay)
  };
}
