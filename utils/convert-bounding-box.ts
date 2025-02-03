import { BoundingBox, Size } from '@/hooks/use-pdf';

// TODO: Refactor. Manual boxes should be converted to server boxes so everything is in the same coordinate system.

export const convertServerBox = ({ box, pageSize }: { box: BoundingBox; pageSize: Size }) => ({
  ...box,
  x: box.x * pageSize.width,
  y: pageSize.height - box.y * pageSize.height - box.height * pageSize.height,
  width: box.width * pageSize.width,
  height: box.height * pageSize.height,
});

export const convertManualBox = ({
  box,
  pageSize,
  canvasBox,
}: {
  box: BoundingBox;
  pageSize: Size;
  canvasBox: BoundingBox;
}) => {
  const scaleY = pageSize.height / canvasBox.height;
  const scaleX = pageSize.width / canvasBox.width;

  const y = box.y * scaleY;
  const flippedY = pageSize.height - y - box.height * scaleY;

  return {
    x: box.x * scaleX,
    y: flippedY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
};

export const convertPdfBoxToCanvasBox = ({
  box,
  canvasBox,
}: {
  box: BoundingBox;
  canvasBox: BoundingBox;
}) => {
  const x = box.x * canvasBox.width;
  const y = box.y * canvasBox.height;
  const width = box.width * canvasBox.width;
  const height = box.height * canvasBox.height;
  return { x, y, width, height };
};
