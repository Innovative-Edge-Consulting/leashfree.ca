export type GuaranteedAnalysisAsFed = {
  proteinMinPercent?: number | null;
  fatMinPercent?: number | null;
  fiberMaxPercent?: number | null;
  moistureMaxPercent?: number | null;
  ashMaxPercent?: number | null;
  calciumMinPercent?: number | null;
  phosphorusMinPercent?: number | null;
  omega6MinPercent?: number | null;
  omega3MinPercent?: number | null;
};

export type CarbEstimate = {
  valuePercent: number;
  isEstimated: boolean;
  ashPercentUsed: number;
};

const ESTIMATED_ASH_PERCENT = 8;

export const roundTo = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isPercent = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;

export function calculateDryMatterValue(asFedPercent: number | null | undefined, moisturePercent: number | null | undefined) {
  if (!isPercent(asFedPercent) || !isPercent(moisturePercent) || moisturePercent >= 100) {
    return null;
  }

  return roundTo((asFedPercent / (100 - moisturePercent)) * 100, 1);
}

export function calculatePricePerKg(priceCad: number | null | undefined, packageSizeKg: number | null | undefined) {
  if (!isPositiveNumber(priceCad) || !isPositiveNumber(packageSizeKg)) {
    return null;
  }

  return roundTo(priceCad / packageSizeKg, 2);
}

export function calculateCostPer1000Kcal(
  priceCad: number | null | undefined,
  packageSizeKg: number | null | undefined,
  kcalPerKg: number | null | undefined
) {
  if (!isPositiveNumber(kcalPerKg)) {
    return null;
  }

  const pricePerKg = calculatePricePerKg(priceCad, packageSizeKg);
  if (pricePerKg === null) {
    return null;
  }

  return roundTo((pricePerKg / kcalPerKg) * 1000, 2);
}

export function calculateEstimatedDailyCost(dailyKcal: number | null | undefined, costPer1000Kcal: number | null | undefined) {
  if (!isPositiveNumber(dailyKcal) || !isPositiveNumber(costPer1000Kcal)) {
    return null;
  }

  return roundTo((dailyKcal / 1000) * costPer1000Kcal, 2);
}

export function calculateRER(weightKg: number | null | undefined) {
  if (!isPositiveNumber(weightKg)) {
    return null;
  }

  return roundTo(70 * weightKg ** 0.75, 0);
}

export function calculateMER(weightKg: number | null | undefined, multiplier: number | null | undefined) {
  const rer = calculateRER(weightKg);
  if (rer === null || !isPositiveNumber(multiplier)) {
    return null;
  }

  return roundTo(rer * multiplier, 0);
}

export function estimateCarbsAsFed(analysis: GuaranteedAnalysisAsFed | null | undefined): CarbEstimate | null {
  if (!analysis) {
    return null;
  }

  const protein = analysis.proteinMinPercent;
  const fat = analysis.fatMinPercent;
  const fiber = analysis.fiberMaxPercent;
  const moisture = analysis.moistureMaxPercent;

  if (!isPercent(protein) || !isPercent(fat) || !isPercent(fiber) || !isPercent(moisture)) {
    return null;
  }

  const hasAsh = isPercent(analysis.ashMaxPercent);
  const ash = hasAsh ? analysis.ashMaxPercent : ESTIMATED_ASH_PERCENT;
  const value = 100 - protein - fat - fiber - moisture - ash;

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return {
    valuePercent: roundTo(value, 1),
    isEstimated: !hasAsh,
    ashPercentUsed: ash
  };
}

export function estimateCarbsDryMatter(analysis: GuaranteedAnalysisAsFed | null | undefined): CarbEstimate | null {
  const asFed = estimateCarbsAsFed(analysis);
  if (!asFed || !analysis) {
    return null;
  }

  const dryMatterValue = calculateDryMatterValue(asFed.valuePercent, analysis.moistureMaxPercent);
  if (dryMatterValue === null) {
    return null;
  }

  return {
    valuePercent: dryMatterValue,
    isEstimated: asFed.isEstimated,
    ashPercentUsed: asFed.ashPercentUsed
  };
}

export const calculateDryMatter = calculateDryMatterValue;
