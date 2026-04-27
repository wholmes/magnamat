import type { SpecsContent } from '@/lib/cms/marketing-content';
import { toneToCssColor } from '@/lib/cms/marketing-content';

import { HeadlineFromSegments } from './headline-from-segments';

type Props = { specs: SpecsContent };

export function SpecsSection({ specs: s }: Props) {
  return (
    <section id="specs" style={{ padding: '110px 24px', background: 'var(--page)' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="reveal">
            <p className="sec-label" style={{ marginBottom: 18 }}>
              {s.sectionLabel}
            </p>
            <HeadlineFromSegments
              segments={s.headlineSegments}
              className="display-headline font-display font-extrabold leading-none"
              style={{ marginBottom: 36, color: 'var(--ink)' }}
            />

            <div
              className="pin-tex"
              style={{
                height: 210,
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg,rgba(229,52,42,0.1) 0%,transparent 50%,rgba(0,0,0,0.1) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.22),transparent)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'linear-gradient(90deg,transparent,rgba(229,52,42,0.35),transparent)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {s.pinDecorCaption}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: 'var(--border)',
                marginTop: 1,
                border: '1px solid var(--border)',
                borderRadius: '0 0 6px 6px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 20, background: 'var(--card)', textAlign: 'center' }}>
                <div className="stat-num" style={{ fontSize: '2.2rem', color: 'var(--red)' }}>
                  {s.statLeft.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'var(--ink-faint)',
                    letterSpacing: '0.1em',
                    marginTop: 5,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.statLeft.label}
                </div>
              </div>
              <div style={{ padding: 20, background: 'var(--card)', textAlign: 'center' }}>
                <div className="stat-num" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>
                  {s.statRight.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-space-mono), monospace',
                    color: 'var(--ink-faint)',
                    letterSpacing: '0.1em',
                    marginTop: 5,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.statRight.label}
                </div>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.15s' }}>
            <div
              style={{
                border: '1px solid var(--border)',
                padding: '0 28px',
                background: 'var(--card)',
                borderRadius: 8,
                boxShadow: '0 4px 24px rgba(22,22,22,0.05)',
              }}
            >
              {s.rows.map((row) => (
                <div key={row.key} className="spec-row">
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono), monospace',
                      fontSize: 10,
                      color: 'var(--ink-soft)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {row.key}
                  </span>
                  <span
                    className="font-display font-semibold"
                    style={{
                      fontSize: row.key === 'Materials' ? 13 : 16,
                      color: toneToCssColor(row.color),
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
