'use client';

import { logError } from '@/utils/logger';
import { PDFDocument } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

type Options = {
  scale?: number;
  fileName: string;
};

export const usePdfExport = () => {
  const exportPdf = async (fileOrUrl: File | string, options: Options): Promise<void> => {
    try {
      let documentUrl: string;
      let createdUrl = false;
      if (typeof fileOrUrl === 'string') {
        documentUrl = fileOrUrl;
      } else {
        documentUrl = URL.createObjectURL(fileOrUrl);
        createdUrl = true;
      }

      const loadingTask = getDocument({ url: documentUrl });
      const pdfDoc: PDFDocumentProxy = await loadingTask.promise;
      if (createdUrl) {
        URL.revokeObjectURL(documentUrl);
      }
      const { numPages } = pdfDoc;

      const flattenedPdfDoc = await PDFDocument.create();

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const pdfPage: PDFPageProxy = await pdfDoc.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale: options.scale ?? 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get 2D context from canvas.');
        }

        await pdfPage.render({ canvasContext: context, viewport }).promise;

        const imageData = canvas.toDataURL('image/png');
        const embeddedImage = await flattenedPdfDoc.embedPng(imageData);

        const pdfPageLib = flattenedPdfDoc.addPage([viewport.width, viewport.height]);
        pdfPageLib.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        canvas.remove();
      }

      const pdfBytes = await flattenedPdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = options.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      logError({
        message: 'Error during PDF flattening',
        error,
      });
      throw error;
    }
  };

  return { exportPdf };
};
