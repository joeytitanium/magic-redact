import { Storage } from '@google-cloud/storage';
import { format } from 'date-fns';
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
      error?: never;
    }
  | {
      gsUrl?: never;
      publicUrl?: never;
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
        console.log('Detected MIME type:', matches[1]);
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

    const key = `uploads/${format(new Date(), 'yyyy-MM-dd')}/${uuidv4()}.${fileType}`;
    const file = bucket.file(key);

    await file.save(buffer, {
      contentType,
      metadata: {
        contentEncoding: 'base64',
      },
    });

    // Get the file metadata to verify upload
    const [metadata] = await file.getMetadata();

    const gcsUri = `gs://${bucketName}/${key}`;
    const publicUrl = `https://storage.cloud.google.com/${bucketName}/${key}`;

    // Verify file exists and is accessible
    const [exists] = await file.exists();

    return { gsUrl: gcsUri, publicUrl };
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return { error: new Error('Unknown GCS upload error') };
  }
};
