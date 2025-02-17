'use client';

import { Pricing02 } from '@/components/titanium/mantine/blocks/pricing';
import { CONFIG } from '@/config';
import { stripeClient } from '@/lib/stripe/client';
import { createCheckoutSession } from '@/lib/stripe/server-actions/create-checkout-session';
import { supabaseClient } from '@/lib/supabase/client';
import { getRouteUrl } from '@/routing/get-route-url';
import { Container } from '@mantine/core';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  const onClick = async (priceId: string) => {
    const supabase = supabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (isNil(userData.user)) {
      router.push(getRouteUrl({ to: '/sign-up', params: { priceId } }));
      return;
    }

    const { sessionId } = await createCheckoutSession({ priceId });
    const stripe = await stripeClient();
    void stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Container fluid px={0}>
      <Pricing02
        callToActions={[
          null,
          ...CONFIG.products.map((x) => ({
            key: x.stripePriceId,
            label: 'Get started',
            onClick: () => onClick(x.stripePriceId),
          })),
        ]}
      />
    </Container>
  );
}
