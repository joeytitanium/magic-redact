import { CONFIG } from '@/config';
import { BoundingBox, BoundingBoxWithMetadata } from '@/hooks/use-pdf';
import { Rect } from '@/types/rectangle';

import { Paper, PaperProps, ScrollArea, Stack, UnstyledButton } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import classes from './mobile.module.css';

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
  numberOfPages: number;
  onDeleteBox: (id: string) => void;
  onPageChange: (page: number) => void;
};

export const MobileCanvas = ({
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
  numberOfPages,
  onPageChange,
  ...paperProps
}: CanvasProps) => {
  const { width: viewportWidth } = useViewportSize();

  return (
    <Paper
      ref={imageRef}
      radius={0}
      style={{
        cursor: 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className={classes.background}
      pb={CONFIG.layout.footerHeight}
      {...paperProps}
    >
      <ScrollArea>
        <Document file={file}>
          <Stack gap="xl">
            {Array.from({ length: numberOfPages }).map((_, index) => (
              <UnstyledButton pos="relative" key={index} onClick={() => onPageChange(index)}>
                <Paper radius={0} style={{ overflow: 'hidden' }}>
                  <Page pageIndex={index} width={viewportWidth} />
                </Paper>
              </UnstyledButton>
            ))}
          </Stack>
        </Document>
      </ScrollArea>
      {/* {draftBox && (
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
        color="red"
      >
        <Center>
          <IconTrash size={CONFIG.icon.size.sm} color="var(--mantine-color-red-5)" />
        </Center>
      </UnstyledButton>
    )} */}
    </Paper>
  );
};
