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
      /*
        Supabase docs does server-side revalidation but we'll do it this way
        https://supabase.com/docs/guides/auth/server-side/nextjs
       */
      await revalidateUserSession(routeTo);
      router.push(routeTo);
    }
  };

  return { handleSignInUp };
};
