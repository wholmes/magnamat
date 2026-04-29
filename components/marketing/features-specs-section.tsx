import type { FeaturesPrintPreset } from '@/lib/cms/types';
import type { CompatContent, FeaturesContent, SpecsContent } from '@/lib/cms/marketing-content';

import { CompatSectionContent } from './compat-section';
import { FeaturesSectionContent } from './features-section';
import { SpecsSectionContent } from './specs-section';

type Props = {
  features: FeaturesContent;
  specs: SpecsContent;
  compat: CompatContent;
  printPresets: FeaturesPrintPreset[];
};

/**
 * One continuous marketing band: Features + Spec sheet + Designed-for-Eufy (compat) share a
 * single `features-specs-surface` background (no stacked section paints between them).
 */
export function FeaturesSpecsSection({ features, specs, compat, printPresets }: Props) {
  return (
    <section
      className="features-specs-surface"
      style={{
        padding: '20px 24px 110px',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'visible',
      }}
    >
      <div id="features" className="features-specs__features">
        <FeaturesSectionContent features={features} printPresets={printPresets} />
      </div>
      <div id="specs" className="features-specs__specs">
        <SpecsSectionContent specs={specs} />
      </div>
      <div
        id="compat"
        className="features-specs__compat compat-section compat-section--embedded"
        role="region"
        aria-label={compat.sectionLabel}
      >
        <CompatSectionContent compat={compat} />
      </div>
    </section>
  );
}
