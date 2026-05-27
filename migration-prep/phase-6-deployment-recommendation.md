# Phase 6 Deployment Recommendation

Generated: 2026-05-26T22:21:45.166Z

## Recommendation

Use Cloudflare Pages for the LeashFree.ca static Astro launch.

## Comparison

| Host | Fit | Notes |
| --- | --- | --- |
| GitHub Pages | Acceptable for simple static hosting | $0 and simple, but native redirects are limited and custom domain/CDN controls are less flexible for this migration. |
| Cloudflare Pages | Best fit | $0 static hosting, custom domains, CDN performance, native _redirects support, simple Astro build settings, and strong DNS/cutover tooling. |
| Netlify free tier | Good technical fit | Supports redirects and builds, but the project can avoid another platform dependency because Cloudflare already handles DNS-style launch needs well. |
| Vercel free tier | Good build platform | Excellent DX, but redirects/custom domain usage can be less aligned with a simple static content site and Cloudflare DNS cutover workflow. |

## Rationale

LeashFree.ca needs static Astro hosting, reliable custom domain support, redirect handling, and low operating cost. Cloudflare Pages best matches those requirements without adding paid services or a heavier runtime platform.

Use Node 22 LTS for the Cloudflare Pages build environment. The Phase 6 security upgrade moved Astro to 6.3.8 and Vite to a modern release that expects Node 20.19+ or Node 22.12+.
