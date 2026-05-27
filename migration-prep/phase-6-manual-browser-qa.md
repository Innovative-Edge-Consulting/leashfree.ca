# Phase 6 Manual Browser QA

Generated: 2026-05-26T21:39:00-04:00

Test target: local static server at http://127.0.0.1:4322 serving /site/dist after `npm run build`.

Note: `astro preview` returned HTTP 500 after the Astro 6 upgrade in this local Windows environment, while the generated static files served correctly through a plain static server. Cloudflare Pages should serve the `dist` files directly.

| Page | Path tested | Loads | Header | Footer | Main content | Images | Mobile layout | SEO title |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | / | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | LeashFree.ca title is reasonable |
| Dog parks directory | /dog-parks/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Directory title is reasonable |
| Burlington dog parks page | /dog-parks/burlington/ | Pass | Pass | Pass | Pass | Resolved city hero image | Pass | Burlington city title is reasonable |
| Province page | /dog-parks/on/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Ontario title is reasonable |
| City page with multiple parks | /dog-parks/toronto/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Toronto city title is reasonable |
| Individual park page | /dog-parks/stanley-park-south-toronto/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Park title is reasonable |
| Blog index | /blog/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Blog title is reasonable |
| Blog post | /blog/top-10-off-leash-dog-parks-in-toronto/ | Pass | Pass | Pass | Pass | Resolved blog hero image | Pass | Blog post title is reasonable |
| Dog breed index | /dog-breeds/ | Pass | Pass | Pass | Pass | Placeholder hero present | Pass | Breed index title is reasonable |
| Dog breed page | /dog-breeds/golden-retriever/ | Pass | Pass | Pass | Pass | Resolved breed image | Pass after CSS fix | Breed detail title is reasonable |
| 404 page | /does-not-exist/ | Pass | Pass | Pass | Pass | No images expected | Pass | 404 title is reasonable |

## Findings

- No broken rendered images were detected on the tested pages.
- Known placeholder usage remains visible on homepage, directory, province, city, park, blog index, and dog breed index/detail pages where media is unresolved.
- A 390px mobile overflow issue was found on the Golden Retriever breed page and fixed by constraining the shared container and rich text blocks.
- Header, footer, canonical tags, H1s, and Open Graph title tags were present on all tested pages.

## Browser Viewports

- Desktop checks used 1280x720.
- Mobile checks used 390x844.
