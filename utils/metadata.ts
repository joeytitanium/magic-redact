import { CONFIG } from '@/config';
import type { Metadata } from 'next';
import { isDevelopment } from './is-development';
import { pageTitle } from './page-title';

export const openGraph: Metadata['openGraph'] = {
  title: isDevelopment ? `[DEV] ${CONFIG.site.name}` : CONFIG.site.name,
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
  title: metadata.title
    ? pageTitle(metadata.title)
    : pageTitle('Free PDF & Image Redaction Tool - Secure, Fast, & Open Source'),
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
