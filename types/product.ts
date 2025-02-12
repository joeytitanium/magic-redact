import Stripe from 'stripe';

export const PRICE_IDS = ['price_1Qq4g7Am5zvWraF48ljnp1BH', 'TODO'] as const;
export type PriceId = (typeof PRICE_IDS)[number];

export type Product = {
  stripePriceId: PriceId;
  name: string;
  price: number;
  description: string;
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  trialPeriodDays: number | undefined;
  billingCycleDocumentPageLimit: number;
};
