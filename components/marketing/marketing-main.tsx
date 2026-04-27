import type { MarketingPageContent } from '@/lib/cms/marketing-content';

import { CompatSection } from './compat-section';
import { FeaturesSection } from './features-section';
import { HeroSection } from './hero-section';
import { SiteFooter } from './site-footer';
import { SpecsSection } from './specs-section';

type Props = { content: MarketingPageContent };

export function MarketingMain({ content }: Props) {
  return (
    <main id="main" tabIndex={-1}>
      <HeroSection hero={content.hero} />
      <FeaturesSection features={content.features} />
      <SpecsSection specs={content.specs} />
      <CompatSection compat={content.compat} />
      <SiteFooter footer={content.footer} />
    </main>
  );
}
