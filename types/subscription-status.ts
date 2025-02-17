export const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_STATUS_DISPLAY: Record<SubscriptionStatus, string> = {
  trialing: 'Trialing',
  active: 'Active',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete Expired',
  past_due: 'Past Due',
  unpaid: 'Unpaid',
  paused: 'Paused',
};
