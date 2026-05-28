# Content Quality Rules

This audit defines quality completeness only. It does not rewrite page content, update reviewedOn, update updatedOn, or change sitemap lastmod.

## Date Policy

- createdOn: when the record was first created.
- publishedOn: when the record first went live.
- reviewedOn: when a human or trusted workflow verified the page and no meaningful content changed.
- updatedOn: when meaningful page content changed.
- sitemap lastmod: uses updatedOn only.

## Dog Park Page Profile

A dog park page is quality complete when these checks are present or intentionally set to a verified value such as Unknown: name, slug, parkHeader, city, province, address/location description, latitude, longitude, official source URL, park type, fenced, small dog area, surface type, parking, water access, shade, rules, reviewedOn, and updatedOn.

## City / Dog Park Location Profile

A city page is quality complete when these checks are present: SEO intro, about section, rules section, seasonal tips, dog park etiquette, official source URL, nearby/internal links, FAQ section, park listing/grid presence, reviewedOn, and updatedOn.

## Quality Status Values

- complete: quality score is at least 95, page is not stale, and no issue classifications are present.
- needs-review: page has no major source, duplicate, thin-content, or data-quality blocker but still requires review.
- thin-content: page is below its content-type word threshold.
- missing-source: page is missing an expected official/source URL.
- duplicate-risk: duplicate SEO title or meta description risk.
- data-quality-risk: suspected duplicate record, fallback-looking slug, or mapping issue.

## Issue Classifications

- safe-technical-fix: deterministic metadata, link, or date-field issue.
- needs-source-research: official/source URL or factual verification needed.
- needs-content-expansion: page needs new human-reviewed content blocks.
- possible-duplicate: likely duplicate record, slug, title, or meta issue.
- needs-human-review: page is stale, incomplete, or data-risky enough to require review.

## Operating Rule

Daily or weekly automation should audit, prioritize, classify, and propose work. It should not automatically publish rewritten park or city content until source-backed content changes have been reviewed.
