import { generateFilepath } from '@/utils/generate-filepath';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    universe_domain: 'googleapis.com',
  },
});

type UploadToGCSResponse =
  | {
      gsUrl: string;
      publicUrl: string;
      fileUuid: string;
      error?: never;
    }
  | {
      gsUrl?: never;
      publicUrl?: never;
      fileUuid?: never;
      error: Error;
    };

export const uploadToGoogleCloudStorage = async ({
  encodedFile,
  fileType,
}: {
  encodedFile: string;
  fileType: string;
}): Promise<UploadToGCSResponse> => {
  try {
    const bucketName = 'magic-redact';
    const bucket = storage.bucket(bucketName);

    // Validate and process the base64 data
    let base64Data = encodedFile;
    let contentType = fileType.includes('pdf') ? 'application/pdf' : `image/${fileType}`;

    if (base64Data.includes('data:')) {
      const matches = base64Data.match(/^data:([^;]+);base64,/);
      if (matches) {
        // eslint-disable-next-line prefer-destructuring
        contentType = matches[1]; // Use the actual MIME type from the data URL
      }
      base64Data = encodedFile.replace(/^data:.*?;base64,/, '');
    }

    // Validate base64 string
    if (!base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      return { error: new Error('Invalid base64 string format') };
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // For PDFs, verify the PDF header
    if (contentType === 'application/pdf') {
      const pdfHeader = buffer.slice(0, 4).toString('hex');
      if (pdfHeader !== '25504446') {
        // '%PDF' in hex
        return { error: new Error('Invalid PDF format') };
      }
    }

    const fileUuid = uuidv4();
    const filePath = generateFilepath({
      uuid: fileUuid,
      fileType,
      date: new Date(),
      type: 'input',
    });
    const file = bucket.file(filePath);

    await file.save(buffer, {
      contentType,
      metadata: {
        contentEncoding: 'base64',
      },
    });

    // TODO: Cleanup. Get the file metadata to verify upload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [metadata] = await file.getMetadata();

    const gcsUri = `gs://${bucketName}/${filePath}`;
    const publicUrl = `https://storage.cloud.google.com/${bucketName}/${filePath}`;

    // TODO: Cleanup. (Verify file exists and is accessible)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [exists] = await file.exists();

    return { gsUrl: gcsUri, publicUrl, fileUuid };
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return { error: new Error('Unknown GCS upload error') };
  }
};
