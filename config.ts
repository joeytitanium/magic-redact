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
    zIndex: {
      hoverOverBox: number;
      mobileFooter: number;
    };
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
  github: {
    repoUrl: string;
  };
  social: {
    x: Social;
    github: Social;
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
    version: '0.0.1',
    url: isDevelopment ? 'http://localhost:3000' : 'https://www.magicredact.com',
    name: 'MagicRedact',
    description:
      'Instantly redact sensitive information from PDFs and images for free. No sign-ups, no hidden fees. Just fast, secure, and open-source redaction',
  },
  dailyRequestLimit: 3,
  support: {
    email: 'joeytitanium@gmail.com',
  },
  stripe: {
    apiVersion: '2025-01-27.acacia',
  },
  github: {
    repoUrl: 'https://github.com/joeytitanium/magic-redact',
  },
  google: {
    storageBucketName: process.env.GOOGLE_STORAGE_BUCKET_NAME,
  },
  layout: {
    headerHeight: 60,
    footerHeight: 64,
    mobileBreakpoint: 'lg',
    containerSize: 'xl',
    zIndex: {
      hoverOverBox: 10,
      mobileFooter: 2,
    },
  },
  products: [
    {
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PLUS,
      name: 'Plus',
      price: 5,
      description: 'Starter plan',
      mode: 'subscription',
      trialPeriodDays: undefined,
      billingCycleDocumentPageLimit: 50,
    },
    {
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
      name: 'Pro',
      price: 15,
      description: 'Pro plan',
      mode: 'subscription',
      trialPeriodDays: undefined,
      billingCycleDocumentPageLimit: 200,
    },
    {
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS,
      name: 'Business',
      price: 50,
      description: 'Business plan',
      mode: 'subscription',
      trialPeriodDays: undefined,
      billingCycleDocumentPageLimit: 1000,
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
  auth: {
    google: {
      // also make sure to update the client id and secret on supabase.com (https://supabase.com/dashboard/project/ulrqcmxlifehrtbhuxkq/auth/providers)
      // clientSecret: // also make sure to update the client secret in config.toml & env variable
      clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
      callbackUrl: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CALLBACK_URL,
    },
  },
  social: {
    x: { url: 'https://x.com/joeytitanium', handle: '@joeytitanium' },
    github: { url: 'https://github.com/joeytitanium', handle: '@joeytitanium' },
  },
} as const;
