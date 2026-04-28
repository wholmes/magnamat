'use server';

import { redirect } from 'next/navigation';

import { parseChromeConfig, validateChromeJsonString } from '@/lib/cms/chrome-json';
import { parseCouponsMultiline } from '@/lib/cms/promo-modal-coupons';
import { heroSceneCameraToJson, tryParseHeroSceneCameraFromEditor } from '@/lib/cms/hero-scene-camera';
import { marketingPageToJson, tryParseMarketingPageFromEditor } from '@/lib/cms/marketing-content';
import { revalidateAfterCmsWrite } from '@/lib/cms/revalidate-public';
import { prisma } from '@/lib/prisma';
import type { PromoModalConfig, PromoModalPathScope } from '@/lib/cms/types';
import {
  adminPasswordConfigured,
  adminPasswordMatches,
  clearAdminSessionCookie,
  createAdminSessionToken,
  getAdminSession,
  setAdminSessionCookie,
} from '@/lib/cms/session';

async function requireCmsSession() {
  if (!(await getAdminSession())) redirect('/admin/login');
}

export type LoginState = { error?: string };

export async function adminLogin(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '');
  if (!adminPasswordConfigured()) {
    return { error: 'CMS_ADMIN_PASSWORD is not set. Add it to .env and restart the dev server.' };
  }
  if (!process.env.CMS_SESSION_SECRET || process.env.CMS_SESSION_SECRET.length < 24) {
    return { error: 'CMS_SESSION_SECRET must be set (at least 24 characters).' };
  }
  if (!adminPasswordMatches(password)) {
    return { error: 'Invalid password.' };
  }
  const token = await createAdminSessionToken();
  if (!token) {
    return { error: 'Could not create session (check CMS_SESSION_SECRET).' };
  }
  await setAdminSessionCookie(token);
  redirect('/admin');
}

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect('/admin/login');
}

export type SaveState = { ok?: boolean; error?: string };

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export async function savePromoModal(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const row = await prisma.siteChrome.findUnique({ where: { id: 'default' } });
  const base = parseChromeConfig(row?.configJson ?? '{}');

  const pathRaw = String(formData.get('promoPathScope') ?? 'home');
  const pathScope: PromoModalPathScope = pathRaw === 'any' ? 'any' : 'home';

  const promoModal: PromoModalConfig = {
    enabled: formData.get('promoEnabled') === 'on',
    title: String(formData.get('promoTitle') ?? '').trim(),
    body: String(formData.get('promoBody') ?? ''),
    coupons: parseCouponsMultiline(String(formData.get('promoCouponsRaw') ?? '')),
    primaryCtaLabel: String(formData.get('promoPrimaryCtaLabel') ?? '').trim(),
    primaryCtaHref: String(formData.get('promoPrimaryCtaHref') ?? '').trim(),
    dismissLabel: String(formData.get('promoDismissLabel') ?? '').trim(),
    rules: {
      minLifetimeVisits: clampInt(parseInt(String(formData.get('promoMinLifetimeVisits') ?? '0'), 10), 0, 9999),
      minScrollY: clampInt(parseInt(String(formData.get('promoMinScrollY') ?? '0'), 10), 0, 1_000_000),
      pathScope,
      dismissStorageKey: String(formData.get('promoDismissStorageKey') ?? '').trim(),
    },
  };

  const next = { ...base, promoModal };
  const checked = validateChromeJsonString(JSON.stringify(next));
  if (!checked.ok) return { error: checked.error };

  await prisma.siteChrome.upsert({
    where: { id: 'default' },
    create: { id: 'default', configJson: checked.normalized },
    update: { configJson: checked.normalized },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}

export async function saveSiteChrome(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const raw = String(formData.get('configJson') ?? '');
  const checked = validateChromeJsonString(raw);
  if (!checked.ok) return { error: checked.error };
  await prisma.siteChrome.upsert({
    where: { id: 'default' },
    create: { id: 'default', configJson: checked.normalized },
    update: { configJson: checked.normalized },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}

export async function saveSiteSettings(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const availabilityStatus = String(formData.get('availabilityStatus') ?? '');
  const navHideOnScroll = formData.get('navHideOnScroll') === 'on';
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', availabilityStatus, navHideOnScroll },
    update: { availabilityStatus, navHideOnScroll },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}

export async function saveSeoSettings(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const noIndex = formData.get('noIndex') === 'on';
  if (!title) return { error: 'Title is required.' };
  await prisma.seoSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', title, description, noIndex },
    update: { title, description, noIndex },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}

export async function saveHeroSceneCamera(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const raw = String(formData.get('configJson') ?? '');
  const checked = tryParseHeroSceneCameraFromEditor(raw);
  if (!checked.ok) return { error: checked.error };
  await prisma.heroSceneCamera.upsert({
    where: { id: 'default' },
    create: { id: 'default', configJson: heroSceneCameraToJson(checked.config) },
    update: { configJson: heroSceneCameraToJson(checked.config) },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}

export async function saveMarketingPage(_prev: SaveState | undefined, formData: FormData): Promise<SaveState> {
  await requireCmsSession();
  const raw = String(formData.get('contentJson') ?? '');
  const parsed = tryParseMarketingPageFromEditor(raw);
  if (!parsed.ok) return { error: parsed.error };
  await prisma.marketingPage.upsert({
    where: { id: 'home' },
    create: { id: 'home', contentJson: marketingPageToJson(parsed.content) },
    update: { contentJson: marketingPageToJson(parsed.content) },
  });
  revalidateAfterCmsWrite();
  return { ok: true };
}
