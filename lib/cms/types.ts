/** Single SKU for the client cart (`data-product-id` must match `id`). */
export type CommerceProduct = {
  id: string;
  name: string;
  subtitle?: string;
  /** `null` = “price at checkout” (Stripe Payment Link shows amount). */
  priceCents: number | null;
  maxPerOrder: number;
};

/** Stripe Payment Link, Gumroad permalink, etc. Empty = checkout button disabled. */
export type CommerceConfig = {
  checkoutUrl: string;
  products: CommerceProduct[];
};

export type SiteChromeConfig = {
  navLinks: { label: string; href: string }[];
  /** YouTube video id for nav “As seen on YouTube” */
  youtubeVideoId: string;
  /** Cart + hosted checkout — consumed by `lib/cart.ts` via `#magnamat-commerce-config`. */
  commerce: CommerceConfig;
};

export type SiteSettingsDTO = {
  availabilityStatus: string;
  navHideOnScroll: boolean;
};

export type SeoSettingsDTO = {
  title: string;
  description: string;
  /** Staging / preview: `noindex` + restrictive `robots.txt`. */
  noIndex: boolean;
};
