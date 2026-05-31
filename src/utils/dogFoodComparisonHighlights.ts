import {
  calculateCostPer1000Kcal,
  calculateDryMatterValue,
  calculateEstimatedDailyCost,
  calculatePricePerKg,
  estimateCarbsAsFed,
  estimateCarbsDryMatter,
  type CarbEstimate,
  type GuaranteedAnalysisAsFed
} from "./dogFoodCalculations";

export type DataStatus =
  | "verified"
  | "nutrition_verified_price_estimated"
  | "missing_price"
  | "missing_calories"
  | "incomplete"
  | "unsupported";

export type DogFoodProductForComparison = {
  id: string;
  brand: string;
  productName: string;
  slug?: string | null;
  dataQualityNotes?: string[] | string | null;
  status: {
    dataStatus: DataStatus;
    publicDisplay: boolean;
  };
  productBasics: {
    foodType?: string | null;
    lifeStage?: string | null;
    mainProteins?: string[];
    grainFree?: boolean | null;
    limitedIngredient?: boolean | null;
    madeInCanada?: boolean | null;
    manufacturingClaim?: string | null;
    manufacturingNote?: string | null;
    tags?: string[];
  };
  ingredients: {
    fullList?: string | null;
    firstFive?: string[];
    ingredientFlags?: Record<string, boolean | null | undefined>;
  };
  guaranteedAnalysisAsFed?: GuaranteedAnalysisAsFed | null;
  calories?: {
    kcalPerKg?: number | null;
    kcalPerCup?: number | null;
  } | null;
  packageAndPrice?: {
    priceCad?: number | null;
    packageSizeKg?: number | null;
    retailerName?: string | null;
    retailerUrl?: string | null;
    priceCheckedAt?: string | null;
    priceType?: string | null;
    note?: string | null;
  } | null;
  nutritionalAdequacy?: {
    statement?: string | null;
    sourceText?: string | null;
    method?: string | null;
    lifeStageClaim?: string | null;
    standard?: string | null;
  } | null;
  sources?: Array<{
    label?: string | null;
    url?: string | null;
    lastChecked?: string | null;
    supports?: string[];
  }>;
};

export type DogFoodComputedValues = {
  proteinDryMatter: number | null;
  fatDryMatter: number | null;
  carbsAsFed: CarbEstimate | null;
  carbsDryMatter: CarbEstimate | null;
  pricePerKg: number | null;
  costPer1000Kcal: number | null;
  estimatedDailyCost: number | null;
};

export type ComparableDogFoodProduct = DogFoodProductForComparison & {
  computed: DogFoodComputedValues;
};

export type DogFoodHighlight = {
  id: string;
  productIds: string[];
  label: string;
  detail: string;
  type: "cost" | "nutrition" | "calorie" | "ingredient" | "origin";
};

export type DogFoodDataWarning = {
  id: string;
  productId: string;
  label: string;
  detail: string;
};

export type DogFoodComparisonHighlightResult = {
  summaryHighlights: DogFoodHighlight[];
  dataWarnings: DogFoodDataWarning[];
};

export function enrichDogFoodProduct(product: DogFoodProductForComparison, dailyKcal: number): ComparableDogFoodProduct {
  const analysis = product.guaranteedAnalysisAsFed || {};
  const price = product.packageAndPrice || {};
  const kcalPerKg = product.calories?.kcalPerKg;
  const costPer1000Kcal = calculateCostPer1000Kcal(price.priceCad, price.packageSizeKg, kcalPerKg);

  return {
    ...product,
    computed: {
      proteinDryMatter: calculateDryMatterValue(analysis.proteinMinPercent, analysis.moistureMaxPercent),
      fatDryMatter: calculateDryMatterValue(analysis.fatMinPercent, analysis.moistureMaxPercent),
      carbsAsFed: estimateCarbsAsFed(analysis),
      carbsDryMatter: estimateCarbsDryMatter(analysis),
      pricePerKg: calculatePricePerKg(price.priceCad, price.packageSizeKg),
      costPer1000Kcal,
      estimatedDailyCost: calculateEstimatedDailyCost(dailyKcal, costPer1000Kcal)
    }
  };
}

export function getDogFoodDataWarnings(product: DogFoodProductForComparison, today = new Date()): DogFoodDataWarning[] {
  const warnings: DogFoodDataWarning[] = [];
  const analysis = product.guaranteedAnalysisAsFed || {};
  const price = product.packageAndPrice || {};
  const sources = product.sources || [];
  const brandProductSource = sources.find((source) => source.label === "Brand product page");

  if (!product.calories?.kcalPerKg) {
    warnings.push({
      id: `${product.id}-missing-calories`,
      productId: product.id,
      label: "Calories not available",
      detail: `${product.brand} ${product.productName} is missing kcal/kg, so calorie-based cost cannot be calculated.`
    });
  }

  if (!price.priceCad) {
    warnings.push({
      id: `${product.id}-missing-price`,
      productId: product.id,
      label: "Price not available",
      detail: `${product.brand} ${product.productName} has no listed price in the current data.`
    });
  }

  if (price.priceCad && price.priceCheckedAt) {
    const checked = new Date(`${price.priceCheckedAt}T00:00:00`);
    const ageDays = (today.getTime() - checked.getTime()) / 86400000;
    if (Number.isFinite(ageDays) && ageDays > 30) {
      warnings.push({
        id: `${product.id}-stale-price`,
        productId: product.id,
        label: "Price may have changed",
        detail: `${product.brand} ${product.productName} price was last checked more than 30 days ago.`
      });
    }
  }

  if (price.priceCad && !price.priceCheckedAt) {
    warnings.push({
      id: `${product.id}-missing-price-checked-at`,
      productId: product.id,
      label: "Price check date not listed",
      detail: `${product.brand} ${product.productName} has a listed price without a priceCheckedAt date.`
    });
  }

  if (!sources.some((source) => source.lastChecked)) {
    warnings.push({
      id: `${product.id}-missing-source-checked-at`,
      productId: product.id,
      label: "Source checked date not listed",
      detail: `${product.brand} ${product.productName} has no listed sourceCheckedAt date.`
    });
  }

  if (!brandProductSource?.url) {
    warnings.push({
      id: `${product.id}-missing-brand-product-url`,
      productId: product.id,
      label: "Brand product URL not listed",
      detail: `${product.brand} ${product.productName} has no listed brandProductUrl.`
    });
  }

  if (
    analysis.proteinMinPercent == null ||
    analysis.fatMinPercent == null ||
    analysis.fiberMaxPercent == null ||
    analysis.moistureMaxPercent == null
  ) {
    warnings.push({
      id: `${product.id}-incomplete-nutrition`,
      productId: product.id,
      label: "Incomplete nutrition",
      detail: `${product.brand} ${product.productName} is missing one or more guaranteed analysis fields.`
    });
  }

  if (product.status.dataStatus === "nutrition_verified_price_estimated") {
    warnings.push({
      id: `${product.id}-price-estimated`,
      productId: product.id,
      label: "Price is estimated",
      detail: `${product.brand} ${product.productName} uses verified nutrition with estimated price data.`
    });
  }

  if (product.status.dataStatus === "missing_price") {
    warnings.push({
      id: `${product.id}-status-missing-price`,
      productId: product.id,
      label: "Price not available",
      detail: `${product.brand} ${product.productName} is marked as missing price data.`
    });
  }

  return warnings;
}

const sortedValues = (
  products: ComparableDogFoodProduct[],
  getValue: (product: ComparableDogFoodProduct) => number | null
) =>
  products
    .map((product) => ({ product, value: getValue(product) }))
    .filter((entry): entry is { product: ComparableDogFoodProduct; value: number } => entry.value !== null)
    .sort((a, b) => a.value - b.value);

const formatProduct = (product: DogFoodProductForComparison) => `${product.brand} ${product.productName}`;

function hasManufacturingSource(product: DogFoodProductForComparison) {
  return Boolean(
    product.productBasics.madeInCanada &&
      product.productBasics.manufacturingClaim &&
      product.sources?.some((source) => source.supports?.includes("manufacturing") && source.url)
  );
}

export function generateDogFoodComparisonHighlights(
  selectedProducts: ComparableDogFoodProduct[],
  today = new Date()
): DogFoodComparisonHighlightResult {
  const products = selectedProducts.slice(0, 4);
  const summaryHighlights: DogFoodHighlight[] = [];
  const dataWarnings = products.flatMap((product) => getDogFoodDataWarnings(product, today));

  if (products.length < 2) {
    return { summaryHighlights, dataWarnings };
  }

  const costPer1000 = sortedValues(products, (product) => product.computed.costPer1000Kcal);
  if (costPer1000.length >= 2 && costPer1000[0].value <= costPer1000[1].value * 0.9) {
    summaryHighlights.push({
      id: "lowest-cost-per-1000",
      productIds: [costPer1000[0].product.id],
      label: "Lowest cost per 1,000 kcal",
      detail: `${formatProduct(costPer1000[0].product)} is at least 10% lower than the next selected food based on available source data.`,
      type: "cost"
    });
  }

  const dailyCost = sortedValues(products, (product) => product.computed.estimatedDailyCost);
  if (dailyCost.length >= 2 && dailyCost[0].value <= dailyCost[1].value * 0.9) {
    summaryHighlights.push({
      id: "lowest-daily-cost",
      productIds: [dailyCost[0].product.id],
      label: "Lowest estimated daily cost",
      detail: `${formatProduct(dailyCost[0].product)} is at least 10% lower for the selected daily calories.`,
      type: "cost"
    });
  }

  const protein = sortedValues(products, (product) => product.computed.proteinDryMatter).reverse();
  if (protein.length >= 2 && protein[0].value >= protein[1].value + 3) {
    summaryHighlights.push({
      id: "highest-dry-matter-protein",
      productIds: [protein[0].product.id],
      label: "Highest dry-matter protein",
      detail: `${formatProduct(protein[0].product)} is at least 3 percentage points higher in dry-matter protein.`,
      type: "nutrition"
    });
  }

  const fat = sortedValues(products, (product) => product.computed.fatDryMatter);
  if (fat.length >= 2 && fat[0].value <= fat[1].value - 3) {
    summaryHighlights.push({
      id: "lowest-dry-matter-fat",
      productIds: [fat[0].product.id],
      label: "Lowest dry-matter fat",
      detail: `${formatProduct(fat[0].product)} is at least 3 percentage points lower in dry-matter fat.`,
      type: "nutrition"
    });
  }

  const calories = sortedValues(products, (product) => product.calories?.kcalPerKg ?? null).reverse();
  if (calories.length >= 2 && calories[0].value >= calories[1].value * 1.1) {
    summaryHighlights.push({
      id: "highest-kcal-per-kg",
      productIds: [calories[0].product.id],
      label: "Highest kcal/kg",
      detail: `${formatProduct(calories[0].product)} is at least 10% higher in kcal/kg than the next selected food.`,
      type: "calorie"
    });
  }

  const fiber = sortedValues(products, (product) => product.guaranteedAnalysisAsFed?.fiberMaxPercent ?? null);
  if (fiber.length >= 2 && fiber[0].value <= fiber[1].value - 2) {
    summaryHighlights.push({
      id: "lowest-fibre",
      productIds: [fiber[0].product.id],
      label: "Lowest fibre",
      detail: `${formatProduct(fiber[0].product)} is at least 2 percentage points lower in listed fibre.`,
      type: "nutrition"
    });
  }

  const flagRules = [
    { key: "containsChicken", freeLabel: "Only chicken-free option selected" },
    { key: "containsBeef", freeLabel: "Only beef-free option selected" },
    { key: "containsFish", freeLabel: "Only fish-free option selected" },
    { key: "containsPeas", freeLabel: "Only pea-free option selected" },
    { key: "containsWheat", freeLabel: "Only wheat-free option selected" },
    { key: "containsCorn", freeLabel: "Only corn-free option selected" },
    { key: "containsSoy", freeLabel: "Only soy-free option selected" }
  ];

  flagRules.forEach((rule) => {
    const freeProducts = products.filter((product) => product.ingredients.ingredientFlags?.[rule.key] === false);
    if (freeProducts.length !== 1) {
      return;
    }

    const [product] = freeProducts;
    summaryHighlights.push({
      id: `${product.id}-${rule.key}-free`,
      productIds: [product.id],
      label: rule.freeLabel,
      detail: `${formatProduct(product)} appears ${rule.freeLabel.replace("Only ", "").replace(" option selected", "")} based on listed ingredients.`,
      type: "ingredient"
    });
  });

  const grainFreeProducts = products.filter((product) => product.productBasics.grainFree === true);
  if (grainFreeProducts.length === 1) {
    const [product] = grainFreeProducts;
    summaryHighlights.push({
      id: `${product.id}-only-grain-free`,
      productIds: [product.id],
      label: "Only grain-free option selected",
      detail: `${formatProduct(product)} appears grain-free based on listed ingredients.`,
      type: "ingredient"
    });
  }

  const grainInclusiveProducts = products.filter((product) => product.productBasics.grainFree === false);
  if (grainInclusiveProducts.length === 1) {
    const [product] = grainInclusiveProducts;
    summaryHighlights.push({
      id: `${product.id}-only-grain-inclusive`,
      productIds: [product.id],
      label: "Only grain-inclusive option selected",
      detail: `${formatProduct(product)} appears grain-inclusive based on listed ingredients.`,
      type: "ingredient"
    });
  }

  products.forEach((product) => {
    if (hasManufacturingSource(product)) {
      summaryHighlights.push({
        id: `${product.id}-made-in-canada`,
        productIds: [product.id],
        label: "Made in Canada claim listed",
        detail: `${formatProduct(product)} has a Made in Canada claim with manufacturing source data.`,
        type: "origin"
      });
    }
  });

  return { summaryHighlights, dataWarnings };
}
