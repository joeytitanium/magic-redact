'use client';

import { CONFIG } from '@/config';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { DesktopHeader, MobileHeader } from './header';
import { Navbar } from './navbar';

export const AppShell = ({
  children,
  forceCollapseNavbar = false,
}: {
  children: ReactNode;
  forceCollapseNavbar?: boolean;
}) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineAppShell
      header={{ height: CONFIG.layout.headerHeight }}
      navbar={{
        width: 240,
        breakpoint: CONFIG.layout.mobileBreakpoint,
        collapsed: { mobile: !opened, desktop: forceCollapseNavbar },
      }}
      // padding="md"
      styles={() => ({
        header: {
          overflow: 'hidden',
          background: 'transparent',
          border: 'none',
        },
        navbar: {
          borderRight: 'none',
        },
      })}
    >
      <MantineAppShell.Header>
        <MobileHeader opened={opened} onToggle={toggle} />
        <DesktopHeader />
      </MantineAppShell.Header>
      <MantineAppShell.Navbar px="md">
        <Navbar onClick={toggle} />
      </MantineAppShell.Navbar>
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};
