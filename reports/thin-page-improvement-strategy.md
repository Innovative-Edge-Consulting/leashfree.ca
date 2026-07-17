# LeashFree.ca Thin-Page Improvement Strategy

Updated: 2026-07-17

## Recommendation

Work through thin pages one at a time, using a research packet and a release checklist for every page. The objective is not to make every page longer. The objective is to make each retained page useful, locally specific, source-backed, technically clean, and visually credible.

The current audit contains 695 thin pages across 1,070 audited pages. It also identifies 120 pages missing source URLs, 667 stale pages, 20 possible duplicate records, and 18 canonical cleanup candidates. These issues need to be handled in order: page identity and evidence first, then content, SEO, imagery, and publication.

## What to change in the original idea

### 1. Research comes before expansion

A thin page should not be expanded from generic knowledge or search snippets. Every meaningful claim should be tied to a source, especially:

- off-leash status and leash boundaries
- address and access points
- fencing, water, shade, parking, washrooms, and surfaces
- operating hours and seasonal restrictions
- dog licensing, age, supervision, and conduct rules
- planned improvements, which must be labelled as planned

### 2. A trusted source is not automatically an image licence

An official municipal page may establish facts without granting permission to copy, adapt, or transform its photographs. Canadian copyright guidance treats photographs as protected artistic works, and adaptation or commercial reproduction may require permission. Use a source photograph as an image-generation reference only when we have a documented licence or written permission. Otherwise, use the source for facts and create an independent original image from a factual visual brief. [CIPO copyright guidance](https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/guide-copyright), [Government of Canada Crown copyright guidance](https://www.canada.ca/en/canadian-heritage/services/crown-copyright-request.html)

### 3. Image accuracy matters more than photorealism

An AI image should not invent a recognizable gate, building, mountain, shoreline, or amenity and present it as a photograph of the real park. If the image is independently generated, treat it as an editorial illustration and use language such as “AI-generated illustration” in internal asset metadata. Do not use the image to prove that an amenity exists.

### 4. The backlog needs multiple workstreams

City pages, individual park pages, breed profiles, and directory records should not all receive the same content template. The generated backlog assigns each page a workstream and image plan so the research pass matches the page’s search intent.

## Backlog files

- [Full 695-page backlog](C:\Users\cjame\leashfree.ca\reports\thin-page-backlog.csv)
- [Backlog summary and first 50 pages](C:\Users\cjame\leashfree.ca\reports\thin-page-backlog-summary.md)
- [Reusable backlog generator](C:\Users\cjame\leashfree.ca\scripts\build-thin-page-backlog.mjs)

Regenerate the backlog after each content-health audit with `npm run content:health` followed by `npm run backlog:thin-pages`.

## Priority model

### T0 — integrity review

Resolve duplicate records, suspicious slugs, canonical conflicts, or city/park identity problems before investing in content or imagery. A page that should redirect or be merged should not receive a new article, image, or sitemap freshness signal.

### T1 — source research

Research pages with no official or trusted source URL. These are the highest evidence risk, even when the page has several hundred words.

### T2 — high-value expansion

Prioritize pages with high audit scores, fewer than 100 words, strong local search intent, or a clear opportunity to connect to the park map and directory.

### T3 — standard expansion

Refresh structurally sound pages that are thin but have enough evidence to proceed.

The generated backlog uses these tiers while retaining the audit score, word count, missing fields, source status, stale age, duplicate risk, and image plan for each URL.

## Standard page workflow

Each page moves through these statuses:

`queued` → `research-in-progress` → `evidence-ready` → `drafted` → `validated` → `image-ready` → `published` → `recheck-scheduled`

### Step 1: Identity and canonical check

Confirm that the page represents the correct city, park, breed, or business. Check for duplicates and suspicious slugs. Decide whether to keep, merge, redirect, or proceed.

### Step 2: Research packet

Create a compact evidence packet containing:

- page URL and page type
- official source URL and access date
- secondary corroborating sources, if needed
- fact-by-fact notes with source attribution
- unresolved or unknown fields
- current/stale/planned distinction
- image source and rights status

Source hierarchy:

1. municipality, park operator, provincial agency, or official business site
2. official bylaws, facility pages, maps, plans, and notices
3. reputable local organizations or established directories for corroboration
4. community reports only as leads, never as sole authority for rules or amenities

### Step 3: Content brief

Use page-specific search intent rather than a fixed word-count target.

For city pages:

- “dog parks in [city]” answer in the first paragraph
- number and type of verified park records
- featured parks with links
- local leash and park-use guidance
- seasonal visit advice
- nearby cities or province hub links
- FAQ based on verified local questions

For individual park pages:

- exact park name and city in title/H1
- location and directions
- off-leash boundary and access transition
- verified amenities with “unknown” where necessary
- best use cases without unsupported superlatives
- rules and visit checklist
- official source and last-reviewed date
- related parks only when the relationship is real

For breeds, directories, and names, use their own factual fields and avoid forcing park-style copy into them.

### Step 4: SEO strategy

Every page should have:

- one unique, location-aware title
- a useful meta description that promises the actual page content
- a stable canonical URL
- breadcrumb structured data
- page-type-appropriate structured data only when the facts are present
- descriptive internal links to the next useful decision
- noindex/redirect/merge decision when the page is not independently valuable

Avoid keyword stuffing, repetitive city-page introductions, unsupported “best” claims, fake reviews, and refreshing `lastmod` without material change.

### Step 5: Image decision

The image is part of the content packet, not an automatic final step.

#### City pages: original location-context image

Generate an original editorial image showing a dog in a visually plausible setting informed by verified local geography or park context: forest, waterfront, prairie, urban trail, mountain foothills, or community park. Do not invent a specific landmark unless it is intentionally stylized and factually verified.

#### Park pages: rights-gated image strategy

Use this decision tree:

1. User-owned or explicitly licensed photo: may be edited or used as a reference within the licence terms.
2. Public-domain or compatible Creative Commons photo: may be used according to the exact licence, with attribution and an asset record.
3. Official page photo with no reuse/adaptation permission: do not copy or transform it. Use it only to research visual facts, then generate an independent original scene or leave the image absent.
4. No suitable source image: generate an independent illustration based on verified facts, not a visual imitation of a particular photograph.

Every asset should record:

- filename and page route
- generation date
- prompt or visual brief
- whether a reference image was used
- reference source and licence/permission
- attribution requirement
- whether the asset is a photograph, licensed adaptation, or AI-generated illustration

#### Image quality requirements

- no invented signs, logos, municipal branding, or readable fake text
- no unsupported amenities shown prominently
- no claim that an AI illustration is a photograph
- useful alt text describing the image, not stuffing the target keyword
- responsive variants and compressed delivery
- inspect every generated image before publication

## Validation gates

A page is not ready to publish until all applicable gates pass:

- source URLs open and support the claims
- no factual field is filled by inference without being labelled
- current versus planned improvements are separated
- title, meta, canonical, breadcrumbs, and structured data are unique and valid
- internal links resolve to the intended page
- image rights record is complete
- generated image contains no invented text or misleading feature
- content-health score improves for the intended reason
- build passes
- page QA passes

## Measurement

Track the following for each completed page:

- before/after content-health score
- word count and completed fields
- whether a source URL was added
- canonical or duplicate decision
- image status and rights class
- impressions, clicks, CTR, and average position after 28 and 90 days
- organic entrances and clicks into maps, directories, and tools

The success metric is not word count. It is improved search visibility and a better user next step without increasing factual or copyright risk.

## Recommended working cadence

Work in batches of one page at a time for the first five pages. Use those pages to refine the evidence packet, image record, and validation checklist. After the process is stable, move to two or three closely related pages per batch, but keep each page independently researched and validated.

The next page after Mission should be **King City**, because it is the highest-priority remaining location page: 12 words, missing official source, and missing nearly every city-page content field. Do not begin imagery until its municipal park sources and park inventory are confirmed.
