# Melville batch - 2026-07-25

Completed the next highest-priority city-guide cleanup for Melville, Saskatchewan.

## Outcome

- [Melville city guide](/dog-parks/melville/) updated with source-backed intro, about copy, seasonal guidance, rules, etiquette, FAQs, official source URLs, review date, and a live featured park record.
- Refreshed the existing [Melville dog park page](/dog-parks/melville-dog-park/) from current City of Melville sources instead of leaving it on generic claims.
- Added a Melville hero image and prepared it for targeted optimization only.

## Source basis

- The City's official dog-park page describes the Melville Off-Leash Dog Park and publishes core features, rules, and hours.
- The official animal-control page says all dogs and cats in Melville must be licensed, says pets must be leashed off the owner's premises, and places the dog park east of the tennis courts in Melville Regional Park.
- The official parks page includes the off-leash dog park in the city's broader parks inventory.

## Source-quality note

- This is a strong source set because the city publishes both the dog park and the governing rules directly.
- This pass removes unsupported fountain claims and keeps parking, washrooms, and waste amenities conservative where they are not clearly published by the city.

## Validation

- `node scripts/apply-melville-updates.mjs`
- `node scripts/optimize-images.mjs --files public/images/dog-parks/melville-original.png`
- `npm run build`

## Result target

- Melville should drop out of the current working backlog.
- The city and park pages should stop relying on unsupported location and amenity claims.
- The new image workflow should prove that a single page pass can optimize only the new image instead of the full image library.
