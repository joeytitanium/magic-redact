import { CONFIG } from '@/config';
import { canvasCoordinates } from '@/utils/image-coordinates';
import { useViewportSize } from '@mantine/hooks';
import { cloneDeep } from 'lodash';
import { PDFDocument, rgb } from 'pdf-lib';
import { useMemo, useRef, useState } from 'react';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

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

const convertServerBox = ({
  box,
  width,
  height,
}: {
  box: BoundingBox;
  width: number;
  height: number;
}) => ({
  ...box,
  x: box.x * width,
  y: height - box.y * height - box.height * height,
  width: box.width * width,
  height: box.height * height,
});

const bytesToUrl = (bytes: Uint8Array<ArrayBufferLike> | ArrayBuffer) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

const convertManualBox = ({
  box,
  pageSize,
  canvasBox,
}: {
  box: BoundingBox;
  pageSize: Size;
  canvasBox: BoundingBox;
}) => {
  const scaleY = pageSize.height / canvasBox.height;
  const scaleX = pageSize.width / canvasBox.width;

  const y = box.y * scaleY;
  const flippedY = pageSize.height - y - box.height * scaleY;

  return {
    x: box.x * scaleX,
    y: flippedY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
};

export const usePdf = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File>();
  const [numPages, setNumPages] = useState(0);
  const [pageSize, setPageSize] = useState<Size>({ width: 0, height: 0 });
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [boxes, setBoxes] = useState<BoundingBoxWithMetadata[][]>([]);

  const resetPdf = () => {
    setFile(undefined);
    setPageSize({ width: 0, height: 0 });
    setPdfUrl(undefined);
    setCurrentPageIndex(0);
    setBoxes([]);
  };

  const viewportSize = useViewportSize();

  const loadPdf = async (newFile: File) => {
    setFile(newFile);
    const pdfArrayBuffer = await newFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    setPageSize(pdfDoc.getPages()[0].getSize());
    setCurrentPageIndex(0);
    setBoxes([]);
    setPdfUrl(bytesToUrl(pdfArrayBuffer));
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

  const drawBoxes = async ({ boxes: boxesToDraw }: { boxes: BoundingBoxWithMetadata[][] }) => {
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
                width: page.getWidth(),
                height: page.getHeight(),
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

    await drawBoxes({ boxes: manualBoxesCopy });
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
    await drawBoxes({ boxes: boxesCopy });
  };

  const nextPage = () => {
    if (currentPageIndex === numPages - 1) return;
    setCurrentPageIndex((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPageIndex === 0) return;
    setCurrentPageIndex((prev) => prev - 1);
  };

  return {
    addManualBox,
    addServerBoxes,
    canvasBox,
    currentPageIndex,
    loadPdf,
    onPdfLoaded,
    resetPdf,
    pageSize,
    pdfFile: file,
    pdfUrl,
    ref,
    nextPage,
    previousPage,
    numPages,
  };
};
