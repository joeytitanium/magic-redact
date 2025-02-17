import { CallToAction01 } from '@/components/titanium/mantine/blocks/call-to-action';
import { Faq01 } from '@/components/titanium/mantine/blocks/faq-01';
import { Footer01 } from '@/components/titanium/mantine/blocks/footer-01';
import { Hero01, Hero01Props } from '@/components/titanium/mantine/blocks/hero-01';
import { HowItWorks01 } from '@/components/titanium/mantine/blocks/how-it-works';
import { Pricing02 } from '@/components/titanium/mantine/blocks/pricing';
import { Security } from '@/components/titanium/mantine/blocks/security';
import { UseCases01 } from '@/components/titanium/mantine/blocks/use-cases-01';
import { CONFIG } from '@/config';
import { stripeClient } from '@/lib/stripe/client';
import { createCheckoutSession } from '@/lib/stripe/create-checkout-session';
import { supabaseClient } from '@/lib/supabase/client';
import { getRouteUrl } from '@/routing/get-route-url';
import { Container } from '@mantine/core';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';

type LandingPageProps = Hero01Props;

export const LandingPage = ({ setFile, onClickSampleImage }: LandingPageProps) => {
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
      <Hero01 setFile={setFile} onClickSampleImage={onClickSampleImage} />
      <UseCases01 />
      <HowItWorks01 />
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
      <Security />
      <Faq01 />
      <CallToAction01 />
      <Footer01 />
    </Container>
  );
};
