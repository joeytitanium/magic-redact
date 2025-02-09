import { stripeClient } from '@/lib/stripe/client';
import { supabaseClient } from '@/lib/supabase/client';
import { getUser } from '@/lib/supabase/queries/get-user';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export const usePostSignInUp = ({
  // variantId,
  routeTo,
}: {
  // variantId: number | undefined;
  routeTo: string;
}) => {
  const router = useRouter();

  const handleSignInUp = async ({ user: authUser }: { user: User }) => {
    // const user = await getUser(supabaseClient());
    // if (!user?.stripe_customer_id) {
    //   const stripe = await stripeClient();
    //   // const customer = await stripe
    // }
    //  if (user.id && variantId) {
    //   void router.push(
    //     generatePersonalizedLemonSqueezyUrl({
    //       variantId,
    //       userId: user.id,
    //       email: user.email,
    //       name: user.user_metadata.name,
    //     })
    //   );
    // } else {
    //   /*
    //     https://supabase.com/docs/guides/auth/server-side/nextjs
    //    */
    //   await revalidateUserSession(routeTo);
    //   router.push(routeTo);
    // }
  };

  return { handleSignInUp };
};
