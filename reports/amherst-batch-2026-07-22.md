# Amherst batch - 2026-07-22

Completed the next valid highest-priority city-guide cleanup for Amherst, Nova Scotia.

## Outcome

- [Amherst city guide](/dog-parks/amherst/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a live featured park record.
- Added a new live park record for [Amherst Off-Leash Dog Park](/dog-parks/amherst-off-leash-dog-park/) so Amherst no longer sits as a city shell without a park listing grid.
- Added an original Amherst city hero image.

## Source basis

- The Town of Amherst Parks & Playgrounds page lists an Off-Leash Dog Park at Dickey Park, 132 East Pleasant Street.
- The same official page says the dog park is a one-acre fenced-in green space where dogs can run and play all year round.
- The town also asks visitors to pick up after their pet and not litter.
- The official Dickey Park entry on the same page describes nearby recreation context including a lighted walking track, large greenspace, play structure, splash pad, and change rooms and washrooms.

## Validation

- `node scripts/apply-amherst-updates.mjs`
- `npm run convert:cms`
- `npm run validate:data`
- `npm run build:media-map`
- `npm run optimize:images`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result target

- Amherst should drop out of `reports/thin-page-backlog.csv`.
- Content health should no longer flag `amherst` as missing source or park listing support.
- `amherst-off-leash-dog-park` should exist as the supporting park record for the city page.

## Remaining caution

- The official town page is strong on location, size, fencing, year-round use, and cleanup guidance, but it does not publish a detailed dog-park amenity grid. Unknown park fields were left blank or conservative on purpose.
