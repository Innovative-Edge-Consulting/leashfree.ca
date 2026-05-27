# Cloudflare Pages Setup Notes

Generated: 2026-05-26T22:21:45.168Z

## Build Settings

- Project root directory: /site
- Build command: npm run build
- Build output directory: dist
- Node version recommendation: Node 22 LTS

## Preview Deployment

1. Push the Phase 6 branch or a launch-prep branch to GitHub.
2. In Cloudflare Pages, create a project from the repository.
3. Set the root directory to site.
4. Set the build command to npm run build.
5. Set the output directory to dist.
6. Set the Node version to Node 22 LTS.
7. Build a preview deployment first.
8. Run browser QA against the preview URL before any DNS changes.

## Custom Domain And DNS Cutover

1. Add leashfree.ca and www.leashfree.ca as custom domains in Cloudflare Pages.
2. Confirm Pages provides the expected DNS records.
3. Lower existing DNS TTL before cutover if possible.
4. Schedule cutover after preview QA and owner approval.
5. Change DNS only during the actual launch phase, not Phase 6.

## Rollback Plan

If launch issues appear, revert DNS records to the prior Webflow target while investigating. Keep the Webflow export and CMS backup intact until the static site has been stable after cutover.
