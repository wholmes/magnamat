import { revalidatePath } from 'next/cache';

/** Paths that read CMS data (incl. middleware rewrites to `/`). */
const MARKETING_PATHS = ['/', '/features', '/specs', '/compat'] as const;

export function revalidateAllPublicMarketingPaths() {
  for (const path of MARKETING_PATHS) {
    revalidatePath(path);
  }
}

/** Call after any CMS mutation so the storefront and admin pick up fresh data. */
export function revalidateAfterCmsWrite() {
  revalidateAllPublicMarketingPaths();
  revalidatePath('/robots.txt');
  revalidatePath('/admin');
  revalidatePath('/admin/content');
}
