# Dog Food Product Data Rules

This dataset powers the Dog Food Comparison Tool. It is for label-based comparison only and should not create individual product pages.

## Accepted Source Hierarchy

Use the most direct public source available:

1. Brand product page for product name, ingredients, calories, guaranteed analysis, life stage, and manufacturing claims.
2. Brand nutrition or technical page when nutrition details are separate from the product page.
3. Retailer product page for Canadian package size and price.
4. Package image only when it clearly shows label data and the brand or retailer page does not list it in text.

Prefer Canadian brand or retailer pages. Record all source URLs and checked dates.

## Required Fields

Each product must include:

- `id`
- `brand`
- `productName`
- `slug`
- `dataStatus`
- `dataQualityNotes`
- `productBasics`
- `ingredients`
- `guaranteedAnalysisAsFed`
- `calories`
- `packageAndPrice`
- `nutritionalAdequacy`
- `sources`

Required comparison data includes protein, fat, fibre, moisture, kcal/kg, package size, first five ingredients, full ingredient list, main proteins, grain-free status, brand product URL, and source checked date.

Optional nutrition fields such as ash, calcium, phosphorus, omega-6, and omega-3 should be included when publicly listed, but missing optional nutrition fields should not block the product.

## Public Data Statuses

Public-display statuses:

- `verified`: nutrition, ingredients, calories, package size, and price are sourced from public pages.
- `nutrition_verified_price_estimated`: nutrition, ingredients, and calories are sourced, but price is estimated from a retailer listing, package option, or recent comparable listing.
- `missing_price`: nutrition, ingredients, calories, and package size are sourced, but no current Canadian price is available.

Blocked statuses:

- `incomplete`: required nutrition, ingredients, source, or package data is missing.
- `missing_calories`: kcal/kg is unavailable, so calorie-based comparison cannot be calculated.
- `unsupported`: the product is outside the current comparison scope or cannot be validated from public data.

Unknown statuses must be treated as blocked from public display.

## Price Freshness Rule

Prices should be refreshed at least every 30 days.

If `priceCheckedAt` is older than 30 days, the product can remain public when otherwise valid, but the audit should warn that the price may have changed.

If a product has `dataStatus: "missing_price"`, missing price fields are warnings, not audit failures.

## Adding A New Product

1. Create a stable lowercase `id` and `slug`.
2. Capture brand, product name, food type, life stage, and manufacturing details from the brand source.
3. Enter the full ingredient list exactly as listed by the source.
4. Enter the first five ingredients as an array with no more than five items.
5. Enter main protein sources as an array.
6. Enter ingredient flags as booleans when the ingredient data supports them.
7. Enter guaranteed analysis as-fed values. Do not manually store dry-matter values.
8. Enter kcal/kg and kcal/cup when listed.
9. Enter package size, price, retailer, retailer URL, and price checked date when available.
10. Add source URLs and source checked date.
11. Run `npm run data:audit:dog-food`.
12. Fix audit errors before publishing. Review warnings before expanding the dataset.

## Verification Rules

Use `verified` only when the listed nutrition, ingredients, calories, package size, and price can be traced to public source URLs.

Use `nutrition_verified_price_estimated` when label data is verified but price is not fully verified or may depend on a retailer option.

Use `missing_price` when label data is verified but no current Canadian price is available.

Use `incomplete` when required fields are missing or the product should not appear in the public tool yet.

## Language Rules

Keep all copy neutral and fact-based.

Do not make medical claims or imply a food treats, prevents, or cures a condition. Do not label any food as best, healthiest, superior, allergy-friendly, sensitive stomach friendly, weight-loss food, or recommended.

Use comparison terms such as label-based, estimated, listed, appears to, and based on available source data.
