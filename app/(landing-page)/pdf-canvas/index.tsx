'use client';

import { BoundingBox } from '@/hooks/use-pdf';
import { Rect } from '@/types/rectangle';
import { Box } from '@mantine/core';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback, File } from 'react-pdf/dist/cjs/shared/types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfCanvasProps {
  file: File;
  // modifiedPdfUrl: string | undefined;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  draftBox: Rect | null;
  imageRef: React.RefObject<HTMLDivElement>;
  currentPageNumber: number;
  canvasBox: BoundingBox;

  onPdfLoaded: (props: DocumentCallback) => void;
}

export const PdfCanvas = ({
  file,
  // modifiedPdfUrl,
  // serverRects,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  draftBox,
  imageRef,
  // manualRectangles,
  canvasBox,
  currentPageNumber,
  onPdfLoaded,
}: PdfCanvasProps) => (
  <Box
    ref={imageRef}
    pos="fixed"
    style={{
      top: canvasBox.y,
      left: canvasBox.x,
      cursor: 'crosshair',
      userSelect: 'none',
    }}
  >
    <Document file={file}>
      <Page
        pageNumber={currentPageNumber + 1}
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
    {/* {numPages > 1 && (
        <Box
          style={{
            position: 'sticky',
            bottom: 20,
            background: 'white',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages}
          >
            Next
          </button>
        </Box> */}
    {/* )} */}
  </Box>
);
