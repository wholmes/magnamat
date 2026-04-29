import { marketingPageToJson } from '@/lib/cms/marketing-content';
import { getMarketingPageContent } from '@/lib/cms/queries';

import { MarketingPageForm } from './marketing-page-form';

export const dynamic = 'force-dynamic';

export default async function AdminMarketingContentPage() {
  const content = await getMarketingPageContent();
  const initialJson = marketingPageToJson(content);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>Home page</h1>
      <p style={{ fontSize: 14, color: '#52525b', marginBottom: 24, lineHeight: 1.6, maxWidth: 52 * 16 }}>
        Hero, features, specs, compatibility, and footer — one JSON document (
        <code style={{ fontSize: 12 }}>MarketingPageContent</code> in{' '}
        <code style={{ fontSize: 12 }}>lib/cms/marketing-content.ts</code>). Unknown keys are ignored; missing keys use
        defaults. Set <code style={{ fontSize: 12 }}>hero.marqueeEnabled</code> to <code style={{ fontSize: 12 }}>false</code>{' '}
        to remove the hero ticker strip entirely. Set <code style={{ fontSize: 12 }}>hero.marqueeScroll</code> to{' '}
        <code style={{ fontSize: 12 }}>false</code> to keep the strip but stop horizontal motion (otherwise omit or use{' '}
        <code style={{ fontSize: 12 }}>true</code>). Set <code style={{ fontSize: 12 }}>hero.marqueeFadeLeft</code> to{' '}
        <code style={{ fontSize: 12 }}>true</code> for a soft mask so the left side of the ticker fades out fully toward the
        viewport edge. Use <code style={{ fontSize: 12 }}>features.introBody</code> for the paragraph under the features
        headline (omit or empty string to hide). The Mug / 3D Model preset bar under the features 3D viewer is off unless you
        set <code style={{ fontSize: 12 }}>features.showPrintPresetToolbar</code> to <code style={{ fontSize: 12 }}>true</code>{' '}
        (older <code style={{ fontSize: 12 }}>printPresetToolbar</code> keys in saved JSON are ignored).
      </p>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <MarketingPageForm initialJson={initialJson} />
      </div>
    </>
  );
}
