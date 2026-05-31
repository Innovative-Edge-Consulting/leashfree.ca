import { useMemo, useState } from "react";
import DogFoodProductDetailModal from "./DogFoodProductDetailModal";
import { calculateRER } from "../utils/dogFoodCalculations";
import {
  enrichDogFoodProduct,
  generateDogFoodComparisonHighlights,
  type ComparableDogFoodProduct,
  type DogFoodProductForComparison
} from "../utils/dogFoodComparisonHighlights";
import { validateAndNormalizeDogFoodProducts } from "../utils/dogFoodProductSchema";

type Props = {
  products: unknown[];
};

const dailyKcalBySize = {
  small: 400,
  medium: 800,
  large: 1300,
  custom: 800
};

const byLabel = (a: string, b: string) => a.localeCompare(b, "en-CA", { sensitivity: "base" });

const formatCurrency = (value: number | null | undefined, missing = "Not listed") =>
  value == null ? missing : new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

const formatNumber = (value: number | null | undefined, suffix = "") =>
  value == null ? "Not listed" : `${value.toLocaleString("en-CA")}${suffix}`;

const listed = (value: string | null | undefined) => value?.trim() || "Not listed";
const yesNo = (value: boolean | null | undefined) => (value == null ? "Not listed" : value ? "Yes" : "No");
const grainLabel = (value: boolean | null | undefined) => (value == null ? "Not listed" : value ? "Grain-free" : "Grain-inclusive");
const productTitle = (product: DogFoodProductForComparison) => `${product.brand} ${product.productName}`;
const trackDogFoodEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as typeof window & {
    gtag?: (command: "event", eventName: string, params: Record<string, unknown>) => void;
  };
  analyticsWindow.gtag?.("event", eventName, {
    event_category: "Dog Food Comparison Tool",
    ...params
  });
};

export default function DogFoodComparisonTool({ products }: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [foodType, setFoodType] = useState("");
  const [protein, setProtein] = useState("");
  const [grainFree, setGrainFree] = useState("");
  const [limitedIngredient, setLimitedIngredient] = useState("");
  const [madeInCanada, setMadeInCanada] = useState("");
  const [dogSize, setDogSize] = useState<keyof typeof dailyKcalBySize>("medium");
  const [customDailyKcal, setCustomDailyKcal] = useState(800);
  const [sort, setSort] = useState("brand");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<ComparableDogFoodProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const dailyKcal = dogSize === "custom" ? customDailyKcal : dailyKcalBySize[dogSize];

  const validatedData = useMemo(() => validateAndNormalizeDogFoodProducts(products), [products]);
  const publicProducts = validatedData.products;

  const enriched = useMemo(
    () => publicProducts.map((product) => enrichDogFoodProduct(product, dailyKcal)),
    [dailyKcal, publicProducts]
  );

  const brands = useMemo(() => [...new Set(enriched.map((item) => item.brand))].sort(byLabel), [enriched]);
  const foodTypes = useMemo(
    () => [...new Set(enriched.map((item) => item.productBasics.foodType).filter(Boolean) as string[])].sort(byLabel),
    [enriched]
  );
  const proteins = useMemo(
    () => [...new Set(enriched.flatMap((item) => item.productBasics.mainProteins || []))].sort(byLabel),
    [enriched]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = enriched.filter((product) => {
      const basics = product.productBasics;
      const haystack = [
        product.brand,
        product.productName,
        basics.foodType,
        basics.lifeStage,
        basics.mainProteins?.join(" "),
        basics.tags?.join(" "),
        product.ingredients.firstFive?.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (!brand || product.brand === brand) &&
        (!foodType || basics.foodType === foodType) &&
        (!protein || basics.mainProteins?.includes(protein)) &&
        (!grainFree || String(Boolean(basics.grainFree)) === grainFree) &&
        (!limitedIngredient || String(Boolean(basics.limitedIngredient)) === limitedIngredient) &&
        (!madeInCanada || String(Boolean(basics.madeInCanada)) === madeInCanada)
      );
    });

    return result.sort((a, b) => {
      if (sort === "cost-1000") {
        return (a.computed.costPer1000Kcal ?? Number.POSITIVE_INFINITY) - (b.computed.costPer1000Kcal ?? Number.POSITIVE_INFINITY);
      }
      if (sort === "daily-cost") {
        return (a.computed.estimatedDailyCost ?? Number.POSITIVE_INFINITY) - (b.computed.estimatedDailyCost ?? Number.POSITIVE_INFINITY);
      }
      if (sort === "protein") return (b.computed.proteinDryMatter ?? -1) - (a.computed.proteinDryMatter ?? -1);
      if (sort === "fat") return (a.computed.fatDryMatter ?? Number.POSITIVE_INFINITY) - (b.computed.fatDryMatter ?? Number.POSITIVE_INFINITY);
      return byLabel(productTitle(a), productTitle(b));
    });
  }, [brand, enriched, foodType, grainFree, limitedIngredient, madeInCanada, protein, query, sort]);

  const selectedProducts = selectedIds
    .map((id) => enriched.find((product) => product.id === id))
    .filter((product): product is ComparableDogFoodProduct => Boolean(product));
  const detailProduct = selectedDetailProduct
    ? enriched.find((product) => product.id === selectedDetailProduct.id) || selectedDetailProduct
    : null;
  const { summaryHighlights, dataWarnings } = useMemo(
    () => generateDogFoodComparisonHighlights(selectedProducts),
    [selectedProducts]
  );

  const highlightedProductIds = new Set(summaryHighlights.flatMap((highlight) => highlight.productIds));
  const selectedColorClass = (id: string) => {
    const selectedIndex = selectedIds.indexOf(id);
    return selectedIndex >= 0 ? `compare-color-${selectedIndex}` : "";
  };
  const highlightColorClass = (productIds: string[]) => selectedColorClass(productIds[0] || "");
  const comparisonCellClass = (product: ComparableDogFoodProduct) =>
    [selectedColorClass(product.id), highlightedProductIds.has(product.id) ? "is-highlighted" : ""].filter(Boolean).join(" ");

  const toggleSelected = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      trackDogFoodEvent("dog_food_compare_select", { product_id: id, selection_count: selectedIds.length + 1 });
    }
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  };

  const openProductDetails = (product: ComparableDogFoodProduct) => {
    trackDogFoodEvent("dog_food_detail_open", { product_id: product.id, brand: product.brand });
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  const closeProductDetails = () => {
    setIsDetailModalOpen(false);
  };

  const clearFilters = () => {
    setQuery("");
    setBrand("");
    setFoodType("");
    setProtein("");
    setGrainFree("");
    setLimitedIngredient("");
    setMadeInCanada("");
  };

  const comparisonRows = [
    ["Brand", (p: ComparableDogFoodProduct) => p.brand],
    ["Product name", (p: ComparableDogFoodProduct) => p.productName],
    ["Food type", (p: ComparableDogFoodProduct) => listed(p.productBasics.foodType)],
    ["Life stage", (p: ComparableDogFoodProduct) => listed(p.productBasics.lifeStage)],
    ["Main proteins", (p: ComparableDogFoodProduct) => p.productBasics.mainProteins?.join(", ") || "Not listed"],
    ["Grain-free / grain-inclusive", (p: ComparableDogFoodProduct) => grainLabel(p.productBasics.grainFree)],
    ["Protein as-fed", (p: ComparableDogFoodProduct) => formatNumber(p.guaranteedAnalysisAsFed?.proteinMinPercent, "%")],
    ["Protein dry-matter", (p: ComparableDogFoodProduct) => formatNumber(p.computed.proteinDryMatter, "%")],
    ["Fat as-fed", (p: ComparableDogFoodProduct) => formatNumber(p.guaranteedAnalysisAsFed?.fatMinPercent, "%")],
    ["Fat dry-matter", (p: ComparableDogFoodProduct) => formatNumber(p.computed.fatDryMatter, "%")],
    ["Fibre as-fed", (p: ComparableDogFoodProduct) => formatNumber(p.guaranteedAnalysisAsFed?.fiberMaxPercent, "%")],
    ["kcal/kg", (p: ComparableDogFoodProduct) => formatNumber(p.calories?.kcalPerKg)],
    ["kcal/cup", (p: ComparableDogFoodProduct) => formatNumber(p.calories?.kcalPerCup)],
    ["Price", (p: ComparableDogFoodProduct) => formatCurrency(p.packageAndPrice?.priceCad, "Price not available")],
    ["Package size", (p: ComparableDogFoodProduct) => formatNumber(p.packageAndPrice?.packageSizeKg, " kg")],
    ["Price per kg", (p: ComparableDogFoodProduct) => formatCurrency(p.computed.pricePerKg, "Price not available")],
    ["Cost per 1,000 kcal", (p: ComparableDogFoodProduct) => formatCurrency(p.computed.costPer1000Kcal, "Not listed")],
    ["Estimated daily cost", (p: ComparableDogFoodProduct) => formatCurrency(p.computed.estimatedDailyCost, "Not listed")],
    ["First five ingredients", (p: ComparableDogFoodProduct) => p.ingredients.firstFive?.join(", ") || "Not listed"],
    ["Made in Canada", (p: ComparableDogFoodProduct) => yesNo(p.productBasics.madeInCanada)],
    ["Last checked", (p: ComparableDogFoodProduct) => p.packageAndPrice?.priceCheckedAt || p.sources?.[0]?.lastChecked || "Not listed"]
  ] as const;

  return (
    <section className="dog-food-tool" aria-label="Dog food comparison filters and results">
      <div className="dog-food-controls">
        <label className="field wide">
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brand, protein, ingredient, or tag"
          />
        </label>
        <label className="field">
          <span>Brand</span>
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="">All brands</option>
            {brands.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Food type</span>
          <select value={foodType} onChange={(event) => setFoodType(event.target.value)}>
            <option value="">All types</option>
            {foodTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Main protein</span>
          <select value={protein} onChange={(event) => setProtein(event.target.value)}>
            <option value="">All proteins</option>
            {proteins.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Grain</span>
          <select value={grainFree} onChange={(event) => setGrainFree(event.target.value)}>
            <option value="">Either</option>
            <option value="true">Grain-free</option>
            <option value="false">Grain-inclusive</option>
          </select>
        </label>
        <label className="field">
          <span>Limited ingredient</span>
          <select value={limitedIngredient} onChange={(event) => setLimitedIngredient(event.target.value)}>
            <option value="">Either</option>
            <option value="true">Limited ingredient</option>
            <option value="false">Not limited ingredient</option>
          </select>
        </label>
        <label className="field">
          <span>Made in Canada</span>
          <select value={madeInCanada} onChange={(event) => setMadeInCanada(event.target.value)}>
            <option value="">Either</option>
            <option value="true">Made in Canada</option>
            <option value="false">Not listed as made in Canada</option>
          </select>
        </label>
        <label className="field">
          <span>Dog size</span>
          <select value={dogSize} onChange={(event) => setDogSize(event.target.value as keyof typeof dailyKcalBySize)}>
            <option value="small">Small, estimated 400 kcal/day</option>
            <option value="medium">Medium, estimated 800 kcal/day</option>
            <option value="large">Large, estimated 1,300 kcal/day</option>
            <option value="custom">Custom daily calories</option>
          </select>
        </label>
        {dogSize === "custom" && (
          <label className="field">
            <span>Daily calories</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customDailyKcal}
              onChange={(event) => setCustomDailyKcal(Number(event.target.value))}
            />
          </label>
        )}
        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="brand">Brand A-Z</option>
            <option value="daily-cost">Lowest estimated daily cost</option>
            <option value="cost-1000">Lowest cost per 1,000 kcal</option>
            <option value="protein">Highest dry-matter protein</option>
            <option value="fat">Lowest dry-matter fat</option>
          </select>
        </label>
      </div>

      <div className="tool-guidance">
        <strong>Compare up to 4 foods</strong>
        <span>Use the filters to narrow the list, then select 2 to 4 foods for a side-by-side view.</span>
      </div>

      <div className="dog-food-summary" aria-live="polite">
        <div><strong>{filtered.length}</strong><span>products shown</span></div>
        <p>
          Cost estimates use {dailyKcal.toLocaleString("en-CA")} kcal/day. For context, a 10 kg adult dog has an estimated
          resting energy need of {formatNumber(calculateRER(10), " kcal/day")} before activity and life-stage factors are added.
          {validatedData.blocked.length > 0 ? ` ${validatedData.blocked.length} draft product(s) are hidden because required information is incomplete.` : ""}
        </p>
      </div>

      <div className="selected-strip">
        <div className="selected-copy">
          <strong>{selectedProducts.length}/4 selected</strong>
          <span>{selectedProducts.length < 2 ? "Select at least 2 foods to compare side by side." : "Comparison table is ready."}</span>
        </div>
        {selectedProducts.length > 0 && (
          <ul className="selected-foods" aria-label="Selected foods">
            {selectedProducts.map((product) => (
              <li key={product.id} className={selectedColorClass(product.id)}>
                <span>{product.brand} {product.productName}</span>
                <button type="button" onClick={() => toggleSelected(product.id)} aria-label={`Remove ${productTitle(product)} from comparison`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedProducts.length > 0 && <button type="button" className="text-button" onClick={() => setSelectedIds([])}>Clear selected</button>}
      </div>

      {selectedProducts.length >= 2 && (
        <div className="compare-panel">
          <div className="compare-heading">
            <h2>Key differences</h2>
            <p>We only call out clear differences, so small gaps may not appear here.</p>
          </div>
          {summaryHighlights.length ? (
            <ul className="highlight-list">
              {summaryHighlights.map((highlight) => (
                <li key={highlight.id} className={`highlight-item ${highlight.type} ${highlightColorClass(highlight.productIds)}`}>
                  <strong>{highlight.label}</strong>
                  <span>{highlight.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">The selected foods are similar on the fields this tool checks.</p>
          )}
          {dataWarnings.length > 0 && (
            <div className="warning-box">
              <strong>Things to check</strong>
              <ul>
                {dataWarnings.map((warning) => <li key={warning.id}>{warning.detail}</li>)}
              </ul>
            </div>
          )}
          <p className="table-scroll-note">Scroll sideways to view all selected foods.</p>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Field</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className={comparisonCellClass(product)}>
                      <button type="button" className="table-product-button" onClick={() => openProductDetails(product)}>
                        {product.brand}<br /><span>{product.productName}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, getValue]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className={comparisonCellClass(product)}>
                        {getValue(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="dog-food-results">
        {filtered.length > 0 ? filtered.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const selectionDisabled = !isSelected && selectedIds.length >= 4;
          return (
            <article className={`dog-food-card ${selectedColorClass(product.id)}`} key={product.id} onClick={() => openProductDetails(product)}>
              <div className="dog-food-card-heading">
                <button type="button" className="product-open" onClick={() => openProductDetails(product)}>
                  <span>{product.brand}</span>
                  <strong>{product.productName}</strong>
                </button>
                <button
                  type="button"
                  className={`select-button${isSelected ? " is-selected" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelected(product.id);
                  }}
                  disabled={selectionDisabled}
                  aria-pressed={isSelected}
                >
                  {isSelected ? "Selected" : selectionDisabled ? "Limit reached" : "Compare"}
                </button>
              </div>
              <div className="badges">
                <span className="badge">{listed(product.productBasics.foodType)}</span>
                <span className="badge">{listed(product.productBasics.lifeStage)}</span>
                <span className="badge">{grainLabel(product.productBasics.grainFree)}</span>
                {product.productBasics.madeInCanada && <span className="badge">Made in Canada</span>}
                {product.productBasics.limitedIngredient && <span className="badge">Limited ingredient</span>}
              </div>
              <dl className="metric-grid">
                <div><dt>Protein dry-matter</dt><dd>{formatNumber(product.computed.proteinDryMatter, "%")}</dd></div>
                <div><dt>Fat dry-matter</dt><dd>{formatNumber(product.computed.fatDryMatter, "%")}</dd></div>
                <div><dt>kcal/kg</dt><dd>{formatNumber(product.calories?.kcalPerKg)}</dd></div>
                <div><dt>Cost / 1,000 kcal</dt><dd>{formatCurrency(product.computed.costPer1000Kcal)}</dd></div>
              </dl>
              <p className="protein-preview">
                <strong>Main proteins:</strong> {product.productBasics.mainProteins?.join(", ") || "Not listed"}
              </p>
              <p className="ingredient-preview">{product.ingredients.firstFive?.join(", ") || "Not listed"}</p>
              <button
                type="button"
                className="text-button detail-link"
                onClick={(event) => {
                  event.stopPropagation();
                  openProductDetails(product);
                }}
              >
                View details
              </button>
            </article>
          );
        }) : (
          <div className="empty-results">
            <strong>No foods match these filters.</strong>
            <p>Try removing a filter or searching for a different brand, protein, or ingredient.</p>
            <button type="button" className="select-button" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </div>

      <DogFoodProductDetailModal
        product={detailProduct}
        computed={detailProduct?.computed || null}
        isOpen={isDetailModalOpen}
        onClose={closeProductDetails}
      />

      <style>{`
        .dog-food-tool { display: grid; gap: var(--space-5); }
        .compare-color-0 {
          --compare-accent: #2f7d5b;
          --compare-bg: #e8f4ee;
          --compare-border: #8fc3a9;
        }
        .compare-color-1 {
          --compare-accent: #376ba5;
          --compare-bg: #eaf1fb;
          --compare-border: #94b6df;
        }
        .compare-color-2 {
          --compare-accent: #a86623;
          --compare-bg: #fbf0df;
          --compare-border: #d7af79;
        }
        .compare-color-3 {
          --compare-accent: #76579f;
          --compare-bg: #f0ebf7;
          --compare-border: #b4a0d2;
        }
        .dog-food-controls {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          box-shadow: var(--shadow-card);
          padding: var(--space-4);
        }
        .field { display: grid; gap: 0.35rem; }
        .field.wide { grid-column: span 2; }
        .field span { color: var(--color-muted); font-size: 0.82rem; font-weight: 850; }
        .field input, .field select {
          width: 100%;
          min-height: 44px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: #fff;
          color: var(--color-text);
          font: inherit;
          font-weight: 700;
          padding: 0.68rem 0.8rem;
        }
        .tool-guidance, .dog-food-summary, .selected-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-primary-soft);
          padding: var(--space-4);
        }
        .tool-guidance {
          background: var(--color-surface);
        }
        .tool-guidance strong { color: var(--color-primary-dark); font-size: 1.04rem; }
        .tool-guidance span { color: var(--color-muted); font-weight: 750; }
        .dog-food-summary div { display: grid; min-width: 120px; }
        .dog-food-summary strong { color: var(--color-primary-dark); font-size: 1.8rem; line-height: 1; }
        .dog-food-summary span, .dog-food-summary p, .selected-strip span { margin: 0; color: var(--color-muted); font-weight: 750; }
        .selected-strip { background: var(--color-surface); flex-wrap: wrap; }
        .selected-copy { display: grid; gap: 0.15rem; min-width: 180px; }
        .selected-copy strong { color: var(--color-primary-dark); }
        .selected-foods {
          display: flex;
          flex: 1 1 360px;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .selected-foods li {
          display: inline-flex;
          align-items: center;
          max-width: 280px;
          gap: 0.45rem;
          border: 1px solid var(--compare-border, var(--color-border));
          border-radius: var(--radius-pill);
          background: var(--compare-bg, var(--color-bg));
          color: var(--color-text);
          font-size: 0.78rem;
          font-weight: 850;
          padding: 0.35rem 0.45rem 0.35rem 0.65rem;
        }
        .selected-foods span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .selected-foods button {
          border: 0;
          border-radius: var(--radius-pill);
          background: var(--compare-accent, var(--color-primary-dark));
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.25rem 0.45rem;
        }
        .text-button {
          border: 0;
          background: transparent;
          color: var(--color-primary-dark);
          cursor: pointer;
          font: inherit;
          font-weight: 900;
        }
        .compare-panel, .dog-food-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          box-shadow: var(--shadow-card);
        }
        .compare-panel { overflow: hidden; }
        .compare-heading {
          display: grid;
          gap: 0.2rem;
          border-bottom: 1px solid var(--color-border);
          padding: var(--space-4);
        }
        .compare-heading h2 { margin: 0; font-size: 1.25rem; }
        .compare-heading p, .empty-note { margin: 0; color: var(--color-muted); }
        .highlight-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
          gap: var(--space-3);
          margin: 0;
          padding: var(--space-4);
          list-style: none;
        }
        .highlight-item {
          display: grid;
          gap: 0.25rem;
          border: 1px solid var(--compare-border, rgba(73, 127, 100, 0.24));
          border-radius: var(--radius-sm);
          background: var(--compare-bg, var(--color-primary-soft));
          box-shadow: inset 0 4px 0 var(--compare-accent, var(--color-primary));
          padding: var(--space-3);
        }
        .highlight-item strong { color: var(--compare-accent, var(--color-primary-dark)); }
        .highlight-item span, .warning-box li { color: var(--color-muted); font-size: 0.92rem; line-height: 1.45; }
        .empty-note { padding: var(--space-4); }
        .warning-box {
          border-top: 1px solid var(--color-border);
          background: #fff8df;
          color: var(--color-warning);
          padding: var(--space-4);
        }
        .warning-box ul { margin: 0.5rem 0 0; }
        .table-scroll-note {
          display: none;
          margin: 0;
          border-top: 1px solid var(--color-border);
          color: var(--color-muted);
          font-size: 0.84rem;
          font-weight: 800;
          padding: 0.75rem var(--space-4) 0;
        }
        .compare-table-wrap { overflow-x: auto; border-top: 1px solid var(--color-border); }
        .compare-table { width: 100%; min-width: 920px; border-collapse: collapse; }
        .compare-table th, .compare-table td {
          border-bottom: 1px solid var(--color-border);
          padding: 0.75rem;
          text-align: left;
          vertical-align: top;
        }
        .compare-table th { color: var(--color-primary-dark); }
        .compare-table th:first-child {
          position: sticky;
          left: 0;
          z-index: 2;
          min-width: 145px;
          background: var(--color-surface);
          box-shadow: 1px 0 0 var(--color-border);
        }
        .compare-table thead th:first-child { z-index: 3; }
        .compare-table th span { color: var(--color-muted); font-size: 0.82rem; font-weight: 700; }
        .compare-table .is-highlighted:not([class*="compare-color-"]) { background: rgba(230, 241, 234, 0.58); }
        .compare-table th[class*="compare-color-"], .compare-table td[class*="compare-color-"] {
          background: var(--compare-bg);
          border-left: 3px solid var(--compare-accent);
        }
        .compare-table thead th[class*="compare-color-"] {
          box-shadow: inset 0 4px 0 var(--compare-accent);
        }
        .compare-table .is-highlighted[class*="compare-color-"] {
          outline: 2px solid color-mix(in srgb, var(--compare-accent) 34%, transparent);
          outline-offset: -2px;
        }
        .table-product-button {
          border: 0;
          background: transparent;
          color: var(--color-primary-dark);
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          padding: 0;
          text-align: left;
        }
        .table-product-button::before {
          content: "";
          display: inline-block;
          width: 0.72rem;
          height: 0.72rem;
          margin-right: 0.45rem;
          border-radius: 999px;
          background: var(--compare-accent, var(--color-primary));
          vertical-align: -0.04rem;
        }
        .dog-food-results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: var(--space-3);
          align-items: stretch;
        }
        .dog-food-card {
          cursor: pointer;
          display: grid;
          grid-template-rows: auto auto auto auto auto 1fr;
          gap: var(--space-3);
          padding: var(--space-4);
          min-height: 100%;
        }
        .empty-results {
          grid-column: 1 / -1;
          display: grid;
          justify-items: start;
          gap: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          box-shadow: var(--shadow-card);
          padding: var(--space-5);
        }
        .empty-results strong { color: var(--color-primary-dark); font-size: 1.08rem; }
        .empty-results p { margin: 0; color: var(--color-muted); font-weight: 750; }
        .dog-food-card[class*="compare-color-"] {
          border-color: var(--compare-border);
          background: linear-gradient(180deg, var(--compare-bg) 0, var(--color-surface) 42%);
          box-shadow: inset 0 4px 0 var(--compare-accent), var(--shadow-card);
        }
        .dog-food-card-heading { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: var(--space-3); }
        .product-open {
          display: grid;
          gap: 0.1rem;
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--color-text);
          cursor: pointer;
          font: inherit;
          padding: 0;
          text-align: left;
        }
        .product-open span { color: var(--color-primary-dark); font-size: 0.74rem; font-weight: 900; letter-spacing: 0; text-transform: uppercase; }
        .product-open strong {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          font-size: 1rem;
          line-height: 1.2;
        }
        .select-button {
          align-self: start;
          min-width: 86px;
          min-height: 36px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill);
          background: #fff;
          color: var(--color-text);
          cursor: pointer;
          font: inherit;
          font-size: 0.84rem;
          font-weight: 900;
          padding: 0.45rem 0.65rem;
        }
        .select-button.is-selected { border-color: var(--color-primary-dark); background: var(--color-primary-dark); color: #fff; }
        .dog-food-card[class*="compare-color-"] .select-button.is-selected {
          border-color: var(--compare-accent);
          background: var(--compare-accent);
        }
        .select-button:disabled { cursor: not-allowed; opacity: 0.66; }
        .detail-link { justify-self: start; }
        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .badge {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill);
          background: var(--color-bg);
          color: var(--color-muted);
          font-size: 0.72rem;
          font-weight: 850;
          line-height: 1.1;
          padding: 0.28rem 0.5rem;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
          margin: 0;
        }
        .metric-grid div {
          border-top: 1px solid var(--color-border);
          padding-top: 0.55rem;
        }
        .metric-grid dt { color: var(--color-muted); font-size: 0.7rem; font-weight: 850; line-height: 1.15; }
        .metric-grid dd { margin: 0.15rem 0 0; color: var(--color-text); font-size: 0.94rem; font-weight: 900; line-height: 1.2; }
        .protein-preview,
        .ingredient-preview {
          color: var(--color-muted);
          font-size: 0.84rem;
          line-height: 1.35;
          margin: 0;
        }
        .protein-preview {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .protein-preview strong { color: var(--color-text); }
        .ingredient-preview {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          border-left: 3px solid var(--color-primary);
          background: var(--color-surface-alt);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          padding: 0.65rem 0.75rem;
        }
        @media (max-width: 980px) {
          .dog-food-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .field.wide { grid-column: 1 / -1; }
        }
        @media (max-width: 680px) {
          .dog-food-controls { grid-template-columns: 1fr; }
          .field, .field input, .field select { min-width: 0; }
          .tool-guidance, .dog-food-summary, .selected-strip {
            align-items: stretch;
            flex-direction: column;
          }
          .table-scroll-note { display: block; }
          .compare-table { min-width: 760px; }
          .compare-table th, .compare-table td { padding: 0.65rem; }
          .selected-foods { flex-basis: auto; }
          .selected-foods li { max-width: 100%; width: 100%; justify-content: space-between; }
          .dog-food-card-heading { grid-template-columns: 1fr; }
          .select-button { width: 100%; }
        }
      `}</style>
    </section>
  );
}
