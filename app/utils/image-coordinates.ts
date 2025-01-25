import { Rect, Rectangle } from '@/types/rectangle';
import { Size } from '@/types/size';

export const imageCoordinates = ({
  imageSize,
  viewportSize,
  headerHeight,
  footerHeight,
  margin = 10,
}: {
  imageSize: Size;
  viewportSize: Size;
  headerHeight: number;
  footerHeight: number;
  margin?: number;
}): Rectangle => {
  const isPortrait = imageSize.width < imageSize.height;
  const imageScale = imageSize.width / imageSize.height;

  if (isPortrait) {
    const height = viewportSize.height - headerHeight - footerHeight - margin * 2;
    const width = height * imageScale;

    return {
      x: viewportSize.width / 2 - width / 2,
      y: headerHeight + margin,
      width,
      height,
    };
  }

  const width = viewportSize.width - margin * 2;
  const height = width * imageScale;

  return {
    x: viewportSize.width / 2 - width / 2,
    y: viewportSize.height - footerHeight - headerHeight - height,
    width,
    height,
  };
};

export const scaledRect = ({
  rect,
  scaledImageSize,
  originalImageSize,
}: {
  rect: Rect;
  scaledImageSize: Size;
  originalImageSize: Size;
}) => {
  const diff = originalImageSize.width / scaledImageSize.width;
  return {
    ...rect,
    x: rect.x / diff,
    y: rect.y / diff,
    width: rect.width / diff,
    height: rect.height / diff,
  };
};

export const scaledRects = ({
  rects,
  scaledImageSize,
  originalImageSize,
}: {
  rects: Rect[];
  scaledImageSize: Size;
  originalImageSize: Size;
}) => rects.map((rect) => scaledRect({ rect, scaledImageSize, originalImageSize }));
