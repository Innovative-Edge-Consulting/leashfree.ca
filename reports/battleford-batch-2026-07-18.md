# Battleford batch - 2026-07-18

Completed the next highest-priority city-guide cleanup for Battleford, Saskatchewan.

## Outcome

- [Battleford city guide](/dog-parks/battleford/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a real featured park record.
- Added a new live park record for [Battleford Off-Leash Dog Park](/dog-parks/battleford-off-leash-dog-park/) so Battleford no longer sits as a city shell without a park listing grid.
- Added an original Battleford city hero image.
- Added an original Battleford park hero image.

## Source basis

- Town of Battleford official off-leash dog park page places the park at the south end of town on 13th Street Industrial.
- The same official page says the park is open all year round and includes a smaller 0.75 acre area and a larger 2.5 acre area.
- The official rule sheet covers leash-in-hand requirements, prohibited dogs, nuisance-dog removal, no toys, no food, and cleanup obligations.
- Town public-safety and administration pages confirm pet licensing, leash requirements outside the owner's property, and immediate waste-removal rules.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Battleford is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `battleford` as complete with 718 words and no missing required fields.
- `battleford-off-leash-dog-park` is not thin and is live as the supporting park record.

## Remaining caution

- The park page still carries a conservative human-review flag because the official town page gives a clear location description but not a latitude/longitude pair.
