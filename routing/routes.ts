/** Remember to update the Sitemap if applicable */
export type Route =
  | { to: '/'; params?: never; fragment?: never }
  | { to: '/pricing'; params?: never; fragment?: never }
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
