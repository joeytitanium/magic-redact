import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
      data: DetectedText[];
      originalResponse: any;
      error: null;
    }
  | {
      data: null;
      originalResponse: any;
      error: Error;
    };

export const detectTextWithGoogleVision = async (
  gcsUri: string
): Promise<DetectTextWithGoogleVisionResult> => {
  try {
    if (gcsUri.toLowerCase().endsWith('.pdf')) {
      const bucketName = 'magic-redact';
      const outputPrefix = 'vision-output';

      const inputConfig = {
        mimeType: 'application/pdf',
        gcsSource: {
          uri: gcsUri,
        },
      };

      const outputConfig = {
        gcsDestination: {
          uri: `gs://${bucketName}/${outputPrefix}/`,
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
      console.log('Operation started, waiting for completion...');

      const [filesResponse] = await operation.promise();

      const destinationUri = filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
      console.log('JSON saved to:', destinationUri);

      // For now, return a basic response to verify it's working
      return {
        data: [],
        originalResponse: filesResponse?.responses?.[0],
        error: null,
      };
    } else {
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
        originalResponse: result,
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
        error: null,
      };
    }
  } catch (error) {
    return {
      data: null,
      originalResponse: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
