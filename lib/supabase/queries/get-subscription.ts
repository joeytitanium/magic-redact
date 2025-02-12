import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { isNil } from 'lodash';

export const getSubscription = async ({
  userId,
  supabase,
}: {
  userId: string | undefined;
  supabase: SupabaseClient<Database>;
}) => {
  if (isNil(userId)) {
    return { subscription: undefined, subscriptionError: undefined };
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { subscription, subscriptionError };
};
