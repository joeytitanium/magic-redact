/** Remember to update the Sitemap if applicable */
export type Route =
  | { to: '/'; params?: never; fragment?: never }
  | { to: '/'; params: { segment: string }; fragment: 'via' };
