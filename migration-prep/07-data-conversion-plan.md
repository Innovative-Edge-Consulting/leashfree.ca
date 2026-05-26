# Data Conversion Plan

## Recommended Final Format

Use JSON for structured collections in the first rebuild phase. Markdown/MDX can be introduced later for hand-authored blog content, but JSON is the safest first target because the source data is exported CSV and includes many structured fields.

## Folder Layout

```text
/src/data/raw/        # copied CSV exports, if needed later
/src/data/clean/      # normalized JSON generated from CSV
/src/data/media-map/  # confirmed CMS media mappings
```

## Cleanup Rules

- Trim whitespace in all string fields.
- Normalize boolean fields such as `Archived`, `Draft`, `Featured?`, `Fenced`, and amenity values.
- Preserve original field names during the first conversion, then add normalized aliases.
- Keep `Collection ID`, `Item ID`, and dates for traceability.

## Slug Rules

- Use existing `Slug` or `slug` values as canonical.
- Generate a slug only if missing, and flag it for owner review.
- Check duplicates within each collection and across shared URL prefixes.

## Rich Text Rules

- Preserve exported rich text HTML where present.
- Sanitize before rendering.
- Later, convert long-form blog/breed content to Markdown only if editing workflow benefits from it.

## Reference Rules

- Resolve references by exact slug first, then exact name, then case-insensitive normalized name.
- Store unresolved references as raw values plus `needs_review`.
- Multi-reference fields should become arrays.

## Media Path Rules

- Do not replace a Webflow URL until the local file exists and is confirmed.
- Use `manual-media-tracker.csv` as the source of truth during manual collection.
- Final paths should follow `/images/{collection-folder}/{collection-type}-{item-slug}-{purpose}.{ext}`.

## Validation Checks

- Required fields: name/title and slug.
- No duplicate output URLs.
- No missing required SEO fallback values.
- No unresolved internal references in published records.
- No final image path unless a local file exists.

## Example Output Structure

See the JSON samples in `migration-prep/examples/`. They use real field names where the exports include them, with placeholder values where conversion has not been performed yet.
