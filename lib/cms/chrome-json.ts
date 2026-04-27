import { DEFAULT_CHROME, DEFAULT_COMMERCE } from './defaults';
import type { CommerceConfig, CommerceProduct, SiteChromeConfig } from './types';

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

export function parseChromeConfig(json: string): SiteChromeConfig {
  try {
    const v = JSON.parse(json) as Partial<SiteChromeConfig>;
    if (v && Array.isArray(v.navLinks)) {
      return {
        navLinks: v.navLinks as SiteChromeConfig['navLinks'],
        youtubeVideoId: typeof v.youtubeVideoId === 'string' ? v.youtubeVideoId : DEFAULT_CHROME.youtubeVideoId,
        commerce: mergeCommerce(v.commerce),
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
        'Expected { "navLinks": [...], "youtubeVideoId": "…", "commerce": { "checkoutUrl": "…", "products": [{ "id", "name", "subtitle?", "priceCents"|null, "maxPerOrder" }] } }.',
    };
  }
  const normalized: SiteChromeConfig = {
    navLinks: o.navLinks,
    youtubeVideoId: o.youtubeVideoId ?? DEFAULT_CHROME.youtubeVideoId,
    commerce: o.commerce != null && isValidCommerce(o.commerce) ? (o.commerce as CommerceConfig) : DEFAULT_COMMERCE,
  };
  return { ok: true, normalized: JSON.stringify(normalized, null, 2) };
}
