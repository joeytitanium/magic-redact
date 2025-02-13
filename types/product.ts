import { CONFIG } from '@/config';
import Stripe from 'stripe';

export const PRICE_IDS = CONFIG.products.map((x) => x.stripePriceId) as [string, ...string[]];

export type Product = {
  stripePriceId: string;
  name: string;
  price: number;
  description: string;
  mode: Stripe.Checkout.SessionCreateParams.Mode;
  trialPeriodDays: number | undefined;
  billingCycleDocumentPageLimit: number;
};
