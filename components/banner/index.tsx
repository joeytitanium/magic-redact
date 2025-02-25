import { Anchor, Container, Flex } from '@mantine/core';
import { isAfter, isBefore } from 'date-fns';

const LAUNCH_DATE = new Date('2025-03-02');

type DateSegment = 'before' | 'today';
const METADATA: Record<DateSegment, { copy: string; url: string }> = {
  before: {
    copy: "We're launching on ProductHunt soon! 🚀 Get notified and support us on launch day.",
    url: 'https://www.producthunt.com/products/magicredact',
  },
  today: {
    copy: "We're live on ProductHunt! 🚀 Please support us by voting for us.",
    url: 'https://www.producthunt.com/posts/magicredact',
  },
};

export const Banner = ({ today = new Date() }: { today?: Date }) => {
  const isAfterLaunch = isAfter(today, LAUNCH_DATE);
  if (isAfterLaunch) {
    return null;
  }

  const isBeforeLaunch = isBefore(today, LAUNCH_DATE);
  const metadata = METADATA[isBeforeLaunch ? 'before' : 'today'];

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
