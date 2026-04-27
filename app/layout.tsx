import type { Metadata } from 'next';

import { fontRootClassName } from '@/app/fonts';
import { getSeoSettings } from '@/lib/cms/queries';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: seo.title,
    description: seo.description,
    robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title: seo.title, description: seo.description, type: 'website' },
    twitter: { card: 'summary', title: seo.title, description: seo.description },
  };
}

/** Minimal shell: fonts + global CSS. Marketing chrome lives in `app/(marketing)/layout.tsx`; admin has no nav/cart. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontRootClassName}>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#f2f4f7" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
