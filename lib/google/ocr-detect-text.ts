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

  const outputDir = `gs://${BUCKET_NAME}/${filePath}`;
  const outputConfig = {
    gcsDestination: {
      uri: `${outputDir}/output`,
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

const detectNonPdf = async (gcsUri: string) => {
  const [result] = await client.documentTextDetection(gcsUri);
  const detections = result.textAnnotations ?? [];

  if (result.error?.message) {
    return {
      data: null,
      originalResponse: result,
      error: new Error(result.error.message),
    };
  }

  // Skip the first detection as it contains the entire text
  return {
    data: detections.slice(1).map((detection) => {
      const vertices = detection.boundingPoly?.vertices ?? [];
      const [topLeft, topRight, bottomLeft] = vertices;

      return {
        text: detection.description ?? '',
        confidence: detection.confidence ?? 0,
        boundingBox: {
          x: topLeft.x ?? 0,
          y: topLeft.y ?? 0,
          width: (topRight.x ?? 0) - (topLeft.x ?? 0),
          height: (bottomLeft.y ?? 0) - (topLeft.y ?? 0),
        },
      };
    }),
    originalResponse: result,
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
    if (gsImageUrl.toLowerCase().endsWith('.pdf')) {
      return await detectPdf({ gsImageUrl, fileUuid });
    }

    return await detectNonPdf(gsImageUrl);
  } catch (error) {
    return {
      data: null,
      originalResponse: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
