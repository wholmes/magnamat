import type { MetadataRoute } from 'next';

import { getSeoSettings } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  if (seo.noIndex) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
  };
}
