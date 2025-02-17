import { ColorSchemeButton } from '@/components/color-scheme-button';
import { Logo } from '@/components/logo';
import { CONFIG } from '@/config';
import { getRouteUrl } from '@/routing/get-route-url';
import { Box, Container, Flex } from '@mantine/core';
import clsx from 'clsx';
import NextLink from 'next/link';
import classes from './index.module.css';
import { Links } from './links';

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
        <Logo width={166} height={24} style={{ flexShrink: 0 }} priority />
        <Flex justify="end" align="center" w="100%">
          <Links />
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
        <Flex align="center" gap="lg">
          <Links />
          <ColorSchemeButton />
        </Flex>
      </Flex>
    </Container>
  </Box>
);
