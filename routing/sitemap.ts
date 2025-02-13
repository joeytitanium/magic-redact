import type { MetadataRoute } from 'next';
import { getRouteUrl } from './get-route-url';
import type { Route } from './routes';

export const SITEMAP_ROUTES: Partial<Record<Route['to'], MetadataRoute.Sitemap[number]>> = {
  '/': {
    url: getRouteUrl({ to: '/' }, { absoluteUrl: true }),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  },
};
