# Warman batch - 2026-07-25

- City page: `/dog-parks/warman/`
- Park page: `/dog-parks/warman-off-leash-dog-park/`

Sources reviewed:

- https://warman.ca/678/Off-Leash-Dog-Park
- https://warman.ca/801/Pet-Licensing-Animal-Services
- https://warman.ca/466/Parks-Playgrounds

Validation steps:

- `node scripts/apply-warman-updates.mjs`
- `npm run build`

Editorial note:

- Warman's official pages conflict on the park's acreage. The off-leash page says just over 20 acres; the parks page says just under 12 acres. The updated copy avoids an exact acreage claim until the city reconciles that detail.
