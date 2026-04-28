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

/** Where the promo `<dialog>` may appear (marketing layout only). */
export type PromoModalPathScope = 'home' | 'any';

export type PromoCoupon = { label: string; code: string };

export type PromoModalRules = {
  /** Show only after this many **browser sessions** (increment once per session). `0` = no minimum. */
  minLifetimeVisits: number;
  /** Minimum `window.scrollY` (px) before the modal can open. `0` = no scroll gate. */
  minScrollY: number;
  pathScope: PromoModalPathScope;
  /**
   * `localStorage` key suffix: `magnamat-promo-dismissed-{dismissStorageKey}`.
   * Change this string to show the modal again to people who already dismissed it.
   */
  dismissStorageKey: string;
};

export type PromoModalConfig = {
  enabled: boolean;
  title: string;
  body: string;
  /** Optional checkout codes — shown in high-contrast strips in the dialog. */
  coupons: PromoCoupon[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  dismissLabel: string;
  rules: PromoModalRules;
};

export type SiteChromeConfig = {
  navLinks: { label: string; href: string }[];
  /** YouTube video id for nav “As seen on YouTube” */
  youtubeVideoId: string;
  /** Cart + hosted checkout — consumed by `lib/cart.ts` via `#magnamat-commerce-config`. */
  commerce: CommerceConfig;
  /** Optional announcement modal — rules + copy; read by `components/promo-modal.tsx`. */
  promoModal: PromoModalConfig;
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
