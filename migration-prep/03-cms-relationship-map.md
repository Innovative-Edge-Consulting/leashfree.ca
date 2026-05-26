# CMS Relationship Map

## Likely Collection Connections

| Source Collection | Field | Likely Target | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Blog Posts | Category | Blog Categories | Likely | Inferred from field name. |
| Blog Posts | Blog Tags | Blog Tags | Likely | Inferred from field name. |
| City Pages | City Name | City Pages | Likely | Inferred from field name. |
| City Pages | Province | Provinces | Likely | Inferred from field name. |
| City Pages | Featured Park 1 | Dog Parks | Likely | Inferred from field name. |
| City Pages | Featured Park 2 | Dog Parks | Likely | Inferred from field name. |
| City Pages | Featured Park 3 | Dog Parks | Likely | Inferred from field name. |
| City Pages | Park Rules | Dog Parks | Likely | Inferred from field name. |
| City Pages | City Website | City Pages | Likely | Inferred from field name. |
| City Pages | Province Page | Provinces | Likely | Inferred from field name. |
| City Pages | Dog Park Etiquettes | Dog Parks | Likely | Inferred from field name. |
| City Pages | Dog Park FAQs | Dog Parks | Likely | Inferred from field name. |
| City Pages | Nearby Cities | City Pages | Likely | Inferred from field name. |
| Directories | Category | Categories | Likely | Inferred from field name. |
| Directories | Province | Provinces | Likely | Inferred from field name. |
| Directories | City | City Pages | Likely | Inferred from field name. |
| Directories | Service Tags | Blog Tags | Likely | Inferred from field name. |
| Dog Breeds | Tags | Blog Tags | Likely | Inferred from field name. |
| Dog Breeds | Breed Group | Breed Groups | Likely | Inferred from field name. |
| Dog Breeds | Breed Group Reference | Breed Groups | Likely | Inferred from field name. |
| Dog Breeds | Size Category | Categories | Likely | Inferred from field name. |
| Dog Parks | Park Name | Dog Parks | Likely | Inferred from field name. |
| Dog Parks | Park Header | Dog Parks | Likely | Inferred from field name. |
| Dog Parks | Park type | Dog Parks | Likely | Inferred from field name. |
| Dog Parks | City | City Pages | Likely | Inferred from field name. |
| Dog Parks | Province | Provinces | Likely | Inferred from field name. |
| Dog Parks | Parking Available | Dog Parks | Likely | Inferred from field name. |
| Dog Parks | Washrooms nearby | Unknown | Ambiguous | Inferred from field name. |
| Dog Parks | Park Website or Source | Dog Parks | Likely | Inferred from field name. |
| Dog Parks | Tags | Blog Tags | Likely | Inferred from field name. |
| Pet Insurance Providers | Parent/Underwriter | Unknown | Ambiguous | Inferred from field name. |
| Pet Insurance Providers | ProvincesAvailable | Provinces | Likely | Inferred from field name. |
| Provinces | Province | Provinces | Likely | Inferred from field name. |

## Clear Relationships

- `Dog Parks.City` and `Dog Parks.Province` likely connect dog park records to city and province records.
- `City Pages.Province`, `City Pages.Province Page`, and `City Pages.Featured Park 1/2/3` connect city pages to provinces and featured park entries.
- `Dog Breeds.Breed Group` and `Dog Breeds.Breed Group Reference` connect breeds to breed groups.
- `Blog Posts.Category` and `Blog Posts.Blog Tags` connect posts to blog taxonomy collections.
- `Directories.Category`, `Directories.Province`, and `Directories.City` connect business listings to directory categories and locations.

## Ambiguous Relationships

- Several reference fields may store names rather than stable IDs. Conversion should preserve both raw label and resolved slug until verified.
- Multi-value fields such as tags, nearby cities, gallery, and additional images need delimiter inspection during conversion.
- `Province Page` may duplicate `Province` or may point to a Webflow item reference; verify before generating routes.

## Data Issues That Could Affect Rebuild

- Case mismatch exists in slug naming: most collections use `Slug`, while Dog Parks uses `slug`.
- Some media fields exist without detected Webflow URLs, which means assets may need manual matching.
- URL fields include external websites, affiliate links, Google Maps, and canonical URLs; they should not all be treated as internal routes.

## Recommended Static Data Model

- Store each collection as JSON arrays keyed by normalized `slug`.
- Keep original Webflow IDs in data for traceability but do not use them in public URLs.
- Resolve references into slugs during conversion while retaining raw source values for audit.
- Use separate media mapping data that maps `collection + item_slug + field_name` to final `/images/...` paths.
