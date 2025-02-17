'use server';

import { CONFIG } from '@/config';
import { stripeServerClient } from '@/lib/stripe/server';
import { supabaseServerClient } from '@/lib/supabase/server';
import { getRouteUrl } from '@/routing/get-route-url';
import { Database } from '@/types/database';
import { calculateTrialEndUnixTimestamp } from '@/utils/calculate-stripe-trial-end-unix-timestamp';
import { LogDomain, logError } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { isNil } from 'lodash';
import Stripe from 'stripe';

const DOMAIN: LogDomain = 'create-checkout-session';

const createCustomerAndUpdateProfile = async ({
  name,
  email,
  userId,
  profileId,
  supabase,
}: {
  name: string;
  email: string;
  userId: string;
  profileId: string;
  supabase: SupabaseClient<Database>;
}) => {
  try {
    const customer = await stripeServerClient.customers.create({
      email,
      name,
      metadata: {
        id: userId,
        profileId,
      },
    });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customer.id,
      })
      .eq('id', userId);
    if (updateError) {
      logError({
        domain: DOMAIN,
        message: 'Failed to update profile',
        error: updateError,
        context: { userId, profileId },
      });
      throw new Error('Failed to update profile');
    }

    return customer.id;
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Failed to create customer',
      error,
      context: { userId, profileId },
    });
    throw new Error('Failed to create customer');
  }
};

const getStripeCustomerId = async ({
  userId,
  supabase,
}: {
  userId: string;
  supabase: SupabaseClient<Database>;
}) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!profile) {
      logError({
        domain: DOMAIN,
        message: 'Profile not found',
        error: profileError,
        context: { userId },
      });

      throw new Error('Profile not found');
    }

    const existingCustomerId = profile.stripe_customer_id;
    if (!isNil(existingCustomerId)) {
      return { customerId: existingCustomerId, profile };
    }

    const customerId = await createCustomerAndUpdateProfile({
      name: profile.name,
      email: profile.email,
      userId,
      profileId: profile.id,
      supabase,
    });
    return { customerId, profile };
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Failed to get stripe customer id',
      error,
      context: { userId },
    });
    throw new Error('Failed to get stripe customer id');
  }
};

// TODO: Don't throw, return error object
export const createCheckoutSession = async ({ priceId }: { priceId: string }) => {
  const product = CONFIG.products.find((p) => p.stripePriceId === priceId);
  if (!product) {
    logError({
      domain: DOMAIN,
      message: 'Product not found',
      context: { priceId },
    });
    throw new Error('Product not found');
  }

  const supabase = await supabaseServerClient();
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError) {
    logError({
      domain: DOMAIN,
      message: 'User not found',
      error: userError,
    });
    throw new Error('User not found');
  }
  const { user } = userData;

  const { customerId } = await getStripeCustomerId({
    userId: user.id,
    supabase,
  });

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer: customerId,
    success_url: getRouteUrl({ to: '/order-success', params: { priceId } }, { absoluteUrl: true }),
    customer_update: {
      address: 'auto',
    },
    mode: product.mode,
    subscription_data: product.trialPeriodDays
      ? {
          trial_period_days: calculateTrialEndUnixTimestamp(product.trialPeriodDays),
        }
      : undefined,
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
  };

  try {
    const session = await stripeServerClient.checkout.sessions.create(checkoutParams);
    return { sessionId: session.id };
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Failed to create checkout session',
      error,
      context: { userId: user.id },
    });
    throw new Error('Failed to create checkout session');
  }
};
