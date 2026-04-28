'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PromoCoupon, PromoModalConfig } from '@/lib/cms/types';

const SESSION_FLAG = 'magnamat-promo-session-counted';
const VISITS_KEY = 'magnamat-lifetime-sessions';

function readPromoConfig(): PromoModalConfig | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('magnamat-promo-modal-config');
  if (!el?.textContent?.trim()) return null;
  try {
    return JSON.parse(el.textContent) as PromoModalConfig;
  } catch {
    return null;
  }
}

function dismissKey(cfg: PromoModalConfig) {
  return `magnamat-promo-dismissed-${cfg.rules.dismissStorageKey}`;
}

function CouponRow({ coupon }: { coupon: PromoCoupon }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [coupon.code]);

  return (
    <div className="promo-modal__coupon">
      <div className="promo-modal__coupon-meta">
        <span className="promo-modal__coupon-label">{coupon.label}</span>
        <button type="button" className="promo-modal__coupon-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code className="promo-modal__coupon-code" translate="no">
        {coupon.code}
      </code>
    </div>
  );
}

export function PromoModal() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [config, setConfig] = useState<PromoModalConfig | null>(null);
  const [visitCount, setVisitCount] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const openedRef = useRef(false);

  useEffect(() => {
    setConfig(readPromoConfig());
    setReduceMotion(
      typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    let count = parseInt(typeof localStorage !== 'undefined' ? localStorage.getItem(VISITS_KEY) || '0' : '0', 10);
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(SESSION_FLAG)) {
      sessionStorage.setItem(SESSION_FLAG, '1');
      count += 1;
      localStorage.setItem(VISITS_KEY, String(count));
    }
    setVisitCount(count);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop || 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const eligible = useMemo(() => {
    if (!config?.enabled || reduceMotion) return false;
    const minV = config.rules.minLifetimeVisits;
    if (minV > 0 && visitCount < minV) return false;
    const minS = config.rules.minScrollY;
    if (minS > 0 && scrollY < minS) return false;
    if (config.rules.pathScope === 'home' && pathname !== '/') return false;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(dismissKey(config)) === '1') return false;
    return true;
  }, [config, reduceMotion, visitCount, scrollY, pathname]);

  useEffect(() => {
    if (!eligible || openedRef.current || !dialogRef.current) return;
    openedRef.current = true;
    dialogRef.current.showModal();
  }, [eligible]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el || !config) return;
    const onClose = () => {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(dismissKey(config)) !== '1') {
        localStorage.setItem(dismissKey(config), '1');
      }
    };
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, [config]);

  const onDismiss = useCallback(() => {
    if (config && typeof localStorage !== 'undefined') {
      localStorage.setItem(dismissKey(config), '1');
    }
    dialogRef.current?.close();
  }, [config]);

  if (!config?.enabled || reduceMotion) return null;

  const bodyLines = config.body.split('\n').filter((l) => l.trim());
  const coupons = Array.isArray(config.coupons) ? config.coupons : [];

  return (
    <dialog ref={dialogRef} className="promo-modal" aria-labelledby="promo-modal-title">
      <div className="promo-modal__brand">
        <Image
          src="/images/logo-transparent.svg"
          alt=""
          width={640}
          height={220}
          className="promo-modal__logo"
          sizes="(max-width: 480px) 72vw, 320px"
        />
      </div>
      <h2 id="promo-modal-title" className="promo-modal__title font-display font-extrabold leading-tight">
        {config.title}
      </h2>
      <div className="promo-modal__body">
        {bodyLines.length
          ? bodyLines.map((line, i) => (
              <p key={i} className="promo-modal__line">
                {line}
              </p>
            ))
          : null}
      </div>
      {coupons.length ? (
        <div className="promo-modal__coupons" aria-label="Coupon codes">
          {coupons.map((c, i) => (
            <CouponRow key={`${c.code}-${i}`} coupon={c} />
          ))}
        </div>
      ) : null}
      <div className="promo-modal__actions">
        {config.primaryCtaHref.trim() ? (
          <Link
            href={config.primaryCtaHref.trim()}
            className="btn btn-primary"
            onClick={onDismiss}
          >
            {config.primaryCtaLabel || 'OK'}
          </Link>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onDismiss}>
            {config.primaryCtaLabel || 'OK'}
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={onDismiss}>
          {config.dismissLabel || 'Not now'}
        </button>
      </div>
    </dialog>
  );
}
