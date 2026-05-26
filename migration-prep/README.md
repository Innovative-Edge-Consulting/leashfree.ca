# LeashFree.ca Webflow Migration Prep

This folder contains the first migration audit for moving LeashFree.ca from Webflow to a low-cost static site build. The original Webflow export files were not changed.

## What Was Reviewed

- Webflow static code export files
- Webflow CMS CSV exports
- Exported images/assets and CMS Media files
- Static HTML page names and inferred URL patterns
- CMS fields, references, SEO fields, and media fields

## Files Found

- Static HTML files: 57
- CSS files: 3
- JavaScript files: 1
- CSV files: 14 total, including 11 CMS export files
- Media/image files counted: JPG 28, JPEG 0, PNG 6, WebP 0, SVG 4, AVIF 161

## CMS Collections Found

- Blog Categories: 7 items
- Blog Posts: 38 items
- Blog Tags: 28 items
- Breed Groups: 9 items
- Categories: 7 items
- City Pages: 88 items
- Directories: 66 items
- Dog Breeds: 310 items
- Dog Parks: 511 items
- Pet Insurance Providers: 8 items
- Provinces: 4 items

## Media Files Found

138 media files were found in `LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/CMS Media`. Do not rename or move them yet. Use `manual-media-tracker.csv` to track what has been downloaded and what still needs review.

## Ready For Next Phase

- CMS schemas are documented.
- Initial relationship map is documented.
- URL inventory and inferred route patterns are prepared.
- Static architecture recommendation is prepared.
- Data conversion plan and sample JSON shapes are prepared.

## Owner Still Needs To Prepare

- Continue manually saving CMS media into the CMS Media folder.
- Use consistent names such as `park-{slug}-hero.jpg`, `city-{slug}-hero.jpg`, `breed-{slug}-profile.jpg`, and `blog-{slug}-featured.jpg`.
- Review media filenames that are long, generated, or hard to match.
- Confirm important live URLs before redirects are generated.

## Recommended Next Step

Connect or initialize the intended git repository, then start the static site scaffold in Astro and convert the CMS CSV exports into validated JSON data.

## Note About Branch Creation

The requested branch `webflow-migration-prep` could not be created because this workspace does not currently contain a `.git` directory.
