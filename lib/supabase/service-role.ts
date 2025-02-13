/* https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app */

import { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';

export function supabaseServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
