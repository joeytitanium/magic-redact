'use client';

import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { SampleImage } from '@/utils/sample-images';
import { notifications } from '@mantine/notifications';
// import { useSearchParams } from 'next/navigation';
import { ImageDropzone } from '@/app/(landing-page)/image-dropzone';
import { CONFIG } from '@/config';
import { useManualDrawing } from '@/hooks/use-manual-drawing';
import { usePdf } from '@/hooks/use-pdf';
import { usePdfExport } from '@/hooks/use-pdf-export';
import { useState } from 'react';
import { Desktop } from './components/desktop';
import { Mobile } from './components/mobile';
import { DesktopMobileProps } from './types';

type ClientPageProps = {
  isDebug: boolean;
};

export const ClientPage = ({ isDebug }: ClientPageProps) => {
  // Demo vars
  const [selectedSampleImage, setSelectedSampleImage] = useState<SampleImage | null>(null);
  const [fauxLoadingSampleImage, setFauxLoadingSampleImage] = useState(false);

  const {
    addManualBox,
    addServerBoxes,
    boxes,
    canvasBox,
    currentPageIndex,
    deleteBox,
    loadFile,
    nextPage,
    numPages,
    onPdfLoaded,
    pdfFile,
    pdfUrl,
    previousPage,
    mobileRef,
    desktopRef,
    resetPdf,
    togglePreviewRedacted,
    previewRedacted,
    goToPage,
  } = usePdf();

  const { exportPdf } = usePdfExport();

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    hoveringOverBox,
    draftBox,
    resetDraftBox,
  } = useManualDrawing({
    boxes,
    mobileRef,
    desktopRef,
    currentPageIndex,
    addBox: (box) => addManualBox({ box, pageNumber: currentPageIndex }),
    canvasBox,
  });

  const {
    mutate: analyzeImageData,
    isPending: isAnalyzing,
    reset: resetAnalyzing,
  } = useAnalyzeImage({
    onSuccess: async (data) => {
      await addServerBoxes({ boxes: data });
    },
  });

  const onReset = () => {
    resetPdf();
    resetDraftBox();
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

  const onClickSampleImage = (sampleImage: SampleImage) => {
    setSelectedSampleImage(sampleImage);
    void fetch(sampleImage)
      .then((res) => res.blob())
      .then((blob) => setFile(new File([blob], sampleImage)));
  };

  const onSetFile = async (f: File) => {
    // setFile(f);
    await loadFile(f);
  };

  if (!pdfUrl || !pdfFile) {
    return <ImageDropzone setFile={onSetFile} onClickSampleImage={onClickSampleImage} />;
  }

  const props: Omit<DesktopMobileProps, 'imageRef'> = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    canvasBox,
    currentPageIndex,
    onPdfLoaded,
    hoveringOverBox,
    onDeleteBox: deleteBox,
    numberOfPages: numPages,
    draftBox,
    file: pdfFile,
    togglePreviewRedacted,
    onDownload,
    onReset,
    onAnalyzeImage,
    isAnalyzing: isAnalyzing || fauxLoadingSampleImage,
    onPreviousPage: previousPage,
    onNextPage: nextPage,
    previewRedacted,
    fauxLoadingSampleImage,
    onPageChange: (page) => goToPage(page),
  };

  return (
    <>
      <Desktop visibleFrom={CONFIG.layout.mobileBreakpoint} imageRef={desktopRef} {...props} />
      <Mobile hiddenFrom={CONFIG.layout.mobileBreakpoint} imageRef={mobileRef} {...props} />
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
    </>
  );
};
