import { CONFIG } from '@/config';
import { Database, Subscription } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

type DocumentCountForBillingPeriodResponse =
  | {
      pagesAlreadyRedacted: number;
      limit: number;
      error?: never;
    }
  | {
      pagesAlreadyRedacted?: never;
      limit?: never;
      error: Error;
    };

export const getPagesAlreadyRedactedForBillingPeriod = async ({
  supabase,
  userId,
  subscription,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  subscription: Subscription;
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

  return { pagesAlreadyRedacted: sum, limit: product.billingCycleDocumentPageLimit };
};
