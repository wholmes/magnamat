/**
 * Typed home marketing copy — stored as JSON on `MarketingPage`.
 * Admin edits JSON at `/admin/content`; unknown keys are ignored, missing keys fall back to defaults.
 */

export type Tone = 'ink' | 'red' | 'blue';

export type TextSegment = { text: string; tone: Tone };

export type HeroStat = { value: string; suffix?: string; label: string };

export type HeroContent = {
  eyebrow: string;
  titleSegments: TextSegment[];
  bodyBeforeBrand: string;
  bodyBrand: string;
  bodyAfterBrand: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: HeroStat[];
  canvasAriaLabel: string;
  canvasVersionLabel: string;
  canvasDragHint: string;
  marquee: string;
  /** Second ticker: horizontal strip on the hero / features seam (below the tilted hero marquee). */
  marqueeStraight: string;
  /** When false, the tilted hero bottom ticker is not rendered. Default true. */
  marqueeEnabled: boolean;
  /** When false, hero ticker copy stays fixed (no horizontal scroll). Default true. */
  marqueeScroll: boolean;
  /** When true, left side of the ticker strip fades to fully transparent (viewport-relative mask). Default false. */
  marqueeFadeLeft: boolean;
  /**
   * When true (and the hero marquee is shown), on viewports ≥1024px the bottom ticker uses `position: sticky`
   * so it pins just under the fixed nav while the rest of the page scrolls. No effect on smaller breakpoints.
   * Default false.
   */
  marqueeStickyDesktop: boolean;
};

export type FeatureCardPins = {
  title: string;
  body: string;
  caption: string;
};

export type FeatureCardFlex = {
  title: string;
  body: string;
  flexMeter: string;
  holdTitle: string;
  holdSub: string;
  popTitle: string;
  popSub: string;
};

export type FeatureCardMaterials = {
  title: string;
  body: string;
  filamentTags: string[];
};

export type FeaturesContent = {
  sectionLabel: string;
  headlineSegments: TextSegment[];
  /** Short paragraph under the features headline (newlines OK; trimmed empty hides in UI). */
  introBody: string;
  /** When true, show Mug / 3D Model preset buttons and the caption under the features 3D viewer. Default false. */
  showPrintPresetToolbar: boolean;
  cardPins: FeatureCardPins;
  cardFlex: FeatureCardFlex;
  cardMaterials: FeatureCardMaterials;
};

export type SpecStatTile = { value: string; label: string };

export type SpecRow = { key: string; value: string; color: Tone };

export type SpecsContent = {
  sectionLabel: string;
  headlineSegments: TextSegment[];
  pinDecorCaption: string;
  statLeft: SpecStatTile;
  statRight: SpecStatTile;
  rows: SpecRow[];
};

export type CompatBadge = { status: 'check' | 'pending'; label: string };

export type CompatContent = {
  sectionLabel: string;
  headlineSegments: TextSegment[];
  body: string;
  badges: CompatBadge[];
  ctaText: string;
  ctaAriaLabel: string;
};

export type FooterLink = { label: string; href: string };

export type FooterContent = {
  copyright: string;
  links: FooterLink[];
};

export type MarketingPageContent = {
  schemaVersion: 1;
  hero: HeroContent;
  features: FeaturesContent;
  specs: SpecsContent;
  compat: CompatContent;
  footer: FooterContent;
};

export const DEFAULT_MARKETING_PAGE: MarketingPageContent = {
  schemaVersion: 1,
  hero: {
    eyebrow: 'UV resin · Eufy Maker · texture fidelity',
    titleSegments: [
      { text: 'Grip.', tone: 'ink' },
      { text: 'Hold.', tone: 'red' },
      { text: 'Release.', tone: 'blue' },
    ],
    bodyBeforeBrand: 'The ',
    bodyBrand: 'mag·na·mat',
    bodyAfterBrand:
      'is a precision-engineered magnetic print surface for the Eufy Maker system. Micro-pin contacts deliver unmatched adhesion during print.',
    ctaPrimary: 'Pre-Order Now',
    ctaSecondary: 'View Specs',
    stats: [
      { value: '250', suffix: '+', label: 'Pin Contacts' },
      { value: '255', suffix: '°C', label: 'Max Bed Temp' },
      { value: '0.1s', label: 'Release Time' },
    ],
    canvasAriaLabel:
      'Interactive 3D preview of the mag·na·mat build surface. Drag to rotate the view. Add ?adjust=1 to the page URL to enable scroll zoom while tuning the camera.',
    canvasVersionLabel: 'mag·na·mat v1.0',
    canvasDragHint: 'drag to orbit',
    marquee:
      'MAGNETIC MICRO-PIN MATRIX &nbsp;·&nbsp; FLEX STEEL SUBSTRATE &nbsp;·&nbsp; EUFY MAKER COMPATIBLE &nbsp;·&nbsp; 250+ CONTACT POINTS &nbsp;·&nbsp; 255°C RATED &nbsp;·&nbsp; PLA · PETG · ABS · TPU · ASA &nbsp;·&nbsp; 0.01mm TOLERANCE &nbsp;·&nbsp; 1,000+ CYCLE RATING &nbsp;·&nbsp; MAGNETIC MICRO-PIN MATRIX &nbsp;·&nbsp; FLEX STEEL SUBSTRATE &nbsp;·&nbsp; EUFY MAKER COMPATIBLE &nbsp;·&nbsp; 250+ CONTACT POINTS &nbsp;·&nbsp; 255°C RATED &nbsp;·&nbsp; PLA · PETG · ABS · TPU · ASA &nbsp;·&nbsp; 0.01mm TOLERANCE &nbsp;·&nbsp; 1,000+ CYCLE RATING &nbsp;·&nbsp;',
    marqueeStraight:
      'ENGINEERING-GRADE FLATNESS &nbsp;·&nbsp; FIELD-TESTED RELEASE &nbsp;·&nbsp; EUFY MAKER FITMENT &nbsp;·&nbsp; SHOP-FIRST WORKFLOW &nbsp;·&nbsp; REPEATABLE Z HEIGHT &nbsp;·&nbsp; NO AQUA NET / GLUE &nbsp;·&nbsp; COLD PLATE SAFE &nbsp;·&nbsp; ENGINEERING-GRADE FLATNESS &nbsp;·&nbsp; FIELD-TESTED RELEASE &nbsp;·&nbsp; EUFY MAKER FITMENT &nbsp;·&nbsp; SHOP-FIRST WORKFLOW &nbsp;·&nbsp; REPEATABLE Z HEIGHT &nbsp;·&nbsp; NO AQUA NET / GLUE &nbsp;·&nbsp; COLD PLATE SAFE &nbsp;·&nbsp;',
    marqueeEnabled: true,
    marqueeScroll: true,
    marqueeFadeLeft: false,
    marqueeStickyDesktop: false,
  },
  features: {
    sectionLabel: '// 01 — Engineering',
    headlineSegments: [
      { text: 'Built', tone: 'ink' },
      { text: 'different.', tone: 'blue' },
    ],
    introBody:
      'Engineered for real workflows — magnetic micro-pins for even hold, flex steel for a clean release, and a surface tuned for common filaments without glue or babysitting.',
    showPrintPresetToolbar: false,
    cardPins: {
      title: 'Micro-Pin Matrix',
      body: '250+ individually tuned magnetic contact pins create a distributed grip field with zero dead zones. Perfect, even adhesion across the full build area — edge to edge.',
      caption: '60× magnified surface pattern',
    },
    cardFlex: {
      title: 'Flex-Release Tech',
      body: 'A precision-flex spring steel core lets you pop parts with a single bow. No tools, no scraping, no warped prints. The mat snaps back to perfectly flat in under 0.1 seconds.',
      flexMeter: 'flex 9.4 / 10',
      holdTitle: 'Hold',
      holdSub: 'during print',
      popTitle: 'Pop',
      popSub: 'when done',
    },
    cardMaterials: {
      title: 'Material Agnostic',
      body: 'Tested to 255°C sustained bed temperature with zero degradation over 1,000+ print cycles. Handles every common filament without surface treatment or adhesion aids.',
      filamentTags: ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', '+more'],
    },
  },
  specs: {
    sectionLabel: '// 02 — Technical',
    headlineSegments: [
      { text: 'Spec', tone: 'ink' },
      { text: 'Sheet.', tone: 'red' },
    ],
    pinDecorCaption: 'pin matrix surface / 60× sim',
    statLeft: { value: '60×', label: 'vs standard PEI' },
    statRight: { value: '∞', label: 'Reuse cycles' },
    rows: [
      { key: 'Build Surface', value: '235 × 235 mm', color: 'ink' },
      { key: 'Pin Count', value: '250+', color: 'red' },
      { key: 'Max Bed Temp', value: '255°C', color: 'ink' },
      { key: 'Surface Tolerance', value: '±0.01 mm', color: 'ink' },
      { key: 'Substrate', value: 'Flex Spring Steel', color: 'ink' },
      { key: 'Cycle Rating', value: '1,000+ prints', color: 'blue' },
      { key: 'Release Time', value: '< 0.1 s', color: 'ink' },
      { key: 'Adhesion vs PEI', value: '60× stronger', color: 'red' },
      { key: 'Materials', value: 'PLA · PETG · ABS · TPU · ASA', color: 'ink' },
    ],
  },
  compat: {
    sectionLabel: '// 03 — System',
    headlineSegments: [
      { text: 'Designed for', tone: 'ink' },
      { text: 'Eufy.', tone: 'blue' },
    ],
    body: 'Drop-in compatible with the full Eufy Maker platform. Magnetic locking base plate. Zero recalibration. No hardware mods. Just place and print.',
    badges: [
      { status: 'check', label: 'Eufy Maker S3' },
      { status: 'check', label: 'Eufy Maker S2' },
      { status: 'pending', label: 'Future Models' },
    ],
    ctaText: 'Get Your mag·na·mat',
    ctaAriaLabel: 'Add mag·na·mat v1.0 to cart',
  },
  footer: {
    copyright: '© 2026 mag·na·mat — Precision Magnetic Surfaces',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

const TONES: Tone[] = ['ink', 'red', 'blue'];

function isTone(x: unknown): x is Tone {
  return typeof x === 'string' && (TONES as readonly string[]).includes(x);
}

function pickTone(x: unknown, fallback: Tone): Tone {
  return isTone(x) ? x : fallback;
}

function pickString(x: unknown, fallback: string): string {
  return typeof x === 'string' ? x : fallback;
}

function pickBoolean(x: unknown, fallback: boolean): boolean {
  if (typeof x === 'boolean') return x;
  if (x === 1 || x === '1' || x === 'true' || x === 'on' || x === 'yes') return true;
  if (x === 0 || x === '0' || x === 'false' || x === 'off' || x === 'no') return false;
  return fallback;
}

function pickSegments(x: unknown, fallback: TextSegment[]): TextSegment[] {
  if (!Array.isArray(x) || x.length === 0) return fallback;
  const out: TextSegment[] = [];
  for (let i = 0; i < x.length; i++) {
    const item = x[i];
    const fb = fallback[Math.min(i, fallback.length - 1)]!;
    if (!item || typeof item !== 'object') {
      out.push(fb);
      continue;
    }
    const o = item as Record<string, unknown>;
    out.push({
      text: pickString(o.text, fb.text),
      tone: pickTone(o.tone, fb.tone),
    });
  }
  while (out.length < fallback.length) out.push(fallback[out.length]!);
  return out.slice(0, fallback.length);
}

function pickHeroStats(x: unknown, fallback: HeroStat[]): HeroStat[] {
  if (!Array.isArray(x) || x.length === 0) return fallback;
  const out: HeroStat[] = [];
  for (let i = 0; i < fallback.length; i++) {
    const item = x[i];
    const fb = fallback[i]!;
    if (!item || typeof item !== 'object') {
      out.push(fb);
      continue;
    }
    const o = item as Record<string, unknown>;
    out.push({
      value: pickString(o.value, fb.value),
      suffix: typeof o.suffix === 'string' ? o.suffix : fb.suffix,
      label: pickString(o.label, fb.label),
    });
  }
  return out;
}

function pickHero(p: unknown, d: HeroContent): HeroContent {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    eyebrow: pickString(o.eyebrow, d.eyebrow),
    titleSegments: pickSegments(o.titleSegments, d.titleSegments),
    bodyBeforeBrand: pickString(o.bodyBeforeBrand, d.bodyBeforeBrand),
    bodyBrand: pickString(o.bodyBrand, d.bodyBrand),
    bodyAfterBrand: pickString(o.bodyAfterBrand, d.bodyAfterBrand),
    ctaPrimary: pickString(o.ctaPrimary, d.ctaPrimary),
    ctaSecondary: pickString(o.ctaSecondary, d.ctaSecondary),
    stats: pickHeroStats(o.stats, d.stats),
    canvasAriaLabel: pickString(o.canvasAriaLabel, d.canvasAriaLabel),
    canvasVersionLabel: pickString(o.canvasVersionLabel, d.canvasVersionLabel),
    canvasDragHint: pickString(o.canvasDragHint, d.canvasDragHint),
    marquee: pickString(o.marquee, d.marquee),
    marqueeStraight: pickString(o.marqueeStraight, d.marqueeStraight),
    marqueeEnabled: pickBoolean(o.marqueeEnabled, d.marqueeEnabled),
    marqueeScroll: pickBoolean(o.marqueeScroll, d.marqueeScroll),
    marqueeFadeLeft: pickBoolean(o.marqueeFadeLeft, d.marqueeFadeLeft),
    marqueeStickyDesktop: pickBoolean(o.marqueeStickyDesktop, d.marqueeStickyDesktop),
  };
}

function pickFeatureCardPins(p: unknown, d: FeatureCardPins): FeatureCardPins {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    title: pickString(o.title, d.title),
    body: pickString(o.body, d.body),
    caption: pickString(o.caption, d.caption),
  };
}

function pickFeatureCardFlex(p: unknown, d: FeatureCardFlex): FeatureCardFlex {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    title: pickString(o.title, d.title),
    body: pickString(o.body, d.body),
    flexMeter: pickString(o.flexMeter, d.flexMeter),
    holdTitle: pickString(o.holdTitle, d.holdTitle),
    holdSub: pickString(o.holdSub, d.holdSub),
    popTitle: pickString(o.popTitle, d.popTitle),
    popSub: pickString(o.popSub, d.popSub),
  };
}

function pickStringArray(x: unknown, fallback: string[]): string[] {
  if (!Array.isArray(x)) return fallback;
  const out = x.filter((i) => typeof i === 'string') as string[];
  return out.length ? out : fallback;
}

function pickFeatureCardMaterials(p: unknown, d: FeatureCardMaterials): FeatureCardMaterials {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    title: pickString(o.title, d.title),
    body: pickString(o.body, d.body),
    filamentTags: pickStringArray(o.filamentTags, d.filamentTags),
  };
}

function pickFeatures(p: unknown, d: FeaturesContent): FeaturesContent {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    sectionLabel: pickString(o.sectionLabel, d.sectionLabel),
    headlineSegments: pickSegments(o.headlineSegments, d.headlineSegments),
    introBody: pickString(o.introBody, d.introBody),
    showPrintPresetToolbar: pickBoolean(o.showPrintPresetToolbar, d.showPrintPresetToolbar),
    cardPins: pickFeatureCardPins(o.cardPins, d.cardPins),
    cardFlex: pickFeatureCardFlex(o.cardFlex, d.cardFlex),
    cardMaterials: pickFeatureCardMaterials(o.cardMaterials, d.cardMaterials),
  };
}

function pickSpecTile(p: unknown, d: SpecStatTile): SpecStatTile {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return { value: pickString(o.value, d.value), label: pickString(o.label, d.label) };
}

function pickSpecRows(x: unknown, fallback: SpecRow[]): SpecRow[] {
  if (!Array.isArray(x) || x.length === 0) return fallback;
  const out: SpecRow[] = [];
  const defaultColor = fallback[0]?.color ?? 'ink';
  for (const item of x) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const key = pickString(o.key, '');
    const value = pickString(o.value, '');
    if (!key.trim() || !value.trim()) continue;
    out.push({
      key,
      value,
      color: pickTone(o.color, defaultColor) as SpecRow['color'],
    });
  }
  return out.length ? out : fallback;
}

function pickSpecs(p: unknown, d: SpecsContent): SpecsContent {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    sectionLabel: pickString(o.sectionLabel, d.sectionLabel),
    headlineSegments: pickSegments(o.headlineSegments, d.headlineSegments),
    pinDecorCaption: pickString(o.pinDecorCaption, d.pinDecorCaption),
    statLeft: pickSpecTile(o.statLeft, d.statLeft),
    statRight: pickSpecTile(o.statRight, d.statRight),
    rows: pickSpecRows(o.rows, d.rows),
  };
}

function pickCompatBadges(x: unknown, fallback: CompatBadge[]): CompatBadge[] {
  if (!Array.isArray(x) || x.length === 0) return fallback;
  const out: CompatBadge[] = [];
  for (let i = 0; i < x.length; i++) {
    const item = x[i];
    const fb = fallback[Math.min(i, fallback.length - 1)]!;
    if (!item || typeof item !== 'object') {
      out.push(fb);
      continue;
    }
    const o = item as Record<string, unknown>;
    const st = o.status === 'pending' ? 'pending' : 'check';
    out.push({ status: st, label: pickString(o.label, fb.label) });
  }
  return out.length ? out : fallback;
}

function pickCompat(p: unknown, d: CompatContent): CompatContent {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    sectionLabel: pickString(o.sectionLabel, d.sectionLabel),
    headlineSegments: pickSegments(o.headlineSegments, d.headlineSegments),
    body: pickString(o.body, d.body),
    badges: pickCompatBadges(o.badges, d.badges),
    ctaText: pickString(o.ctaText, d.ctaText),
    ctaAriaLabel: pickString(o.ctaAriaLabel, d.ctaAriaLabel),
  };
}

function pickFooterLinks(x: unknown, fallback: FooterLink[]): FooterLink[] {
  if (!Array.isArray(x) || x.length === 0) return fallback;
  const out: FooterLink[] = [];
  for (const item of x) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    out.push({
      label: pickString(o.label, ''),
      href: pickString(o.href, '#'),
    });
  }
  return out.length ? out : fallback;
}

function pickFooter(p: unknown, d: FooterContent): FooterContent {
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    copyright: pickString(o.copyright, d.copyright),
    links: pickFooterLinks(o.links, d.links),
  };
}

/** Parse DB JSON and merge with defaults (tolerates partial / unknown). */
export function parseMarketingPageJson(raw: string | null | undefined): MarketingPageContent {
  const d = DEFAULT_MARKETING_PAGE;
  if (!raw || !raw.trim()) return d;
  try {
    const root = JSON.parse(raw) as Record<string, unknown>;
    if (root.schemaVersion !== 1 && root.schemaVersion !== undefined) {
      /* allow missing schemaVersion for older rows */
    }
    return {
      schemaVersion: 1,
      hero: pickHero(root.hero, d.hero),
      features: pickFeatures(root.features, d.features),
      specs: pickSpecs(root.specs, d.specs),
      compat: pickCompat(root.compat, d.compat),
      footer: pickFooter(root.footer, d.footer),
    };
  } catch {
    return d;
  }
}

export function marketingPageToJson(content: MarketingPageContent): string {
  return JSON.stringify(content, null, 2);
}

/** Validates JSON syntax before save; merges partial objects with defaults. */
export function tryParseMarketingPageFromEditor(
  raw: string
): { ok: true; content: MarketingPageContent } | { ok: false; error: string } {
  try {
    const root = JSON.parse(raw) as unknown;
    if (root === null || typeof root !== 'object' || Array.isArray(root)) {
      return { ok: false, error: 'Root must be a JSON object (not an array).' };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON.' };
  }
  return { ok: true, content: parseMarketingPageJson(raw) };
}

export function toneToCssColor(tone: Tone): string {
  if (tone === 'red') return 'var(--red)';
  if (tone === 'blue') return 'var(--blue)';
  return 'var(--ink)';
}

/** Normalize body copy newlines for display (trim each line from JSON paste). */
export function normalizeMultiline(s: string): string {
  return s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
}
