import type { SeoSettingsDTO, SiteChromeConfig, SiteSettingsDTO } from './types';

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

export const DEFAULT_CHROME: SiteChromeConfig = {
  navLinks: [
    { label: 'Features', href: '/features' },
    { label: 'Specs', href: '/specs' },
    { label: 'Compatible', href: '/compat' },
  ],
  youtubeVideoId: 'M7lc1UVf-VE',
  commerce: DEFAULT_COMMERCE,
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
