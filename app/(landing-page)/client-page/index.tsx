'use client';

import { CONFIG } from '@/config';
import { Box } from '@mantine/core';

import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { SampleImage } from '@/utils/sample-images';
import { notifications } from '@mantine/notifications';
// import { useSearchParams } from 'next/navigation';
import { Footer } from '@/app/(landing-page)/footer';
import { ImageDropzone } from '@/app/(landing-page)/image-dropzone';
import { PdfCanvas } from '@/app/(landing-page)/pdf-canvas';
import { useManualDrawing } from '@/hooks/use-manual-drawing';
import { BoundingBoxWithMetadata, usePdf } from '@/hooks/use-pdf';
import { usePdfExport } from '@/hooks/use-pdf-export';
import { useState } from 'react';

type ClientPageProps = {
  isDebug: boolean;
};

export const ClientPage = ({ isDebug }: ClientPageProps) => {
  // const [file, setFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [rectangles, setRectangles] = useState<BoundingBoxWithMetadata[][]>([]);
  const [hoveredRectId, setHoveredRectId] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRedacted, setShowRedacted] = useState(false);

  // Demo vars
  const [selectedSampleImage, setSelectedSampleImage] = useState<SampleImage | null>(null);
  const [fauxLoadingSampleImage, setFauxLoadingSampleImage] = useState(false);

  const {
    loadPdf,
    // currentPage,
    // manualBoxes,
    // modifiedPdfUrl,
    // setCurrentPage,
    // setManualBoxes,
    addManualBox,
    addServerBoxes,
    canvasBox,
    currentPageNumber,
    onPdfLoaded,
    pdfFile,
    pdfUrl,
    ref,
    resetPdf,
  } = usePdf();

  const { exportPdf } = usePdfExport();

  const { handleMouseDown, handleMouseMove, handleMouseUp, draftBox, resetDraftBox } =
    useManualDrawing({
      ref,
      addBox: (box) => addManualBox({ box, pageNumber: currentPageNumber }),
    });

  const {
    mutate: analyzeImageData,
    isPending: isAnalyzing,
    reset: resetAnalyzing,
  } = useAnalyzeImage({
    onSuccess: async (data) => {
      // setRectangles((prev) => [...prev, ...r.filter((x) => (isDebug ? true : x.sensitive))]);
      // setRectangles((prev) => [...prev, ...r.filter((x) => x.sensitive)]);
      await addServerBoxes({ boxes: data });
    },
  });

  const onReset = () => {
    resetPdf();
    setShowRedacted(false);
    setImageSize(null);
    setRectangles([]);
    resetDraftBox();
    setHoveredRectId(null);
    setStartPoint(null);
    resetAnalyzing();
    setSelectedSampleImage(null);
    setFauxLoadingSampleImage(false);
  };

  const handleFileUpload = async (f: File) => {
    const reader = new FileReader();

    if (f.type === 'application/pdf') {
      // For PDFs, use readAsArrayBuffer
      reader.readAsArrayBuffer(f);

      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const base64Pdf = `data:application/pdf;base64,${base64String}`;
        void analyzeImageData({ imageUrl: base64Pdf });
      };
    } else {
      // For images, use existing readAsDataURL
      reader.readAsDataURL(f);

      reader.onload = async () => {
        const base64Image = reader.result as string;
        void analyzeImageData({ imageUrl: base64Image });
      };
    }
  };

  const onAnalyzeImage = async () => {
    if (selectedSampleImage) {
      setFauxLoadingSampleImage(true);
      setTimeout(() => {
        setFauxLoadingSampleImage(false);
        // setRectangles(sampleImageRects[selectedSampleImage]);
      }, 3500);
      return;
    }

    if (!pdfFile) return;

    try {
      await handleFileUpload(pdfFile);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze image',
        color: 'red',
      });
    }
  };

  const onDownload = async () => {
    if (!pdfUrl) return;

    try {
      await exportPdf(pdfUrl, { fileName: pdfFile?.name ?? 'document' });
      notifications.show({
        message: 'File downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to download file',
        color: 'red',
      });
    }
  };

  const handleDeleteRect = (id: string) => {
    setRectangles((prev) => prev.filter((rect) => rect.id !== id));
    setHoveredRectId(null);
  };

  const onClickSampleImage = (sampleImage: SampleImage) => {
    setSelectedSampleImage(sampleImage);
    void fetch(sampleImage)
      .then((res) => res.blob())
      .then((blob) => setFile(new File([blob], sampleImage)));
  };

  const onSetFile = async (f: File) => {
    // setFile(f);
    await loadPdf(f);
  };

  if (pdfUrl) {
    return (
      <>
        <Box pos="fixed" top={0} left={0} right={0} bottom={0} />
        {/* {file.type === 'application/pdf' ? ( */}
        <PdfCanvas
          imageRef={ref}
          file={pdfUrl}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          draftBox={draftBox}
          currentPageNumber={currentPageNumber}
          onPdfLoaded={onPdfLoaded}
          canvasBox={canvasBox}
        />
        {/* ) : ( */}
        <>
          {/* <ImageCanvas
              imageRef={imageRef}
              canvasCoordinates={coordinates}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              imageUrl={imageUrl}
              rectangles={r}
              hoveredRectId={hoveredRectId}
              handleDeleteRect={handleDeleteRect}
              currentRect={currentRect}
              onHoveredRectIdChange={setHoveredRectId}
              showRedacted={showRedacted}
              isDebug={isDebug}
            /> */}
        </>
        {/* )} */}
        <Box pos="fixed" left={0} right={0} bottom={0} h={CONFIG.layout.footerHeight}>
          <Footer
            onDownload={onDownload}
            onReset={onReset}
            onAnalyzeImage={onAnalyzeImage}
            isAnalyzing={isAnalyzing || fauxLoadingSampleImage}
            showRedacted={showRedacted}
            onToggleRedacted={() => setShowRedacted((prev) => !prev)}
          />
        </Box>
      </>
    );
  }

  return (
    <ImageDropzone
      setImage={onSetFile}
      setImageSize={setImageSize}
      onClickSampleImage={onClickSampleImage}
    />
  );
};
