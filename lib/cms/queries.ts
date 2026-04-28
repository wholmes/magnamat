import { cache } from 'react';

import { prisma } from '@/lib/prisma';

import { parseChromeConfig } from './chrome-json';
import { DEFAULT_CHROME, DEFAULT_SEO, DEFAULT_SITE_SETTINGS } from './defaults';
import {
  FALLBACK_HERO_SCENE_CAMERA,
  parseHeroSceneCameraFromJson,
  type HeroSceneCameraConfig,
} from './hero-scene-camera';
import { DEFAULT_MARKETING_PAGE, parseMarketingPageJson, type MarketingPageContent } from './marketing-content';
import type { SeoSettingsDTO, SiteChromeConfig, SiteSettingsDTO } from './types';

/** Layout: nav labels + YouTube id (SiteChrome.configJson pattern). */
export const getSiteChrome = cache(async (): Promise<SiteChromeConfig> => {
  try {
    const row = await prisma.siteChrome.findUnique({ where: { id: 'default' } });
    if (row?.configJson) return parseChromeConfig(row.configJson);
  } catch {
    /* DB unavailable — build / CI without DATABASE_URL */
  }
  return DEFAULT_CHROME;
});

export const getSiteSettings = cache(async (): Promise<SiteSettingsDTO> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (row) {
      return {
        availabilityStatus: row.availabilityStatus,
        navHideOnScroll: row.navHideOnScroll,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SITE_SETTINGS;
});

export const getSeoSettings = cache(async (): Promise<SeoSettingsDTO> => {
  try {
    const row = await prisma.seoSettings.findUnique({ where: { id: 'default' } });
    if (row) {
      return { title: row.title, description: row.description, noIndex: row.noIndex };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SEO;
});

/** Home page sections (hero, features, specs, compat, footer). */
export const getMarketingPageContent = cache(async (): Promise<MarketingPageContent> => {
  try {
    const row = await prisma.marketingPage.findUnique({ where: { id: 'home' } });
    if (row?.contentJson) return parseMarketingPageJson(row.contentJson);
  } catch {
    /* ignore */
  }
  return DEFAULT_MARKETING_PAGE;
});

/** Hero WebGL default orbit + mat rotation (injected for `lib/mat-scene.ts`). */
export const getHeroSceneCameraConfig = cache(async (): Promise<HeroSceneCameraConfig> => {
  try {
    const row = await prisma.heroSceneCamera.findUnique({ where: { id: 'default' } });
    if (row?.configJson) {
      const parsed = parseHeroSceneCameraFromJson(row.configJson);
      if (parsed) return parsed;
    }
  } catch {
    /* ignore */
  }
  return FALLBACK_HERO_SCENE_CAMERA;
});

/**
 * Features “Built different” WebGL (`#mat-canvas-scroll`). Same JSON shape as hero.
 * `null` = no row / invalid JSON → client uses hero CMS preset + built-in framing nudge.
 */
export const getFeaturesSceneCameraConfig = cache(async (): Promise<HeroSceneCameraConfig | null> => {
  try {
    const row = await prisma.featuresSceneCamera.findUnique({ where: { id: 'default' } });
    if (row?.configJson) {
      return parseHeroSceneCameraFromJson(row.configJson);
    }
  } catch {
    /* ignore */
  }
  return null;
});
