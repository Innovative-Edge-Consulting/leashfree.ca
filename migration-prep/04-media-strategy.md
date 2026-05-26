# Media Strategy

Media source inspected: LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/CMS Media

## Inventory

- Media files found: 138
- File types found: avif: 114, jpg: 21, png: 3
- Duplicate filenames: none detected
- Suspicious filenames: 138 files have spaces, underscores, uppercase letters, punctuation, or very long names. See `media-inventory.json`.

## Recommended Naming Convention

Use `{collection-type}-{item-slug}-{image-purpose}.{extension}`. Examples: `park-bayview-park-hero.jpg`, `city-burlington-dog-parks-hero.jpg`, `breed-golden-retriever-profile.jpg`.

## Recommended Public Folder Structure

```text
/public/images/parks/
/public/images/cities/
/public/images/provinces/
/public/images/blog/
/public/images/breeds/
/public/images/general/
```

## Mapping Strategy

- Use `manual-media-tracker.csv` as the working list for each CMS media field.
- Match media by collection, item slug, field name, and original Webflow URL where available.
- For manually downloaded files without source URLs, match by visible page context and filename slug hints.
- Keep current filenames untouched until a later cleanup/copy step.

## Missing Media Strategy

- Treat missing media as `needs_review` or `not_started`; do not publish broken final image paths.
- Use a neutral placeholder only during development, never as final SEO/social imagery without owner approval.
- Prioritize hero, thumbnail/card, and OG images before gallery/secondary images.

## Replacing Webflow URLs

- During data conversion, replace Webflow/website-files URLs with local paths only when a confirmed local file exists.
- Store unresolved source URLs in a media mapping file so they can be revisited.
- CMS exports include media-like fields but few/no direct `website-files.com` URLs were detected in the CSV values, so some media may need to be matched manually from screenshots or live pages.
