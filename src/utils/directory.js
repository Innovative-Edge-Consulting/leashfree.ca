export const DIRECTORY_CATEGORY_LABELS = {
  "animal-shelters-and-rescues": "Animal Shelters & Rescues",
  "dog-daycares-and-boarding": "Dog Daycares & Boarding",
  "dog-groomers": "Dog Groomers",
  "dog-trainers": "Dog Trainers",
  "dog-walkers-and-pet-sitters": "Dog Walkers & Pet Sitters",
  "pet-stores-and-boutiques": "Pet Stores & Boutiques",
  veterinarians: "Veterinarians"
};

export const DIRECTORY_CATEGORY_COPY = {
  "animal-shelters-and-rescues": {
    title: "Animal shelters and rescues in Canada",
    description: "Find Canadian animal shelters, dog rescues, humane societies, and adoption organizations in the LeashFree.ca directory.",
    summary: "Browse shelters, rescues, humane societies, and adoption organizations that help Canadian dogs find care, foster homes, and permanent families.",
    image: "/images/general/category-animal-shelters-and-rescues-hero.jpg"
  },
  "dog-daycares-and-boarding": {
    title: "Dog daycares and boarding in Canada",
    description: "Find Canadian dog daycares, boarding kennels, overnight care, and supervised play services in the LeashFree.ca directory.",
    summary: "Browse daycare and boarding providers for supervised play, overnight stays, and reliable care when your dog needs a safe place to spend the day or night.",
    image: "/images/general/category-dog-daycares-and-boarding-hero.jpg"
  },
  "dog-groomers": {
    title: "Dog groomers in Canada",
    description: "Find Canadian dog groomers, coat care providers, bath services, nail trims, and breed-specific grooming in the LeashFree.ca directory.",
    summary: "Browse groomers for baths, trims, coat maintenance, nail care, and regular grooming appointments across Canada.",
    image: "/images/general/category-dog-groomers-hero.jpg"
  },
  "dog-trainers": {
    title: "Dog trainers in Canada",
    description: "Find Canadian dog trainers, puppy classes, behaviour support, obedience programs, and private training services in the LeashFree.ca directory.",
    summary: "Browse trainers for puppy basics, obedience, leash manners, reactivity support, and behaviour coaching for Canadian dog owners.",
    image: "/images/general/category-dog-trainers-hero.jpg"
  },
  "dog-walkers-and-pet-sitters": {
    title: "Dog walkers and pet sitters in Canada",
    description: "Find Canadian dog walkers, pet sitters, drop-in visits, and in-home pet care services in the LeashFree.ca directory.",
    summary: "Browse walkers and pet sitters for daily exercise, drop-in visits, vacation care, and practical support for busy dog owners.",
    image: "/images/general/category-dog-walkers-and-pet-sitters-hero.jpg"
  },
  "pet-stores-and-boutiques": {
    title: "Pet stores and boutiques in Canada",
    description: "Find Canadian pet stores, dog boutiques, food retailers, gear shops, and local pet supply businesses in the LeashFree.ca directory.",
    summary: "Browse pet stores and boutiques for food, treats, gear, toys, apparel, and local dog supplies.",
    image: "/images/general/category-pet-stores-and-boutiques-hero.jpg"
  },
  veterinarians: {
    title: "Veterinarians in Canada",
    description: "Find Canadian veterinary clinics, animal hospitals, emergency vets, and pet health services in the LeashFree.ca directory.",
    summary: "Browse veterinary clinics, animal hospitals, emergency services, and pet health providers across Canada.",
    image: "/images/general/category-veterinarians-hero.jpg"
  }
};

export function cleanDirectoryValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeDirectoryValue(value) {
  return cleanDirectoryValue(value).toLowerCase();
}

export function directoryCityLabel(value) {
  return cleanDirectoryValue(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function directoryProvinceLabel(value) {
  const province = cleanDirectoryValue(value);
  if (province.length <= 3) return province.toUpperCase();
  return directoryCityLabel(province);
}

export function directoryCategory(item) {
  return cleanDirectoryValue(item.raw?.Category || item.references?.Category?.[0]);
}

export function directoryCategoryLabel(value) {
  const slug = cleanDirectoryValue(value);
  return DIRECTORY_CATEGORY_LABELS[slug] || slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function directoryLocationLabel(item) {
  return [
    directoryCityLabel(item.raw?.City),
    directoryProvinceLabel(item.raw?.Province)
  ].filter(Boolean).join(", ");
}

export function directoryCategoryPath(value) {
  const slug = cleanDirectoryValue(value);
  return slug ? `/directory/${slug}/` : "/directory/";
}

export function directoryCategoryCopy(value) {
  const slug = cleanDirectoryValue(value);
  return DIRECTORY_CATEGORY_COPY[slug] || {
    title: `${directoryCategoryLabel(slug)} in Canada`,
    description: `Find ${directoryCategoryLabel(slug).toLowerCase()} in the LeashFree.ca directory.`,
    summary: `Browse ${directoryCategoryLabel(slug).toLowerCase()} across Canada.`,
    image: "/images/general/directory-services-hero.png"
  };
}
