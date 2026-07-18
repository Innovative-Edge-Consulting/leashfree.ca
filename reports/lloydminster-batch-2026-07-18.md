# Lloydminster batch - 2026-07-18

Completed the next highest-priority city-guide cleanup for Lloydminster.

## Outcome

- [Lloydminster city guide](/dog-parks/lloydminster/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and two real featured park records.
- Added a new live park record for [Lloydminster Off-Leash Dog Park](/dog-parks/lloydminster-off-leash-dog-park/).
- Added a new live park record for [R.H. Brekko Lake Off-Leash Area](/dog-parks/r-h-brekko-lake-off-leash-area/).
- Added an original Lloydminster city hero image.
- Added an original fenced-park hero image.
- Added an original R.H. Brekko Lake hero image.

## Source basis

- City of Lloydminster Animal Services page says the main off-leash park is a fully fenced green space at 41 Street and 47 Avenue with doggie bags, picnic tables, waste bins, and nearly three acres of space.
- The same city page says R.H. Brekko Lake at 51 Avenue and 62 Street is an unfenced off-leash park available to the public and suited to well-trained dogs.
- The same city page says dog and cat owners no longer need to purchase a pet licence after the updated Domestic Animal Bylaw passed on January 11, 2021.
- Current city animal-services guidance and the 38-2020 Domestic Animal Bylaw confirm dogs and cats over six months still need identification tags with owner contact information when off the owner's property, animals must be under control in public, and waste must be removed immediately.
- The posted City off-leash rules PDF was used for behavioural and handler rules inside the fenced park, while outdated licence wording on that older sign was not treated as current policy.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Lloydminster is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `lloydminster` as complete with 901 words and no missing required fields.
- `lloydminster-off-leash-dog-park` is not thin and is live as a supporting park record.
- `r-h-brekko-lake-off-leash-area` is not thin and is live as a supporting park record.

## Remaining caution

- Both park pages still carry a conservative review flag because latitude and longitude were intentionally left blank rather than inferred without a clearly published official coordinate source.
