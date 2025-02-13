/** Remember to update the Sitemap if applicable */
export type Route =
  | {
      to: '/';
      params?: { pricing?: string };
      fragment?: never;
    }
  | { to: '/order-success'; params?: { priceId?: string }; fragment?: never }
  | { to: '/privacy'; params?: never; fragment?: never }
  | { to: '/terms'; params?: never; fragment?: never }
  | {
      to: '/sign-up';
      params?: {
        redirect?: 'checkout';
        priceId?: string;
      };
      fragment?: never;
    }
  | {
      to: '/sign-in';
      params?: {
        priceId?: string;
      };
      fragment?: never;
    }
  | { to: '/'; params: { segment: string }; fragment: 'via' };
