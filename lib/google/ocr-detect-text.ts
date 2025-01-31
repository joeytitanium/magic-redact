import { Rectangle } from '@/types/rectangle';
import { generateFilepath } from '@/utils/generate-filepath';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { isNil } from 'lodash';

type BatchAnnotateFilesResponse = protos.google.cloud.vision.v1.IAnnotateFileResponse;

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

function transformVisionResponse(response: BatchAnnotateFilesResponse): Rectangle[][] {
  return (
    response.responses?.[0]?.fullTextAnnotation?.pages?.map((page) => {
      return (
        page.blocks
          ?.flatMap((block) =>
            block.paragraphs?.flatMap((paragraph) =>
              paragraph.words?.map((word) => {
                const vertices = word.boundingBox?.normalizedVertices;
                if (!vertices || vertices.length < 4) return null;

                const [topLeft, topRight, bottomRight] = vertices;

                return {
                  x: topLeft.x ?? 0,
                  y: topLeft.y ?? 0,
                  width: (topRight.x ?? 0) - (topLeft.x ?? 0),
                  height: (bottomRight.y ?? 0) - (topLeft.y ?? 0),
                  text: word.symbols?.map((symbol) => symbol.text).join('') ?? '',
                  confidence: word.confidence ?? 0,
                  sensitive: false,
                };
              })
            )
          )
          .filter((rect) => !isNil(rect)) ?? []
      );
    }) ?? []
  );
}
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

  const folderDestinationUrl = filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
  if (!folderDestinationUrl) {
    return {
      data: null,
      originalResponse: null,
      error: new Error('No destination URI found'),
    };
  }
  const resultUrl = `${filePath}output-1-to-1.json`;

  const [result] = await storage.bucket(BUCKET_NAME).file(resultUrl).download();
  const json = JSON.parse(result.toString()) as BatchAnnotateFilesResponse;

  return {
    data: transformVisionResponse(json),
    originalResponse: null,
    // originalResponse: filesResponse?.responses?.[0],
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
    } else {
      return await detectNonPdf(gsImageUrl);
    }
  } catch (error) {
    return {
      data: null,
      originalResponse: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};
