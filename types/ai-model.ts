export const AI_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;
export type AiModel = (typeof AI_MODELS)[number];
