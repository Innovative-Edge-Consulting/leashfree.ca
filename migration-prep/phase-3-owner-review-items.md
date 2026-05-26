# Phase 3 Owner Review Items

Generated: 2026-05-26

## High Priority

- Confirm final route ownership for `/dog-parks/{slug}/`, especially whether province pages should remain in this namespace.
- Continue saving high-priority CMS media from `phase-3-media-to-save-next.csv`.
- Review unmatched local media files in `site/src/data/generated/media-map-report.md`.

## Medium Priority

- Review risky local media filenames before copying them into `/site/public/images/`.
- Confirm whether individual dog park pages should keep `/dog-parks/{park-slug}/` or eventually move to `/parks/{park-slug}/` with redirects.
- Review duplicate SEO titles and duplicate meta descriptions before launch.

## Low Priority

- Review directory/service pages after the main park, city, province, blog, and breed pages are stable.
- Confirm whether breed group pages should receive richer landing page copy later.

## Ambiguous Relationship Fields

Some relationships remain intentionally conservative:

- Blog categories and tags are rendered from explicit reference fields only.
- Breed group links are added only when the referenced group can be resolved by name or slug.
- Park to city/province links use clear City and Province fields only.

No guessed relationships were added in Phase 3.
