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
      response_format: zodResponseFormat(OPEN_AI_REQUESTED_SCHEMA, 'sensitiveStrings'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a world class data protection expert. Analyze the following strings and determine which ones contain sensitive information. 

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

    const { sensitiveStrings } = outputResult.data.choices[0].message.parsed;

    const sensitiveStringSet = new Set(
      sensitiveStrings.flatMap((str) =>
        str
          .split(/[,\s]+/) // split by comma or any whitespace
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      )
    );
    // console.log(
    //   `🔫 sensitiveStringSet: ${JSON.stringify(Array.from(sensitiveStringSet), null, '\t')}`
    // );

    // Get the rectangles corresponding to the sensitive indexes
    const rectangles = ocrMapped.rectangles.map((x) => ({
      ...x,
      sensitive: sensitiveStringSet.has(x.description),
    }));
    console.log(`🔫 prompt_tokens: ${outputResult.data.usage.prompt_tokens}`);
    console.log(`🔫 completion_tokens: ${outputResult.data.usage.completion_tokens}`);
    console.log(`🔫 total_tokens: ${outputResult.data.usage.total_tokens}`);
    // console.log(`🔫 sensitiveRectangles: ${JSON.stringify(sensitiveRectangles, null, '\t')}`);

    return NextResponse.json({ rectangles });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
