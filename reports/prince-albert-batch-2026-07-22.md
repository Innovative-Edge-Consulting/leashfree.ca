# Prince Albert batch - 2026-07-22

Completed the next highest-priority city-guide cleanup for Prince Albert, Saskatchewan.

## Outcome

- [Prince Albert city guide](/dog-parks/prince-albert/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official city animal-services source, review date, and a live featured park record.
- Refreshed the existing [Central Bark Dog Park](/dog-parks/central-bark-dog-park/) record with conservative source-backed content instead of unsupported generic copy.
- Added an original Prince Albert city hero image.

## Source basis

- The City of Prince Albert animal-services page currently explains Animal Control contacts, pet licensing, and the bylaws dog owners should follow.
- The Prince Albert SPCA contact page confirms the shelter location at 1125 North Industrial Drive, which anchors the park location.
- Local reporting from paNOW identifies Central Bark as the city dog park beside the SPCA building on the north side of the river and reports it was built by the SPCA in 2010.

## Source-quality note

- A current dedicated official municipal dog-park page was not identified in this research pass.
- Because of that, the page set is intentionally conservative about amenities and uses explicit source-confidence language instead of implying stronger official documentation than exists.

## Validation

- `node scripts/apply-prince-albert-updates.mjs`
- `npm run build:media-map`
- `npm run optimize:images`
- `npm run build`
- `npm run convert:cms` and `npm run validate:data` hit a Windows file-open lock inside `src/data/generated`, so the specific generated Prince Albert records were patched directly before the final build.

## Result target

- Prince Albert has been removed from the current working backlog.
- The city page should stop claiming unsupported Alfred Jenkins Field House dog-park facts.
- The supporting park record should now show the actual source-confidence level and location basis.
