'use client';

import { CONFIG } from '@/config';
import { Rect, Rectangle } from '@/types/rectangle';
import { canvasCoordinates } from '@/utils/image-coordinates';
import { Box } from '@mantine/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfCanvasProps {
  file: File;
  serverRects: Rect[][];
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  currentRect: Rect | null;
  imageRef: React.RefObject<HTMLDivElement>;
  manualRectangles: Rect[];
}

export const PdfCanvas = ({
  file,
  serverRects,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  currentRect,
  imageRef,
  manualRectangles,
}: PdfCanvasProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);

  const [canvasRect, setCanvasRect] = useState<Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const modifyPdf = async () => {
      try {
        // Load the PDF file
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Draw boxes for each bounding box
        if (serverRects.length > 0) {
          const convertedServerRects = serverRects[0].map((box) => ({
            ...box,
            x: box.x * width,
            y: height - box.y * height - box.height * height, // Adjust Y because we're drawing from bottom-left
            width: box.width * width,
            height: box.height * height,
          }));

          convertedServerRects.forEach((box) => {
            firstPage.drawRectangle({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              borderColor: box.sensitive ? rgb(1, 0, 0) : rgb(0.5, 0.5, 0.5),
              borderWidth: 1,
              // color: box.sensitive rgb(1, 0, 0, 0.1), // Transparent red fill
            });
          });
        }

        if (manualRectangles.length > 0) {
          const convertedRects = manualRectangles.map((rect) => ({
            x: rect.x,
            y: height - rect.y - rect.height,
            width: rect.width,
            height: rect.height,
          }));

          convertedRects.forEach((rect) => {
            firstPage.drawRectangle({
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              borderColor: rgb(1, 0, 0),
              borderWidth: 1,
            });
          });
        }

        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();

        // Create a URL for the modified PDF
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setModifiedPdfUrl(url);

        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error processing PDF:', error);
      }
    };

    if (serverRects.length > 0 || manualRectangles.length > 0) {
      void modifyPdf();
    }
  }, [file, serverRects, manualRectangles]);

  const onLoadSuccess = async (doc: DocumentCallback) => {
    setNumPages(doc.numPages);
    const page = await doc.getPage(1);

    const coordinates = canvasCoordinates({
      imageSize: {
        width: page.getViewport({ scale: 1 }).width,
        height: page.getViewport({ scale: 1 }).height,
      },
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
      headerHeight: CONFIG.layout.headerHeight,
      footerHeight: CONFIG.layout.footerHeight,
    });
    setCanvasRect(coordinates);
  };

  return (
    <Box
      ref={imageRef}
      pos="fixed"
      style={{
        top: canvasRect.y,
        left: canvasRect.x,
        w: canvasRect.width,
        h: canvasRect.height,
        cursor: 'crosshair',
        userSelect: 'none',
      }}
    >
      <Document file={modifiedPdfUrl ?? file} onLoadSuccess={onLoadSuccess}>
        <Page
          pageNumber={currentPage}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </Document>
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
};
