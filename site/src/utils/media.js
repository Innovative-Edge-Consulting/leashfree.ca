const PLACEHOLDER = "/images/placeholders/missing-image.svg";

export function resolveMedia(item, fieldName, mediaMap) {
  const entries = mediaMap?.items || [];
  const match = entries.find((entry) => {
    return (
      entry.collection === item.collection &&
      entry.itemSlug === item.slug &&
      (!fieldName || entry.fieldName === fieldName) &&
      entry.currentLocalPath
    );
  });

  if (match?.suggestedPublicPath && match.status === "matched") {
    return {
      src: match.suggestedPublicPath,
      status: "mapped",
      source: match
    };
  }

  const fallback = Array.isArray(item.media) ? item.media[0] : null;
  return {
    src: PLACEHOLDER,
    status: fallback?.originalUrl ? "webflow-url-preserved" : "placeholder",
    source: fallback || null
  };
}

export { PLACEHOLDER };
