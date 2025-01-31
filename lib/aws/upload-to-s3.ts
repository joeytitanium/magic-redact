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

// TODO: UNUSED. DELETE?
export const uploadToS3 = async ({
  encodedImage,
  fileType,
}: {
  encodedImage: string;
  fileType: string;
}): Promise<UploadToS3Response> => {
  try {
    const contentType = fileType.includes('pdf') ? 'application/pdf' : fileType;

    let base64Data = encodedImage;
    if (base64Data.includes('data:')) {
      base64Data = encodedImage.replace(/^data:.*?;base64,/, '');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const key = `uploads/${format(new Date(), 'yyyy-MM-dd')}/${uuidv4()}.${fileType}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
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
