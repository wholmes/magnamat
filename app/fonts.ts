import { Barlow, Barlow_Condensed, Orbitron, Space_Mono } from 'next/font/google';

export const fontBarlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-barlow',
  display: 'swap',
});

export const fontBarlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const fontOrbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const fontSpaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

/** Apply on `<html>` so `var(--font-*)` works across `styles.css` and inline styles. */
export const fontRootClassName = [
  fontBarlow.variable,
  fontBarlowCondensed.variable,
  fontOrbitron.variable,
  fontSpaceMono.variable,
].join(' ');
