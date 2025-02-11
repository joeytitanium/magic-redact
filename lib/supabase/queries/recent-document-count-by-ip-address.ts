import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { formatISO, subHours } from 'date-fns';

type RecentDocumentCountByIpAddressResponse =
  | {
      count: number;
      error?: never;
    }
  | {
      count?: never;
      error: Error;
    };

export const recentDocumentCountByIpAddress = async ({
  supabase,
  ipAddress,
  hoursAgo = 24,
}: {
  supabase: SupabaseClient<Database>;
  ipAddress: string;
  hoursAgo?: number;
}): Promise<RecentDocumentCountByIpAddressResponse> => {
  const { data, error } = await supabase
    .from('documents')
    .select('count', { count: 'exact' })
    .eq('ip_address', ipAddress)
    .is('user_id', null)
    .gte('created_at', formatISO(subHours(new Date(), hoursAgo)))
    .single();

  if (error) {
    return { error };
  }

  return { count: data.count };
};
