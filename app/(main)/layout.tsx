import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';
import { HeadTrackingScripts, PostHeadTrackingScripts } from '@/components/tracking-scripts';
import { generateMetadata } from '@/utils/metadata';
import { ColorSchemeScript } from '@mantine/core';
import type { ReactNode } from 'react';

export const metadata = generateMetadata();

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
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
