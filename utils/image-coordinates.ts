import { Rect, Rectangle } from '@/types/rectangle';
import { Size } from '@/types/size';

export const canvasCoordinates = ({
  imageSize,
  viewportSize,
  headerHeight,
  footerHeight,
  margin = 20,
}: {
  imageSize: Size;
  viewportSize: Size;
  headerHeight: number;
  footerHeight: number;
  margin?: number;
}): Pick<Rectangle, 'x' | 'y' | 'width' | 'height'> => {
  const isPortrait = imageSize.width < imageSize.height;
  const imageScale = imageSize.width / imageSize.height;

  if (isPortrait) {
    const availableWidth = viewportSize.width - margin * 2;
    let height = viewportSize.height - headerHeight - footerHeight - margin * 2;
    let width = height * imageScale;

    if (width > availableWidth) {
      width = availableWidth;
      height = width / imageScale;
    }

    return {
      x: viewportSize.width / 2 - width / 2,
      y: viewportSize.height / 2 - height / 2,
      width,
      height,
    };
  }

  const availableHeight = viewportSize.height - headerHeight - footerHeight - margin * 2;
  let width = viewportSize.width - margin * 2;
  let height = width / imageScale;

  if (height > availableHeight) {
    height = availableHeight;
    width = height * imageScale;
  }

  return {
    x: viewportSize.width / 2 - width / 2,
    y: viewportSize.height / 2 - height / 2,
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
  if (rect.source === 'user') return rect;

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
