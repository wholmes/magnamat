import { MarketingMain } from '@/components/marketing/marketing-main';
import { getMarketingPageContent } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await getMarketingPageContent();
  return <MarketingMain content={content} />;
}
