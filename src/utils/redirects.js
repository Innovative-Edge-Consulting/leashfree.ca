import implementedRedirects from "../data/generated/implemented-redirects.json";

function normalizeRoute(routePath) {
  if (!routePath) return "";
  const clean = String(routePath).split("#")[0].split("?")[0];
  if (clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export const redirects = implementedRedirects.map((item) => ({
  ...item,
  sourceRoute: normalizeRoute(item.sourceRoute),
  targetRoute: normalizeRoute(item.targetRoute)
}));

export const redirectedSourceRoutes = new Set(redirects.map((item) => item.sourceRoute));

export function isRedirectSourceRoute(routePath) {
  return redirectedSourceRoutes.has(normalizeRoute(routePath));
}

export function canonicalRouteFor(routePath) {
  const normalized = normalizeRoute(routePath);
  return redirects.find((item) => item.sourceRoute === normalized)?.targetRoute || normalized;
}

export function withoutRedirectedRecords(records) {
  return records.filter((record) => !isRedirectSourceRoute(record.routePath || (record.slug ? `/dog-parks/${record.slug}/` : "")));
}
