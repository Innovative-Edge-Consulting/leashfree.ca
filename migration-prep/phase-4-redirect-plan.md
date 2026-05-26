# Phase 4 Redirect Plan

Generated: 2026-05-26

This is a planning file only. No redirects were implemented in Phase 4.

## Current Known URL Patterns

From the Webflow export and migration audit:

- `/`
- `/dog-parks/`
- `/dog-parks/{slug}/`
- `/dog-breeds/`
- `/dog-breeds/{slug}/`
- `/blog/`
- `/blog/{slug}/`
- `/directory/`
- `/directory/{slug}/`
- Static utility pages such as `/about-us/`, `/contact/`, `/privacy-policy/`, and `/terms-of-use/` exist in the Webflow export.
- Older province landing pages also exist as static HTML exports such as `/ontario-dog-parks/`, `/alberta-dog-parks/`, and `/british-columbia-dog-parks/`.

## New Astro URL Patterns

- `/`
- `/dog-parks/`
- `/dog-parks/{slug}/`
- `/dog-breeds/`
- `/dog-breeds/{slug}/`
- `/dog-breeds/group/{slug}/`
- `/blog/`
- `/blog/{slug}/`
- `/directory/`
- `/directory/{slug}/`
- `/sitemap.xml`
- `/404.html`

## URLs That Appear Unchanged

- `/`
- `/dog-parks/`
- `/dog-parks/{slug}/`
- `/dog-breeds/`
- `/dog-breeds/{slug}/`
- `/blog/`
- `/blog/{slug}/`
- `/directory/`
- `/directory/{slug}/`

## URLs That May Need Redirects

- `/about-us/` if an Astro about page is added later.
- `/contact/` if an Astro contact page is added later.
- `/privacy-policy/` and `/terms-of-use/` if legal/static pages are migrated later.
- Province static pages such as `/ontario-dog-parks/` may need redirects to `/dog-parks/on/`.
- Similar legacy province pages may need redirects to the matching generated province slug.

## Manual Review Needed

- Confirm whether individual park detail pages should remain at `/dog-parks/{park-slug}/` for launch.
- Confirm whether city and province landing pages should remain in the same `/dog-parks/{slug}/` namespace.
- Compare the final Webflow sitemap against the generated Astro sitemap before launch.
- Decide whether legacy dog names, tools, games, and resource pages will be rebuilt, redirected, or intentionally retired.

## Shared `/dog-parks/{slug}/` Policy Recommendation

Long term, this is cleaner:

- `/dog-parks/` = dog park directory hub
- `/dog-parks/{slug}/` = city or province landing pages only
- `/parks/{slug}/` = individual park detail pages
- `/dog-breeds/{slug}/` = dog breed pages
- `/blog/{slug}/` = blog posts

Phase 4 does not implement this change because Phase 3 found the current shared namespace has 0 collisions and the audited export appears to preserve `/dog-parks/{slug}/` for multiple content types. A route change should happen only with a complete redirect map.
