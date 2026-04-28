import type { FeaturesPrintPreset, PromoModalConfig, SeoSettingsDTO, SiteChromeConfig, SiteSettingsDTO } from './types';

export const DEFAULT_COMMERCE: SiteChromeConfig['commerce'] = {
  checkoutUrl: '',
  products: [
    {
      id: 'magnamat-v1',
      name: 'mag·na·mat v1.0',
      subtitle: 'Magnetic build surface · Eufy Maker · 235×235 mm',
      priceCents: null,
      maxPerOrder: 99,
    },
  ],
};

export const DEFAULT_PROMO_MODAL: PromoModalConfig = {
  enabled: false,
  title: 'Stay in the loop',
  body: 'Get launch updates and print tips for mag·na·mat on the Eufy Maker.',
  coupons: [],
  primaryCtaLabel: 'Pre-order',
  primaryCtaHref: '/',
  dismissLabel: 'Not now',
  rules: {
    minLifetimeVisits: 3,
    minScrollY: 480,
    pathScope: 'home',
    dismissStorageKey: 'promo-v1',
  },
};

/** Default jig demos — swap `topTextureUrl` in Admin → Site chrome for your own art. */
export const DEFAULT_FEATURES_PRINT_PRESETS: FeaturesPrintPreset[] = [
  {
    id: 'flat',
    label: 'Flat blank',
    caption: 'Rigid panel · default Chicago demo art',
    topTextureUrl: '/images/print-demo-chicago-bean.png',
  },
  {
    id: 'mug',
    label: 'Mug wrap',
    caption: 'Curved substrate — swap texture for your mug wrap preview',
    topTextureUrl: '/images/print-demo-chicago-bean.png',
  },
  {
    id: 'apparel',
    label: 'Apparel',
    caption: 'Textile / DTF area — illustrate fabric jig footprint',
    topTextureUrl: '/images/print-demo-chicago-bean.png',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    caption: 'Poster / canvas sheet on the magnetic jig',
    topTextureUrl: '/images/print-demo-chicago-bean.png',
  },
];

export const DEFAULT_CHROME: SiteChromeConfig = {
  navLinks: [
    { label: 'Features', href: '/features' },
    { label: 'Specs', href: '/specs' },
    { label: 'Compatible', href: '/compat' },
  ],
  youtubeVideoId: 'M7lc1UVf-VE',
  commerce: DEFAULT_COMMERCE,
  promoModal: DEFAULT_PROMO_MODAL,
  featuresPrintPresets: DEFAULT_FEATURES_PRINT_PRESETS,
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsDTO = {
  availabilityStatus: '',
  navHideOnScroll: false,
};

export const DEFAULT_SEO: SeoSettingsDTO = {
  title: 'mag·na·mat — Magnetic Maker Mat for Eufy',
  description:
    'mag·na·mat — precision magnetic print surface for the Eufy Maker system. 250+ micro-pin contacts, flex spring steel, 255°C rated, effortless release.',
  noIndex: false,
};
