import { CONFIG } from '@/config';
import { Database, SubscriptionRecord } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

type DocumentCountForBillingPeriodResponse =
  | {
      pageCount: number;
      limit: number;
      error?: never;
    }
  | {
      pageCount?: never;
      limit?: never;
      error: Error;
    };

export const documentCountForBillingPeriod = async ({
  supabase,
  userId,
  subscription,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  subscription: SubscriptionRecord;
}): Promise<DocumentCountForBillingPeriodResponse> => {
  const { data, error } = await supabase
    .from('documents')
    .select('num_pages.sum()')
    .eq('user_id', userId)
    .gte('created_at', subscription.current_period_start)
    .lt('created_at', subscription.current_period_end);
  const sum = data?.[0]?.sum ?? 0;

  if (error) {
    return { error };
  }

  const product = CONFIG.products.find((p) => p.stripePriceId === subscription.price_id);
  if (!product) {
    return { error: new Error('Product not found') };
  }

  return { pageCount: sum, limit: product.billingCycleDocumentPageLimit };
};
