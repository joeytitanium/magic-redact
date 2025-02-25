import { Anchor, Container, Flex } from '@mantine/core';
import { isAfter, isSameDay } from 'date-fns';

const LAUNCH_DATE = new Date('2025-03-02');

export const Banner = ({ today = new Date() }: { today?: Date }) => {
  const isAfterLaunch = isAfter(today, LAUNCH_DATE);
  if (isAfterLaunch) {
    return null;
  }

  const bannerCopy = (() => {
    if (isSameDay(today, LAUNCH_DATE)) {
      return "We're live on ProductHunt! 🚀 Please support us by voting for us.";
    }
    return "We're launching on ProductHunt soon! 🚀 Get notified and support us on launch day.";
  })();

  return (
    <Container bg="blue" py={8} fluid>
      <Flex align="center" justify="center" h="100%">
        <Anchor
          c="white"
          ta="center"
          fw={600}
          href="https://www.producthunt.com/products/magicredact"
          target="_blank"
          underline="never"
        >
          {bannerCopy}
        </Anchor>
      </Flex>
    </Container>
  );
};
