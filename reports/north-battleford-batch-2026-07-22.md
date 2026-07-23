# North Battleford batch - 2026-07-22

Completed the next highest-priority city-guide cleanup for North Battleford, Saskatchewan.

## Outcome

- [North Battleford city guide](/dog-parks/north-battleford/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URLs, review date, and a live featured park record.
- Refreshed the existing [North Battleford Off-Leash Dog Park](/dog-parks/north-battleford-off-leash-dog-park/) record from current City of North Battleford sources instead of leaving it on a third-party listing.
- Added an original North Battleford hero image and mapped it for both the city and park pages.

## Source basis

- The City's official dog park page says the Dog Park is the only area where dogs can be off leash in public.
- The same page places the park just off Airport Road by Cameron McIntosh Airport, says it is fully fenced, and says it is open all year round.
- The city publishes current dog-park rules, including licence and vaccination requirements, leash-carry requirements, nuisance-dog removal, and a ban on dogs in heat and motorized vehicles.
- The current pet-licences page says all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.

## Source-quality note

- This source set is stronger than many other thin pages because the city publishes the park directly and gives usable rule context.
- This pass still keeps coordinates and unconfirmed amenities conservative because the official page does not clearly publish a coordinate pair or a detailed amenity checklist.

## Validation

- `node scripts/apply-north-battleford-updates.mjs`
- `npm run optimize:images`
- `npm run build`

## Result target

- North Battleford should drop out of the current working backlog.
- The city page should stop relying on unsupported generic copy and the fallback hero image.
- The supporting park record should now reflect the city's published location context, fencing, year-round status, and rules.
