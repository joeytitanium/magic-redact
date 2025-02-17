import { supabaseClient } from '@/lib/supabase/client';
import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, Button, Group } from '@mantine/core';
import { Session } from '@supabase/supabase-js';
import { isNil } from 'lodash';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';

export const Links = () => {
  const supabase = supabaseClient();
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    void (async () => {
      const { data } = supabase.auth.onAuthStateChange((evt, sess) => {
        setSession(sess);
      });

      return () => {
        data.subscription.unsubscribe();
      };
    })();
  }, [supabase.auth]);

  if (isNil(session?.user)) {
    return (
      <Group align="center">
        <Anchor component={NextLink} href={getRouteUrl({ to: '/sign-in' })} underline="never">
          Sign-in
        </Anchor>
        <Button
          component="a"
          variant="light"
          href={getRouteUrl({ to: '/sign-up' })}
          size="sm"
          radius="xl"
        >
          Sign-up
        </Button>
      </Group>
    );
  }

  return (
    <>
      <Anchor component={NextLink} href={getRouteUrl({ to: '/account' })} underline="never">
        Account
      </Anchor>
    </>
  );
};
