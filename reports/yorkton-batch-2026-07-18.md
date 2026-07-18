# Yorkton batch - 2026-07-18

Completed the next highest-priority city-guide cleanup for Yorkton, Saskatchewan.

## Outcome

- [Yorkton city guide](/dog-parks/yorkton/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a real featured park record.
- Added a new live park record for [Wiggly Field Off-Leash Dog Park](/dog-parks/wiggly-field-off-leash-dog-park/) so Yorkton no longer sits as a hollow city shell without a park listing grid.
- Added an original Yorkton city hero image.
- Added an original Wiggly Field park hero image.

## Source basis

- City of Yorkton Animal Services says Yorkton has one off-leash dog park, Wiggly Field.
- City of Yorkton Enforcement says dogs and cats must be leashed and under control when off their property, allows off-leash use at an off-leash dog park, and requires immediate dog-poop cleanup.
- City of Yorkton heritage history says Wiggly Field Off-Leash Dog Park opened in 2015 on the former site of JayCee Beach.
- City of Yorkton sports-fields material places the Jaycee Beach Ball Complex just off York Road West, which provides area context for the park without overstating a precise civic address.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Yorkton is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `yorkton` as complete with 751 words and no missing required fields.
- `wiggly-field-off-leash-dog-park` is not thin and is live as the supporting park record.

## Remaining caution

- The City of Yorkton sources used here do not clearly publish an exact dog-park civic address or coordinate pair. The new park page is intentionally conservative and uses source-backed location context plus a Google Maps search link rather than invented coordinates.
