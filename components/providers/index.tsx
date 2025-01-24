'use client';

import '@/theme/style.css';
import { MantineProvider } from '@mantine/core';
//
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { resolver, theme } from '@/theme';
import { Notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
// import ErrorBoundary from '../ErrorBoundary';
import { PHProvider } from './posthog';

const PostHogPageView = dynamic(() => import('./posthog-page-view'), {
  ssr: false,
});

export const Providers = ({ children }: { children: ReactNode }) => (
  // <ErrorBoundary>
  <PHProvider>
    <PostHogPageView />
    <MantineProvider theme={theme} cssVariablesResolver={resolver}>
      <Notifications position="top-center" />
      {children}
    </MantineProvider>
  </PHProvider>
  // </ErrorBoundary>
);
