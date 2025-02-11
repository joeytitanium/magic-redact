import { z } from 'zod';

export const SIZE_SCHEMA = z.object({
  width: z.number(),
  height: z.number(),
});
export type Size = z.infer<typeof SIZE_SCHEMA>;
