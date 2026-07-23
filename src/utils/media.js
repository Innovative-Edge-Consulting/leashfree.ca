const DEFAULT_MEDIA = {
  "Blog Posts": "/images/blog/blog-how-to-choose-the-right-dog-park-for-your-pup-hero.jpg",
  "Blog Categories": "/images/general/blog-category-dog-gear-card.jpg",
  "Breed Groups": "/images/general/breed-group-working-dogs-hero.jpg",
  Categories: "/images/general/category-veterinarians-hero.jpg",
  "City Pages": "/images/dog-parks/alberta-dog-parks-hero.jpg",
  Directories: "/images/general/category-veterinarians-hero.jpg",
  "Dog Breeds": "/images/general/blog-category-dog-breeds-card.avif",
  "Dog Names": "/images/general/blog-category-dog-names-card.jpg",
  "Dog Parks": "/images/dog-parks/alberta-dog-parks-hero.jpg",
  Provinces: "/images/blog/blog-top-10-off-leash-dog-parks-in-toronto-hero.avif"
};

const PLACEHOLDER = DEFAULT_MEDIA["Dog Parks"];

export function defaultMediaFor(collection) {
  return DEFAULT_MEDIA[collection] || PLACEHOLDER;
}

function firstUsableMediaValue(item, fieldName) {
  const fieldMatch = Array.isArray(item.media)
    ? item.media.find((entry) => (!fieldName || entry.fieldName === fieldName) && entry.value)
    : null;
  if (fieldMatch?.value) return fieldMatch.value;

  if (fieldName && item.raw?.[fieldName]) return item.raw[fieldName];
  if (item.image) return item.image;

  return null;
}

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

  const directValue = firstUsableMediaValue(item, fieldName);
  if (directValue) {
    return {
      src: directValue,
      status: "embedded",
      source: match || directValue
    };
  }

  const fallback = Array.isArray(item.media) ? item.media[0] : null;
  return {
    src: defaultMediaFor(item.collection),
    status: match?.currentLocalPath ? "defaulted-unpublished" : fallback?.originalUrls?.length ? "defaulted-webflow-url" : "defaulted",
    source: match || fallback || null
  };
}

export { PLACEHOLDER };
