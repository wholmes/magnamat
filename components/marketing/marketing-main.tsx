import type { FeaturesPrintPreset } from '@/lib/cms/types';
import type { MarketingPageContent } from '@/lib/cms/marketing-content';

import { FeaturesSpecsSection } from './features-specs-section';
import { HeroSection } from './hero-section';
import { SiteFooter } from './site-footer';

type Props = { content: MarketingPageContent; featuresPrintPresets: FeaturesPrintPreset[] };

export function MarketingMain({ content, featuresPrintPresets }: Props) {
  return (
    <main id="main" tabIndex={-1}>
      <HeroSection hero={content.hero} />
      <FeaturesSpecsSection
        features={content.features}
        specs={content.specs}
        compat={content.compat}
        printPresets={featuresPrintPresets}
      />
      <SiteFooter footer={content.footer} />
    </main>
  );
}
