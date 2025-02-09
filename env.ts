import { z } from 'zod';

const ENV_SCHEMA = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});
type Env = z.infer<typeof ENV_SCHEMA>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
