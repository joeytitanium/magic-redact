import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, AnchorProps, Flex, MantineSize, ScrollArea, Title } from '@mantine/core';

const PADDING_Y: MantineSize = 'xl';
const ANCHOR_PROPS: AnchorProps = {
  underline: 'hover',
  fz: 'md',
  my: 4,
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Title order={4} c="var(--mantine-color-text)" fw={800} fz="lg">
    {children}
  </Title>
);

export const Navbar = ({ onClick }: { onClick: () => void }) => (
  <ScrollArea>
    <Flex direction="column" py={PADDING_Y}>
      <SectionTitle>Pages</SectionTitle>
      <Flex direction="column">
        <Anchor
          onClick={onClick}
          href={getRouteUrl({ to: '/' })}
          target="_blank"
          fz="sm"
          {...ANCHOR_PROPS}
        >
          Home
        </Anchor>
      </Flex>
    </Flex>
  </ScrollArea>
);
