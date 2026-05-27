function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isCoordinate(value) {
  if (!clean(value)) return false;
  const number = Number(value);
  return Number.isFinite(number);
}

function encodeMapQuery(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function locationQuery({ name, address, city, province, postalCode, latitude, longitude }) {
  if (isCoordinate(latitude) && isCoordinate(longitude)) {
    return `${clean(latitude)},${clean(longitude)}`;
  }

  return [name, address, city, province, postalCode].map(clean).filter(Boolean).join(", ");
}

export function mapLocation(input) {
  const query = locationQuery(input);
  if (!query) return null;

  const encodedQuery = encodeMapQuery(query);
  const embedKey = clean(import.meta.env.PUBLIC_GOOGLE_MAPS_EMBED_API_KEY);

  return {
    query,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`,
    searchUrl: input.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    embedUrl: embedKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedKey)}&q=${encodedQuery}`
      : `https://maps.google.com/maps?q=${encodedQuery}&output=embed`
  };
}
