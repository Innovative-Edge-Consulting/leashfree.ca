import { createSearchIndex } from "../utils/searchIndex.js";

export function GET() {
  return new Response(JSON.stringify(createSearchIndex()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
