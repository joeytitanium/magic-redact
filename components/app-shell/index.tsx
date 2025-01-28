'use client';

import { CONFIG } from '@/config';
import { AppShell as MantineAppShell } from '@mantine/core';
import type { ReactNode } from 'react';
import { DesktopHeader, MobileHeader } from './header';

export const AppShell = ({ children }: { children: ReactNode }) => (
  // const [opened, { toggle }] = useDisclosure();

  <MantineAppShell
    // className="graph-paper"
    header={{ height: CONFIG.layout.headerHeight }}
    // padding="md"
    styles={() => ({
      header: {
        overflow: 'hidden',
        background: 'transparent',
        border: 'none',
      },
    })}
  >
    <MantineAppShell.Header>
      <MobileHeader
      // opened={opened} onToggle={toggle}
      />
      <DesktopHeader />
    </MantineAppShell.Header>
    <MantineAppShell.Main>{children}</MantineAppShell.Main>
  </MantineAppShell>
);
