import { convertPdfBoxToCanvasBox } from '@/utils/convert-bounding-box';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoundingBox, BoundingBoxWithMetadata, Coordinates } from './use-pdf';

type UseManualDrawingProps = {
  desktopRef: React.RefObject<HTMLDivElement>;
  mobileRef: React.RefObject<HTMLDivElement>;
  addBox: (box: BoundingBoxWithMetadata) => void;
  boxes: BoundingBoxWithMetadata[][];
  currentPageIndex: number;
  canvasBox: BoundingBox;
};

const findBoxHoveringOver = ({
  boxes,
  x,
  y,
  currentPageIndex,

  canvasBox,
}: {
  boxes: BoundingBoxWithMetadata[][];
  x: number;
  y: number;
  currentPageIndex: number;

  canvasBox: BoundingBox;
}) => {
  const boxesOnPage = boxes[currentPageIndex] ?? [];
  const targetBox = boxesOnPage.find((box) => {
    const b = box.source === 'user' ? box : convertPdfBoxToCanvasBox({ box, canvasBox });
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  });
  return targetBox ?? null;
};

export const useManualDrawing = ({
  mobileRef,
  desktopRef,
  addBox,
  boxes,
  currentPageIndex,
  canvasBox,
}: UseManualDrawingProps) => {
  const [draftBox, setDraftBox] = useState<BoundingBoxWithMetadata | null>(null);
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveringOverBox, setHoveringOverBox] = useState<BoundingBoxWithMetadata | null>(null);

  const ref = mobileRef.current?.clientWidth === 0 ? desktopRef : mobileRef;

  // useEffect(() => {
  //   if (!hoveringOverBoxId) return;

  //   const b = findBoxHoveringOver({
  //     boxes,
  //     x: hoveringOverBoxId.x,
  //     y: hoveringOverBoxId.y,
  //     currentPageIndex,
  //     pageSize,
  //     canvasBox,
  //   });
  //   if (!b) {
  //     setHoveringOverBoxId(null);
  //   }
  // }, [boxes, currentPageIndex, hoveringOverBox, pageSize, canvasBox]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setDraftBox({ id: uuidv4(), source: 'user', x, y, width: 0, height: 0, sensitive: true });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (!isDrawing || !startPoint) {
      const box = findBoxHoveringOver({
        boxes,
        x: currentX,
        y: currentY,
        currentPageIndex,
        canvasBox,
      });
      setHoveringOverBox(box ?? null);
      return;
    }

    // Determine the top-left position based on drag direction
    const x = currentX < startPoint.x ? currentX : startPoint.x;
    const y = currentY < startPoint.y ? currentY : startPoint.y;

    setDraftBox((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        x,
        y,
        width: Math.abs(currentX - startPoint.x),
        height: Math.abs(currentY - startPoint.y),
      };
    });
  };

  const handleMouseUp = async () => {
    if (draftBox && draftBox.width > 5 && draftBox.height > 5) {
      addBox(draftBox);
    }
    setIsDrawing(false);
    setDraftBox(null);
    setStartPoint(null);
  };

  return {
    draftBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    hoveringOverBox,
    resetDraftBox: () => setDraftBox(null),
  };
};
