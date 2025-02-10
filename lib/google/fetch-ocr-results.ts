import { Rectangle } from '@/types/rectangle';
import { logDebugMessage, LogDomain, logError } from '@/utils/logger';
import { File, Storage } from '@google-cloud/storage';
import { protos } from '@google-cloud/vision';
import { isNil } from 'lodash';

const DOMAIN: LogDomain = 'google-fetch-ocr-results';

type BatchAnnotateFilesResponse = protos.google.cloud.vision.v1.IAnnotateFileResponse;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const transformVisionResponse = (response: BatchAnnotateFilesResponse): Rectangle[][] =>
  response.responses?.map(
    (pageResponse) =>
      pageResponse.fullTextAnnotation?.pages?.[0].blocks
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
  ) ?? [];

const waitForJsonFiles = async ({
  storage,
  bucketName,
  filePath,
  maxAttempts = 5,
  initialDelayMs = 500,
}: {
  storage: Storage;
  bucketName: string;
  filePath: string;
  maxAttempts?: number;
  initialDelayMs?: number;
}): Promise<File[]> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Exponential backoff delay
    const delayMs = initialDelayMs * 2 ** attempt;
    await sleep(delayMs);

    logDebugMessage({
      domain: DOMAIN,
      message: `🔍 Checking for JSON files (attempt ${attempt + 1}/${maxAttempts})...`,
      context: { filePath, attempt: attempt + 1, maxAttempts },
    });

    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: filePath,
    });

    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    if (jsonFiles.length > 0) {
      logDebugMessage({
        domain: DOMAIN,
        message: `✅ Found ${jsonFiles.length} JSON files`,
        context: { numFiles: jsonFiles.length, fileNames: jsonFiles.map((f) => f.name) },
      });
      return jsonFiles;
    }
  }

  throw new Error(`No JSON files found after ${maxAttempts} attempts`);
};

export const fetchOcrResults = async ({
  filePath,
  storage,
  bucketName,
}: {
  filePath: string;
  storage: Storage;
  bucketName: string;
}): Promise<Rectangle[][]> => {
  try {
    const jsonFiles = await waitForJsonFiles({ storage, bucketName, filePath });
    logDebugMessage({
      domain: DOMAIN,
      message: 'Found JSON files in output directory',
      context: {
        filePath,
        bucketName,
        numFiles: jsonFiles.length,
      },
    });

    const allResults: Rectangle[][] = [];

    for (const file of jsonFiles) {
      try {
        const [result] = await file.download();
        const json = JSON.parse(result.toString()) as BatchAnnotateFilesResponse;
        const pageResults = transformVisionResponse(json);
        allResults.push(...pageResults);
      } catch (err) {
        logError({
          domain: DOMAIN,
          message: 'Error downloading result',
          context: {
            filePath,
            bucketName,
            error: err,
          },
        });
      }
    }

    return allResults;
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Error fetching OCR results',
      context: {
        filePath,
        bucketName,
        error,
      },
    });
    throw error;
  }
};
