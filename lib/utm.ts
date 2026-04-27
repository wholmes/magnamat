/**
 * Append UTM query params for **on-site** tracking (ads use platform link builders).
 * `utm_source` = site/brand; `utm_medium` = placement (nav, footer, hero_cta, …).
 */
export type UtmParams = Partial<{
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}>;

/**
 * @param baseOrigin — Used only to parse relative `href` (e.g. `process.env.NEXT_PUBLIC_SITE_URL` or `http://localhost:3000`).
 */
export function appendUtmToUrl(href: string, params: UtmParams, baseOrigin = 'http://localhost:3000'): string {
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }
  try {
    const u = new URL(href, baseOrigin);
    for (const [k, v] of Object.entries(params)) {
      if (v != null && String(v).length > 0 && !u.searchParams.has(k)) {
        u.searchParams.set(k, String(v));
      }
    }
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return u.toString();
    }
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return href;
  }
}
