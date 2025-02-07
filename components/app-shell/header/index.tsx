import { ColorSchemeButton } from '@/components/color-scheme-button';
import { Logo } from '@/components/logo';
import { CONFIG } from '@/config';
import { getRouteUrl } from '@/routing/get-route-url';
import { Box, Container, Flex } from '@mantine/core';
import clsx from 'clsx';
import NextLink from 'next/link';
import classes from './index.module.css';

export type MobileHeaderProps = {
  // onToggle: () => void;
  // opened: boolean;
};

// const HeaderButton = ({
//   children,
//   href,
//   ...actionIconProps
// }: ActionIconProps & { children: ReactNode; href: string }) => (
//   <ActionIcon
//     component="a"
//     href={href}
//     target="_blank"
//     w={32}
//     h={32}
//     p={0}
//     variant="subtle"
//     {...actionIconProps}
//   >
//     {children}
//   </ActionIcon>
// );

export const MobileHeader = () => (
  <Box
    component="header"
    className={clsx('frosted-glass', classes.header)}
    hiddenFrom={CONFIG.layout.mobileBreakpoint}
  >
    <Container
      size={CONFIG.layout.containerSize}
      h="100%"
      px="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Flex justify="space-between" align="center" h="100%" gap="xs">
        {/* <Burger size="sm" opened={opened} onClick={onToggle} /> */}
        <Logo width={166} height={24} style={{ flexShrink: 0 }} priority />
        <Flex justify="end" align="center" w="100%">
          <ColorSchemeButton />
        </Flex>
      </Flex>
    </Container>
  </Box>
);

export const DesktopHeader = () => (
  <Box
    component="header"
    className={clsx('frosted-glass', classes.header)}
    visibleFrom={CONFIG.layout.mobileBreakpoint}
  >
    <Container size={CONFIG.layout.containerSize} h="100%" fluid>
      <Flex justify="space-between" align="center" h="100%" gap="xs">
        <Flex align="center" gap={8}>
          <NextLink
            href={getRouteUrl({ to: '/' })}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Logo priority />
          </NextLink>
        </Flex>
        <Flex align="center">
          <ColorSchemeButton />
        </Flex>
      </Flex>
    </Container>
  </Box>
);
