import { CONFIG } from '@/config';
import { convertManualBox, convertServerBox } from '@/utils/convert-bounding-box';
import { canvasCoordinates } from '@/utils/image-coordinates';
import { logError } from '@/utils/logger';
import { useHotkeys, useViewportSize } from '@mantine/hooks';
import { cloneDeep } from 'lodash';
import { PDFDocument, rgb } from 'pdf-lib';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { useMemo, useRef, useState } from 'react';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

export type Coordinates = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type BoundingBox = Coordinates & Size;
export type BoundingBoxWithMetadata = BoundingBox & {
  id: string;
  source: 'user' | 'server';
  sensitive: boolean;
};

const bytesToUrl = (bytes: Uint8Array<ArrayBufferLike> | ArrayBuffer) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

const isImageFile = (file: File) => file.type.startsWith('image/');

const createPdfFromImage = async (imageFile: File): Promise<Uint8Array> => {
  const isHeic = imageFile.type === 'image/heic';

  if (isHeic) {
    // Note: We do this import here otherwise we get a window is not defined error.
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({ blob: imageFile, toType: 'image/jpeg' });
    imageFile = new File([convertedBlob as Blob], imageFile.name.replace(/\.[^/.]+$/, '.jpg'), {
      type: 'image/jpeg',
    });
  }

  const pdfDoc = await PDFDocument.create();
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D context from canvas.');
  }

  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = URL.createObjectURL(imageFile);
  });

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = canvas.toDataURL('image/png');
  const embeddedImage = await pdfDoc.embedPng(imageData);

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
  });
  canvas.remove();
  URL.revokeObjectURL(img.src);

  return pdfDoc.save();
};

export const usePdf = () => {
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File>();
  const [numPages, setNumPages] = useState(0);
  const [pageSize, setPageSize] = useState<Size>({ width: 0, height: 0 });
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [boxes, setBoxes] = useState<BoundingBoxWithMetadata[][]>([]);
  const [previewRedacted, setPreviewRedacted] = useState(false);
  const [fileExtension, setFileExtension] = useState<string>();

  const resetPdf = () => {
    setFile(undefined);
    setPageSize({ width: 0, height: 0 });
    setPdfUrl(undefined);
    setCurrentPageIndex(0);
    setBoxes([]);
    setNumPages(0);
    setFileExtension(undefined);
  };

  const nextPage = () => {
    if (currentPageIndex === numPages - 1) return;
    setCurrentPageIndex((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPageIndex === 0) return;
    setCurrentPageIndex((prev) => prev - 1);
  };

  const goToPage = (page: number) => {
    if (page < 0 || page >= numPages) return;
    setCurrentPageIndex(page);
  };

  useHotkeys([
    ['ArrowRight', nextPage],
    ['ArrowLeft', previousPage],
    ['ArrowUp', previousPage],
    ['ArrowDown', nextPage],
  ]);

  const viewportSize = useViewportSize();

  const loadFile = async (newFile: File) => {
    resetPdf();
    try {
      const extension = newFile.name.split('.').pop() ?? '';
      setFileExtension(extension);

      if (isImageFile(newFile)) {
        const pdfBytes = await createPdfFromImage(newFile);
        const pdfFile = new File([pdfBytes], newFile.name.replace(/\.[^/.]+$/, '.pdf'), {
          type: 'application/pdf',
        });
        setFile(pdfFile); // Update the file state with the new PDF file
        setPdfUrl(bytesToUrl(pdfBytes));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        setPageSize(pdfDoc.getPages()[0].getSize());
      } else if (newFile.type === 'application/pdf') {
        setFile(newFile);
        const pdfBytes = await newFile.arrayBuffer();
        setPdfUrl(bytesToUrl(pdfBytes));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        setPageSize(pdfDoc.getPages()[0].getSize());
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
    } catch (error) {
      logError({ message: 'Error loading file', error });
      throw error;
    }
  };

  const canvasBox = useMemo(
    () =>
      canvasCoordinates({
        imageSize: pageSize,
        viewportSize,
        headerHeight: CONFIG.layout.headerHeight,
        footerHeight: CONFIG.layout.footerHeight,
      }),
    [pageSize, viewportSize]
  );

  const onPdfLoaded = (props: DocumentCallback) => {
    setNumPages(props.numPages);
  };

  const drawBoxes = async ({
    boxes: boxesToDraw,
    previewRedacted: previewRedactedToDraw,
  }: {
    boxes: BoundingBoxWithMetadata[][];
    previewRedacted: boolean;
  }) => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    let pageNumber = 0;
    for (const page of pages) {
      const pageBoxes = boxesToDraw[pageNumber] ?? [];
      for (const box of pageBoxes) {
        const convertedBox =
          box.source === 'user'
            ? convertManualBox({
                box,
                pageSize,
                canvasBox,
              })
            : convertServerBox({
                box,
                pageSize,
              });
        if (box.sensitive) {
          page.drawRectangle({
            x: convertedBox.x,
            y: convertedBox.y,
            width: convertedBox.width,
            height: convertedBox.height,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: rgb(0, 0, 0),
            opacity: previewRedactedToDraw ? 0.5 : 1,
          });
        }
      }
      pageNumber++;
    }

    pdfDoc.setCreator('auto-redacted by magicredact.com');
    pdfDoc.setProducer('magicredact.com');
    pdfDoc.setModificationDate(new Date());

    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfUrl = bytesToUrl(modifiedPdfBytes);
    setPdfUrl(modifiedPdfUrl);
    return modifiedPdfUrl;
  };

  const addManualBox = async ({
    box: newBox,
    pageNumber,
  }: {
    box: BoundingBoxWithMetadata;
    pageNumber: number;
  }) => {
    if (!file) return;

    const manualBoxesCopy = cloneDeep(boxes);
    const pageBoxes = manualBoxesCopy[pageNumber] ?? [];
    if (pageBoxes.some((x) => x.id === newBox.id)) return manualBoxesCopy;
    pageBoxes.push(newBox);
    manualBoxesCopy[pageNumber] = pageBoxes;
    setBoxes(manualBoxesCopy);

    await drawBoxes({ boxes: manualBoxesCopy, previewRedacted });
  };

  const addServerBoxes = async ({ boxes: newBoxes }: { boxes: BoundingBoxWithMetadata[][] }) => {
    const maxPages = Math.max(boxes.length, newBoxes.length);
    const boxesCopy = cloneDeep(boxes);

    for (let i = 0; i < maxPages; i++) {
      const pageBoxes = boxesCopy[i] ?? [];
      const newPageBoxes = newBoxes[i] ?? [];
      const combinedPageBoxes = [...pageBoxes, ...newPageBoxes].filter(
        (x, index, self) => self.findIndex((t) => t.id === x.id) === index
      );
      boxesCopy[i] = combinedPageBoxes;
    }

    setBoxes(boxesCopy);
    await drawBoxes({ boxes: boxesCopy, previewRedacted });
  };

  const deleteBox = async (id: string) => {
    if (!file) return;

    const boxesCopy = cloneDeep(boxes);
    const pageBoxes = boxesCopy[currentPageIndex] ?? [];
    const newPageBoxes = pageBoxes.filter((x) => x.id !== id);
    boxesCopy[currentPageIndex] = newPageBoxes;
    setBoxes(boxesCopy);
    await drawBoxes({ boxes: boxesCopy, previewRedacted });
  };

  const togglePreviewRedacted = async ({
    onCompleted,
  }: {
    onCompleted?: ({
      pdfUrl,
      previewRedacted,
    }: {
      pdfUrl: string | undefined;
      previewRedacted: boolean;
    }) => void;
  } = {}) => {
    setPreviewRedacted((prev) => !prev);
    const url = await drawBoxes({ boxes, previewRedacted: !previewRedacted });
    onCompleted?.({ pdfUrl: url, previewRedacted: !previewRedacted });
  };

  return {
    addManualBox,
    addServerBoxes,
    boxes,
    canvasBox,
    currentPageIndex,
    deleteBox,
    fileExtension,
    loadFile,
    nextPage,
    numPages,
    onPdfLoaded,
    pageSize,
    pdfFile: file,
    pdfUrl,
    previousPage,
    mobileRef,
    desktopRef,
    resetPdf,
    togglePreviewRedacted,
    previewRedacted,
    goToPage,
  };
};
