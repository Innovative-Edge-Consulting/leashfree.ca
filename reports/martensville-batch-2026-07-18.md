# Martensville batch - 2026-07-18

Completed the next highest-priority city-guide cleanup for Martensville, Saskatchewan.

## Outcome

- [Martensville city guide](/dog-parks/martensville/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a real featured park record.
- Added a new live park record for [Martensville Dog Park](/dog-parks/martensville-dog-park/) so Martensville no longer sits as a city shell without a park listing grid.
- Added an original Martensville city hero image.
- Added an original Martensville park hero image.

## Source basis

- City of Martensville's pet licensing and animal services page states that pets must be licensed before visiting the Martensville Dog Park.
- The same city page says once-weaned dogs and cats must have a valid licence and wear a visible licence tag.
- City of Martensville parks and recreation pages list an Off-Leash Dog Park as part of the municipal recreation system.
- City waste and recycling guidance places the yard waste site along 10th Avenue South, south of the off-leash dog park, which provides conservative location context without inventing a civic address.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Martensville is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `martensville` as complete with 789 words and no missing required fields.
- `martensville-dog-park` is not thin and is live as the supporting park record.

## Remaining caution

- The park page still carries a conservative review flag because latitude and longitude were intentionally left blank rather than inferred without a clearly published official coordinate source.
