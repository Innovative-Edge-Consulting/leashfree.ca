# Phase 4 Design Audit

Generated: 2026-05-26

## Existing Visual Patterns Found

- Primary brand green is consistently present in the Webflow export: `#497f64`.
- The export uses pale green/off-white backgrounds around dog park and directory content.
- Webflow typography references `Manrope` for body text and `Corben` for large display headings.
- Navigation includes the LeashFree.ca brand, dog park, dog breed, blog/resource, and directory-style links.
- Cards and listings are common across dog parks, blog posts, directory listings, and breed pages.
- Webflow uses many generated utility classes and duplicated component variants.

## Recommended Reusable Components

- `Header.astro`
- `Footer.astro`
- `Hero.astro`
- `Section.astro`
- `Breadcrumbs.astro`
- `ImageWithFallback.astro`
- `Card.astro`
- `ParkCard.astro`
- `CityCard.astro`
- `ProvinceCard.astro`
- `BlogCard.astro`
- `BreedCard.astro`
- `RelatedLinks.astro`
- `ContentBlock.astro`
- `CTA.astro`
- `EmptyState.astro`

## Recommended Color Palette

- Primary: `#497f64`
- Primary dark: `#315f49`
- Background: `#f7faf7`
- Surface: `#ffffff`
- Alternate surface: `#f0f6f1`
- Text: `#1f2933`
- Muted text: `#5f6f64`
- Border: `#dbe7dd`

## Recommended Typography Scale

- System-first sans stack with `Manrope` as a preferred brand font when available.
- Display stack with `Corben` fallback for large homepage and section headings.
- H1 uses a responsive clamp but does not scale all body text with viewport width.
- Listing/card headings stay compact for dense directory pages.

## Recommended Button Styles

- Primary pill button using LeashFree green and white text.
- Secondary pill button using white background and subtle border.
- Keep buttons static and accessible; no JavaScript required.

## Recommended Card Styles

- White surface.
- 16px radius.
- Subtle border and shadow.
- Optional badges for province, category, park traits, or breed traits.
- Optional image area with placeholder fallback.

## Recommended Layout Patterns

- Sticky top header with desktop links and a simple `<details>` mobile menu.
- Full-width section bands with constrained inner content.
- Responsive grids for cards.
- Two-column detail layout for park, breed, and directory pages.
- Sidebar cards only for supporting facts or related links.

## Webflow CSS Worth Preserving

- Brand color direction.
- Overall green/off-white visual direction.
- Major public navigation intent.
- Page type separation: dog parks, dog breeds, blog, directory.

## Webflow CSS Not Migrated

- Generated `ai-gen-*` variables.
- Webflow interaction classes.
- Large duplicated navbar, hero, and blog component variants.
- Webflow runtime JavaScript.
- Ad, analytics, and third-party scripts.

The new static site should remain lightweight and Astro-native.
