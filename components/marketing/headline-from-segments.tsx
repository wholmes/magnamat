import { createElement } from 'react';

import type { TextSegment } from '@/lib/cms/marketing-content';
import { toneToCssColor } from '@/lib/cms/marketing-content';

type Props = {
  segments: TextSegment[];
  className?: string;
  style?: React.CSSProperties;
  /** Default `h2`; use `h1` for hero title. */
  as?: 'h1' | 'h2';
};

/** Multi-line display headline: one segment per line, each with its tone color. */
export function HeadlineFromSegments({ segments, className, style, as = 'h2' }: Props) {
  return createElement(
    as,
    { className, style },
    segments.map((seg, i) => (
      <span key={i}>
        {i > 0 ? <br /> : null}
        <span style={{ color: toneToCssColor(seg.tone) }}>{seg.text}</span>
      </span>
    ))
  );
}
