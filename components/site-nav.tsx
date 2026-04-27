import Image from 'next/image';
import Link from 'next/link';

import type { SiteChromeConfig } from '@/lib/cms/types';

type Props = {
  chrome: SiteChromeConfig;
};

export function SiteNav({ chrome }: Props) {
  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav__inner">
        <Link href="/" className="logo logo-mark" aria-label="mag·na·mat — home">
          <Image
            src="/images/logo-transparent.svg"
            alt=""
            width={1024}
            height={350}
            priority
            sizes="(max-width: 768px) 64vw, 420px"
          />
        </Link>

        <div className="site-nav__links">
          {chrome.navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="nav-link js-yt-lightbox-open"
            data-youtube-id={chrome.youtubeVideoId}
            aria-haspopup="dialog"
            aria-controls="yt-lightbox"
          >
            As seen on YouTube
          </button>
        </div>

        <div className="site-nav__actions">
          <button
            type="button"
            className="site-nav__cart-btn js-cart-toggle"
            aria-label="Open cart"
            aria-expanded="false"
            aria-controls="cart-drawer"
          >
            <svg
              className="site-nav__cart-icon"
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6 5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            <span className="site-nav__cart-badge js-cart-badge" hidden data-count="0">
              0
            </span>
          </button>
          <button
            type="button"
            className="btn btn-primary js-add-to-cart"
            data-product-id="magnamat-v1"
            style={{ fontSize: 13, padding: '11px 26px' }}
            aria-label="Add to cart and pre-order"
          >
            Pre-Order
          </button>
        </div>
      </div>
    </nav>
  );
}
