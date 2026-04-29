'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TextSegment } from '@/lib/cms/marketing-content';
import { toneToCssColor } from '@/lib/cms/marketing-content';

type Props = {
  segments: TextSegment[];
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Hero h1 with line-by-line mask animation. Replays when the title re-enters the viewport after
 * the user has scrolled down and back up (headline was fully out of view).
 */
export function HeroHeadlineReplay({ segments, className, style }: Props) {
  const hRef = useRef<HTMLHeadingElement>(null);
  const armedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const [replayId, setReplayId] = useState(0);

  const checkScroll = useCallback(() => {
    const el = hRef.current;
    if (!el) return;
    const y = window.scrollY;
    const rect = el.getBoundingClientRect();
    const margin = 24;
    const outOfView = rect.bottom < -margin || rect.top > window.innerHeight + margin;
    const inView = rect.top < window.innerHeight - margin && rect.bottom > margin;

    if (outOfView && y > 64) {
      armedRef.current = true;
    }
    if (armedRef.current && inView) {
      armedRef.current = false;
      if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      setReplayId((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        checkScroll();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    checkScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [checkScroll]);

  return (
    <h1 ref={hRef} className={[className, 'headline-mask'].filter(Boolean).join(' ')} style={style}>
      {segments.map((seg, i) => (
        <span key={`${replayId}-${i}`} className="headline-mask-line">
          <span
            className="headline-mask-line__inner"
            style={{
              color: toneToCssColor(seg.tone),
              animationDelay: `${0.06 + i * 0.11}s`,
            }}
          >
            {seg.text}
          </span>
        </span>
      ))}
    </h1>
  );
}
