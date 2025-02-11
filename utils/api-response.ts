import { NextResponse } from 'next/server';
import { z } from 'zod';

const API_INTERNAL_CODES = ['max-request-limit-reached'] as const;

const API_SUCCESS_PAYLOAD_SCHEMA = <T>(schema: z.ZodType<T>) =>
  z.object({
    data: schema,
  });

const API_ERROR_PAYLOAD_SCHEMA = z.object({
  internalErrorCode: z.enum(API_INTERNAL_CODES).optional(),
  publicFacingMessage: z.string().optional(),
});
export type ApiErrorPayload = z.infer<typeof API_ERROR_PAYLOAD_SCHEMA>;

const SUCCESS_RESPONSE_CODE = '200-success';
const ERROR_RESPONSE_CODES = [
  '401-unauthorized',
  '400-bad-request',
  '429-too-many-requests',
  '500-internal-server-error',
] as const;
const API_RESPONSE_TYPES = [SUCCESS_RESPONSE_CODE, ...ERROR_RESPONSE_CODES] as const;
type ApiResponseType = (typeof API_RESPONSE_TYPES)[number];

const API_VARIABLES_SCHEMA = <T>(dataSchema: z.ZodType<T>) =>
  z.discriminatedUnion('type', [
    z
      .object({
        type: z.literal(SUCCESS_RESPONSE_CODE),
      })
      .merge(API_SUCCESS_PAYLOAD_SCHEMA(dataSchema)),
    z
      .object({
        type: z.enum(ERROR_RESPONSE_CODES),
      })
      .merge(API_ERROR_PAYLOAD_SCHEMA),
  ]);
type ApiVariables<T> = z.infer<ReturnType<typeof API_VARIABLES_SCHEMA<T>>>;

export const API_DATA_SCHEMA = <T>(dataSchema: z.ZodType<T>) =>
  API_SUCCESS_PAYLOAD_SCHEMA(dataSchema)
    .merge(z.object({ success: z.literal(true) }))
    .or(API_ERROR_PAYLOAD_SCHEMA.merge(z.object({ success: z.literal(false) })));

const responseCode: Record<ApiResponseType, number> = {
  '400-bad-request': 400,
  '200-success': 200,
  '401-unauthorized': 401,
  '429-too-many-requests': 429,
  '500-internal-server-error': 500,
};

export const createApiResponse = <T>(response: ApiVariables<T>) => {
  const { type, ...payload } = response;
  return NextResponse.json(
    {
      ...payload,
      success: type === SUCCESS_RESPONSE_CODE,
    },
    { status: responseCode[type] }
  );
};
