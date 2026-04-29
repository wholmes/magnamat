import type { CompatContent } from '@/lib/cms/marketing-content';
import { normalizeMultiline } from '@/lib/cms/marketing-content';

import { HeadlineFromSegments } from './headline-from-segments';

type Props = { compat: CompatContent };

/** Rings + slab — rendered inside `FeaturesSpecsSection` under `#compat`. */
export function CompatSectionContent({ compat: c }: Props) {
  return (
    <>
      <div className="compat-rings" aria-hidden>
        <div className="ring" style={{ width: 700, height: 700, borderWidth: 1, borderColor: 'rgba(0,0,0,0.055)' }} />
        <div className="ring" style={{ width: 530, height: 530, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)' }} />
        <div className="ring" style={{ width: 370, height: 370, borderWidth: 1, borderColor: 'rgba(229,52,42,0.08)' }} />
        <div className="ring" style={{ width: 220, height: 220, borderWidth: 1, borderColor: 'rgba(229,52,42,0.095)' }} />
        <div className="ring" style={{ width: 100, height: 100, borderWidth: 1, borderColor: 'rgba(229,52,42,0.11)' }} />
        <div className="compat-rings__burst" />
      </div>

      <div className="compat-slab bg-grid">
        <div className="compat-slab__inner">
          <div className="reveal">
            <p className="sec-label" style={{ marginBottom: 22 }}>
              {c.sectionLabel}
            </p>
            <HeadlineFromSegments
              segments={c.headlineSegments}
              className="font-display font-extrabold leading-none"
              style={{ fontSize: 'clamp(2.8rem,6vw,5.5rem)', marginBottom: 28, color: 'var(--ink)' }}
            />
            <p
              style={{
                color: 'var(--ink-muted)',
                fontSize: 16,
                lineHeight: 1.75,
                maxWidth: 'min(36em, 520px)',
                margin: '0 auto 32px',
              }}
            >
              {normalizeMultiline(c.body)}
            </p>
          </div>

          <div
            className="reveal compat-slab__badges"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              transitionDelay: '0.15s',
            }}
          >
            {c.badges.map((b, i) => (
              <div key={`${b.label}-${i}`} className="compat-badge">
                {b.status === 'check' ? (
                  <span style={{ color: 'var(--blue)', fontSize: 18, fontWeight: 700 }}>✓</span>
                ) : (
                  <span style={{ color: 'var(--ink-faint)', fontSize: 18 }}>○</span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: 12,
                    color: b.status === 'check' ? 'var(--ink-muted)' : 'var(--ink-faint)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          <div className="reveal compat-slab__cta" style={{ transitionDelay: '0.3s' }}>
            <button
              type="button"
              className="btn btn-primary js-add-to-cart"
              data-product-id="magnamat-v1"
              style={{ fontSize: 17, padding: '18px 52px' }}
              aria-label={c.ctaAriaLabel}
            >
              {c.ctaText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
