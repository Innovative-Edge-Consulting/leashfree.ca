# URL Structure Audit

## Static Pages

- /401
- /404
- /about-us
- /alberta-dog-parks
- /blog
- /british-columbia-dog-parks
- /canadian-dog-names
- /color-inspired-dog-names
- /contact
- /cute-dog-names
- /directory
- /dog-breeds
- /dog-insurance-canada
- /dog-name-finder
- /dog-names
- /dog-parks
- /female-dog-names
- /find-your-breed
- /barkle
- /
- /link-tree
- /male-dog-names
- /manitoba-dog-parks
- /nature-dog-names
- /new-brunswick-dog-parks
- /newfoundland-and-labrador-dog-parks
- /nova-scotia-dog-parks
- /ontario-dog-parks
- /prince-edward-island-dog-parks
- /privacy-policy
- /quebec-dog-parks
- /resources
- /dog-calorie-calculator
- /dog-gear-finder
- /saskatchewan-dog-parks
- /search
- /strong-dog-names
- /style-guide
- /suggest-a-dog-park
- /terms-of-use
- /unique-dog-names
- /untitled

## CMS Template Exports

- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_blog-categories.html -> template for blog-categories
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_blog-tags.html -> template for blog-tags
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_blog.html -> template for blog
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_breed-groups.html -> template for breed-groups
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_category.html -> template for category
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_city.html -> template for city
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_directory.html -> template for directory
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_dog-breeds.html -> template for dog-breeds
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_dog-names.html -> template for dog-names
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_dog-parks.html -> template for dog-parks
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_pet-insurance.html -> template for pet-insurance
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_provinces.html -> template for provinces
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_services.html -> template for services
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_tool-categories.html -> template for tool-categories
- LeashFree-Webflow-Backup-2026-05-26/01-webflow-code-export/leashfree-webflow-code-export-2026-05-26.zip/detail_tools.html -> template for tools

## Inferred CMS URL Patterns

- Park pages: `/dog-parks/{slug}/`
- City pages: `/dog-parks/{city-slug}/` or a future `/cities/{slug}/` if SEO redirects are handled carefully
- Province pages: `/dog-parks/{province-slug}/` based on exported province static pages like `ontario-dog-parks.html`
- Blog posts: `/blog/{slug}/`
- Blog categories: `/blog/category/{slug}/`
- Blog tags: `/blog/tag/{slug}/`
- Dog breeds: `/dog-breeds/{slug}/`
- Breed groups: `/dog-breeds/group/{slug}/`
- Directory listings: `/directory/{slug}/`

## Duplicate Slugs

- dog-parks: Blog Categories, Blog Tags
- calgary: Blog Tags, City Pages
- french-bulldog: Blog Tags, Dog Breeds
- german-shepherd: Blog Tags, Dog Breeds
- golden-retriever: Blog Tags, Dog Breeds
- halifax: Blog Tags, City Pages
- labrador-retriever: Blog Tags, Dog Breeds
- montreal: Blog Tags, City Pages
- poodle: Blog Tags, Dog Breeds
- toronto: Blog Tags, City Pages
- vancouver: Blog Tags, City Pages

## Missing Slugs

No missing CMS slugs detected.

## Recommended Future URL Structure

Keep current high-value URLs stable where possible. Convert `.html` static pages to trailing-slash routes with redirects from `.html`. For CMS content, use collection-specific prefixes and generate canonical URLs consistently.

## Redirect Risks

- Static exported `.html` pages need redirects to extensionless or trailing-slash paths if the new site changes format.
- Province pages currently exist as flat files like `/ontario-dog-parks`; moving them under `/dog-parks/ontario/` would require explicit redirects.
- City and park slugs may collide under a shared `/dog-parks/{slug}` pattern, so route generation should check conflicts before build.
