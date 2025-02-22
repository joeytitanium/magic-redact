'use server';

import { stripeServerClient } from '@/lib/stripe/server';
import { supabaseServerClient } from '@/lib/supabase/server';
import { getRouteUrl } from '@/routing/get-route-url';
import { LogDomain, logError } from '@/utils/logger';
import { isNil } from 'lodash';

const DOMAIN: LogDomain = 'create-stripe-portal-url';

type CreateStripePortalUrlResponse =
  | {
      url: string;
      error?: never;
    }
  | {
      url?: never;
      error: Error;
    };

export const createStripePortalUrl = async (): Promise<CreateStripePortalUrlResponse> => {
  try {
    const supabase = await supabaseServerClient();
    const { error, data: profile } = await supabase.from('profiles').select('*').maybeSingle();

    if (!profile) {
      if (error) {
        logError({
          domain: DOMAIN,
          message: 'Could not get user session.',
          error,
        });
      }
      return { error: new Error('Could not get user session.') };
    }

    const stripeCustomerId = profile.stripe_customer_id;
    if (isNil(stripeCustomerId)) {
      return { error: new Error('Stripe customer id not found') };
    }

    try {
      const { url } = await stripeServerClient.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: getRouteUrl({ to: '/account' }, { absoluteUrl: true }),
      });
      if (!url) {
        return { error: new Error('Could not create billing portal') };
      }
      return { url };
    } catch (err) {
      logError({
        domain: DOMAIN,
        message: 'Could not create billing portal',
        error: err,
      });
      return { error: new Error('Could not create billing portal') };
    }
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Could not create billing portal',
      error,
    });
    return { error: new Error('Could not create billing portal') };
  }
};
