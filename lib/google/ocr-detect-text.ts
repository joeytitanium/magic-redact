import { CONFIG } from '@/config';
import { Rectangle } from '@/types/rectangle';
import { generateFilepath } from '@/utils/generate-filepath';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { fetchOcrResults } from './fetch-ocr-results';
import { googleStorageClient } from './google-storage-client';

const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedText {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

type DetectTextWithGoogleVisionResult =
  | {
      data: Rectangle[][];
      originalResponse: any;
      error: null;
    }
  | {
      data: null;
      originalResponse: any;
      error: Error;
    };

const detectPdf = async ({ gsImageUrl, fileUuid }: { gsImageUrl: string; fileUuid: string }) => {
  const { outputFolderPath } = generateFilepath({
    uuid: fileUuid,
    fileType: 'pdf',
    date: new Date(),
  });

  const inputConfig = {
    mimeType: 'application/pdf',
    gcsSource: {
      uri: gsImageUrl,
    },
  };

  const outputConfig = {
    gcsDestination: {
      uri: `gs://${CONFIG.google.storageBucketName}/${outputFolderPath}`,
    },
  };

  const [operation] = await client.asyncBatchAnnotateFiles({
    requests: [
      {
        inputConfig,
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        outputConfig,
      },
    ],
  });

  const [filesResponse] = await operation.promise();

  const folderDestinationUrl = filesResponse.responses?.[0]?.outputConfig?.gcsDestination?.uri;
  if (!folderDestinationUrl) {
    return {
      data: null,
      originalResponse: null,
      error: new Error('No destination URI found'),
    };
  }

  const results = await fetchOcrResults({
    filePath: outputFolderPath,
    storage: googleStorageClient,
    bucketName: CONFIG.google.storageBucketName,
  });
  return {
    data: results,
    originalResponse: filesResponse,
    error: null,
  };
};

export const ocrDetectText = async ({
  gsImageUrl,
  fileUuid,
}: {
  gsImageUrl: string;
  fileUuid: string;
}): Promise<DetectTextWithGoogleVisionResult> => {
  try {
    return await detectPdf({ gsImageUrl, fileUuid });
  } catch (error) {
    return {
      data: null,
      originalResponse: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
