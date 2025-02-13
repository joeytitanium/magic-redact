import { CONFIG } from '@/config';
import { googleStorageClient } from './google-storage-client';

type DeleteGoogleCloudStorageFileResponse =
  | {
      error: null;
    }
  | {
      error: Error;
    };

export const deleteGoogleCloudStoragePath = async ({
  folderPath,
}: {
  folderPath: string;
}): Promise<DeleteGoogleCloudStorageFileResponse> => {
  try {
    const bucket = googleStorageClient.bucket(CONFIG.google.storageBucketName);
    const [files] = await bucket.getFiles({
      prefix: folderPath,
    });
    await Promise.all(files.map((file) => file.delete()));
    return { error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return { error: new Error('Unknown Google Cloud Storage delete error') };
  }
};
