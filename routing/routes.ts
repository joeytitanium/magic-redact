/** Remember to update the Sitemap if applicable */
export type Route =
  | {
      to: '/';
      params?: { pricing?: boolean };
      fragment?: never;
    }
  | { to: '/privacy'; params?: never; fragment?: never }
  | { to: '/terms'; params?: never; fragment?: never }
  | {
      to: '/sign-up';
      params?: {
        redirect?: 'checkout';
        variantId?: string;
        priceId?: string;
      };
      fragment?: never;
    }
  | {
      to: '/sign-in';
      params?: {
        variantId?: string;
      };
      fragment?: never;
    }
  | { to: '/'; params: { segment: string }; fragment: 'via' };
