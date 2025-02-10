import { generateFilepath } from '@/utils/generate-filepath';
import { v4 as uuidv4 } from 'uuid';
import { googleStorageClient } from './google-storage-client';

type UploadToGCSResponse =
  | {
      gsUrl: string;
      publicUrl: string;
      fileUuid: string;
      outputFolderPath: string;
      error?: never;
    }
  | {
      gsUrl?: never;
      publicUrl?: never;
      fileUuid?: never;
      outputFolderPath?: never;
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
    const bucket = googleStorageClient.bucket(bucketName);

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
    const { inputPath, outputFolderPath } = generateFilepath({
      uuid: fileUuid,
      fileType,
      date: new Date(),
    });
    const file = bucket.file(inputPath);

    await file.save(buffer, {
      contentType,
      metadata: {
        contentEncoding: 'base64',
      },
    });

    // TODO: Cleanup. Get the file metadata to verify upload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [metadata] = await file.getMetadata();

    const gcsUri = `gs://${bucketName}/${inputPath}`;
    const publicUrl = `https://storage.cloud.google.com/${bucketName}/${inputPath}`;

    // TODO: Cleanup. (Verify file exists and is accessible)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [exists] = await file.exists();

    return { gsUrl: gcsUri, publicUrl, fileUuid, outputFolderPath };
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return { error: new Error('Unknown GCS upload error') };
  }
};
