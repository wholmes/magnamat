'use client';

import { useEffect } from 'react';

import { bootMarketingMatRuntime } from '@/lib/mat-scene';

/**
 * Loads legacy side-effect modules (nav paths, cart, YouTube) and boots Three.js after paint.
 * Matches premium-dark-ui guidance: dynamic WebGL boundary, CMS-driven shell in layout.
 */
export function ClientRuntime() {
  useEffect(() => {
    void import('@/lib/nav-spy');
    void import('@/lib/yt-lightbox');
    void import('@/lib/cart');
    bootMarketingMatRuntime();
  }, []);
  return null;
}
