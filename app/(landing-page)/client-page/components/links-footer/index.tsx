import { CONFIG } from '@/config';
import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, Group, GroupProps } from '@mantine/core';
import NextLink from 'next/link';

const COMMON_PROPS: GroupProps = {
  h: CONFIG.layout.footerHeight,
  px: 'xl',
};

const Links = () => (
  <>
    <Anchor component={NextLink} href={getRouteUrl({ to: '/' })} underline="hover">
      Pricing
    </Anchor>
    <Anchor component={NextLink} href={getRouteUrl({ to: '/privacy' })} underline="hover">
      Privacy
    </Anchor>
    <Anchor component={NextLink} href={getRouteUrl({ to: '/terms' })} underline="hover">
      Terms
    </Anchor>
  </>
);

export const LinksFooter = (groupProps: GroupProps) => (
  <>
    <Group
      {...groupProps}
      {...COMMON_PROPS}
      justify="center"
      hiddenFrom={CONFIG.layout.mobileBreakpoint}
    >
      <Links />
    </Group>
    <Group
      {...groupProps}
      {...COMMON_PROPS}
      justify="end"
      visibleFrom={CONFIG.layout.mobileBreakpoint}
    >
      <Links />
    </Group>
  </>
);
