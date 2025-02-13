import { supabaseServerClient } from '@/lib/supabase/server';
import { getRouteUrl } from '@/routing/get-route-url';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';

const OrderSuccessPage = async () => {
  const supabase = await supabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const userId = userData.user?.id;
  if (!userId) {
    redirect(getRouteUrl({ to: '/sign-up' }));
  }

  return (
    <Container size="xs">
      <Stack justify="center" maw={400} h="70dvh">
        <Title mt="xl" ta="center">
          Purchase successful.
        </Title>
        <Text ta="center" mb="xl" inline>
          Your subscription has been successfully created.
        </Text>

        <Button component={NextLink} href={getRouteUrl({ to: '/' })}>
          Let's get started
        </Button>
      </Stack>
    </Container>
  );
};

export default OrderSuccessPage;
