import { renderSitemapIndex, xmlResponse } from "../utils/sitemap.js";

export function GET() {
  return xmlResponse(renderSitemapIndex());
}
