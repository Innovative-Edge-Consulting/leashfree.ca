# Humboldt batch - 2026-07-18

Completed the next highest-priority city-guide cleanup for Humboldt, Saskatchewan.

## Outcome

- [Humboldt city guide](/dog-parks/humboldt/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and a real featured park record.
- Added a new live park record for [Humboldt Off-Leash Dog Park](/dog-parks/humboldt-off-leash-dog-park/) so Humboldt no longer sits as a city shell without a park listing grid.
- Added an original Humboldt city hero image.
- Added an original Humboldt park hero image.

## Source basis

- City of Humboldt permits and licensing page states that dogs over three months old require an annual city licence.
- City of Humboldt bylaw and protective-services pages confirm animal control is part of the city's active enforcement framework.
- City of Humboldt event pages identify the Humboldt Community Gathering Place at 701 6th Avenue.
- Location wording for the dog park is intentionally conservative because the city does not appear to publish a dedicated dog-park page with exact coordinates or a full amenity list.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Humboldt is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `humboldt` as complete with 772 words and no missing required fields.
- `humboldt-off-leash-dog-park` is not thin and is live as the supporting park record.

## Remaining caution

- The new park page still carries a conservative human-review flag because latitude and longitude were intentionally left blank rather than inferred without a clearly published official coordinate source.
