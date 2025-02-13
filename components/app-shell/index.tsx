'use client';

import { CONFIG } from '@/config';
import { AppShell as MantineAppShell } from '@mantine/core';
import type { ReactNode } from 'react';
import { DesktopHeader, MobileHeader } from './header';

export const AppShell = ({ children }: { children: ReactNode }) => (
  <MantineAppShell
    header={{ height: CONFIG.layout.headerHeight }}
    styles={() => ({
      header: {
        overflow: 'hidden',
        background: 'transparent',
        border: 'none',
      },
    })}
  >
    <MantineAppShell.Header>
      <MobileHeader />
      <DesktopHeader />
    </MantineAppShell.Header>
    <MantineAppShell.Main>{children}</MantineAppShell.Main>
  </MantineAppShell>
);
