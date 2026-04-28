import type { PromoCoupon } from './types';

const MAX_COUPONS = 6;
const MAX_LABEL = 80;
const MAX_CODE = 40;

/** Allowed characters in coupon codes (display + clipboard only). */
function isSafeCouponCode(code: string) {
  return /^[A-Za-z0-9 _-]+$/.test(code);
}

/** Parse admin textarea: one coupon per line as `Label | CODE`. */
export function parseCouponsMultiline(raw: string): PromoCoupon[] {
  const out: PromoCoupon[] = [];
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const pipe = trimmed.indexOf('|');
    if (pipe < 0) continue;
    const label = trimmed.slice(0, pipe).trim();
    const code = trimmed.slice(pipe + 1).trim();
    if (!label || !code) continue;
    if (label.length > MAX_LABEL || code.length > MAX_CODE) continue;
    if (!isSafeCouponCode(code)) continue;
    out.push({ label: label.slice(0, MAX_LABEL), code: code.slice(0, MAX_CODE) });
    if (out.length >= MAX_COUPONS) break;
  }
  return out;
}

export function couponsToMultiline(coupons: PromoCoupon[]): string {
  if (!coupons.length) return '';
  return coupons.map((c) => `${c.label} | ${c.code}`).join('\n');
}

/** Merge `promoModal.coupons` from stored JSON. */
export function sanitizeCouponArray(raw: unknown): PromoCoupon[] {
  if (!Array.isArray(raw)) return [];
  const out: PromoCoupon[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const label = typeof o.label === 'string' ? o.label.trim() : '';
    const code = typeof o.code === 'string' ? o.code.trim() : '';
    if (!label || !code) continue;
    if (label.length > MAX_LABEL || code.length > MAX_CODE) continue;
    if (!isSafeCouponCode(code)) continue;
    out.push({ label: label.slice(0, MAX_LABEL), code: code.slice(0, MAX_CODE) });
    if (out.length >= MAX_COUPONS) break;
  }
  return out;
}
