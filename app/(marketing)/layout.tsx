import { CartDrawer } from '@/components/cart-drawer';
import { ClientRuntime } from '@/components/client-runtime';
import { SiteNav } from '@/components/site-nav';
import { YtLightbox } from '@/components/yt-lightbox';
import { heroSceneCameraToJson } from '@/lib/cms/hero-scene-camera';
import { getHeroSceneCameraConfig, getSiteChrome } from '@/lib/cms/queries';

export default async function MarketingSiteLayout({ children }: { children: React.ReactNode }) {
  const [chrome, heroScene] = await Promise.all([getSiteChrome(), getHeroSceneCameraConfig()]);
  const heroSceneJson = heroSceneCameraToJson(heroScene);

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
      <script
        id="magnamat-commerce-config"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chrome.commerce) }}
      />
      {children}
      <CartDrawer />
      <YtLightbox />
      <ClientRuntime />
    </>
  );
}
