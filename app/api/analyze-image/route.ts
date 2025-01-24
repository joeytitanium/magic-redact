import { ANALYZE_IMAGE_RESPONSE_SCHEMA } from '@/types/rectangle';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const INPUT_SCHEMA = z.object({
  imageUrl: z.string().url(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputResult = INPUT_SCHEMA.safeParse(body);
    if (!inputResult.success) {
      return NextResponse.json({ error: inputResult.error.message }, { status: 400 });
    }
    const { imageUrl } = inputResult.data;

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      response_format: zodResponseFormat(ANALYZE_IMAGE_RESPONSE_SCHEMA, 'rectangles'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Tell me the rectangles of each sensitive part of the image (e.g. names, telephone numbers, emails, websites, etc.)',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // console.log(`🔫 response: ${JSON.stringify(response, null, '\t')}`);
    const outputResult = ANALYZE_IMAGE_RESPONSE_SCHEMA.safeParse(
      response.choices[0].message.parsed
    );
    if (!outputResult.success) {
      return NextResponse.json({ error: outputResult.error.message }, { status: 400 });
    }

    return NextResponse.json(outputResult.data);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
