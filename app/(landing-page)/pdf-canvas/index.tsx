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
  rectangles: Rect[][];
}

const EXAMPLE_BOUNDING_BOXES = [
  {
    // "Joseph"
    x: 0.42156863,
    y: 0.053030305,
    width: 0.08170137, // 0.503268 - 0.42156863
    height: 0.017676765, // 0.07070707 - 0.053030305
  },
  {
    // "Stein"
    x: 0.5114379,
    y: 0.05050505,
    width: 0.0604575, // 0.5718954 - 0.5114379
    height: 0.017676764, // 0.06818182 - 0.05050505
  },
];

export const PdfCanvas = ({ file, rectangles }: PdfCanvasProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);
  const [canvasRect, setCanvasRect] = useState<Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  console.log(`🔫 rectangles: ${JSON.stringify(rectangles, null, '\t')}`);

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
        rectangles[0].forEach((box) => {
          // EXAMPLE_BOUNDING_BOXES.forEach((box) => {
          // Convert normalized coordinates to PDF coordinates
          const pdfX = box.x * width;
          const pdfY = height - box.y * height; // PDF coordinates start from bottom-left
          const boxWidth = box.width * width;
          const boxHeight = box.height * height;

          // Draw rectangle
          firstPage.drawRectangle({
            x: pdfX,
            y: pdfY - boxHeight, // Adjust Y because we're drawing from bottom-left
            width: boxWidth,
            height: boxHeight,
            borderColor: box.sensitive ? rgb(1, 0, 0) : rgb(0.5, 0.5, 0.5),
            borderWidth: 1,
            // color: box.sensitive rgb(1, 0, 0, 0.1), // Transparent red fill
          });
        });

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

    if (rectangles.length > 0) {
      void modifyPdf();
    }
  }, [file, rectangles]);

  const onLoadSuccess = async (doc: DocumentCallback) => {
    setNumPages(doc.numPages);
    console.log(`🔫 doc: ${JSON.stringify(await doc.getMetadata(), null, '\t')}`);
    const page = await doc.getPage(1);

    const coordinates = canvasCoordinates({
      imageSize: {
        width: await page.getViewport({ scale: 1 }).width,
        height: await page.getViewport({ scale: 1 }).height,
      },
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
      headerHeight: CONFIG.layout.headerHeight,
      footerHeight: CONFIG.layout.footerHeight,
    });
    console.log(`🔫 coordinates: ${JSON.stringify(coordinates, null, '\t')}`);
    setCanvasRect(coordinates);
  };

  console.log(`🔫 canvasRect: ${JSON.stringify(canvasRect, null, '\t')}`);

  return (
    <Box
      pos="fixed"
      style={{
        top: canvasRect.y,
        left: canvasRect.x,
        w: canvasRect.width,
        h: canvasRect.height,
      }}
    >
      <Document file={modifiedPdfUrl ?? file} onLoadSuccess={onLoadSuccess}>
        <Page pageNumber={currentPage} width={canvasRect.width} height={canvasRect.height} />
      </Document>

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
