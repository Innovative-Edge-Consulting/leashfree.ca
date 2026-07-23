# Weyburn batch - 2026-07-22

Completed the next highest-priority city-guide cleanup for Weyburn, Saskatchewan.

## Outcome

- [Weyburn city guide](/dog-parks/weyburn/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a live featured park record.
- Refreshed the existing [Weyburn Community Dog Park](/dog-parks/weyburn-community-dog-park/) record from official city sources instead of leaving it on a third-party source.
- Added an original Weyburn city hero image.

## Source basis

- The City of Weyburn dog-park page places the Weyburn Community Dog Park on Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility.
- The same official page says the fenced park is 2.8 acres, includes separate areas for large and small dogs, and has a fenced staging area for leash removal before entry.
- The official rules PDF says dogs must wear current rabies and licence tags, handlers must carry a leash, dogs outside park boundaries must be leashed, and several safety and conduct rules apply.

## Validation

- `node scripts/apply-weyburn-updates.mjs`
- `npm run convert:cms`
- `npm run validate:data`
- `npm run build:media-map`
- `npm run optimize:images`
- `npm run build`
- `npm run content:health` currently fails for an unrelated missing built breed page (`dist/dog-breeds/large-munsterlander/index.html`), so the generated health backlog remained stale.
- The working backlog files were updated manually for Weyburn after build validation.

## Result

- Weyburn has been removed from the current working backlog in `reports/thin-page-backlog.csv`.
- The supporting park record should no longer rely on a third-party source.
- The queue remains restartable from the next highest-priority page.
