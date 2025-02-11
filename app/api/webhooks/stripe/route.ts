import { stripeServerClient } from '@/lib/stripe/server';
import { supabaseServiceRoleClient } from '@/lib/supabase/service-role';
import { createApiResponse } from '@/utils/api-response';
import { logApiError, LogDomain, logError, logMessage } from '@/utils/logger';
import { isNil } from 'lodash';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const DOMAIN: LogDomain = 'stripe-webhook';

const relevantEvents = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.pending_update_applied',
  'customer.subscription.pending_update_expired',
  'customer.subscription.trial_will_end',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'invoice.upcoming',
  'invoice.marked_uncollectible',
  'invoice.payment_succeeded',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
]);

export const toDateTime = (secs: number) => {
  const t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

const processEvent = async (event: Stripe.Event) => {
  const { customer: customerId } = event.data.object as { customer: string };

  if (typeof customerId !== 'string') {
    logError({
      domain: DOMAIN,
      message: 'Customer Id is not a string',
    });
    throw new Error('Customer Id is not a string');
  }

  const supabase = supabaseServiceRoleClient();
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (isNil(user)) {
    logError({
      domain: DOMAIN,
      message: 'User not found',
    });
    throw new Error('User not found');
  }

  const subscriptions = await stripeServerClient.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: 'all',
    expand: ['data.default_payment_method'],
  });

  if (subscriptions.data.length === 0) {
    logError({
      domain: DOMAIN,
      message: 'No subscriptions found',
    });
    throw new Error('No subscriptions found');
  }

  const subscription = subscriptions.data[0];

  const paymentMethod =
    subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
      ? {
          brand: subscription.default_payment_method.card?.brand ?? null,
          last4: subscription.default_payment_method.card?.last4 ?? null,
        }
      : null;

  const { error: upsertError } = await supabase.from('subscriptions').upsert({
    id: subscription.id,
    user_id: user.id,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? toDateTime(subscription.cancel_at).toISOString() : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(subscription.current_period_start).toISOString(),
    current_period_end: toDateTime(subscription.current_period_end).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at ? toDateTime(subscription.ended_at).toISOString() : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end ? toDateTime(subscription.trial_end).toISOString() : null,
    brand: paymentMethod?.brand,
    last4: paymentMethod?.last4,
  });

  if (upsertError) {
    logError({
      domain: DOMAIN,
      message: 'Error upserting subscription',
      error: upsertError,
    });
    throw new Error('Error upserting subscription');
  }

  logMessage({
    domain: DOMAIN,
    message: 'Subscription upserted',
    context: {
      event: event.type,
      status: subscription.status,
      customerId,
      userId: user.id,
      subscriptionId: subscription.id,
    },
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = (await headers()).get('Stripe-Signature');
    if (isNil(sig) || typeof sig !== 'string') {
      logApiError({
        domain: DOMAIN,
        request,
        message: 'Invalid or missing signature',
      });
      return createApiResponse({
        type: '400-bad-request',
      });
    }

    const event = stripeServerClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (!relevantEvents.has(event.type)) {
      return NextResponse.json({ received: true });
    }

    await processEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    logApiError({
      domain: DOMAIN,
      message: 'Error handling Stripe webhook',
      request,
      error,
    });
    return createApiResponse({
      type: '400-bad-request',
    });
  }
}
