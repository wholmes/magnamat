'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import type { SaveState } from '@/app/admin/actions';
import { savePromoModal } from '@/app/admin/actions';
import { couponsToMultiline } from '@/lib/cms/promo-modal-coupons';
import type { PromoModalConfig } from '@/lib/cms/types';

type Props = { initial: PromoModalConfig };

export function PromoModalRulesDialog({ initial }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(savePromoModal, undefined as SaveState | undefined);

  useEffect(() => {
    if (state?.ok) {
      dialogRef.current?.close();
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid #d4d4d8',
          background: '#fafafa',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Configure promo modal…
      </button>

      <dialog
        ref={dialogRef}
        className="admin-promo-dialog"
        aria-labelledby="admin-promo-dialog-title"
        style={{ border: 'none', borderRadius: 12, padding: 0, maxWidth: 520, width: 'calc(100vw - 32px)' }}
      >
        <form
          action={action}
          style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          key={`${initial.rules.dismissStorageKey}-${initial.enabled}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <h2 id="admin-promo-dialog-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Promo modal (visibility rules)
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 20,
                lineHeight: 1,
                cursor: 'pointer',
                padding: 4,
                color: '#71717a',
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.55 }}>
            Controls the optional marketing <code style={{ fontSize: 12 }}>&lt;dialog&gt;</code>. Sessions are counted
            once per browser tab session; scroll uses <code style={{ fontSize: 12 }}>window.scrollY</code>. Change{' '}
            <strong>Dismiss key</strong> to show again to visitors who already dismissed.
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" name="promoEnabled" defaultChecked={initial.enabled} />
            Enabled
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Title
            <input
              name="promoTitle"
              type="text"
              required
              defaultValue={initial.title}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Body (plain text, newlines → paragraphs)
            <textarea
              name="promoBody"
              required
              rows={4}
              defaultValue={initial.body}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d4d4d8',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Coupon codes (optional — one per line: <code style={{ fontSize: 12 }}>Label | CODE</code>)
            <textarea
              name="promoCouponsRaw"
              rows={3}
              defaultValue={couponsToMultiline(initial.coupons)}
              placeholder={'Launch week | MAGNA20\nVIP list | MAGNA-VIP'}
              spellCheck={false}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d4d4d8',
                fontSize: 13,
                fontFamily: 'ui-monospace, Menlo, monospace',
                resize: 'vertical',
              }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
              Primary CTA label
              <input
                name="promoPrimaryCtaLabel"
                type="text"
                defaultValue={initial.primaryCtaLabel}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
              Primary CTA href
              <input
                name="promoPrimaryCtaHref"
                type="text"
                defaultValue={initial.primaryCtaHref}
                placeholder="/"
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Dismiss label
            <input
              name="promoDismissLabel"
              type="text"
              defaultValue={initial.dismissLabel}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
            />
          </label>

          <fieldset style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 14, margin: 0 }}>
            <legend style={{ fontSize: 12, fontWeight: 700, padding: '0 6px' }}>Visibility rules</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Minimum session count (0 = first session OK)
                <input
                  name="promoMinLifetimeVisits"
                  type="number"
                  min={0}
                  max={9999}
                  required
                  defaultValue={initial.rules.minLifetimeVisits}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Minimum scroll Y (px, 0 = no scroll gate)
                <input
                  name="promoMinScrollY"
                  type="number"
                  min={0}
                  max={1000000}
                  required
                  defaultValue={initial.rules.minScrollY}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Page scope
                <select
                  name="promoPathScope"
                  defaultValue={initial.rules.pathScope}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
                >
                  <option value="home">Home path only (pathname is /)</option>
                  <option value="any">Any path (marketing site)</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Dismiss storage key (alphanumeric, dots, underscores, hyphens)
                <input
                  name="promoDismissStorageKey"
                  type="text"
                  required
                  pattern="[\w.-]+"
                  defaultValue={initial.rules.dismissStorageKey}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
                />
              </label>
            </div>
          </fieldset>

          {state?.error ? (
            <p role="alert" style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p style={{ color: '#15803d', fontSize: 13, margin: 0 }}>Saved. Marketing pages will pick this up shortly.</p>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#18181b',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: pending ? 'wait' : 'pointer',
              }}
            >
              {pending ? 'Saving…' : 'Save promo modal'}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #d4d4d8',
                background: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
