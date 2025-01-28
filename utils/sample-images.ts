import { Rect } from '@/types/rectangle';

export const SAMPLE_IMAGES = ['/sample-lemon-squeezy.jpeg', '/sample-zoom-call.jpeg'] as const;
export type SampleImage = (typeof SAMPLE_IMAGES)[number];

export const sampleImageSize: Record<SampleImage, { width: number; height: number }> = {
  '/sample-lemon-squeezy.jpeg': { width: 521, height: 640 },
  '/sample-zoom-call.jpeg': { width: 1600, height: 1000 },
};

export const sampleImageThumbnail: Record<SampleImage, string> = {
  '/sample-lemon-squeezy.jpeg': '/sample-lemon-squeezy-thumbnail.jpg',
  '/sample-zoom-call.jpeg': '/sample-zoom-call-thumbnail.jpg',
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
      sensitive: true,
    },
    {
      id: '47082b22-bc4e-425c-85dd-6ff65ba555de',
      source: 'user',
      x: 105.109375,
      y: 612,
      width: 95,
      height: 24,
      sensitive: true,
    },
    {
      id: '26d54813-99ff-4935-9d39-15b285f576f0',
      source: 'user',
      x: 102.109375,
      y: 648,
      width: 194,
      height: 27,
      sensitive: true,
    },
  ],
  '/sample-zoom-call.jpeg': [
    {
      id: '30394282-69a1-424f-b85d-85a055b5aa70',
      source: 'user',
      x: 226.40625,
      y: 138,
      width: 22,
      height: 12,
      sensitive: true,
    },
    {
      id: 'b7f00add-0bb1-42cd-a758-56a9c31e590f',
      source: 'user',
      x: 250.40625,
      y: 138,
      width: 37,
      height: 12,
      sensitive: true,
    },
    {
      id: '0731dfa6-1856-484b-bc94-ed7edb0c9fd9',
      source: 'user',
      x: 361.40625,
      y: 138,
      width: 18,
      height: 12,
      sensitive: true,
    },
    {
      id: 'df9ab20d-4459-4b75-803b-db0c0609d98a',
      source: 'user',
      x: 381.40625,
      y: 138,
      width: 28,
      height: 12,
      sensitive: true,
    },
    {
      id: '32f14d8c-11aa-48c7-9294-083487073295',
      source: 'user',
      x: 507.40625,
      y: 139,
      width: 32,
      height: 10,
      sensitive: true,
    },
    {
      id: '1b76c96b-64bc-4617-b8e0-b34c5968b12c',
      source: 'user',
      x: 630.40625,
      y: 139,
      width: 29,
      height: 11,
      sensitive: true,
    },
    {
      id: '9c1015c3-62dc-4d25-a8bc-134786ac121e',
      source: 'user',
      x: 661.40625,
      y: 139,
      width: 56,
      height: 11,
      sensitive: true,
    },
    {
      id: 'd5be99bb-cb8c-4339-9abc-fd0d936ea70e',
      source: 'user',
      x: 777.40625,
      y: 139,
      width: 22,
      height: 11,
      sensitive: true,
    },
    {
      id: 'c7388d9c-707d-4877-a76f-b7f66639b0cd',
      source: 'user',
      x: 801.40625,
      y: 139,
      width: 26,
      height: 11,
      sensitive: true,
    },
  ],
};
