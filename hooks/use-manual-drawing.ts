import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoundingBoxWithMetadata, Coordinates } from './use-pdf';

type UseManualDrawingProps = {
  ref: React.RefObject<HTMLDivElement>;
  addBox: (box: BoundingBoxWithMetadata) => void;
};

export const useManualDrawing = ({ ref, addBox }: UseManualDrawingProps) => {
  const [draftBox, setDraftBox] = useState<BoundingBoxWithMetadata | null>(null);
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
    if (!isDrawing || !startPoint || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    draftBox,
    resetDraftBox: () => setDraftBox(null),
  };
};
