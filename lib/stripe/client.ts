import { loadStripe, Stripe } from '@stripe/stripe-js';
import { isNil } from 'lodash';

let stripePromise: Promise<Stripe | null>;

export const stripeClient = () => {
  if (isNil(stripePromise)) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
};
