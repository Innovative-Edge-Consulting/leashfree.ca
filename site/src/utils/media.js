const PLACEHOLDER = "/images/placeholders/missing-image.svg";

export function resolveMedia(item, fieldName, mediaMap) {
  const entries = mediaMap?.items || [];
  const match = entries.find((entry) => {
    return (
      entry.collection === item.collection &&
      entry.itemSlug === item.slug &&
      (!fieldName || entry.fieldName === fieldName) &&
      (entry.publicPathReady || entry.publicPath || entry.currentLocalPath)
    );
  });

  if (match?.publicPathReady && match.publicPath) {
    return {
      src: match.publicPath,
      status: "mapped",
      source: match
    };
  }

  const fallback = Array.isArray(item.media) ? item.media[0] : null;
  return {
    src: PLACEHOLDER,
    status: match?.currentLocalPath ? "matched-not-copied" : fallback?.originalUrls?.length ? "webflow-url-preserved" : "placeholder",
    source: match || fallback || null
  };
}

export { PLACEHOLDER };
