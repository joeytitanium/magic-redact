import { sendDiscordAlert } from '@/lib/discord/send-discord-notification';
import { ocrDetectText } from '@/lib/google/ocr-detect-text';
import { uploadToGoogleCloudStorage } from '@/lib/google/upload-to-google-cloud-storage';
import { supabaseServiceRoleClient } from '@/lib/supabase/service-role';
import { AiModel } from '@/types/ai-model';
import { DocumentInsert } from '@/types/database';
import { DeviceInfo } from '@/types/device-info';
import { OPEN_AI_REQUESTED_SCHEMA, OPEN_AI_RESPONSE_SCHEMA } from '@/types/rectangle';
import { logApiError, logDebugMessage } from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { geolocation, ipAddress } from '@vercel/functions';
import { isNil } from 'lodash';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';

const AI_MODEL: AiModel = 'gpt-4o';

const INPUT_SCHEMA = z.object({
  imageUrl: z.string().url(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TokenCostResponse = {
  inputTokenCost: string;
  outputTokenCost: string;
  totalCost: string;
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
    const totalCostDisplay = `$${Number(totalTokenCost).toFixed(fixedDecimal)}`;
    return {
      inputTokenCost: inputTokenCostDisplay,
      outputTokenCost: outputTokenCostDisplay,
      totalCost: totalCostDisplay,
    };
  }

  // if (model === 'gpt-4o-mini') {
  // $0.150 / 1M input tokens
  // $0.600 / 1M output tokens
  const inputTokenCost = (inputTokens / 1_000_000) * 0.15;
  const outputTokenCost = (outputTokens / 1_000_000) * 0.6;
  const totalCost = inputTokenCost + outputTokenCost;
  const inputTokenCostDisplay = `$${Number(inputTokenCost).toFixed(fixedDecimal)}`;
  const outputTokenCostDisplay = `$${Number(outputTokenCost).toFixed(fixedDecimal)}`;
  const totalCostDisplay = `$${Number(totalCost).toFixed(fixedDecimal)}`;
  return {
    inputTokenCost: inputTokenCostDisplay,
    outputTokenCost: outputTokenCostDisplay,
    totalCost: totalCostDisplay,
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
}: {
  supabase: SupabaseClient;
  document: Omit<DocumentInsert, 'device_info' | 'ai_model'>;
  request: Request;
  deviceInfo: DeviceInfo;
}) => {
  const { error: insertError } = await supabase.from('documents').insert({
    ...document,
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
    logApiError({ message: 'Error inserting record into db', error: insertError, request });
  }
};

export async function POST(request: Request) {
  // TODO:
  // - Block requests from IP addresses that have been flagged as suspicious
  // - Limit requests by IP

  const supabase = supabaseServiceRoleClient();

  const userAgent = request.headers.get('user-agent') || '';
  const ua = new UAParser(userAgent);
  const deviceInfo: DeviceInfo = {
    ...ua.getResult(),
    geolocation: geolocation(request),
    ipAddress: ipAddress(request),
  };

  try {
    const body = await request.json();
    const inputResult = INPUT_SCHEMA.safeParse(body);
    if (!inputResult.success) {
      return NextResponse.json({ error: inputResult.error.message }, { status: 400 });
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
      logApiError({ message: 'Invalid image URL', request });
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    const {
      gsUrl: gsImageUrl,
      publicUrl: publicImageUrl,
      fileUuid,
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
      logApiError({ message: 'Google Cloud Storage upload error', error: gcsError, request });
      return NextResponse.json({ error: gcsError.message }, { status: 400 });
    }

    // OCR
    const {
      data: ocrResults,
      originalResponse,
      error: ocrError,
    } = await ocrDetectText({
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
        message: 'Error detecting text with Google Vision',
        error: ocrError ?? new Error('Unknown error'),
        request,
      });
      await insertDbRecord({
        supabase,
        request,
        deviceInfo,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_url: publicImageUrl,
          document_type: documentType,
          ocr_error: ocrError?.message ?? 'Unknown error',
        },
      });
      return NextResponse.json({ error: ocrError?.message ?? 'Unknown error' }, { status: 400 });
    }

    // logDebugMessage(`🔫 ocrResults: ${JSON.stringify(ocrResults, null, '\t')}`, {
    //   request,
    //   context: { ocrResults },
    // });
    if (ocrResults.length === 0) {
      await sendDiscordAlert({
        username: '/analyze-image',
        title: 'No text detected',
        imageUrl: publicImageUrl,
        deviceInfo,
        variant: 'error',
      });
      logApiError({ message: 'No text detected', request });
      await insertDbRecord({
        supabase,
        request,
        deviceInfo,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_url: publicImageUrl,
          document_type: documentType,
          ocr_response: originalResponse,
        },
      });
      return NextResponse.json({ error: 'No text detected' }, { status: 400 });
    }

    const input = ocrResults
      .flat()
      .map((x) => x.text)
      .filter((x) => x && x.length > 1);
    logDebugMessage({
      message: `Input: ${JSON.stringify(input, null, '\t')}`,
      context: { input },
    });

    // OPEN AI
    const openaiPrompt = `You are a world class data protection expert. Analyze the following strings and determine which ones contain sensitive information. 

⚠️ Important:
2️⃣ Return an **array of strings** that contain sensitive text, including:
   - **Names**
   - **Addresses**
   - **Dates of birth**
   - **License numbers**
   - **Emails**
   - **Phone numbers**
   - **Financial details**
   - **Identifying numbers (e.g., passport, driver's license, social security)**
4️⃣ Do **not** include general text like labels (e.g., "DOB:", "Name:", etc.) unless they are part of private info.
5️⃣ Return an **array** of sensitive strings.

The strings are:  
${input.join(',')}`;
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
      max_tokens: 500, // TODO: verify
    });

    logDebugMessage({
      message: 'OpenAI response',
      context: { response },
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
      logApiError({ message: 'Error parsing OpenAI response', error: outputResult.error, request });
      await insertDbRecord({
        supabase,
        request,
        deviceInfo,
        document: {
          ip_address: deviceInfo.ipAddress,
          document_url: publicImageUrl,
          document_type: documentType,
          ocr_response: originalResponse,
          ai_error: response as any,
        },
      });
      return NextResponse.json({ error: outputResult.error.message }, { status: 400 });
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
    // logDebugMessage(
    //   `🔫 sensitiveStringSet: ${JSON.stringify(Array.from(sensitiveStringSet), null, '\t')}`,
    //   {
    //     request,
    //     context: { sensitiveStringSet },
    //   }
    // );

    const rectangles = ocrResults.map((page) =>
      page.map((y) => ({
        ...y,
        sensitive: sensitiveStringSet.has(y.text ?? ''),
      }))
    );
    // console.log(`🔫 prompt_tokens: ${outputResult.data.usage.prompt_tokens}`);
    // console.log(`🔫 completion_tokens: ${outputResult.data.usage.completion_tokens}`);
    // console.log(`🔫 total_tokens: ${outputResult.data.usage.total_tokens}`);
    // console.log(`🔫 sensitiveRectangles: ${JSON.stringify(rectangles, null, '\t')}`);

    await insertDbRecord({
      supabase,
      request,
      deviceInfo,
      document: {
        ip_address: deviceInfo.ipAddress,
        document_url: publicImageUrl,
        document_type: documentType,
        ocr_response: originalResponse,
        ai_completion_tokens: outputResult.data.usage.completion_tokens,
        ai_prompt_tokens: outputResult.data.usage.prompt_tokens,
        ai_total_tokens: outputResult.data.usage.total_tokens,
        ai_prompt: openaiPrompt,
        ai_response: response as any,
      },
    });
    const tokenCost = estimatedTokenCost({
      inputTokens: outputResult.data.usage.prompt_tokens,
      outputTokens: outputResult.data.usage.completion_tokens,
      model: AI_MODEL,
    });
    const tokenSummary = `Prompt: ${outputResult.data.usage.prompt_tokens} = **${tokenCost.inputTokenCost}**,
Completion: ${outputResult.data.usage.completion_tokens} = **${tokenCost.outputTokenCost}**,
Total: ${outputResult.data.usage.total_tokens} = **${tokenCost.totalCost}**`;
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
    return NextResponse.json({ rectangles });
  } catch (error) {
    if (error instanceof Error) {
      logApiError({ message: 'Error analyzing image', error, request });
    } else {
      logApiError({ message: 'Unknown error analyzing image', request, context: { error } });
    }
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
