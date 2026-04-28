import { MarketingMain } from '@/components/marketing/marketing-main';
import { getMarketingPageContent, getSiteChrome } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [content, chrome] = await Promise.all([getMarketingPageContent(), getSiteChrome()]);
  return <MarketingMain content={content} featuresPrintPresets={chrome.featuresPrintPresets} />;
}
