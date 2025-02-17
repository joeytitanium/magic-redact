import { CONFIG } from '@/config';
import { getRouteUrl } from '@/routing/get-route-url';
import { RECTANGLE_SCHEMA } from '@/types/rectangle';
import { API_DATA_SCHEMA } from '@/utils/api-response';
import { LogDomain, logError } from '@/utils/logger';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { BoundingBoxWithMetadata } from './use-pdf';

const DOMAIN: LogDomain = 'use-analyze-image';

type Variables = {
  imageUrl: string;
};

const ANALYZE_SUCCESS_SCHEMA = z.object({
  rectangles: z.array(z.array(RECTANGLE_SCHEMA)),
});

export const useAnalyzeImage = (
  options: UseMutationOptions<BoundingBoxWithMetadata[][] | undefined, Error, Variables>
) => {
  const router = useRouter();

  return useMutation<BoundingBoxWithMetadata[][] | undefined, Error, Variables>({
    mutationFn: async (args) => {
      try {
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: args.imageUrl }),
        });
        const data = await response.json();
        const parsed = API_DATA_SCHEMA(ANALYZE_SUCCESS_SCHEMA).parse(data);
        if (parsed.success) {
          const rectangles: BoundingBoxWithMetadata[][] = parsed.data.rectangles.map((page) =>
            page.map((r) => ({ ...r, id: crypto.randomUUID(), source: 'server' }))
          );
          return rectangles;
        }

        if (parsed.internalErrorCode === 'max-free-daily-limit-reached') {
          modals.openConfirmModal({
            title: 'Daily limit reached',
            children: (
              <Text size="sm">
                You have reached the daily limit. If you'd like to automatically redact more
                documents please check out our subscription plans.
              </Text>
            ),
            labels: { confirm: 'See Plans', cancel: 'Cancel' },
            onConfirm: () => router.push(getRouteUrl({ to: '/plans' })),
          });
          return undefined;
        }

        if (parsed.internalErrorCode === 'max-free-page-limit-reached') {
          modals.openConfirmModal({
            title: 'Subscription plan required',
            children: (
              <Text size="sm">
                Only subscription plans can analyze documents with more than 1 page. If you'd like
                to analyze more pages please check out our subscription plans.
              </Text>
            ),
            labels: { confirm: 'See Plans', cancel: 'Cancel' },
            onConfirm: () => router.push(getRouteUrl({ to: '/plans' })),
          });
          return undefined;
        }

        if (parsed.internalErrorCode === 'max-subscription-plan-limit-reached') {
          modals.openConfirmModal({
            title: 'Subscription limit reached',
            children: (
              <>
                <Text size="sm">
                  You have reached the subscription limit. You must wait until the next billing
                  period to continue.
                </Text>
                <Text mt="xs" size="sm">
                  If you'd like to upgrade please reach out to me at{' '}
                  <a href={`mailto:${CONFIG.support.email}`}>{CONFIG.support.email}</a>.
                </Text>
              </>
            ),
            labels: { confirm: 'Send email', cancel: 'Got it' },
            onConfirm: () => {
              window.open(`mailto:${CONFIG.support.email}`, '_blank');
            },
          });
          return undefined;
        }

        throw new Error('An unknown error has occurred.');
      } catch (err) {
        logError({ domain: DOMAIN, message: 'Error in useAnalyzeImage', error: err });
        throw err;
      }
    },
    onError: (error, variables, context) => {
      logError({ domain: DOMAIN, message: 'Error in useAnalyzeImage', error });
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze image. Please try again.',
        color: 'red',
      });
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
