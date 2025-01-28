import { Rect, Rectangle } from '@/types/rectangle';
import { ActionIcon, Box, Image } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { CSSProperties } from 'react';

export const ImageCanvas = ({
  imageRef,
  canvasCoordinates,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  imageUrl,
  rectangles,
  hoveredRectId,
  handleDeleteRect,
  currentRect,
  onHoveredRectIdChange,
  showRedacted,
}: {
  imageRef: React.RefObject<HTMLDivElement>;
  canvasCoordinates: Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  imageUrl: string;
  rectangles: Rect[];
  hoveredRectId: string | null;
  handleDeleteRect: (id: string) => void;
  currentRect: Rect | null;
  onHoveredRectIdChange: (id: string | null) => void;
  showRedacted: boolean;
}) => {
  const stylingForRect = (rect: Rect): CSSProperties => {
    if (rect.sensitive) {
      return {
        backgroundColor: !showRedacted ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.3)',
      };
    }

    return {
      border: '1px solid green',
    };
  };

  return (
    <Box
      ref={imageRef}
      pos="fixed"
      id="node"
      top={canvasCoordinates.y}
      left={canvasCoordinates.x}
      w={canvasCoordinates.width}
      h={canvasCoordinates.height}
      style={{ cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Image src={imageUrl} alt="Uploaded image" />
      {rectangles.map((rect) => (
        <Box
          key={rect.id}
          style={{
            position: 'absolute',
            top: rect.y,
            left: rect.x,
            width: rect.width,
            height: rect.height,
            transition: 'all 0.2s ease',
            zIndex: hoveredRectId === rect.id ? 10 : 1,
            ...stylingForRect(rect),
          }}
          onMouseEnter={() => onHoveredRectIdChange(rect.id)}
          onMouseLeave={() => onHoveredRectIdChange(null)}
        >
          {hoveredRectId === rect.id && (
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              radius="xl"
              pos="absolute"
              top={-10}
              right={-10}
              onClick={() => handleDeleteRect(rect.id)}
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Box>
      ))}
      {currentRect && (
        <Box
          style={{
            position: 'absolute',
            top: currentRect.y,
            left: currentRect.x,
            width: currentRect.width,
            height: currentRect.height,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid black',
          }}
        />
      )}
    </Box>
  );
};
