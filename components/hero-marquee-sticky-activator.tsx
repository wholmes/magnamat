'use client';

import { useLayoutEffect } from 'react';

import { initHeroMarqueeSticky } from '@/lib/hero-marquee-sticky';

/** Mount next to the hero ticker so init runs after this subtree is in the DOM (layout sibling of `ClientRuntime`). */
export function HeroMarqueeStickyActivator() {
  useLayoutEffect(() => {
    return initHeroMarqueeSticky();
  }, []);
  return null;
}
