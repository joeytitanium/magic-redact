import { handleSignUp } from '@/app/(auth)/_utils/handle-sign-up';
import { CONFIG } from '@/config';
import { supabaseClient } from '@/lib/supabase/client';
import { logError } from '@/utils/logger';
import { notifications } from '@mantine/notifications';
import { GoogleLogin } from '@react-oauth/google';
import { Session, User } from '@supabase/supabase-js';

type Props = {
  type: 'signup' | 'signin';
  onSuccess: (data: { user: User; session: Session }) => void;
};

export const SocialLogin = ({ type, onSuccess }: Props) => {
  const supabase = supabaseClient();

  return (
    <GoogleLogin
      theme="filled_black"
      use_fedcm_for_prompt
      text={type === 'signin' ? 'signin_with' : 'signup_with'}
      login_uri={CONFIG.auth.google.callbackUrl}
      onSuccess={async (response) => {
        if (!response.credential) {
          console.error(`Missing credential: ${JSON.stringify(response, null, '\t')}`);
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
          console.error('Error signing in with Google', signInError.message);
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
  );
};
