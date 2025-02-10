import { CONFIG } from '@/config';
import { stripeClient } from '@/lib/stripe/client';
import { createCheckoutSession } from '@/lib/stripe/create-checkout-session';
import { supabaseClient } from '@/lib/supabase/client';
import { getRouteUrl } from '@/routing/get-route-url';
import { PriceId } from '@/types/product';
import { Button, Modal } from '@mantine/core';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';

export type PricingModalProps = {
  opened: boolean;
  onClose: () => void;
};

export const PricingModal = ({ opened, onClose }: PricingModalProps) => {
  const router = useRouter();
  const onClick = async (priceId: PriceId) => {
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
    <Modal opened={opened} onClose={onClose}>
      {CONFIG.products.map((product) => (
        <Button key={product.stripePriceId} onClick={() => onClick(product.stripePriceId)}>
          {product.name}
        </Button>
      ))}
    </Modal>
  );
};
