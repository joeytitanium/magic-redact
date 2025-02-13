'use client';

import '@/theme/style.css';
import { MantineProvider } from '@mantine/core';
//
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
//
import '@/theme/shadcn-style.css';

import { supabaseClient } from '@/lib/supabase/client';
import { shadcnTheme } from '@/theme';
import { Notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useEffect, useState, type ReactNode } from 'react';
// import ErrorBoundary from '../ErrorBoundary';
import { cssVariableResolver } from '@/theme/css-variable-resolver';

import { CONFIG } from '@/config';
import { ModalsProvider } from '@mantine/modals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PHProvider } from './posthog';

const PostHogPageView = dynamic(() => import('./posthog-page-view'), {
  ssr: false,
});

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const supabase = supabaseClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        // handle initial session
      } else if (event === 'SIGNED_IN') {
        posthog.identify(session?.user.id, {
          email: session?.user.email,
          name: session?.user.user_metadata.name ?? session?.user.user_metadata.displayName,
        });

        if (session) {
          // void updateUserProfile({ session });
        }
      } else if (event === 'SIGNED_OUT') {
        posthog.reset();
        [window.localStorage, window.sessionStorage].forEach((storage) => {
          Object.entries(storage).forEach(([key]) => {
            storage.removeItem(key);
          });
        });
      } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    // <ErrorBoundary>
    <PHProvider>
      <PostHogPageView />
      <MantineProvider theme={shadcnTheme} cssVariablesResolver={cssVariableResolver}>
        <Notifications position="top-center" />
        <ModalsProvider modalProps={{ centered: true }}>
          <GoogleOAuthProvider clientId={CONFIG.auth.google.clientId}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </GoogleOAuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </PHProvider>
    // </ErrorBoundary>
  );
};
