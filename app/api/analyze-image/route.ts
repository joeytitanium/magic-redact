import { sendDiscordAlert } from '@/lib/discord/send-discord-notification';
import { deleteGoogleCloudStoragePath } from '@/lib/google/delete-google-cloud-storage-file';
import { ocrDetectText } from '@/lib/google/ocr-detect-text';
import { uploadToGoogleCloudStorage } from '@/lib/google/upload-to-google-cloud-storage';
import { supabaseServerClient } from '@/lib/supabase/server';
import { supabaseServiceRoleClient } from '@/lib/supabase/service-role';
import { AiModel } from '@/types/ai-model';
import { DocumentInsert } from '@/types/database';
import { DeviceInfo } from '@/types/device-info';
import { OPEN_AI_REQUESTED_SCHEMA, OPEN_AI_RESPONSE_SCHEMA } from '@/types/rectangle';
import { createApiResponse } from '@/utils/api-response';
import { isDevelopment } from '@/utils/is-development';
import { logApiError, LogDomain } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { geolocation, ipAddress } from '@vercel/functions';
import { isNil } from 'lodash';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';
import { validatePageQuota } from './utils/validate-page-quota';

const AI_MODEL: AiModel = 'gpt-4o';
const DOMAIN: LogDomain = 'api-analyze-image';

const INPUT_SCHEMA = z.object({
  imageUrl: z.string().url(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TokenCostResponse = {
  inputTokenCost: number;
  outputTokenCost: number;
  totalTokenCost: number;
  inputTokenCostDisplay: string;
  outputTokenCostDisplay: string;
  totalTokenCostDisplay: string;
};

export const estimatedTokenCost = ({
  inputTokens,
  outputTokens,
  model,
  fixedDecimal = 8,
}: {
  inputTokens: number;
  outputTokens: number;
  model: AiModel;
  fixedDecimal?: number;
}): TokenCostResponse => {
  if (model === 'gpt-4o') {
    // $2.50 / 1M input tokens
    // $10.00 / 1M output tokens
    const inputTokenCost = (inputTokens / 1_000_000) * 2.5;
    const outputTokenCost = (outputTokens / 1_000_000) * 10;
    const totalTokenCost = inputTokenCost + outputTokenCost;
    const inputTokenCostDisplay = `$${Number(inputTokenCost).toFixed(fixedDecimal)}`;
    const outputTokenCostDisplay = `$${Number(outputTokenCost).toFixed(fixedDecimal)}`;
    const totalTokenCostDisplay = `$${Number(totalTokenCost).toFixed(fixedDecimal)}`;
    return {
      inputTokenCost,
      outputTokenCost,
      totalTokenCost,
      inputTokenCostDisplay,
      outputTokenCostDisplay,
      totalTokenCostDisplay,
    };
  }

  // if (model === 'gpt-4o-mini') {
  // $0.150 / 1M input tokens
  // $0.600 / 1M output tokens
  const inputTokenCost = (inputTokens / 1_000_000) * 0.15;
  const outputTokenCost = (outputTokens / 1_000_000) * 0.6;
  const totalTokenCost = inputTokenCost + outputTokenCost;
  const inputTokenCostDisplay = `$${Number(inputTokenCost).toFixed(fixedDecimal)}`;
  const outputTokenCostDisplay = `$${Number(outputTokenCost).toFixed(fixedDecimal)}`;
  const totalTokenCostDisplay = `$${Number(totalTokenCost).toFixed(fixedDecimal)}`;
  return {
    inputTokenCost,
    outputTokenCost,
    totalTokenCost,
    inputTokenCostDisplay,
    outputTokenCostDisplay,
    totalTokenCostDisplay,
  };
  // }
};

const getDocumentTypeFromDataUrl = (dataUrl: string): string | null => {
  // Check if it's a valid data URL
  if (!dataUrl.startsWith('data:')) return null;

  try {
    // Extract the MIME type portion (e.g. "image/jpeg")
    const mimeMatch = dataUrl.match(/^data:([^;,]+)/);
    if (!mimeMatch) return null;

    // Get the file extension from the MIME type
    const mimeType = mimeMatch[1].toLowerCase();
    const typeMatch = mimeType.split('/')[1];

    return typeMatch;
  } catch {
    return null;
  }
};

const insertDbRecord = async ({
  supabase,
  document,
  request,
  deviceInfo,
  userId,
}: {
  supabase: SupabaseClient;
  document: Omit<DocumentInsert, 'device_info' | 'ai_model'>;
  request: Request;
  deviceInfo: DeviceInfo;
  userId: string | undefined;
}) => {
  const { error: insertError } = await supabase.from('documents').insert({
    ...document,
    user_id: userId,
    ai_model: AI_MODEL,
    device_info: deviceInfo,
  });
  if (insertError) {
    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'Error inserting record into db',
      deviceInfo,
      variant: 'error',
    });
    logApiError({
      domain: DOMAIN,
      message: 'Error inserting record into db',
      error: insertError,
      request,
    });
  }
};

export async function POST(request: Request) {
  const supabaseServer = await supabaseServerClient();
  const supabaseServiceRole = supabaseServiceRoleClient();
  const { data: userData } = await supabaseServer.auth.getUser();
  const userId = userData.user?.id;

  const userAgent = request.headers.get('user-agent') || '';
  const ua = new UAParser(userAgent);
  const deviceInfo: DeviceInfo = {
    ...ua.getResult(),
    geolocation: geolocation(request),
    ipAddress: isDevelopment ? '127.0.0.1' : ipAddress(request),
  };

  if (isNil(deviceInfo.ipAddress)) {
    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'IP address missing',
      deviceInfo,
      variant: 'error',
    });
    return createApiResponse({
      code: '400-bad-request',
      publicFacingMessage: 'IP address missing.',
    });
  }

  try {
    const body = await request.json();
    const inputResult = INPUT_SCHEMA.safeParse(body);
    if (!inputResult.success) {
      logApiError({
        domain: DOMAIN,
        message: 'Invalid input',
        error: inputResult.error,
        request,
      });
      return createApiResponse({
        code: '400-bad-request',
      });
    }
    const { imageUrl: base64Image } = inputResult.data;
    const documentType = getDocumentTypeFromDataUrl(base64Image);
    if (!documentType) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Invalid image URL',
        deviceInfo,
        variant: 'error',
      });
      logApiError({
        domain: DOMAIN,
        message: 'Invalid image URL',
        request,
      });
      return createApiResponse({
        code: '400-bad-request',
      });
    }

    const {
      gsUrl: gsImageUrl,
      publicUrl: publicImageUrl,
      fileUuid,
      numPages,
      outputFolderPath,
      error: gcsError,
    } = await uploadToGoogleCloudStorage({
      encodedFile: base64Image,
      fileType: documentType,
    });

    if (gcsError) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Google Cloud Storage upload error',
        deviceInfo,
        variant: 'error',
      });
      logApiError({
        domain: DOMAIN,
        message: 'Google Cloud Storage upload error',
        error: gcsError,
        request,
      });
      return createApiResponse({ code: '400-bad-request' });
    }

    const { errorResponse } = await validatePageQuota({
      requestedNumPages: numPages,
      deviceInfo,
      userId,
      ipAddress: deviceInfo.ipAddress,
      supabase: supabaseServiceRole,
      domain: DOMAIN,
      request,
    });
    if (!isNil(errorResponse)) {
      return errorResponse;
    }

    // OCR
    const { data: ocrResults, error: ocrError } = await ocrDetectText({
      gsImageUrl,
      fileUuid,
    });
    if (!isNil(ocrError) || isNil(ocrResults)) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Error detecting text with Google Vision',
        imageUrl: publicImageUrl,
        deviceInfo,
        variant: 'error',
        context: [
          {
            name: 'Error',
            value: ocrError?.message ?? 'Unknown error',
            inline: false,
          },
        ],
      });
      logApiError({
        domain: DOMAIN,
        message: 'Error detecting text with Google Vision',
        error: ocrError ?? new Error('Unknown error'),
        request,
      });
      await insertDbRecord({
        supabase: supabaseServiceRole,
        request,
        deviceInfo,
        userId: userData.user?.id,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_type: documentType,
          ocr_error: ocrError?.message ?? 'Unknown error',
        },
      });
      return createApiResponse({ code: '400-bad-request' });
    }

    const { error: deleteError } = await deleteGoogleCloudStoragePath({
      folderPath: outputFolderPath,
    });
    if (deleteError) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Error deleting Google Cloud Storage file',
        deviceInfo,
        variant: 'error',
      });
      logApiError({
        domain: DOMAIN,
        message: 'Error deleting Google Cloud Storage file',
        error: deleteError,
        request,
      });
    }

    if (ocrResults.length === 0) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'No text detected',
        imageUrl: publicImageUrl,
        deviceInfo,
        variant: 'error',
      });
      logApiError({
        domain: DOMAIN,
        message: 'No text detected',
        request,
      });
      await insertDbRecord({
        supabase: supabaseServiceRole,
        request,
        deviceInfo,
        userId,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_type: documentType,
        },
      });
      return createApiResponse({
        code: '400-bad-request',
        publicFacingMessage: 'No text was detected.',
      });
    }

    // OPEN AI
    const openaiPrompt = process.env.AI_PROMPT.replace(
      '{{input}}',
      ocrResults
        .flat()
        .map((x) => x.text)
        .filter((x) => x && x.length > 1)
        .join(',')
    );
    const response = await openai.beta.chat.completions.parse({
      model: AI_MODEL,
      response_format: zodResponseFormat(OPEN_AI_REQUESTED_SCHEMA, 'sensitiveStrings'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: openaiPrompt,
            },
          ],
        },
      ],
    });

    const outputResult = OPEN_AI_RESPONSE_SCHEMA.safeParse(response);
    if (!outputResult.success) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'Error parsing OpenAI response',
        imageUrl: publicImageUrl,
        deviceInfo,
        variant: 'error',
        context: [
          {
            name: 'OpenAI response',
            value: JSON.stringify(response, null, '\t'),
            inline: false,
          },
          {
            name: 'Parse error',
            value: outputResult.error.message,
            inline: false,
          },
        ],
      });
      logApiError({
        domain: DOMAIN,
        message: 'Error parsing OpenAI response',
        error: outputResult.error,
        request,
      });
      await insertDbRecord({
        supabase: supabaseServiceRole,
        request,
        deviceInfo,
        userId,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_type: documentType,
          ai_error: response as any,
        },
      });
      return createApiResponse({
        code: '400-bad-request',
      });
    }

    const { sensitiveStrings } = outputResult.data.choices[0].message.parsed;
    const sensitiveStringSet = new Set(
      sensitiveStrings.flatMap((str) =>
        str
          .split(/[,\s]+/) // split by comma or any whitespace
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      )
    );

    const rectangles = ocrResults.map((page) =>
      page.map((y) => ({
        ...y,
        sensitive: sensitiveStringSet.has(y.text ?? ''),
      }))
    );

    const tokenCost = estimatedTokenCost({
      inputTokens: outputResult.data.usage.prompt_tokens,
      outputTokens: outputResult.data.usage.completion_tokens,
      model: AI_MODEL,
    });
    const tokenSummary = `Prompt: ${outputResult.data.usage.prompt_tokens} = **${tokenCost.inputTokenCost}**,
Completion: ${outputResult.data.usage.completion_tokens} = **${tokenCost.outputTokenCost}**,
Total: ${outputResult.data.usage.total_tokens} = **${tokenCost.totalTokenCost}**`;

    await insertDbRecord({
      supabase: supabaseServiceRole,
      request,
      deviceInfo,
      userId,
      document: {
        ip_address: deviceInfo.ipAddress,
        document_type: documentType,
        num_pages: numPages,
        ai_input_tokens: outputResult.data.usage.prompt_tokens,
        ai_output_tokens: outputResult.data.usage.completion_tokens,
        ai_total_tokens: outputResult.data.usage.total_tokens,
        ai_input_cost: tokenCost.inputTokenCost,
        ai_output_cost: tokenCost.outputTokenCost,
        ai_total_cost: tokenCost.totalTokenCost,
      },
    });

    await sendDiscordAlert({
      username: '/analyze-image',
      title: 'Image successfully analyzed',
      imageUrl: publicImageUrl,
      deviceInfo,
      variant: 'success',
      context: [
        {
          name: 'Tokens',
          value: tokenSummary,
          inline: false,
        },
      ],
    });
    return createApiResponse({
      code: '200-success',
      data: { rectangles },
    });
  } catch (error) {
    if (error instanceof Error) {
      logApiError({
        domain: DOMAIN,
        message: 'Error analyzing image',
        error,
        request,
      });
    } else {
      logApiError({
        domain: DOMAIN,
        message: 'Unknown error analyzing image',
        request,
        context: { error },
      });
    }
    return createApiResponse({ code: '500-internal-server-error' });
  }
}
