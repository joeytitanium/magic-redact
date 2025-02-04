import { Rectangle } from '@/types/rectangle';
import { generateFilepath } from '@/utils/generate-filepath';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { fetchOcrResults } from './fetch-ocr-results';

const BUCKET_NAME = 'magic-redact';

const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

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
  const filePath = generateFilepath({
    uuid: fileUuid,
    fileType: 'pdf',
    date: new Date(),
    type: 'output',
  });

  const inputConfig = {
    mimeType: 'application/pdf',
    gcsSource: {
      uri: gsImageUrl,
    },
  };

  const outputConfig = {
    gcsDestination: {
      uri: `gs://${BUCKET_NAME}/${filePath}`,
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

  const results = await fetchOcrResults({ filePath, storage, bucketName: BUCKET_NAME });
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
