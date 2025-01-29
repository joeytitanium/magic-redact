import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type UploadToS3Response =
  | {
      url: string;
      error?: never;
    }
  | {
      url?: never;
      error: Error;
    };

export const uploadToS3 = async (encodedImage: string): Promise<UploadToS3Response> => {
  try {
    const base64Data = encodedImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const key = `uploads/${format(new Date(), 'yyyy-MM-dd')}/${uuidv4()}.jpg`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ContentEncoding: 'base64',
      })
    );

    return {
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return { error: new Error('Unknown S3 upload error') };
  }
};
