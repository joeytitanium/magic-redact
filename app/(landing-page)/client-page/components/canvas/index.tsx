import { CONFIG } from '@/config';
import { BoundingBox, BoundingBoxWithMetadata } from '@/hooks/use-pdf';
import { Rect } from '@/types/rectangle';
import { convertPdfBoxToCanvasBox } from '@/utils/convert-bounding-box';

import { Box, Center, Paper, PaperProps, UnstyledButton } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type CanvasProps = PaperProps & {
  file: File;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  draftBox: Rect | null;
  imageRef: React.RefObject<HTMLDivElement>;
  currentPageIndex: number;
  canvasBox: BoundingBox;
  onPdfLoaded: (props: DocumentCallback) => void;
  hoveringOverBox: BoundingBoxWithMetadata | null;
  onDeleteBox: (id: string) => void;
};

export const Canvas = ({
  file,
  imageRef,
  canvasBox,
  currentPageIndex,
  draftBox,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  hoveringOverBox,
  onDeleteBox,
  onPdfLoaded,

  ...paperProps
}: CanvasProps) => {
  const hoverBox = (() => {
    if (!hoveringOverBox) return null;
    if (hoveringOverBox.source === 'user') return hoveringOverBox;
    return convertPdfBoxToCanvasBox({ box: hoveringOverBox, canvasBox });
  })();

  return (
    <Paper
      ref={imageRef}
      pos="fixed"
      withBorder
      radius={0}
      top={canvasBox.y}
      left={canvasBox.x}
      style={{
        cursor: 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      {...paperProps}
    >
      <Document file={file} onLoadSuccess={onPdfLoaded}>
        <Page
          pageIndex={currentPageIndex}
          width={canvasBox.width}
          height={canvasBox.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          // onMouseLeave={handleMouseUp}
        />
      </Document>
      {draftBox && (
        <Box
          style={{
            position: 'absolute',
            top: draftBox.y,
            left: draftBox.x,
            width: draftBox.width,
            height: draftBox.height,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid black',
          }}
        />
      )}
      {hoverBox && hoveringOverBox && (
        <UnstyledButton
          onClick={() => onDeleteBox(hoveringOverBox.id)}
          style={{
            cursor: 'pointer',
            position: 'absolute',
            top: hoverBox.y,
            left: hoverBox.x,
            width: hoverBox.width,
            height: hoverBox.height,
            zIndex: CONFIG.zIndex.hoverOverBox,
          }}
          variant="filled"
          color="red.5"
        >
          <Center>
            <IconTrash size={CONFIG.icon.size.sm} color="var(--mantine-color-red-5)" />
          </Center>
        </UnstyledButton>
      )}
    </Paper>
  );
};
