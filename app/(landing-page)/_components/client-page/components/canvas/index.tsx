import { CONFIG } from '@/config';
import { BoundingBox, BoundingBoxWithMetadata } from '@/hooks/use-pdf';
import { Rect } from '@/types/rectangle';
import { convertPdfBoxToCanvasBox } from '@/utils/convert-bounding-box';

import { Box, Paper, PaperProps, Popover, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type CanvasProps = PaperProps & {
  file: File | string;
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
  const [opened, { close, open }] = useDisclosure(false);

  const hoverBox = (() => {
    if (!hoveringOverBox) return null;
    if (hoveringOverBox.source === 'user') return hoveringOverBox;
    return convertPdfBoxToCanvasBox({ box: hoveringOverBox, canvasBox });
  })();

  return (
    <Paper
      className="ph-no-capture"
      ref={imageRef}
      withBorder
      radius={0}
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
        <Popover
          opened={opened}
          styles={{
            dropdown: {
              padding: 8,
            },
          }}
          withArrow
        >
          <Popover.Target>
            <UnstyledButton
              onMouseEnter={open}
              onMouseLeave={close}
              onClick={() => onDeleteBox(hoveringOverBox.id)}
              style={{
                cursor: 'pointer',
                position: 'absolute',
                top: hoverBox.y,
                left: hoverBox.x,
                width: hoverBox.width,
                height: hoverBox.height,
                zIndex: CONFIG.zIndex.hoverOverBox,
                opacity: 0.5,
              }}
              // bg="red.5"
            />
          </Popover.Target>
          <Popover.Dropdown>
            <Text fz="xs">Click to delete</Text>
          </Popover.Dropdown>
        </Popover>
      )}
    </Paper>
  );
};
