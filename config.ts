import type { MantineSize } from '@mantine/core';
import { Product } from './types/product';
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
    version: string;
  };
  dailyRequestLimit: number;
  support: {
    email: string;
  };
  layout: {
    headerHeight: number;
    footerHeight: number;
    mobileBreakpoint: MantineSize;
    containerSize: MantineSize;
    zIndex: {};
  };
  products: Product[];
  stripe: {
    apiVersion: '2025-01-27.acacia';
  };
  google: {
    storageBucketName: string;
  };
  auth: {
    google: {
      clientId: string;
      callbackUrl: string;
    };
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
  zIndex: {
    hoverOverBox: number;
  };
} = {
  site: {
    version: '0.0.1',
    url: isDevelopment ? 'http://localhost:3000' : 'https://www.magicredact.com',
    name: 'MagicRedact',
    description: 'Automatically redact sensitive information from images',
  },
  dailyRequestLimit: 3,
  support: {
    email: 'joeytitanium@gmail.com',
  },
  stripe: {
    apiVersion: '2025-01-27.acacia',
  },
  google: {
    storageBucketName: 'magic-redact',
  },
  layout: {
    headerHeight: 60,
    footerHeight: 64,
    mobileBreakpoint: 'lg',
    containerSize: 'xl',
    zIndex: {},
  },
  products: [
    {
      stripePriceId: isDevelopment
        ? 'price_1Qq4g7Am5zvWraF48ljnp1BH'
        : 'price_1Qq4g7Am5zvWraF48ljnp1BH',
      name: 'Starter',
      price: 5,
      description: 'Starter plan',
      mode: 'subscription',
      trialPeriodDays: undefined,
    },
    {
      stripePriceId: isDevelopment
        ? 'price_1Qq4g7Am5zvWraF48ljnp1BH'
        : 'price_1Qq4g7Am5zvWraF48ljnp1BH',
      name: 'Pro',
      price: 10,
      description: 'Pro plan',
      mode: 'subscription',
      trialPeriodDays: undefined,
    },
  ],
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
  zIndex: {
    hoverOverBox: 10,
  },
  auth: {
    google: {
      // also make sure to update the client id and secret on supabase.com (https://supabase.com/dashboard/project/ulrqcmxlifehrtbhuxkq/auth/providers)
      // clientSecret: // also make sure to update the client secret in config.toml & env variable
      clientId: isDevelopment
        ? '679503925703-p3nkj2igonpcehv5mr92auhsli4lvumb.apps.googleusercontent.com'
        : '679503925703-rnvgqe7k7hoab630n50ld4i19vvfcr2r.apps.googleusercontent.com',
      callbackUrl: isDevelopment ? 'http://127.0.0.1:54321/auth/v1/callback' : '',
    },
  },
  social: {
    x: { url: 'https://x.com/joeytitanium', handle: '@joeytitanium' },
  },
} as const;
