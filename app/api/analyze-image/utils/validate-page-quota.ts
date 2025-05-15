import { CONFIG } from '@/config';
import { sendDiscordAlert } from '@/lib/discord/send-discord-notification';
import { getPagesAlreadyRedactedForBillingPeriod } from '@/lib/supabase/queries/get-pages-already-redacted-for-billing-period';
import { getSubscription } from '@/lib/supabase/queries/get-subscription';
import { recentDocumentCountByIpAddress } from '@/lib/supabase/queries/recent-document-count-by-ip-address';
import { Database } from '@/types/database';
import { DeviceInfo } from '@/types/device-info';
import { createApiResponse } from '@/utils/api-response';
import { logApiError, LogDomain } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { isNil } from 'lodash';
import { NextResponse } from 'next/server';

type DetermineNumPagesRemainingResponse = {
  numPagesRemaining?: number;
  errorResponse?: NextResponse;
};

export const validatePageQuota = async ({
  requestedNumPages,
  deviceInfo,
  ipAddress,
  supabase,
  domain,
  request,
  userId,
}: {
  requestedNumPages: number;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  userId?: string;
  supabase: SupabaseClient<Database>;
  domain: LogDomain;
  request: Request;
}): Promise<DetermineNumPagesRemainingResponse> => {
  if (isNil(userId)) {
    const { count: pagesRemainingToday, error } = await recentDocumentCountByIpAddress({
      supabase,
      ipAddress,
    });

    if (error) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Error getting recent document count by ip address',
        deviceInfo,
        variant: 'error',
      });
      logApiError({
        domain,
        message: 'Error getting recent document count by ip address',
        error,
        request,
      });
      return {
        errorResponse: createApiResponse({ code: '400-bad-request' }),
      };
    }

    if (requestedNumPages > 1) {
      return {
        errorResponse: createApiResponse({
          code: '429-too-many-requests',
          internalErrorCode: 'max-free-page-limit-reached',
        }),
      };
    }

    const numPagesRemaining = CONFIG.dailyRequestLimit - requestedNumPages - pagesRemainingToday;
    if (numPagesRemaining < 0) {
      return {
        errorResponse: createApiResponse({
          code: '429-too-many-requests',
          internalErrorCode: 'max-free-daily-limit-reached',
        }),
      };
    }

    return { numPagesRemaining };
  }

  const { subscription, subscriptionError } = await getSubscription({
    userId,
    supabase,
  });
  if (isNil(subscription) || subscriptionError) {
    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'Error getting subscription',
      deviceInfo,
      variant: 'error',
    });
    logApiError({
      domain,
      message: 'Error getting subscription',
      error: subscriptionError,
      request,
    });
    return {
      errorResponse: createApiResponse({ code: '400-bad-request' }),
    };
  }
  if (subscription.cancel_at_period_end) {
    return {
      errorResponse: createApiResponse({
        code: '429-too-many-requests',
        publicFacingMessage: 'Subscription has expired. Please renew your subscription.',
      }),
    };
  }
  const { pagesAlreadyRedacted, limit, error } = await getPagesAlreadyRedactedForBillingPeriod({
    supabase,
    userId,
    subscription,
  });
  if (error) {
    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'Error getting document count for billing period',
      deviceInfo,
      variant: 'error',
    });
    logApiError({
      domain,
      message: 'Error getting document count for billing period',
      error,
      request,
    });
    return { errorResponse: createApiResponse({ code: '400-bad-request' }) };
  }

  const numPagesRemaining = limit - pagesAlreadyRedacted - requestedNumPages;

  if (numPagesRemaining < 0) {
    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'Customer subscription limit reached',
      deviceInfo,
      variant: 'error',
      context: [
        {
          name: 'User Id',
          value: userId,
          inline: true,
        },
      ],
    });
    return {
      errorResponse: createApiResponse({
        code: '429-too-many-requests',
        internalErrorCode: 'max-subscription-plan-limit-reached',
      }),
    };
  }

  return { numPagesRemaining };
};
