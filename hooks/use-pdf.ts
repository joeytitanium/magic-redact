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

// const convertServerBox = ({
//   box,
//   width,
//   height,
// }: {
//   boxes: BoundingBox;
//   width: number;
//   height: number;
// }) => ({
//   ...box,
//   x: box.x * width,
//   y: height - box.y * height - box.height * height,
//   width: box.width * width,
//   height: box.height * height,
// });

const bytesToUrl = (bytes: Uint8Array<ArrayBufferLike> | ArrayBuffer) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

const insertBox = ({
  box,
  pageNumber,
  existingBoxes,
}: {
  box: BoundingBoxWithMetadata;
  pageNumber: number;
  existingBoxes: BoundingBoxWithMetadata[][];
}) => {
  const manualBoxesCopy = cloneDeep(existingBoxes);
  const pageBoxes = manualBoxesCopy[pageNumber] ?? [];
  if (pageBoxes.some((x) => x.id === box.id)) return manualBoxesCopy;
  pageBoxes.push(box);
  manualBoxesCopy[pageNumber] = pageBoxes;
  return manualBoxesCopy;
};

const convertManualBox = ({ box, pageSize }: { box: BoundingBox; pageSize: Size }) => ({
  x: box.x,
  y: pageSize.height - box.y - box.height,
  width: box.width,
  height: box.height,
});

export const usePdf = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File>();
  const [pageSize, setPageSize] = useState<Size>({ width: 0, height: 0 });
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [currentPageNumber, setCurrentPageNumber] = useState(0);
  const [manualBoxes, setManualBoxes] = useState<BoundingBoxWithMetadata[][]>([]);

  const viewportSize = useViewportSize();

  const loadPdf = async (newFile: File) => {
    setFile(newFile);
    const pdfArrayBuffer = await newFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    setPageSize(pdfDoc.getPages()[0].getSize());
    setCurrentPageNumber(0);
    setManualBoxes([]);
    setPdfUrl(bytesToUrl(pdfArrayBuffer));
  };

  // const pageSize = useMemo(() => {
  //   if (!pdfDoc) return { width: 0, height: 0 };
  //   return pdfDoc.getPages()[0].getSize();
  // }, [pdfDoc]);
  // const numPages = pdfDoc?.getPageCount() ?? 0;

  // const canvasBox = useMemo(
  //   () =>
  //     canvasCoordinates({
  //       imageSize: pageSize,
  //       viewportSize: { width: window.innerWidth, height: window.innerHeight },
  //       headerHeight: CONFIG.layout.headerHeight,
  //       footerHeight: CONFIG.layout.footerHeight,
  //     }),
  //   [pageSize]
  // );

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

  const onPdfLoaded = (props: DocumentCallback) => {};

  const addBox = async ({
    box: newBox,
    pageNumber,
  }: {
    box: BoundingBoxWithMetadata;
    pageNumber: number;
  }) => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    const updatedManualBoxes = insertBox({ box: newBox, pageNumber, existingBoxes: manualBoxes });

    for (const page of pages) {
      const pageBoxes = updatedManualBoxes[pageNumber] ?? [];
      for (const box of pageBoxes) {
        const convertedBox = convertManualBox({ box, pageSize });
        page.drawRectangle({
          x: convertedBox.x,
          y: convertedBox.y,
          width: convertedBox.width,
          height: convertedBox.height,
          borderColor: rgb(1, 0, 0),
          borderWidth: 1,
        });
      }
    }

    setManualBoxes(updatedManualBoxes);
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfUrl = bytesToUrl(modifiedPdfBytes);
    setPdfUrl(modifiedPdfUrl);
  };

  return {
    pdfFile: file,
    pdfUrl,
    canvasBox,
    loadPdf,
    currentPageNumber,
    setCurrentPageNumber,
    onPdfLoaded,
    addBox,
    ref,
  };
};
