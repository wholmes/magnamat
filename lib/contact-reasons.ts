/** Allowed `reason` values for `/contact` — keep in sync with server validation. */
export const CONTACT_REASON_OPTIONS = [
  { value: 'pre_order', label: 'Pre-order & availability' },
  { value: 'product_support', label: 'Product or technical support' },
  { value: 'compatibility', label: 'Compatibility with my Eufy Maker' },
  { value: 'press_affiliate', label: 'Press, media, or influencer inquiry' },
  { value: 'wholesale_retail', label: 'Wholesale or retail partnership' },
  { value: 'other', label: 'Something else' },
] as const;

export type ContactReasonValue = (typeof CONTACT_REASON_OPTIONS)[number]['value'];

const ALLOWED = new Set<string>(CONTACT_REASON_OPTIONS.map((o) => o.value));

export function isContactReasonValue(v: string): v is ContactReasonValue {
  return ALLOWED.has(v);
}

export function contactReasonLabel(value: string): string | undefined {
  return CONTACT_REASON_OPTIONS.find((o) => o.value === value)?.label;
}
