# Deleted Duplicate Records

Generated on: 2026-05-29
Scope: Confirmed Webflow-suffixed duplicate records with validated permanent redirects and existing canonical targets.

## Summary

- Deleted (removed from active content dataset): 3
- Redirects retained: 3 (all `301`)
- Canonical targets retained: 3
- Manual-review same-name-different-city candidates deleted: 0

## Deletion Log

| Deleted Record Route | Canonical Route | Redirect Status | Reason for Deletion | Internal Link Check |
| --- | --- | --- | --- | --- |
| `/dog-parks/charleson-dog-park-8fc05/` | `/dog-parks/charleson-dog-park/` | `301` active (`public/_redirects` + `src/data/generated/implemented-redirects.json`) | Confirmed exact duplicate with Webflow-generated suffix (`-8fc05`) and validated canonical target exists. | No internal references found in active templates/content; only redirect mapping references remain. |
| `/dog-parks/lee-street-park-202b1/` | `/dog-parks/lee-street-park/` | `301` active (`public/_redirects` + `src/data/generated/implemented-redirects.json`) | Confirmed exact duplicate with Webflow-generated suffix (`-202b1`) and validated canonical target exists. | No internal references found in active templates/content; only redirect mapping references remain. |
| `/dog-parks/new-brighton-dog-park-vancouver-65262/` | `/dog-parks/new-brighton-dog-park-vancouver/` | `301` active (`public/_redirects` + `src/data/generated/implemented-redirects.json`) | Confirmed exact duplicate with Webflow-generated suffix (`-65262`) and validated canonical target exists. | No internal references found in active templates/content; only redirect mapping references remain. |

## Safety Assertions

- Canonical targets exist and remain active in `src/data/generated/parks.json`.
- Deleted source records no longer exist in `src/data/generated/parks.json`.
- Redirect source routes are not included in active sitemap generation because:
  - source records were removed from parks data, and
  - redirect-source filtering remains enforced by `withoutRedirectedRecords(...)` in sitemap/content pipelines.
- `/dog-parks/confederation-park-075b6/` was not deleted because it is a manual-review same-name-different-city candidate, not a confirmed true duplicate.
