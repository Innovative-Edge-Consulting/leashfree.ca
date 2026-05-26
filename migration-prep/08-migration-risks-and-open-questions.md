# Migration Risks and Open Questions

## High

- Media collection is incomplete or not yet normalized; final image paths cannot be safely generated until local files are confirmed.
- The workspace is not a git repository, so branch-based review and commits are currently blocked.
- Current live URL structure was inferred from exports, not verified against a live sitemap or crawl. Redirect planning needs validation before launch.

## Medium

- CMS references may be stored as names rather than stable IDs, especially city/province/category/tag/breed group fields.
- Some CMS media fields do not expose direct Webflow URLs in CSV values, requiring manual matching from live pages or screenshots.
- Webflow forms, search, filtering, and interactions may need replacement rather than direct migration.
- Directory affiliate/external URLs need review to avoid accidentally changing monetized links.

## Low

- File naming includes spaces, underscores, generated AI filenames, and long names; this is manageable during the later media cleanup step.
- The extracted code export folder has a `.zip` suffix, which is confusing but not currently harmful.

## Fields Needing Owner Review

- All media fields: hero, featured, thumbnail, gallery, OG image.
- URL fields: affiliate URLs, source URLs, Google Maps, canonical URLs, external websites.
- Reference fields: featured parks, nearby cities, categories, tags, breed groups.

## CMS Collections Needing Owner Review

- Dog Parks: largest collection and highest URL/SEO importance.
- Dog Breeds: largest media set and many rich text fields.
- City Pages and Provinces: important for location landing pages and internal linking.
- Blog Posts: taxonomy, featured images, and rich body content need verification.

## Missing Files

- No sitemap.xml found.
- No robots.txt found.
- No redirects file found.
- No root-level `/cms-exports/CMS Media/` folder found; media currently appears in the backup export path.

## Recommended Next Codex Tasks

1. Initialize or connect the intended git repository and create the migration branch.
2. Verify live URLs with a crawl or sitemap export.
3. Build the Astro scaffold.
4. Convert CMS CSV files into normalized JSON with validation.
5. Create a confirmed media mapping workflow and copy/rename media into `/public/images/` only after owner review.
