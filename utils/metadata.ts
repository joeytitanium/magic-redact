import { CONFIG } from '@/config';
import type { Metadata } from 'next';

export const openGraph: Metadata['openGraph'] = {
  title: CONFIG.site.name,
  description: CONFIG.site.description,
  type: 'website',
  url: CONFIG.site.url,
  siteName: CONFIG.site.name,
  images: [
    {
      url: `${CONFIG.site.url}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: 'Mantine landing page blocks',
    },
  ],
};

export const generateMetadata = (metadata: Metadata = {}): Metadata => ({
  title: CONFIG.site.name,
  description: CONFIG.site.description,
  keywords: ['MagicRedact', 'AI', 'Image', 'Redact', 'Sensitive', 'Information'].join(', '),
  openGraph,
  twitter: {
    card: 'summary_large_image',
    title: CONFIG.site.name,
    description: CONFIG.site.description,
    creator: CONFIG.social.x.handle,
    images: [`${CONFIG.site.url}/og-image.jpg`],
  },
  ...metadata,
});
