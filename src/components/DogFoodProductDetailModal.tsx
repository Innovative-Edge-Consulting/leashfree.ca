import { useEffect } from "react";
import type { DogFoodComputedValues, DogFoodProductForComparison } from "../utils/dogFoodComparisonHighlights";

type Props = {
  product: DogFoodProductForComparison | null;
  computed: DogFoodComputedValues | null;
  isOpen: boolean;
  onClose: () => void;
};

const formatCurrency = (value: number | null | undefined, missing = "Not listed") =>
  value == null ? missing : new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

const formatNumber = (value: number | null | undefined, suffix = "") =>
  value == null ? "Not listed" : `${value.toLocaleString("en-CA")}${suffix}`;

const listed = (value: string | null | undefined) => value?.trim() || "Not listed";
const provided = (value: string | null | undefined) => value?.trim() || "Not provided";
const yesNoListed = (value: boolean | null | undefined) => (value == null ? "Not listed" : value ? "Listed" : "Not listed");
const statusLabel = (value: boolean | null | undefined) => (value == null ? "Not available" : value ? "Listed" : "Not listed");
const grainLabel = (value: boolean | null | undefined) => (value == null ? "Not listed" : value ? "Grain-free" : "Grain-inclusive");
const dataStatusLabel = (value: string | null | undefined) => {
  if (value === "verified") return "Nutrition and price checked";
  if (value === "nutrition_verified_price_estimated") return "Nutrition checked, price estimated";
  if (value === "missing_price") return "Nutrition checked, price not available";
  return "Needs review";
};

function sourceUrl(product: DogFoodProductForComparison, label: string) {
  return product.sources?.find((source) => source.label === label)?.url || null;
}

function sourceCheckedAt(product: DogFoodProductForComparison) {
  return product.sources?.find((source) => source.lastChecked)?.lastChecked || null;
}

function valueRow(label: string, asFed: number | null | undefined, dryMatter?: number | null) {
  return (
    <tr>
      <th>{label}</th>
      <td>{formatNumber(asFed, "%")}</td>
      <td>{dryMatter === undefined ? "Not listed" : formatNumber(dryMatter, "%")}</td>
    </tr>
  );
}

function linkCell(url: string | null) {
  if (!url) return "Not provided";
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {url}
    </a>
  );
}

function dataQualityNotes(notes: DogFoodProductForComparison["dataQualityNotes"]) {
  if (Array.isArray(notes)) return notes.length ? notes.join(" ") : "Not listed";
  return listed(notes);
}

function suitabilityNotes(product: DogFoodProductForComparison) {
  const flags = product.ingredients.ingredientFlags || {};
  const notes: string[] = [];

  if (product.productBasics.lifeStage) {
    notes.push(`This food is labelled for ${product.productBasics.lifeStage}.`);
  }

  if (product.productBasics.grainFree === true) {
    notes.push("This food appears to be grain-free based on the ingredient data.");
  } else if (product.productBasics.grainFree === false) {
    notes.push("This food appears to be grain-inclusive based on the ingredient data.");
  }

  if (flags.containsChicken === true) notes.push("Chicken is listed in the ingredient data.");
  if (flags.containsBeef === true) notes.push("Beef is listed in the ingredient data.");
  if (flags.containsFish === true) notes.push("Fish is listed in the ingredient data.");

  const notListed = [
    flags.containsWheat === false ? "Wheat" : null,
    flags.containsCorn === false ? "corn" : null,
    flags.containsSoy === false ? "soy" : null
  ].filter(Boolean);

  if (notListed.length === 3) {
    notes.push("Wheat, corn, and soy are not listed in the ingredient data.");
  }

  const hasManufacturingSource = product.sources?.some((source) => source.supports?.includes("manufacturing") && source.url);
  if (product.productBasics.madeInCanada && hasManufacturingSource) {
    notes.push("This product has a verified Made in Canada claim.");
  } else if (product.productBasics.madeInCanada) {
    notes.push("This product has a Made in Canada claim in the available data.");
  }

  if (product.packageAndPrice?.priceCheckedAt) {
    notes.push(`Price was last checked on ${product.packageAndPrice.priceCheckedAt} and may have changed.`);
  }

  return notes.length ? notes : ["No additional label-based suitability notes are available."];
}

export default function DogFoodProductDetailModal({ product, computed, isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product || !computed) return null;

  const analysis = product.guaranteedAnalysisAsFed || {};
  const flags = product.ingredients.ingredientFlags || {};
  const priceMissing = product.packageAndPrice?.priceCad == null;
  const caloriesMissing = product.calories?.kcalPerKg == null;
  const modalTitleId = `dog-food-detail-${product.id}`;

  const ingredientFlags = [
    ["Contains chicken", flags.containsChicken],
    ["Contains beef", flags.containsBeef],
    ["Contains fish", flags.containsFish],
    ["Contains egg", flags.containsEgg],
    ["Contains dairy", flags.containsDairy],
    ["Contains corn", flags.containsCorn],
    ["Contains wheat", flags.containsWheat],
    ["Contains soy", flags.containsSoy],
    ["Contains peas", flags.containsPeas],
    ["Contains lentils", flags.containsLentils],
    ["Contains potatoes", flags.containsPotatoes]
  ] as const;

  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <article
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="detail-header">
          <div>
            <span>{product.brand}</span>
            <h2 id={modalTitleId}>{product.productName}</h2>
          </div>
          <button type="button" className="detail-close" onClick={onClose} aria-label="Close product details">
            Close
          </button>
        </header>

        <div className="detail-grid">
          <section className="detail-section">
            <h3>Product Summary</h3>
            <table>
              <tbody>
                <tr><th>Brand</th><td>{product.brand}</td></tr>
                <tr><th>Product name</th><td>{product.productName}</td></tr>
                <tr><th>Food type</th><td>{listed(product.productBasics.foodType)}</td></tr>
                <tr><th>Life stage</th><td>{listed(product.productBasics.lifeStage)}</td></tr>
                <tr><th>Main proteins</th><td>{product.productBasics.mainProteins?.join(", ") || "Not listed"}</td></tr>
                <tr><th>Grain status</th><td>{grainLabel(product.productBasics.grainFree)}</td></tr>
                <tr><th>Limited ingredient</th><td>{yesNoListed(product.productBasics.limitedIngredient)}</td></tr>
                <tr><th>Made in Canada</th><td>{yesNoListed(product.productBasics.madeInCanada)}</td></tr>
                <tr><th>Manufacturing claim</th><td>{listed(product.productBasics.manufacturingClaim)}</td></tr>
                <tr><th>Information status</th><td>{dataStatusLabel(product.status.dataStatus)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="detail-section">
            <h3>Nutrition Snapshot</h3>
            <table>
              <thead>
                <tr><th>Nutrient</th><th>As-fed</th><th>Dry matter</th></tr>
              </thead>
              <tbody>
                {valueRow("Protein", analysis.proteinMinPercent, computed.proteinDryMatter)}
                {valueRow("Fat", analysis.fatMinPercent, computed.fatDryMatter)}
                {valueRow("Fibre", analysis.fiberMaxPercent)}
                {valueRow("Moisture", analysis.moistureMaxPercent)}
                {valueRow("Ash", analysis.ashMaxPercent)}
                {valueRow("Calcium", analysis.calciumMinPercent)}
                {valueRow("Phosphorus", analysis.phosphorusMinPercent)}
                {valueRow("Omega-6", analysis.omega6MinPercent)}
                {valueRow("Omega-3", analysis.omega3MinPercent)}
              </tbody>
            </table>
          </section>

          <section className="detail-section">
            <h3>Calories and Cost</h3>
            {priceMissing && <p className="detail-note">Price not available.</p>}
            {caloriesMissing && <p className="detail-note">Calorie-based cost comparison is not available for this product.</p>}
            <table>
              <tbody>
                <tr><th>kcal/kg</th><td>{formatNumber(product.calories?.kcalPerKg)}</td></tr>
                <tr><th>kcal/cup</th><td>{formatNumber(product.calories?.kcalPerCup)}</td></tr>
                <tr><th>Package size</th><td>{formatNumber(product.packageAndPrice?.packageSizeKg, " kg")}</td></tr>
                <tr><th>Listed price</th><td>{formatCurrency(product.packageAndPrice?.priceCad, "Price not available")}</td></tr>
                <tr><th>Price per kg</th><td>{formatCurrency(computed.pricePerKg, "Price not available")}</td></tr>
                <tr><th>Cost per 1,000 kcal</th><td>{formatCurrency(computed.costPer1000Kcal)}</td></tr>
                <tr><th>Estimated daily cost</th><td>{formatCurrency(computed.estimatedDailyCost)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="detail-section">
            <h3>Ingredients</h3>
            <p><strong>First five ingredients:</strong> {product.ingredients.firstFive?.join(", ") || "Not listed"}</p>
            <p><strong>Full ingredient list:</strong> {listed(product.ingredients.fullList)}</p>
            <p><strong>Main protein sources:</strong> {product.productBasics.mainProteins?.join(", ") || "Not listed"}</p>
            <div className="flag-list">
              {ingredientFlags.map(([label, value]) => (
                <span key={label} className="detail-badge">
                  {label}: {statusLabel(value)}
                </span>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h3>Suitability Notes</h3>
            <ul className="plain-list">
              {suitabilityNotes(product).map((note) => <li key={note}>{note}</li>)}
            </ul>
          </section>

          <section className="detail-section">
            <h3>Sources and Notes</h3>
            <table>
              <tbody>
                <tr><th>Brand product URL</th><td>{linkCell(sourceUrl(product, "Brand product page"))}</td></tr>
                <tr><th>Brand nutrition URL</th><td>{linkCell(sourceUrl(product, "Brand nutrition page"))}</td></tr>
                <tr><th>Retailer URL</th><td>{linkCell(sourceUrl(product, "Retailer page"))}</td></tr>
                <tr><th>Package image URL</th><td>{linkCell(sourceUrl(product, "Package image"))}</td></tr>
                <tr><th>Source checked date</th><td>{provided(sourceCheckedAt(product))}</td></tr>
                <tr><th>Price checked date</th><td>{provided(product.packageAndPrice?.priceCheckedAt)}</td></tr>
                <tr><th>Data quality notes</th><td>{dataQualityNotes(product.dataQualityNotes)}</td></tr>
              </tbody>
            </table>
          </section>
        </div>
      </article>

      <style>{`
        .detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          background: rgba(31, 41, 51, 0.58);
          padding: 1rem;
        }
        .detail-modal {
          width: min(1080px, 100%);
          max-height: calc(100dvh - 2rem);
          overflow: auto;
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
        }
        .detail-header {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: var(--space-4);
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: var(--space-5);
        }
        .detail-header span {
          color: var(--color-primary-dark);
          font-size: 0.82rem;
          font-weight: 900;
          text-transform: uppercase;
        }
        .detail-header h2 {
          margin: 0.2rem 0 0;
          font-size: clamp(1.35rem, 3vw, 2rem);
          line-height: 1.15;
        }
        .detail-close {
          min-width: 112px;
          min-height: 42px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill);
          background: #fff;
          color: var(--color-text);
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          padding: 0.55rem 0.9rem;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-4);
          padding: var(--space-5);
        }
        .detail-section {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          padding: var(--space-4);
        }
        .detail-section h3 { margin-top: 0; }
        .detail-section p { color: var(--color-muted); }
        .detail-section table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .detail-section th,
        .detail-section td {
          border-bottom: 1px solid var(--color-border);
          overflow-wrap: anywhere;
          padding: 0.65rem 0;
          text-align: left;
          vertical-align: top;
        }
        .detail-section th {
          width: 38%;
          color: var(--color-primary-dark);
          font-size: 0.82rem;
        }
        .detail-section td {
          color: var(--color-text);
          font-weight: 750;
        }
        .detail-section a {
          color: var(--color-primary-dark);
          font-weight: 900;
          text-decoration: underline;
        }
        .detail-note {
          border-left: 3px solid var(--color-primary);
          background: var(--color-primary-soft);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          margin: 0 0 var(--space-3);
          padding: var(--space-3);
        }
        .flag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-top: var(--space-3);
        }
        .detail-badge {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill);
          background: var(--color-bg);
          color: var(--color-text);
          font-size: 0.82rem;
          font-weight: 850;
          padding: 0.4rem 0.65rem;
        }
        .plain-list {
          color: var(--color-muted);
          margin-bottom: 0;
          padding-left: 1.1rem;
        }
        @media (max-width: 880px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .detail-header {
            align-items: stretch;
            flex-direction: column;
          }
          .detail-close { width: 100%; }
          .detail-grid { padding: var(--space-3); }
        }
      `}</style>
    </div>
  );
}
