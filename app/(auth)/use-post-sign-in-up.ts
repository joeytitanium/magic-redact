import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { revalidateUserSession } from './_utils/revalidate-user-session';

export const usePostSignInUp = ({
  variantId,
  routeTo,
}: {
  variantId: number | undefined;
  routeTo: string;
}) => {
  const router = useRouter();

  const handleSignInUp = async ({ user }: { user: User | null }) => {
    if (user?.id && variantId) {
      // void router.push(
      //   generatePersonalizedLemonSqueezyUrl({
      //     variantId,
      //     userId: user.id,
      //     email: user.email,
      //     name: user.user_metadata.name,
      //   })
      // );
    } else {
      /* TODO: Perhaps find a better way.
       * Without this it still thinks there is no user.
       * router.refresh() invalidates cache but we need a different path
       * router.push() doesnt have options to revalidate cache either.
       */
      await revalidateUserSession(routeTo);
      router.push(routeTo);
    }
  };

  return { handleSignInUp };
};
