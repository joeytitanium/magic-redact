import { CONFIG } from '@/config';
import Stripe from 'stripe';

export const stripeServerClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: CONFIG.stripe.apiVersion,
  // Register this as an official Stripe plugin.
  // https://stripe.com/docs/building-plugins#setappinfo
  appInfo: {
    name: CONFIG.site.name,
    version: CONFIG.site.version,
    url: CONFIG.site.url,
  },
});
