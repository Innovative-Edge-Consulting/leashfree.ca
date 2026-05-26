# Static Build Recommendation

## Recommended Framework

Use **Astro** as the primary rebuild framework. It is static-first, low-cost to host, GitHub-friendly, SEO-friendly, and works well with JSON data plus local images. It avoids the runtime/server assumptions of Next.js while still supporting components, layouts, collections, RSS/sitemap generation, and incremental complexity if needed.

## Option Evaluation

| Option | Fit | Notes |
| --- | --- | --- |
| Astro | Best | Static-first, content/data friendly, minimal client JS, strong SEO ergonomics. |
| Next.js static export | Good but heavier | More framework overhead; static export has routing/image constraints to manage. |
| Eleventy | Good | Very low overhead, but less ergonomic for rich components and future interactivity. |
| Plain HTML from scripts | Limited | Cheapest technically, but maintainability drops quickly with 500+ parks and 300+ breeds. |

## Suggested Project Structure

```text
/src/
  layouts/
  pages/
  components/
  data/
    parks.json
    cities.json
    provinces.json
    blog-posts.json
    dog-breeds.json
  lib/
/public/
  images/
    parks/
    cities/
    provinces/
    blog/
    breeds/
    general/
```

## Data and Page Generation

- Convert Webflow CSV exports into normalized JSON first.
- Generate pages from slugs using Astro dynamic routes.
- Keep original Webflow IDs in the data for debugging and reference resolution.
- Generate SEO metadata from `Meta Title`, `SEO Title`, `SEO Title Tag`, `Meta Description`, OG fields, and fallbacks.
- Generate `sitemap.xml` at build time from static pages and CMS records.
- Maintain redirects in a host-specific file such as Netlify `_redirects`, Cloudflare Pages redirects, or a generated `redirects.json` source.

## Risks and Assumptions

- Media is incomplete until the manual CMS Media folder is fully collected.
- Current live URL structure should be verified against the live site before final redirects.
- Webflow interactions/forms/search may require replacement rather than direct migration.
