import type { CSSProperties } from 'react';

import type { FeaturesContent } from '@/lib/cms/marketing-content';
import { normalizeMultiline } from '@/lib/cms/marketing-content';

import { HeadlineFromSegments } from './headline-from-segments';

type Props = { features: FeaturesContent };

function filamentTagStyle(label: string): CSSProperties {
  if (label === 'TPU') {
    return {
      border: '1px solid rgba(229,52,42,0.35)',
      padding: '5px 11px',
      fontFamily: 'var(--font-space-mono), monospace',
      fontSize: 10,
      color: '#c42e26',
      borderRadius: 3,
    };
  }
  if (label === 'ASA') {
    return {
      border: '1px solid rgba(59,155,229,0.4)',
      padding: '5px 11px',
      fontFamily: 'var(--font-space-mono), monospace',
      fontSize: 10,
      color: '#2a7fc4',
      borderRadius: 3,
    };
  }
  if (label === '+more') {
    return {
      border: '1px solid var(--border)',
      padding: '5px 11px',
      fontFamily: 'var(--font-space-mono), monospace',
      fontSize: 10,
      color: 'var(--ink-faint)',
      borderRadius: 3,
    };
  }
  return {
    border: '1px solid var(--border)',
    padding: '5px 11px',
    fontFamily: 'var(--font-space-mono), monospace',
    fontSize: 10,
    color: 'var(--ink-soft)',
    borderRadius: 3,
    background: 'var(--page)',
  };
}

export function FeaturesSection({ features }: Props) {
  const f = features;
  return (
    <section id="features" style={{ padding: '110px 24px', background: 'var(--page-2)', position: 'relative', overflow: 'hidden' }}>
      <div className="features-section__logo-bg" aria-hidden />

      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          width: 1,
          height: 280,
          background: 'linear-gradient(to bottom,transparent,rgba(229,52,42,0.2),transparent)',
          transform: 'rotate(20deg)',
          transformOrigin: 'top',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: 0,
          width: 1,
          height: 280,
          background: 'linear-gradient(to bottom,transparent,rgba(0,0,0,0.18),transparent)',
          transform: 'rotate(-20deg)',
          transformOrigin: 'top',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div className="features-section__inner" style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: 28 }}>
          <p className="sec-label" style={{ marginBottom: 18 }}>
            {f.sectionLabel}
          </p>
          <HeadlineFromSegments
            segments={f.headlineSegments}
            className="display-headline font-display font-extrabold leading-none"
            style={{ color: 'var(--ink)' }}
          />
        </div>

        <div id="features-3d-reveal" className="features-3d-reveal w-full" aria-hidden>
          <div className="features-3d-reveal__host">
            <div
              id="canvas-container-scroll"
              className="hero-canvas-h features-3d-reveal__canvas features-3d-reveal__stage"
              style={{ position: 'relative' }}
            >
              <canvas id="mat-canvas-scroll" aria-hidden tabIndex={-1} />
              <div
                className="font-display font-medium"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 5,
                  fontSize: 8,
                  color: 'var(--ink-faint)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  pointerEvents: 'none',
                }}
              >
                mag·na·mat v1.0
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  opacity: 0.5,
                  pointerEvents: 'none',
                  color: 'var(--ink-soft)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                <span style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, letterSpacing: '0.1em' }}>
                  drag to orbit
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 js-features-cards-shift">
          <div className="f-card reveal">
            <div className="f-card-icon f-card-icon--pins" aria-hidden>
              <svg className="f-card-iso" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11 26 L28 37 L45 26 L28 15 Z"
                  fill="rgba(22,22,22,0.12)"
                  stroke="#1a1a1a"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 26 L28 37 L28 48 L11 37 Z"
                  fill="rgba(22,22,22,0.08)"
                  stroke="#1a1a1a"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
                <path
                  d="M45 26 L28 37 L28 48 L45 37 Z"
                  fill="rgba(22,22,22,0.05)"
                  stroke="#1a1a1a"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
                <g stroke="#1a1a1a" strokeWidth="1.65" strokeLinecap="round">
                  <line x1="19" y1="24" x2="19" y2="15" />
                  <line x1="25" y1="28" x2="25" y2="17" />
                  <line x1="31" y1="24" x2="31" y2="15" />
                  <line x1="22" y1="31" x2="22" y2="21" />
                  <line x1="28" y1="33" x2="28" y2="20" />
                  <line x1="34" y1="31" x2="34" y2="21" />
                </g>
              </svg>
            </div>
            <h3 className="font-display font-semibold" style={{ fontSize: '1.6rem', marginBottom: 12, color: 'var(--ink)' }}>
              {f.cardPins.title}
            </h3>
            <p style={{ color: 'var(--ink-muted)', lineHeight: 1.75, fontSize: 14, marginBottom: 22 }}>
              {normalizeMultiline(f.cardPins.body)}
            </p>
            <div className="pin-tex" style={{ height: 76, borderRadius: 4, opacity: 0.95 }} />
            <div
              style={{
                marginTop: 10,
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: 9,
                color: 'var(--ink-faint)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {f.cardPins.caption}
            </div>
          </div>

          <div className="f-card reveal" style={{ transitionDelay: '0.12s' }}>
            <div className="f-card-icon f-card-icon--flex" aria-hidden>
              <svg className="f-card-iso" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 32 L28 44 L47 32 L28 20 Z"
                  fill="rgba(22,22,22,0.05)"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 26 L30 38 L49 26 L30 14 Z"
                  fill="rgba(22,22,22,0.09)"
                  stroke="#1a1a1a"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 20 L32 32 L51 20 L32 8 Z"
                  fill="rgba(22,22,22,0.14)"
                  stroke="#1a1a1a"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold" style={{ fontSize: '1.6rem', marginBottom: 12, color: 'var(--ink)' }}>
              {f.cardFlex.title}
            </h3>
            <p style={{ color: 'var(--ink-muted)', lineHeight: 1.75, fontSize: 14, marginBottom: 22 }}>
              {normalizeMultiline(f.cardFlex.body)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{ flex: 1, height: 3, background: 'linear-gradient(90deg,var(--red),var(--blue))', borderRadius: 2 }}
              />
              <span style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, color: 'var(--ink-faint)' }}>
                {f.cardFlex.flexMeter}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'rgba(229,52,42,0.06)',
                  border: '1px solid rgba(229,52,42,0.15)',
                  textAlign: 'center',
                  borderRadius: 4,
                }}
              >
                <div className="font-display font-semibold" style={{ fontSize: 18, color: 'var(--ink)' }}>
                  {f.cardFlex.holdTitle}
                </div>
                <div style={{ fontSize: 9, color: 'var(--ink-soft)', fontFamily: 'var(--font-space-mono), monospace', marginTop: 3 }}>
                  {f.cardFlex.holdSub}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  borderRadius: 4,
                }}
              >
                <div className="font-display font-semibold" style={{ fontSize: 18, color: 'var(--blue)' }}>
                  {f.cardFlex.popTitle}
                </div>
                <div style={{ fontSize: 9, color: 'var(--ink-soft)', fontFamily: 'var(--font-space-mono), monospace', marginTop: 3 }}>
                  {f.cardFlex.popSub}
                </div>
              </div>
            </div>
          </div>

          <div className="f-card reveal" style={{ transitionDelay: '0.24s' }}>
            <div className="f-card-icon f-card-icon--material" aria-hidden>
              <svg className="f-card-iso" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 26 L28 36 L44 26 L28 16 Z"
                  fill="rgba(22,22,22,0.07)"
                  stroke="#1a1a1a"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 26 L28 36 L28 46 L12 36 Z"
                  fill="rgba(22,22,22,0.11)"
                  stroke="#1a1a1a"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
                <path
                  d="M44 26 L28 36 L28 46 L44 36 Z"
                  fill="rgba(22,22,22,0.05)"
                  stroke="#1a1a1a"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
                <path d="M32 28 L34 32 L40 24" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display font-semibold" style={{ fontSize: '1.6rem', marginBottom: 12, color: 'var(--ink)' }}>
              {f.cardMaterials.title}
            </h3>
            <p style={{ color: 'var(--ink-muted)', lineHeight: 1.75, fontSize: 14, marginBottom: 22 }}>
              {normalizeMultiline(f.cardMaterials.body)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {f.cardMaterials.filamentTags.map((t) => (
                <span key={t} style={filamentTagStyle(t)}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
