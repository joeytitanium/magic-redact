import { LandingPageSearchParams } from '@/app/(main)/page';
import { Anchor, Container, Flex } from '@mantine/core';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { ReactNode } from 'react';

export const PRODUCT_HUNT_LAUNCH_DATE = new Date('2025-03-02');
export const UNEED_LAUNCH_DATE = new Date('2025-02-28');

type DateSegment = 'before' | 'today';
const METADATA: Record<DateSegment, (ref?: string) => { copy: ReactNode; url: string }> = {
  before: () => ({
    copy: "We're launching on ProductHunt soon! 🚀 Get notified and support us on launch day.",
    url: 'https://www.producthunt.com/products/magicredact',
  }),
  today: (ref) => ({
    copy:
      ref === 'producthunt' ? (
        <>
          Thanks for supporting us! 🚀 Use code <u>PHUNT30</u> for 30% off.
        </>
      ) : (
        "We're live on ProductHunt! 🚀 Please support us by voting for us."
      ),
    url: 'https://www.producthunt.com/posts/magicredact',
  }),
};

export const Banner = ({
  today = new Date(),
  searchParams,
}: {
  today?: Date;
  searchParams: LandingPageSearchParams;
}) => {
  if (isSameDay(today, UNEED_LAUNCH_DATE)) {
    return (
      <Container bg="blue" py={8} fluid>
        <Flex align="center" justify="center" h="100%">
          <Anchor
            c="white"
            ta="center"
            fw={600}
            href="https://www.uneed.best/tool/magicredact"
            target="_blank"
            underline="never"
          >
            We're live on Uneed! 🚀 Please support us by voting for us.
          </Anchor>
        </Flex>
      </Container>
    );
  }

  const isAfterLaunch = isAfter(today, PRODUCT_HUNT_LAUNCH_DATE);
  if (isAfterLaunch) {
    return null;
  }

  const isBeforeLaunch = isBefore(today, PRODUCT_HUNT_LAUNCH_DATE);
  const metadata = METADATA[isBeforeLaunch ? 'before' : 'today'](searchParams.ref);

  return (
    <Container bg="blue" py={8} fluid>
      <Flex align="center" justify="center" h="100%">
        <Anchor
          c="white"
          ta="center"
          fw={600}
          href={metadata.url}
          target="_blank"
          underline="never"
        >
          {metadata.copy}
        </Anchor>
      </Flex>
    </Container>
  );
};
