/** Remember to update the Sitemap if applicable */
export type Route =
  | {
      to: '/';
      params?: never;
      fragment?:
        | 'editor'
        | 'use-cases'
        | 'how-it-works'
        | 'plans-and-features'
        | 'frequently-asked-questions';
    }
  | { to: '/plans'; params?: never; fragment?: never }
  | { to: '/account'; params?: never; fragment?: never }
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
