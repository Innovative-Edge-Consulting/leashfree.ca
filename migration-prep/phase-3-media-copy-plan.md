# Phase 3 Media Copy Plan

Generated: 2026-05-26

## Scope

This is a plan only. Phase 3 does not move, copy, rename, or delete owner-saved CMS media files.

## Proposed Source Folder

`/cms-exports/CMS Media/`

The current project also contains owner-saved media in:

`/LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/CMS Media/`

The final source should be confirmed before any copy command runs.

## Proposed Destination Folder

`/site/public/images/`

Recommended subfolders:

- `/site/public/images/parks/`
- `/site/public/images/cities/`
- `/site/public/images/provinces/`
- `/site/public/images/blog/`
- `/site/public/images/breeds/`
- `/site/public/images/general/`

## Naming Rules

Use:

`{collection-type}-{item-slug}-{image-purpose}.{extension}`

Examples:

- `park-bayview-park-hero.jpg`
- `city-burlington-dog-parks-hero.jpg`
- `province-ontario-dog-parks-hero.jpg`
- `breed-golden-retriever-profile.jpg`
- `blog-best-dog-parks-in-ontario-featured.jpg`

## Duplicate Handling

- Detect exact duplicate destination names before copying.
- If two local files map to the same CMS item and purpose, keep both in the report and require owner review.
- Do not overwrite existing files without an explicit future write mode and backup policy.

## Missing File Handling

- Keep missing files in `media-map.json`.
- Render `/images/placeholders/missing-image.svg` until a local media file is copied.
- Do not fall back to Webflow-hosted URLs as the preferred public image path.

## Media Map Update After Copy

After a future copy step:

1. Copy approved files into `/site/public/images/`.
2. Update `site/src/data/media-map.json` with confirmed public paths.
3. Mark copied files as public-path-ready.
4. Re-run `npm run migrate:prep`.
5. Re-run `npm run build`.

## Page Image Resolution

Pages should resolve images in this order:

1. Confirmed local public image path.
2. Placeholder image.
3. Stored Webflow URL only as historical source metadata.

## Draft Script

A dry-run-only draft script was added:

`/site/scripts/copy-media-draft.js`

Recommended future command name:

`npm run media:copy:dry-run`

Do not add write mode until the owner confirms source folder, destination naming, and duplicate handling.
