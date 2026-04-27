import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.siteChrome.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      configJson: JSON.stringify({
        navLinks: [
          { label: 'Features', href: '/features' },
          { label: 'Specs', href: '/specs' },
          { label: 'Compatible', href: '/compat' },
        ],
        youtubeVideoId: 'M7lc1UVf-VE',
        commerce: {
          checkoutUrl: '',
          products: [
            {
              id: 'magnamat-v1',
              name: 'mag·na·mat v1.0',
              subtitle: 'Magnetic build surface · Eufy Maker · 235×235 mm',
              priceCents: null,
              maxPerOrder: 99,
            },
          ],
        },
      }),
    },
    update: {},
  });

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', availabilityStatus: '', navHideOnScroll: false },
    update: {},
  });

  await prisma.seoSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      title: 'mag·na·mat — Magnetic Maker Mat for Eufy',
      description:
        'mag·na·mat — precision magnetic print surface for the Eufy Maker system. 250+ micro-pin contacts, flex spring steel, 255°C rated, effortless release.',
      noIndex: false,
    },
    update: {},
  });

  await prisma.marketingPage.upsert({
    where: { id: 'home' },
    create: { id: 'home', contentJson: '{}' },
    update: {},
  });

  const defaultHeroScene = JSON.stringify({
    v: 1,
    distance: 17.961961,
    polarDeg: 77.844331,
    azimuthDeg: -94.868025,
    target: [0, 0.1, 0],
    mat: { order: 'YXZ', x: 0.471239, y: -0.829031, z: 0.218166 },
  });

  await prisma.heroSceneCamera.upsert({
    where: { id: 'default' },
    create: { id: 'default', configJson: defaultHeroScene },
    update: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
