import Link from 'next/link';

import type { HeroContent } from '@/lib/cms/marketing-content';
import { normalizeMultiline } from '@/lib/cms/marketing-content';

import { HeadlineFromSegments } from './headline-from-segments';

type Props = { hero: HeroContent };

export function HeroSection({ hero }: Props) {
  return (
    <section className="bg-grid hero-above-fold">
      <div className="hero-above-fold__main hero-main-inner">
        <div className="hero-above-fold__reveal">
          <div className="hero-layout-grid">
            <div className="hero-stack-copy">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18,
                  padding: '8px 16px',
                  border: '1px solid rgba(22,22,22,0.1)',
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 4,
                  boxShadow: '0 2px 20px rgba(59,155,229,0.08)',
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-soft)',
                  }}
                >
                  {hero.eyebrow}
                </span>
              </div>

              <HeadlineFromSegments
                as="h1"
                segments={hero.titleSegments}
                className="hero-title font-display font-extrabold leading-none"
                style={{ marginBottom: 20, color: 'var(--ink)' }}
              />

              <p
                style={{
                  color: 'var(--ink-muted)',
                  fontSize: 'clamp(15px,3.8vw,17px)',
                  lineHeight: 1.65,
                  maxWidth: 460,
                  marginBottom: 24,
                }}
              >
                {hero.bodyBeforeBrand}
                <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{hero.bodyBrand}</strong>{' '}
                {normalizeMultiline(hero.bodyAfterBrand)}
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                <button
                  type="button"
                  className="btn btn-primary js-add-to-cart"
                  data-product-id="magnamat-v1"
                  style={{ fontSize: 15, padding: '15px 36px' }}
                  aria-label="Add mag·na·mat v1.0 to cart"
                >
                  {hero.ctaPrimary}
                </button>
                <Link href="/specs" className="btn btn-outline" style={{ fontSize: 15, padding: '15px 36px' }}>
                  {hero.ctaSecondary}
                </Link>
              </div>

              <div
                className="flex"
                style={{
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  borderRadius: 4,
                  background: 'var(--card)',
                }}
              >
                {hero.stats.map((stat, idx) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: '12px 10px',
                      borderRight: idx < hero.stats.length - 1 ? '1px solid var(--border)' : undefined,
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      className="stat-num"
                      style={{
                        fontSize: 'clamp(18px,4.5vw,24px)',
                        color: idx === 2 ? 'var(--blue)' : 'var(--ink)',
                      }}
                    >
                      {stat.value}
                      {stat.suffix ? (
                        <span
                          style={{
                            color: idx === 0 ? 'var(--red)' : 'var(--ink-soft)',
                            fontSize: idx === 1 ? 13 : 16,
                          }}
                        >
                          {stat.suffix}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-faint)',
                        marginTop: 5,
                        fontFamily: 'var(--font-space-mono), monospace',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-product-col">
              <div id="canvas-container" className="hero-canvas-h hero-product-stage" style={{ position: 'relative' }}>
                <div className="hero-product-photo" aria-hidden />
                <canvas
                  id="mat-canvas"
                  role="img"
                  tabIndex={0}
                  aria-label={hero.canvasAriaLabel}
                />
                <div
                  className="font-display font-medium"
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    fontSize: 9,
                    color: 'var(--ink-faint)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                  }}
                >
                  {hero.canvasVersionLabel}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: 0.55,
                    pointerEvents: 'none',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, letterSpacing: '0.1em' }}>
                    {hero.canvasDragHint}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-marquee" aria-hidden>
        <div className="marquee-track" style={{ display: 'inline-block' }}>
          <span
            style={{
              fontFamily: 'var(--font-barlow-condensed), sans-serif',
              fontWeight: 650,
              fontSize: 13,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
            }}
            dangerouslySetInnerHTML={{ __html: hero.marquee }}
          />
        </div>
      </div>
    </section>
  );
}
