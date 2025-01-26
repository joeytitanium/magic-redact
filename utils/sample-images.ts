import { Rect } from '@/types/rectangle';

export const SAMPLE_IMAGES = ['/sample-lemon-squeezy.jpeg'] as const;
export type SampleImage = (typeof SAMPLE_IMAGES)[number];

export const sampleImageSize: Record<SampleImage, { width: number; height: number }> = {
  '/sample-lemon-squeezy.jpeg': { width: 521, height: 640 },
};

export const sampleImageRects: Record<SampleImage, Rect[]> = {
  '/sample-lemon-squeezy.jpeg': [
    {
      id: '7f129a27-9a51-4ac0-ab80-902e5125eb86',
      source: 'user',
      x: 95.109375,
      y: 573,
      width: 172,
      height: 26,
    },
    {
      id: '47082b22-bc4e-425c-85dd-6ff65ba555de',
      source: 'user',
      x: 105.109375,
      y: 612,
      width: 95,
      height: 24,
    },
    {
      id: '26d54813-99ff-4935-9d39-15b285f576f0',
      source: 'user',
      x: 102.109375,
      y: 648,
      width: 194,
      height: 27,
    },
  ],
};
