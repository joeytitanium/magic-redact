'use client';

import '@/theme/style.css';
import { MantineProvider } from '@mantine/core';
//
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
//
import '@/theme/shadcn-style.css';

import { shadcnTheme } from '@/theme';
import { Notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
// import ErrorBoundary from '../ErrorBoundary';
import { cssVariableResolver } from '@/theme/css-variable-resolver';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PHProvider } from './posthog';

const PostHogPageView = dynamic(() => import('./posthog-page-view'), {
  ssr: false,
});

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    // <ErrorBoundary>
    <PHProvider>
      <PostHogPageView />
      <MantineProvider theme={shadcnTheme} cssVariablesResolver={cssVariableResolver}>
        <Notifications position="top-center" />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MantineProvider>
    </PHProvider>
    // </ErrorBoundary>
  );
};
