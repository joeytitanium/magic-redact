import { z } from 'zod';

const ENV_SCHEMA = z.object({
  OPENAI_API_KEY: z.string().min(1),

  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
  GOOGLE_PROJECT_ID: z.string().min(1),
  GOOGLE_PRIVATE_KEY_ID: z.string().min(1),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
  GOOGLE_CLIENT_EMAIL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_X509_CERT_URL: z.string().min(1).url(),
  GOOGLE_STORAGE_BUCKET_NAME: z.string().min(1),

  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1).url(),

  DISCORD_WEBHOOK_URL: z.string().min(1).url(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  STRIPE_PRICE_ID_PLUS: z.string().min(1),
  STRIPE_PRICE_ID_PRO: z.string().min(1),
  STRIPE_PRICE_ID_BUSINESS: z.string().min(1),

  NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_AUTH_CALLBACK_URL: z.string().url(),

  AI_PROMPT: z.string().min(1),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
});
type Env = z.infer<typeof ENV_SCHEMA>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
