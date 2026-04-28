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
        defaults. Set <code style={{ fontSize: 12 }}>hero.marqueeScroll</code> to <code style={{ fontSize: 12 }}>false</code>{' '}
        to stop the hero ticker animation (otherwise omit or use <code style={{ fontSize: 12 }}>true</code>).
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
