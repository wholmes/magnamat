import { parseChromeConfig } from '@/lib/cms/chrome-json';
import { DEFAULT_CHROME, DEFAULT_SEO, DEFAULT_SITE_SETTINGS } from '@/lib/cms/defaults';
import { FALLBACK_HERO_SCENE_CAMERA, parseHeroSceneCameraFromJson } from '@/lib/cms/hero-scene-camera';
import { prisma } from '@/lib/prisma';

import { CmsDashboard } from './cms-dashboard';

export const dynamic = 'force-dynamic';

function logAdminDbReadError(label: string, err: unknown) {
  console.warn(`[admin] ${label} read failed — using defaults.`, err);
}

export default async function AdminSitePage() {
  let dbReadHadError = false;
  const mark = () => {
    dbReadHadError = true;
  };

  const [chromeRow, settingsRow, seoRow, heroCameraRow] = await Promise.all([
    prisma.siteChrome
      .findUnique({ where: { id: 'default' } })
      .catch((e) => {
        mark();
        logAdminDbReadError('SiteChrome', e);
        return null;
      }),
    prisma.siteSettings
      .findUnique({ where: { id: 'default' } })
      .catch((e) => {
        mark();
        logAdminDbReadError('SiteSettings', e);
        return null;
      }),
    prisma.seoSettings
      .findUnique({ where: { id: 'default' } })
      .catch((e) => {
        mark();
        logAdminDbReadError('SeoSettings', e);
        return null;
      }),
    prisma.heroSceneCamera
      .findUnique({ where: { id: 'default' } })
      .catch((e) => {
        mark();
        logAdminDbReadError('HeroSceneCamera', e);
        return null;
      }),
  ]);

  const chromeResolved = chromeRow?.configJson ? parseChromeConfig(chromeRow.configJson) : DEFAULT_CHROME;
  const chromeJson = JSON.stringify(chromeResolved, null, 2);

  const availabilityStatus = settingsRow?.availabilityStatus ?? DEFAULT_SITE_SETTINGS.availabilityStatus;
  const navHideOnScroll = settingsRow?.navHideOnScroll ?? DEFAULT_SITE_SETTINGS.navHideOnScroll;
  const seoTitle = seoRow?.title ?? DEFAULT_SEO.title;
  const seoDescription = seoRow?.description ?? DEFAULT_SEO.description;
  const seoNoIndex = seoRow?.noIndex ?? DEFAULT_SEO.noIndex;

  const heroSceneResolved =
    heroCameraRow?.configJson != null ? parseHeroSceneCameraFromJson(heroCameraRow.configJson) : null;
  const heroSceneJson = JSON.stringify(heroSceneResolved ?? FALLBACK_HERO_SCENE_CAMERA, null, 2);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>Site & metadata</h1>
      <p style={{ fontSize: 14, color: '#52525b', marginBottom: 32, lineHeight: 1.55, maxWidth: 52 * 16 }}>
        Nav chrome, optional settings, and document SEO. Saves apply on the next request to the marketing site.
      </p>
      <CmsDashboard
        chromeJson={chromeJson}
        promoModal={chromeResolved.promoModal}
        availabilityStatus={availabilityStatus}
        navHideOnScroll={navHideOnScroll}
        seoTitle={seoTitle}
        seoDescription={seoDescription}
        seoNoIndex={seoNoIndex}
        heroSceneJson={heroSceneJson}
        dbReadHadError={dbReadHadError}
      />
    </>
  );
}
