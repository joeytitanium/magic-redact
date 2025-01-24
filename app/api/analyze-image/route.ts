import { ANALYZE_IMAGE_RESPONSE_SCHEMA } from '@/types/rectangle';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { detectTextWithGoogleVision } from './google-vision';

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

    const ocrResults = await detectTextWithGoogleVision(
      'https://www.pa.gov/content/dam/copapwp-pagov/en/dmv/images/driver-services/realid/sample-real-id-images/real%20id-compliant%20non-commercial%20driver%27s%20license%20-%20mid-renewal%20cycle.jpg'
    );
    // console.log(`🔫 ocrResults: ${JSON.stringify(ocrResults, null, '\t')}`);

    const ocrMapped = {
      rectangles: ocrResults.map((x) => ({
        description: x.text,
        x: x.boundingBox.x,
        y: x.boundingBox.y,
        width: x.boundingBox.width,
        height: x.boundingBox.height,
        originalData: x,
      })),
    };

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      response_format: zodResponseFormat(ANALYZE_IMAGE_RESPONSE_SCHEMA, 'indexes'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the following rectangles and determine which ones contain sensitive information. 

⚠️ Important:
1️⃣ If multiple rectangles **together** form private information (e.g., name + address), treat them as a **single sensitive block**.
2️⃣ Return the **indexes** of rectangles that contain sensitive text, including:
   - **Names**
   - **Addresses**
   - **Dates of birth**
   - **License numbers**
   - **Emails**
   - **Phone numbers**
   - **Financial details**
   - **Identifying numbers (e.g., passport, driver’s license, social security)**
3️⃣ If multiple rectangles contribute to **one piece of private data**, include all of them.
4️⃣ Do **not** include general text like labels (e.g., "DOB:", "Name:", etc.) unless they are part of private info.
5️⃣ Return an **array of indexes** of sensitive rectangles.

The rectangles are:  
${JSON.stringify(ocrMapped.rectangles, null, '\t')}`,
            },
          ],
        },
      ],
      max_tokens: 500,
    });

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
