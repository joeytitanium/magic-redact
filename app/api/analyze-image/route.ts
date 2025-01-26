import { OPEN_AI_REQUESTED_SCHEMA, OPEN_AI_RESPONSE_SCHEMA } from '@/types/rectangle';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { detectTextWithGoogleVision } from './google-vision';
import { uploadToS3 } from './upload-to-s3';

const INPUT_SCHEMA = z.object({
  imageUrl: z.string().url(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const INDEX_RESPONSE_SCHEMA = z.object({
//   indexes: z.array(z.number()),
// });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputResult = INPUT_SCHEMA.safeParse(body);
    if (!inputResult.success) {
      return NextResponse.json({ error: inputResult.error.message }, { status: 400 });
    }
    const { imageUrl } = inputResult.data;
    const s3ImageUrl = await uploadToS3(imageUrl);
    // console.log(`🔫 s3ImageUrl: ${s3ImageUrl}`);

    const ocrResults = await detectTextWithGoogleVision(s3ImageUrl);
    // console.log(`🔫 ocrResults: ${JSON.stringify(ocrResults, null, '\t')}`);
    if (ocrResults.length === 0) {
      return NextResponse.json({ error: 'No text detected' }, { status: 400 });
    }

    const ocrMapped = {
      rectangles: ocrResults.map((x) => ({
        description: x.text,
        x: x.boundingBox.x,
        y: x.boundingBox.y,
        width: x.boundingBox.width,
        height: x.boundingBox.height,
      })),
    };
    const input = ocrMapped.rectangles.map((x) => x.description).filter((x) => x.length > 1);
    // console.log(`🔫 input: ${JSON.stringify(input, null, '\t')}`);

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      response_format: zodResponseFormat(OPEN_AI_REQUESTED_SCHEMA, 'indexes'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a privacy protection system. Your task is to identify sensitive text fragments and ALL numbers that should be redacted from medical documents.

Input: An array of OCR-detected text fragments, numbered starting from 0.
Output: Return only the indexes of text fragments that should be redacted.

Critical Rules:
1. ALWAYS REDACT:
   - ALL numbers and numeric sequences (including dates, times, IDs, etc.)
   - Full names (e.g., "John Smith", "Sarah Anderson")
   - Email addresses (e.g., "john.doe@email.com")
   - Phone numbers
   - Physical addresses
   - Any text containing numbers (e.g., "MA567891", "Room 101")
   - Alphanumeric combinations
   - Dates in any format
   - Times in any format
   - Ages
   - Measurements
   - Insurance numbers
   - Medical record numbers
   - Any other identifying numbers

2. NEVER REDACT:
   - Headers or section titles without numbers (e.g., "MEDICAL REPORT", "Assessment", "Diagnosis")
   - Field labels without numbers (e.g., "Doctor's Name:", "Phone:", "Email:")
   - Medical terminology without numbers
   - Descriptions of health status without numbers
   - Hospital/clinic names (unless they contain numbers)
   - General words and phrases without numbers

3. NUMBER DETECTION RULES:
   - If a fragment contains ANY numbers (0-9), redact the entire fragment
   - Include fragments with written numbers (e.g., "one", "two") if they are part of sensitive information
   - Include number-like characters (e.g., "#", "+")

Example:
Input: ["MEDICAL REPORT", "Visit Date:", "14.11.2023", "Room 101", "Assessment", "Height: 170cm"]
Should return: [2, 3, 5] (all fragments containing numbers)

Analyze these text fragments:
${input.join(',')}`,
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // console.log(`🔫 response: ${JSON.stringify(response, null, '\t')}`);
    const outputResult = OPEN_AI_RESPONSE_SCHEMA.safeParse(response);
    if (!outputResult.success) {
      console.error(`🔫 outputResult: ${JSON.stringify(outputResult.error, null, '\t')}`);
      return NextResponse.json({ error: outputResult.error.message }, { status: 400 });
    }

    const { indexes } = outputResult.data.choices[0].message.parsed;

    // Get the rectangles corresponding to the sensitive indexes
    const sensitiveRectangles = indexes.map((index) => ocrMapped.rectangles[index]);
    console.log(`🔫 prompt_tokens: ${outputResult.data.usage.prompt_tokens}`);
    console.log(`🔫 completion_tokens: ${outputResult.data.usage.completion_tokens}`);
    console.log(`🔫 total_tokens: ${outputResult.data.usage.total_tokens}`);
    // console.log(`🔫 sensitiveRectangles: ${JSON.stringify(sensitiveRectangles, null, '\t')}`);

    return NextResponse.json({ rectangles: sensitiveRectangles });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
