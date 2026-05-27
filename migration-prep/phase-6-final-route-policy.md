# Phase 6 Final Route Policy

Generated: 2026-05-26T22:21:45.074Z

## Launch Policy

For launch readiness, keep the current generated route policy unchanged:

- /dog-parks/ = main dog park directory hub
- /dog-parks/{slug}/ = existing generated city, province, and individual park detail pages
- /dog-breeds/ = dog breed directory
- /dog-breeds/{slug}/ = dog breed detail pages
- /dog-breeds/group/{slug}/ = dog breed group pages
- /blog/ = blog index
- /blog/{slug}/ = blog posts
- /directory/ = directory index
- /directory/{slug}/ = directory listings

## Preferred Long-Term Policy

The cleaner long-term policy remains:

- /dog-parks/{slug}/ for city or province landing pages only
- /parks/{slug}/ for individual park detail pages

Do not make that URL structure change during Phase 6. It would require a complete redirect map and preview QA across hundreds of indexed park pages. The current shared route policy has no duplicate generated routes in this build and is safer for launch.

## Audit Results

- Generated route rows audited: 1082
- Duplicate route collisions: 0
- Missing slugs: 0
- Unexpected generated paths: none identified beyond the known shared /dog-parks/{slug}/ policy.

## Redirect Candidates

Legacy /parks/{slug} links found in content should be handled by the draft redirects where a confident target exists. /parks/vanier-park remains owner review because no matching generated destination was found.
