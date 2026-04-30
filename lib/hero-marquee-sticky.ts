/**
 * Desktop-only pin for the hero ticker when `hero.marqueeStickyDesktop` is on.
 * Once pinned under the nav, the strip stays fixed while you keep scrolling down. It only returns
 * to in-flow when you have scrolled back up by `UNPIN_SCROLL_PX` from the deepest scroll **and**
 * the hero spacer has moved back to the nav band so the ticker does not jump off-screen.
 * Fast scroll: we also pin if the marquee crosses the nav line between rAF frames (prev vs current `top`).
 */
const MQ = '(min-width: 1024px)';
/** Pixels scrolled back up from the max scroll-after-pin before we *may* return to in-flow marquee */
const UNPIN_SCROLL_PX = 96;
/**
 * When unpinning, the spacer host must sit far enough into the viewport that the ticker is not
 * left above the fold (otherwise `position: fixed` → in-flow looks like it “vanished”).
 */
const UNPIN_HOST_BOTTOM_MIN = 4;
/** If the first bind misses DOM (hydration / streaming), retry for ~2s of frames instead of giving up */
const MAX_WIRE_ATTEMPTS = 120;

export function initHeroMarqueeSticky(): () => void {
  if (typeof window === 'undefined') return () => {};

  const mq = window.matchMedia(MQ);
  let onScroll: (() => void) | null = null;
  let onMq: (() => void) | null = null;
  let ro: ResizeObserver | null = null;
  let raf = 0;
  let vv: VisualViewport | null = null;
  let onLoadKick: (() => void) | null = null;
  let onPageshow: ((e: PageTransitionEvent) => void) | null = null;
  let wireRetryRaf = 0;
  let wireAttempts = 0;

  const clearWireRetry = () => {
    if (wireRetryRaf) {
      cancelAnimationFrame(wireRetryRaf);
      wireRetryRaf = 0;
    }
    wireAttempts = 0;
  };

  const teardownListeners = () => {
    if (onLoadKick) {
      window.removeEventListener('load', onLoadKick);
      onLoadKick = null;
    }
    if (onPageshow) {
      window.removeEventListener('pageshow', onPageshow);
      onPageshow = null;
    }
    if (onScroll) {
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      vv?.removeEventListener('scroll', onScroll);
      vv?.removeEventListener('resize', onScroll);
      onScroll = null;
    }
    if (onMq) {
      mq.removeEventListener('change', onMq);
      onMq = null;
    }
    if (ro) {
      ro.disconnect();
      ro = null;
    }
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    vv = null;
  };

  /** Returns true when scroll/RO listeners are attached; false if DOM was not ready yet */
  const wireBindings = (): boolean => {
    teardownListeners();

    const hero = document.querySelector('.hero-above-fold--marquee-sticky-desktop');
    const marquee = hero?.querySelector('.hero-marquee.hero-marquee--sticky-desktop') as HTMLElement | null;
    const host =
      marquee?.parentElement?.classList.contains('hero-marquee-sticky-host') === true
        ? (marquee.parentElement as HTMLElement)
        : null;
    const nav = document.querySelector('.site-nav');

    if (!hero || !host || !marquee || !nav) {
      marquee?.classList.remove('is-fixed-under-nav');
      if (host) host.style.height = '';
      return false;
    }

    let pinned = false;
    /** Greatest `scrollY` seen while pinned (starts at scroll when pin engaged). */
    let peakScrollSincePin = 0;
    /** Previous marquee `getBoundingClientRect().top` while unpinned — catches fast scroll past the nav line. */
    let prevMarqueeTop: number | null = null;

    const navHeight = () => Math.ceil(nav.getBoundingClientRect().height);

    const scrollY = () => window.scrollY || document.documentElement.scrollTop || 0;

    const applyPin = (next: boolean) => {
      if (next) {
        pinned = true;
        prevMarqueeTop = null;
        peakScrollSincePin = scrollY();
        const h = Math.max(1, Math.round(marquee.getBoundingClientRect().height));
        host.style.height = `${h}px`;
        marquee.classList.add('is-fixed-under-nav');
        document.documentElement.style.setProperty('--site-nav-pin-top', `${navHeight()}px`);
      } else {
        pinned = false;
        prevMarqueeTop = null;
        peakScrollSincePin = 0;
        host.style.height = '';
        marquee.classList.remove('is-fixed-under-nav');
        document.documentElement.style.removeProperty('--site-nav-pin-top');
      }
    };

    const tick = () => {
      if (!mq.matches) {
        document.documentElement.style.removeProperty('--site-nav-pin-top');
        if (pinned) applyPin(false);
        return;
      }

      const nh = navHeight();
      document.documentElement.style.setProperty('--site-nav-pin-top', `${nh}px`);

      const heroRect = hero.getBoundingClientRect();
      const mRect = marquee.getBoundingClientRect();
      const sy = scrollY();

      if (pinned) {
        peakScrollSincePin = Math.max(peakScrollSincePin, sy);
        const hostRect = host.getBoundingClientRect();
        const scrolledBackFromPeak = sy < peakScrollSincePin - UNPIN_SCROLL_PX;
        /* Host is the in-flow spacer; wait until its bottom reaches the nav band before unpinning */
        const slotBackAtNav = hostRect.bottom >= nh + UNPIN_HOST_BOTTOM_MIN;
        if (scrolledBackFromPeak && slotBackAtNav) {
          applyPin(false);
        } else {
          const h = Math.max(1, Math.round(marquee.getBoundingClientRect().height));
          host.style.height = `${h}px`;
        }
        return;
      }

      /* Not pinned: normal case + cross-frame catch-up when wheel/trackpad skips the nav line. */
      const heroStillRelevant = heroRect.bottom > nh + 20;
      const crossedNavDown =
        prevMarqueeTop !== null && prevMarqueeTop > nh + 1 && mRect.top <= nh + 1;
      const shouldPin =
        (heroStillRelevant && mRect.top <= nh + 1) || (crossedNavDown && mRect.bottom > nh - 2);
      if (shouldPin) {
        applyPin(true);
      } else {
        prevMarqueeTop = mRect.top;
      }
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };

    onScroll = schedule;
    window.addEventListener('scroll', onScroll, { passive: true, capture: true } as AddEventListenerOptions);
    document.addEventListener('scroll', onScroll, { passive: true, capture: true } as AddEventListenerOptions);
    window.addEventListener('resize', onScroll, { passive: true });
    vv = window.visualViewport ?? null;
    vv?.addEventListener('scroll', onScroll, { passive: true });
    vv?.addEventListener('resize', onScroll, { passive: true });

    ro = new ResizeObserver(schedule);
    ro.observe(nav);
    ro.observe(hero);
    ro.observe(marquee);

    onMq = () => schedule();
    mq.addEventListener('change', onMq);

    const kick = () => {
      schedule();
      requestAnimationFrame(() => schedule());
    };

    if (document.readyState === 'complete') {
      requestAnimationFrame(() => requestAnimationFrame(kick));
    } else {
      onLoadKick = () => kick();
      window.addEventListener('load', onLoadKick, { once: true });
    }

    queueMicrotask(kick);

    onPageshow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      clearWireRetry();
      if (!wireBindings()) scheduleWireRetry();
    };
    window.addEventListener('pageshow', onPageshow);

    kick();
    return true;
  };

  const scheduleWireRetry = () => {
    if (wireRetryRaf) cancelAnimationFrame(wireRetryRaf);
    wireRetryRaf = requestAnimationFrame(() => {
      wireRetryRaf = 0;
      tryWire();
    });
  };

  const tryWire = () => {
    if (wireBindings()) {
      clearWireRetry();
      return;
    }
    if (wireAttempts++ >= MAX_WIRE_ATTEMPTS) {
      clearWireRetry();
      return;
    }
    scheduleWireRetry();
  };

  tryWire();

  return () => {
    clearWireRetry();
    teardownListeners();
    document.documentElement.style.removeProperty('--site-nav-pin-top');
    document.querySelector('.hero-marquee--sticky-desktop')?.classList.remove('is-fixed-under-nav');
    document.querySelectorAll('.hero-marquee-sticky-host').forEach((el) => {
      if (el instanceof HTMLElement) el.style.height = '';
    });
  };
}
