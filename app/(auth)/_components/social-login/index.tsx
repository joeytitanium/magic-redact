import { handleSignUp } from '@/app/(auth)/_utils/handle-sign-up';
import { CONFIG } from '@/config';
import { supabaseClient } from '@/lib/supabase/client';
import { logError } from '@/utils/logger';
import { Box } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { GoogleLogin } from '@react-oauth/google';
import { Session, User } from '@supabase/supabase-js';

type Props = {
  type: 'signup' | 'signin';
  onSuccess: (data: { user: User; session: Session }) => void;
};

export const SocialLogin = ({ type, onSuccess }: Props) => {
  const supabase = supabaseClient();
  const { ref, width } = useElementSize();

  return (
    <Box w="100%" ref={ref}>
      <GoogleLogin
        width={width}
        use_fedcm_for_prompt
        text={type === 'signin' ? 'signin_with' : 'signup_with'}
        login_uri={CONFIG.auth.google.callbackUrl}
        onSuccess={async (response) => {
          if (!response.credential) {
            logError({
              message: 'Missing Google credential',
              context: { response },
            });
            notifications.show({
              message: 'Error signing in with Google',
              color: 'red',
            });
            return;
          }

          const { data: signInData, error: signInError } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          });

          if (signInError) {
            logError({ message: 'Error signing in with Google', error: signInError });
            notifications.show({
              message: 'Error signing in with Google',
              color: 'red',
            });
            return;
          }
          const { user } = signInData;

          await handleSignUp({
            email: user.email ?? 'missing email',
            name: user.user_metadata.name,
            source: 'Google',
            userId: user.id,
            avatarUrl: user.user_metadata.avatar_url,
          });

          onSuccess(signInData);
        }}
        onError={() => {
          logError({
            message: 'Error signing in with Google',
          });
          notifications.show({
            message: 'Error signing in with Google',
            color: 'red',
          });
        }}
      />
    </Box>
  );
};
