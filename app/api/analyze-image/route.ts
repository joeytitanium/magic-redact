import { ANALYZE_IMAGE_RESPONSE_SCHEMA } from '@/types/rectangle';
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
  // return NextResponse.json(
  //   {
  //     rectangles: [
  //       {
  //         x: 206,
  //         y: 935,
  //         width: 148,
  //         height: 24,
  //         description: '111589130',
  //       },
  //       {
  //         x: 181,
  //         y: 1062,
  //         width: 125,
  //         height: 25,
  //         description: 'Michelle',
  //       },
  //       {
  //         x: 316,
  //         y: 1062,
  //         width: 147,
  //         height: 25,
  //         description: 'Chiamaka',
  //       },
  //       {
  //         x: 474,
  //         y: 1062,
  //         width: 95,
  //         height: 25,
  //         description: 'Okeke',
  //       },
  //       {
  //         x: 173,
  //         y: 1124,
  //         width: 431,
  //         height: 32,
  //         description: 'michelleokeke13@gmail.com',
  //       },
  //     ],
  //   },
  //   { status: 200 }
  // );

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
