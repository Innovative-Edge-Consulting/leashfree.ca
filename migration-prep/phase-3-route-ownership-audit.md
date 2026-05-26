# Phase 3 Route Ownership Audit

Generated: 2026-05-26

## Current Route Generators

The Astro app currently has one dynamic route for the shared dog park namespace:

- `site/src/pages/dog-parks/[slug].astro`

The route reads three collections and resolves each slug in this order:

1. Dog Parks
2. City Pages
3. Provinces

This keeps one clear Astro route owner for `/dog-parks/{slug}/` while still supporting the URL patterns found in the migration audit.

## Route Pattern By Collection

| Collection | Route Pattern | Status |
| --- | --- | --- |
| Dog Parks | `/dog-parks/{park-slug}/` | Preserved |
| City Pages | `/dog-parks/{city-slug}/` | Preserved |
| Provinces | `/dog-parks/{province-slug}/` | Preserved for now |
| Blog Posts | `/blog/{post-slug}/` | Separate route |
| Dog Breeds | `/dog-breeds/{breed-slug}/` | Separate route |
| Directories | `/directory/{slug}/` | Separate route |

## Collision Review

- Items checked in shared `/dog-parks/{slug}/` namespace: 603
- Current slug collisions across Dog Parks, City Pages, and Provinces: 0

No generated pages currently overwrite or compete with each other in this namespace.

## Recommended Route Ownership

- `/dog-parks/`: main dog park directory hub.
- `/dog-parks/{slug}/`: single route owner that resolves park, city, or province content by slug.
- `/blog/{slug}/`: blog posts only.
- `/dog-breeds/{slug}/`: dog breed pages only.
- `/directory/{slug}/`: directory/service landing pages only.

This is intentionally conservative because the original audit shows `/dog-parks/{slug}/` as an existing SEO-friendly URL pattern for multiple public content types.

## Redirect Candidates Later

These should not be changed during Phase 3, but may need redirect decisions before launch:

- Province pages could eventually move to `/dog-parks/{province-slug}/` permanently or to `/provinces/{province-slug}/`.
- Individual park pages could eventually move to `/parks/{park-slug}/` only if the owner accepts a redirect plan.
- Any Webflow collection paths not represented in the static scaffold should be reviewed against the original sitemap before launch.

## Owner Review Needed

- Confirm whether province pages should remain under `/dog-parks/{province-slug}/`.
- Confirm whether individual park pages should remain under `/dog-parks/{park-slug}/` for launch.
- Confirm whether any future city, province, or park slugs may collide as new content is added.
