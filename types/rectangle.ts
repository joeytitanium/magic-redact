import { z } from 'zod';

export const RECTANGLE_SCHEMA = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string().optional(),
  sensitive: z.boolean(),
});
export type Rectangle = z.infer<typeof RECTANGLE_SCHEMA>;

export const OPEN_AI_REQUESTED_SCHEMA = z.object({
  sensitiveStrings: z.array(z.string()),
});

export const OPEN_AI_RESPONSE_SCHEMA = z.object({
  model: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        parsed: OPEN_AI_REQUESTED_SCHEMA,
      }),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type OpenAiResponse = z.infer<typeof OPEN_AI_RESPONSE_SCHEMA>;

export const ANALYZE_IMAGE_RESPONSE_SCHEMA = z.object({
  rectangles: z.array(z.array(RECTANGLE_SCHEMA)),
});
export type AnalyzeImageResponse = z.infer<typeof ANALYZE_IMAGE_RESPONSE_SCHEMA>;

export type RectSource = 'user' | 'server';
export type Rect = Rectangle & { id: string; source: RectSource };
