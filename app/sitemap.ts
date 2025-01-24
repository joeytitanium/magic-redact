import { SITEMAP_ROUTES } from '@/routing/sitemap';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(SITEMAP_ROUTES);
}
