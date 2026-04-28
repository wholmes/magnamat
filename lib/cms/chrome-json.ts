import { DEFAULT_CHROME, DEFAULT_COMMERCE, DEFAULT_FEATURES_PRINT_PRESETS, DEFAULT_PROMO_MODAL } from './defaults';
import { sanitizeCouponArray } from './promo-modal-coupons';
import type {
  CommerceConfig,
  CommerceProduct,
  FeaturesPrintPreset,
  PromoModalConfig,
  SiteChromeConfig,
} from './types';

function mergeCommerce(raw: unknown): CommerceConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_COMMERCE;
  const c = raw as Record<string, unknown>;
  const checkoutUrl = typeof c.checkoutUrl === 'string' ? c.checkoutUrl : DEFAULT_COMMERCE.checkoutUrl;
  const productsRaw = c.products;
  if (!Array.isArray(productsRaw) || productsRaw.length === 0) return { ...DEFAULT_COMMERCE, checkoutUrl };
  const products: CommerceProduct[] = [];
  for (const item of productsRaw) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    const id = typeof p.id === 'string' ? p.id.trim() : '';
    const name = typeof p.name === 'string' ? p.name.trim() : '';
    if (!id || !name) continue;
    const maxPerOrder =
      typeof p.maxPerOrder === 'number' && Number.isFinite(p.maxPerOrder) && p.maxPerOrder >= 1
        ? Math.min(9999, Math.floor(p.maxPerOrder))
        : 99;
    let priceCents: number | null = null;
    if (p.priceCents === null) priceCents = null;
    else if (typeof p.priceCents === 'number' && Number.isFinite(p.priceCents) && p.priceCents >= 0) {
      priceCents = Math.floor(p.priceCents);
    }
    const subtitle = typeof p.subtitle === 'string' && p.subtitle.trim() ? p.subtitle.trim() : undefined;
    products.push({ id, name, subtitle, priceCents, maxPerOrder });
  }
  if (products.length === 0) return { ...DEFAULT_COMMERCE, checkoutUrl };
  return { checkoutUrl, products };
}

function isValidFeatureTextureUrl(s: string): boolean {
  const t = s.trim();
  if (!t || t.length > 512) return false;
  if (t.startsWith('/')) return true;
  try {
    const u = new URL(t);
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.length > 0;
  } catch {
    return false;
  }
}

function mergeFeaturesPrintPresets(raw: unknown): FeaturesPrintPreset[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_FEATURES_PRINT_PRESETS];
  const out: FeaturesPrintPreset[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    const id = typeof p.id === 'string' ? p.id.trim().slice(0, 64) : '';
    const label = typeof p.label === 'string' ? p.label.trim().slice(0, 80) : '';
    const topTextureUrl = typeof p.topTextureUrl === 'string' ? p.topTextureUrl.trim() : '';
    if (!id || !label || !isValidFeatureTextureUrl(topTextureUrl)) continue;
    const caption =
      typeof p.caption === 'string' && p.caption.trim() ? p.caption.trim().slice(0, 220) : undefined;
    out.push({ id, label, caption, topTextureUrl });
  }
  return out.length > 0 ? out : [...DEFAULT_FEATURES_PRINT_PRESETS];
}

function mergePromoModal(raw: unknown): PromoModalConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_PROMO_MODAL;
  const p = raw as Record<string, unknown>;
  const rulesRaw = p.rules && typeof p.rules === 'object' ? (p.rules as Record<string, unknown>) : {};
  const pathScope =
    rulesRaw.pathScope === 'home' || rulesRaw.pathScope === 'any' ? rulesRaw.pathScope : DEFAULT_PROMO_MODAL.rules.pathScope;
  let minLifetimeVisits =
    typeof rulesRaw.minLifetimeVisits === 'number' && Number.isFinite(rulesRaw.minLifetimeVisits)
      ? Math.min(9999, Math.max(0, Math.floor(rulesRaw.minLifetimeVisits)))
      : DEFAULT_PROMO_MODAL.rules.minLifetimeVisits;
  let minScrollY =
    typeof rulesRaw.minScrollY === 'number' && Number.isFinite(rulesRaw.minScrollY)
      ? Math.min(1_000_000, Math.max(0, Math.floor(rulesRaw.minScrollY)))
      : DEFAULT_PROMO_MODAL.rules.minScrollY;
  let dismissStorageKey =
    typeof rulesRaw.dismissStorageKey === 'string' && rulesRaw.dismissStorageKey.trim()
      ? rulesRaw.dismissStorageKey.trim().slice(0, 64)
      : DEFAULT_PROMO_MODAL.rules.dismissStorageKey;
  if (!/^[\w.-]+$/.test(dismissStorageKey)) dismissStorageKey = DEFAULT_PROMO_MODAL.rules.dismissStorageKey;

  return {
    enabled: Boolean(p.enabled),
    title: typeof p.title === 'string' ? p.title : DEFAULT_PROMO_MODAL.title,
    body: typeof p.body === 'string' ? p.body : DEFAULT_PROMO_MODAL.body,
    coupons: sanitizeCouponArray(p.coupons),
    primaryCtaLabel:
      typeof p.primaryCtaLabel === 'string' ? p.primaryCtaLabel : DEFAULT_PROMO_MODAL.primaryCtaLabel,
    primaryCtaHref:
      typeof p.primaryCtaHref === 'string' ? p.primaryCtaHref : DEFAULT_PROMO_MODAL.primaryCtaHref,
    dismissLabel: typeof p.dismissLabel === 'string' ? p.dismissLabel : DEFAULT_PROMO_MODAL.dismissLabel,
    rules: {
      minLifetimeVisits,
      minScrollY,
      pathScope,
      dismissStorageKey,
    },
  };
}

export function parseChromeConfig(json: string): SiteChromeConfig {
  try {
    const v = JSON.parse(json) as Partial<SiteChromeConfig>;
    if (v && Array.isArray(v.navLinks)) {
      return {
        navLinks: v.navLinks as SiteChromeConfig['navLinks'],
        youtubeVideoId: typeof v.youtubeVideoId === 'string' ? v.youtubeVideoId : DEFAULT_CHROME.youtubeVideoId,
        commerce: mergeCommerce(v.commerce),
        promoModal: mergePromoModal(v.promoModal),
        featuresPrintPresets: mergeFeaturesPrintPresets(v.featuresPrintPresets),
      };
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_CHROME;
}

function isValidCommerce(c: unknown): c is CommerceConfig {
  if (!c || typeof c !== 'object') return false;
  const x = c as Record<string, unknown>;
  if (x.checkoutUrl !== undefined && typeof x.checkoutUrl !== 'string') return false;
  if (!Array.isArray(x.products) || x.products.length === 0) return false;
  for (const item of x.products) {
    if (!item || typeof item !== 'object') return false;
    const p = item as Record<string, unknown>;
    if (typeof p.id !== 'string' || !p.id.trim()) return false;
    if (typeof p.name !== 'string' || !p.name.trim()) return false;
    if (typeof p.maxPerOrder !== 'number' || !Number.isFinite(p.maxPerOrder) || p.maxPerOrder < 1) return false;
    if (p.subtitle !== undefined && typeof p.subtitle !== 'string') return false;
    if (p.priceCents !== undefined && p.priceCents !== null && (typeof p.priceCents !== 'number' || p.priceCents < 0)) {
      return false;
    }
  }
  return true;
}

function isValidPromoModal(p: unknown): p is PromoModalConfig {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  if (typeof x.enabled !== 'boolean') return false;
  if (typeof x.title !== 'string' || typeof x.body !== 'string') return false;
  if (typeof x.primaryCtaLabel !== 'string' || typeof x.primaryCtaHref !== 'string') return false;
  if (typeof x.dismissLabel !== 'string') return false;
  if (x.coupons !== undefined && !Array.isArray(x.coupons)) return false;
  const couponList = Array.isArray(x.coupons) ? x.coupons : [];
  for (const c of couponList) {
    if (!c || typeof c !== 'object') return false;
    const row = c as Record<string, unknown>;
    if (typeof row.label !== 'string' || typeof row.code !== 'string') return false;
    if (!row.label.trim() || !row.code.trim()) return false;
    if (row.label.length > 80 || row.code.length > 40) return false;
    if (!/^[A-Za-z0-9 _-]+$/.test(row.code.trim())) return false;
  }
  if (!x.rules || typeof x.rules !== 'object') return false;
  const r = x.rules as Record<string, unknown>;
  if (typeof r.minLifetimeVisits !== 'number' || !Number.isFinite(r.minLifetimeVisits) || r.minLifetimeVisits < 0) {
    return false;
  }
  if (typeof r.minScrollY !== 'number' || !Number.isFinite(r.minScrollY) || r.minScrollY < 0) return false;
  if (r.pathScope !== 'home' && r.pathScope !== 'any') return false;
  if (typeof r.dismissStorageKey !== 'string' || !r.dismissStorageKey.trim()) return false;
  if (!/^[\w.-]+$/.test(r.dismissStorageKey.trim())) return false;
  return true;
}

function isStrictChromeConfig(o: unknown): o is SiteChromeConfig {
  if (!o || typeof o !== 'object') return false;
  const x = o as Record<string, unknown>;
  if (!Array.isArray(x.navLinks) || x.navLinks.length === 0) return false;
  for (const item of x.navLinks) {
    if (!item || typeof item !== 'object') return false;
    const l = item as Record<string, unknown>;
    if (typeof l.label !== 'string' || typeof l.href !== 'string') return false;
    if (!l.label.trim() || !l.href.trim()) return false;
  }
  if (x.youtubeVideoId !== undefined && typeof x.youtubeVideoId !== 'string') return false;
  if (x.commerce !== undefined && !isValidCommerce(x.commerce)) return false;
  if (x.promoModal !== undefined && !isValidPromoModal(x.promoModal)) return false;
  if (x.featuresPrintPresets !== undefined) {
    if (!Array.isArray(x.featuresPrintPresets)) return false;
    if (x.featuresPrintPresets.length > 16) return false;
    for (const item of x.featuresPrintPresets) {
      if (!item || typeof item !== 'object') return false;
      const p = item as Record<string, unknown>;
      if (typeof p.id !== 'string' || !p.id.trim()) return false;
      if (typeof p.label !== 'string' || !p.label.trim()) return false;
      if (typeof p.topTextureUrl !== 'string' || !isValidFeatureTextureUrl(p.topTextureUrl)) return false;
      if (p.caption !== undefined && typeof p.caption !== 'string') return false;
    }
  }
  return true;
}

/** Validates user-supplied JSON for CMS saves (strict shape). */
export function validateChromeJsonString(raw: string): { ok: true; normalized: string } | { ok: false; error: string } {
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax.' };
  }
  if (!isStrictChromeConfig(o)) {
    return {
      ok: false,
      error:
        'Expected { "navLinks": [...], "youtubeVideoId": "…", "commerce": { ... }, "promoModal"?: { ... }, "featuresPrintPresets"?: [ { "id", "label", "topTextureUrl" (path or https URL), "caption"? } ] }.',
    };
  }
  const normalized: SiteChromeConfig = {
    navLinks: o.navLinks,
    youtubeVideoId: o.youtubeVideoId ?? DEFAULT_CHROME.youtubeVideoId,
    commerce: o.commerce != null && isValidCommerce(o.commerce) ? o.commerce : DEFAULT_COMMERCE,
    promoModal: mergePromoModal(o.promoModal),
    featuresPrintPresets: mergeFeaturesPrintPresets(o.featuresPrintPresets),
  };
  return { ok: true, normalized: JSON.stringify(normalized, null, 2) };
}
