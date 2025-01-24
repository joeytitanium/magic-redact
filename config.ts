import type { MantineSize } from '@mantine/core';
import { isDevelopment } from './utils/is-development';

type Social = {
  url: string;
  handle: string;
};

export const CONFIG: {
  site: {
    url: string;
    name: string;
    description: string;
  };
  layout: {
    headerHeight: number;
    mobileBreakpoint: MantineSize;
    containerSize: MantineSize;
    zIndex: {};
  };
  social: {
    x: Social;
    // bluesky: Social;
    // threads: Social;
    // instagram: Social;
    // youtube: Social;
  };
  icon: {
    size: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
  localStorageKey: {};
} = {
  site: {
    url: isDevelopment ? 'http://localhost:3000' : 'https://www.titanium.dev',
    name: 'Titanium',
    description: 'Description here',
  },
  layout: {
    headerHeight: 60,
    mobileBreakpoint: 'lg',
    containerSize: 'xl',
    zIndex: {},
  },
  icon: {
    size: {
      xs: 16,
      sm: 21,
      md: 26,
      lg: 32,
      xl: 40,
    },
  },
  localStorageKey: {},
  social: {
    x: { url: 'https://x.com/joeytitanium', handle: '@joeytitanium' },
  },
} as const;
