import { CONFIG } from '@/config';
import { createStripePortalUrl } from '@/lib/stripe/server-actions/create-stripe-portal-url';
import { supabaseServerClient } from '@/lib/supabase/server';
import { getRouteUrl } from '@/routing/get-route-url';
import { SUBSCRIPTION_STATUS_DISPLAY } from '@/types/subscription-status';
import { Box, Button, Container, Divider, Flex, Group, Text, Title } from '@mantine/core';
import { format } from 'date-fns';
import { isNil } from 'lodash';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

// TODO: Show number of pages remaining for the billing period

const LabelValueCell = ({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode | undefined;
}) => {
  if (!value) {
    return null;
  }

  return (
    <Box>
      <Flex my="xs" justify="space-between" align="center">
        <Text fw="bold">{label}</Text>
        {typeof value === 'string' ? <Text>{value}</Text> : value}
      </Flex>
      <Divider />
    </Box>
  );
};

const AccountPage = async () => {
  const supabase = await supabaseServerClient();
  const { data: profile } = await supabase.from('profiles').select('*').maybeSingle();
  if (!profile) {
    redirect(getRouteUrl({ to: '/sign-up' }));
  }

  const { data: subscriptions } = await supabase.from('subscriptions').select('*');

  const { url: stripePortalUrl } = await createStripePortalUrl();

  const subscribedProduct = CONFIG.products.find(
    (product) => product.stripePriceId === subscriptions?.[0]?.price_id
  );

  return (
    <Container size="sm" my="xl">
      <Title mb="sm">Account</Title>
      <LabelValueCell label="Name" value={profile.name} />
      <LabelValueCell label="Email" value={profile.email} />
      <Title order={2} mt="xl" mb="sm">
        Subscription
      </Title>
      {subscriptions?.map((subscription) => (
        <Box key={subscription.id}>
          <LabelValueCell
            label="Status"
            value={
              subscription.status ? SUBSCRIPTION_STATUS_DISPLAY[subscription.status] : undefined
            }
          />
          {!isNil(subscription.current_period_end) && (
            <LabelValueCell
              label="Next billing date"
              value={format(new Date(subscription.current_period_end), 'MM/dd/yyyy')}
            />
          )}
          {!isNil(subscribedProduct) && (
            <LabelValueCell label="Plan" value={subscribedProduct.name} />
          )}
          {!isNil(stripePortalUrl) && (
            <Group justify="end" py="lg">
              <Button component="a" href={stripePortalUrl} target="_blank" size="sm">
                Manage subscription
              </Button>
            </Group>
          )}
        </Box>
      ))}
      {subscriptions?.length === 0 && (
        <Button component="a" href={getRouteUrl({ to: '/plans' })} size="sm">
          View plans
        </Button>
      )}
    </Container>
  );
};

export default AccountPage;
