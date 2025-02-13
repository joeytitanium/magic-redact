'use client';

import { LogDomain, logError } from '@/utils/logger';
import { PDFDocument } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

const DOMAIN: LogDomain = 'use-pdf-export';

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

const downloadBlob = (blob: Blob, fileName: string) => {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
};

export const usePdfExport = () => {
  const exportPdf = async ({
    fileUrl,
    fileExtension,
    options,
  }: {
    fileUrl: string;
    fileExtension: string;
    options: Options;
  }): Promise<void> => {
    try {
      if (fileExtension.toLowerCase() !== 'pdf') {
        const loadingTask = getDocument({ url: fileUrl });
        const pdfDoc: PDFDocumentProxy = await loadingTask.promise;
        // For image files, assume a single page PDF (adjust if you support multi-page images).
        const pdfPage: PDFPageProxy = await pdfDoc.getPage(1);
        const viewport = pdfPage.getViewport({ scale: options.scale ?? 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get 2D context from canvas.');
        }

        await pdfPage.render({ canvasContext: context, viewport }).promise;

        const lowerExtension = fileExtension.toLowerCase();
        let mimeType = 'image/png';
        if (['jpg', 'jpeg'].includes(lowerExtension)) {
          mimeType = 'image/jpeg';
        } else if (lowerExtension === 'webp') {
          mimeType = 'image/webp';
        } else if (lowerExtension === 'heic') {
          // HEIC conversion is not supported by canvas.toDataURL so fallback to JPEG.
          mimeType = 'image/jpeg';
        } else if (
          lowerExtension === 'gif' ||
          lowerExtension === 'bmp' ||
          lowerExtension === 'tiff'
        ) {
          // Canvas conversion does not natively support GIF (especially animations), BMP, or TIFF.
          // Fallback to PNG conversion.
          mimeType = 'image/png';
        }

        const imageData = canvas.toDataURL(mimeType);

        // Utility to convert a DataURL into a Blob.
        const dataURLtoBlob = (dataUrl: string): Blob => {
          const [header, base64Data] = dataUrl.split(',');
          const mime = (header.match(/:(.*?);/) as RegExpMatchArray | null)?.[1] ?? mimeType;
          const byteString = atob(base64Data);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          return new Blob([uint8Array], { type: mime });
        };

        const blob = dataURLtoBlob(imageData);
        // Change the file name extension if needed.
        let finalFileName = options.fileName;
        if (finalFileName.toLowerCase().endsWith('.pdf')) {
          finalFileName =
            lowerExtension === 'heic'
              ? finalFileName.replace(/\.pdf$/i, '.jpg') // fallback to jpg for heic
              : finalFileName.replace(/\.pdf$/i, `.${lowerExtension}`);
        }
        downloadBlob(blob, finalFileName);
        canvas.remove();
        return;
      }

      const loadingTask = getDocument({ url: fileUrl });
      const pdfDoc: PDFDocumentProxy = await loadingTask.promise;
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
      downloadBlob(blob, options.fileName);
    } catch (error) {
      logError({
        domain: DOMAIN,
        message: 'Error during PDF flattening',
        error,
      });
      throw error;
    }
  };

  return { exportPdf };
};
