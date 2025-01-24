import { ImageAnnotatorClient } from '@google-cloud/vision';

const vision = new ImageAnnotatorClient({
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

export async function detectTextWithGoogleVision(imageUrl: string): Promise<DetectedText[]> {
  try {
    const [result] = await vision.documentTextDetection({
      image: { source: { imageUri: imageUrl } },
    });
    const detections = result.textAnnotations ?? [];

    // Skip the first detection as it contains the entire text
    return detections.slice(1).map((detection) => {
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
        originalData: detection,
      };
    });
  } catch (error) {
    console.error('Error in Google Vision text detection:', error);
    throw new Error('Failed to perform OCR with Google Vision');
  }
}
