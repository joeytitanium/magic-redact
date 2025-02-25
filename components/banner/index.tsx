import { Anchor, Container, Flex } from '@mantine/core';
import { isAfter, isBefore } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

const LAUNCH_DATE = new Date('2025-03-02');

const SEARCH_PARAMS_SCHEMA = z.object({
  ref: z.string().optional(),
});

type DateSegment = 'before' | 'today';
const METADATA: Record<DateSegment, (ref?: string) => { copy: string; url: string }> = {
  before: () => ({
    copy: "We're launching on ProductHunt soon! 🚀 Get notified and support us on launch day.",
    url: 'https://www.producthunt.com/products/magicredact',
  }),
  today: (ref) => ({
    copy:
      ref === 'producthunt'
        ? 'Thanks for supporting us! 🚀 Use code PHUNT30 for 30% off.'
        : "We're live on ProductHunt! 🚀 Please support us by voting for us.",
    url: 'https://www.producthunt.com/posts/magicredact',
  }),
};

export const Banner = ({ today = new Date() }: { today?: Date }) => {
  const searchParams = useSearchParams();
  const searchParamsSchema = SEARCH_PARAMS_SCHEMA.safeParse(
    Object.fromEntries(searchParams.entries())
  );
  const isAfterLaunch = isAfter(today, LAUNCH_DATE);
  if (isAfterLaunch) {
    return null;
  }

  const isBeforeLaunch = isBefore(today, LAUNCH_DATE);
  const metadata = METADATA[isBeforeLaunch ? 'before' : 'today'](searchParamsSchema.data?.ref);

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
