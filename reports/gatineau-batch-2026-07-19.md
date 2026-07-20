# Gatineau batch - 2026-07-19

Completed the next highest-priority city-guide cleanup for Gatineau, Quebec.

## Outcome

- [Gatineau city guide](/dog-parks/gatineau/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URL, review date, and three real featured park records.
- Added a new live park record for [Parc Allen Dog Exercise Area](/dog-parks/parc-allen-dog-exercise-area/).
- Added a new live park record for [Parc de la Technologie Off-Leash Area](/dog-parks/parc-de-la-technologie-off-leash-area/).
- Added a new live park record for [Lac-Beauchamp North Off-Leash Area](/dog-parks/lac-beauchamp-north-off-leash-area/).
- Added an original Gatineau city hero image.
- Added an original Parc Allen hero image.
- Added an original Parc de la Technologie hero image.
- Added an original Lac-Beauchamp hero image.

## Source basis

- Ville de Gatineau current dog-parks page says dogs are currently allowed off leash at Parc Jardins-Lavigne basin, Parc de la Technologie, and the fenced north portion of Parc du Lac-Beauchamp accessed from boulevard Saint-René Est opposite 757 Saint-René Est.
- The same current page says the city's official aires d'exercices canins are Parc Allen, Domaine Fairview, Parc Lamarche, and the terrain de la caserne Cadieux-Laflamme.
- Ville de Gatineau's licensing page says every dog must be registered, renewed annually, and wear its city tag.
- Ville de Gatineau's current dog-rules page says dogs in on-leash public park settings must use a leash no longer than 1.85 metres, dogs weighing 20 kilograms or more must wear a halter or harness attached to the leash, retractable leashes are not recommended, and dogs using city dog spaces must be vaccinated.
- Ville de Gatineau's Lac-Beauchamp page was used for broader park context and confirms the main park address at 741 boulevard Maloney Est and free access/parking, while the dog page remained the controlling source for the off-leash access point and fenced north-zone limitation.

## Validation

- `npm run convert:cms`
- `npm run validate:data`
- `npm run build`
- `npm run qa:pages`
- `npm run content:health`
- `npm run backlog:thin-pages`

## Result

- Gatineau is no longer present in `reports/thin-page-backlog.csv`.
- Content health now marks `gatineau` as complete with 855 words and no missing required fields.
- `parc-allen-dog-exercise-area` is not thin and is live as a supporting park record.
- `parc-de-la-technologie-off-leash-area` is not thin and is live as a supporting park record.
- `lac-beauchamp-north-off-leash-area` is not thin and is live as a supporting park record.

## Remaining caution

- The three new park pages still carry a conservative review flag because latitude and longitude were intentionally left blank rather than inferred without a clearly published official coordinate source.
- Parc Allen and Parc de la Technologie also remain intentionally conservative on amenities because the reviewed current city pages clearly confirm status and rules more strongly than benches, water, shade, or parking details.
