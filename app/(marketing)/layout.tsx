import { CartDrawer } from '@/components/cart-drawer';
import { ClientRuntime } from '@/components/client-runtime';
import { PromoModal } from '@/components/promo-modal';
import { SiteNav } from '@/components/site-nav';
import { YtLightbox } from '@/components/yt-lightbox';
import { heroSceneCameraToJson } from '@/lib/cms/hero-scene-camera';
import { getFeaturesSceneCameraConfig, getHeroSceneCameraConfig, getSiteChrome } from '@/lib/cms/queries';

export default async function MarketingSiteLayout({ children }: { children: React.ReactNode }) {
  const [chrome, heroScene, featuresScene] = await Promise.all([
    getSiteChrome(),
    getHeroSceneCameraConfig(),
    getFeaturesSceneCameraConfig(),
  ]);
  const heroSceneJson = heroSceneCameraToJson(heroScene);
  const featuresSceneJson = featuresScene != null ? heroSceneCameraToJson(featuresScene) : null;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteNav chrome={chrome} />
      <script
        id="magnamat-hero-scene-config"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: heroSceneJson }}
      />
      {featuresSceneJson != null ? (
        <script
          id="magnamat-features-scene-config"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: featuresSceneJson }}
        />
      ) : null}
      <script
        id="magnamat-commerce-config"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chrome.commerce) }}
      />
      <script
        id="magnamat-promo-modal-config"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chrome.promoModal) }}
      />
      <script
        id="magnamat-features-print-presets"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chrome.featuresPrintPresets) }}
      />
      {children}
      <PromoModal />
      <CartDrawer />
      <YtLightbox />
      <ClientRuntime />
    </>
  );
}
