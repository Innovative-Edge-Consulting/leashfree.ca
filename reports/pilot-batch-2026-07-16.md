# Thin-page pilot batch — 2026-07-16

Completed three integrity-first park records:

| Page | Research basis | Content decision | Image decision | QA |
| --- | --- | --- | --- | --- |
| [Confederation Park, Toronto](/dog-parks/confederation-park-075b6/) | City of Toronto off-leash-area study and Confederation Park facility information | Confirmed fenced Scarborough off-leash area; removed unsupported amenity claims and directed visitors to current site signage | Independent original urban fenced-park scene; no municipal photo copied or transformed | 167 words; source URL present |
| [Hampton Dog Park, Saskatoon](/dog-parks/hampton-dog-park-89f0c/) | City of Saskatoon dog-park page and current Hampton upgrade information | Replaced outdated “unfenced” description with a naturalized-area description and recorded fencing, parking, signage, and waste-bin upgrades | Independent original prairie/naturalized park scene | 172 words; source URL present |
| [Lee Street Park, Guelph](/dog-parks/lee-street-park/) | City of Guelph park page, off-leash page, and leash-free policy | Corrected address to 71 Lee Street, retained unfenced status, added verified park features, and used dawn-to-dusk policy language | Independent original unfenced neighbourhood-park scene | 177 words; source URL present |

Validation completed:

- `npm run convert:cms` — passed
- `npm run validate:data` — 0 warnings
- `npm run build` — passed; 1,095 pages built
- `npm run qa:pages` — 0 broken images; 77 site-wide broken links remain pre-existing

The backlog still classifies these records as thin because the threshold is intentionally conservative. Their next step is canonical review/redirect confirmation, not more generic prose.
