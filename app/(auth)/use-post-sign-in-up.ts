import { stripeClient } from '@/lib/stripe/client';
import { createCheckoutSession } from '@/lib/stripe/server-actions/create-checkout-session';
import { getRouteUrl } from '@/routing/get-route-url';
import { isNil } from 'lodash';
import { redirect } from 'next/navigation';

export const usePostSignInUp = ({ priceId }: { priceId: string | undefined }) => {
  const handleSignInUp = async () => {
    if (!isNil(priceId)) {
      const stripe = await stripeClient();
      const { sessionId } = await createCheckoutSession({ priceId });
      void stripe?.redirectToCheckout({ sessionId });
      return;
    }

    redirect(getRouteUrl({ to: '/' }));

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
