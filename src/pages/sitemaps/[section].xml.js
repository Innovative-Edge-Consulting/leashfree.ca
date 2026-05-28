import { getSitemapSection, renderUrlSet, sitemapSections, xmlResponse } from "../../utils/sitemap.js";

export function getStaticPaths() {
  return sitemapSections.map((section) => ({
    params: { section: section.slug }
  }));
}

export function GET({ params }) {
  const section = getSitemapSection(params.section);

  if (!section) {
    return new Response("Not found", { status: 404 });
  }

  return xmlResponse(renderUrlSet(section.entries));
}
