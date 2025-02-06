import { Providers } from '@/components/providers';
import { HeadTrackingScripts, PostHeadTrackingScripts } from '@/components/tracking-scripts';
import { CONFIG } from '@/config';
import { ColorSchemeScript } from '@mantine/core';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: CONFIG.site.name,
  description: 'Auto-redact sensitive information from your images',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <HeadTrackingScripts />
      </head>
      <PostHeadTrackingScripts />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
