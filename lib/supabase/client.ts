/* https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app */

import { Database } from '@/types/database';
import { createBrowserClient } from '@supabase/ssr';

export function supabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
