'use client';

import { CONFIG } from '@/config';
import { Box } from '@mantine/core';

import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { SampleImage } from '@/utils/sample-images';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
// import { useSearchParams } from 'next/navigation';
import { useManualDrawing } from '@/hooks/use-manual-drawing';
import { BoundingBoxWithMetadata, usePdf } from '@/hooks/use-pdf';
import { useState } from 'react';
import { Footer } from './footer';
import { ImageDropzone } from './image-dropzone';
import { PdfCanvas } from './pdf-canvas';

export default function HomePage() {
  // const [file, setFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [rectangles, setRectangles] = useState<BoundingBoxWithMetadata[][]>([]);
  const [hoveredRectId, setHoveredRectId] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRedacted, setShowRedacted] = useState(false);

  // const searchParams = useSearchParams();
  // const isDebug = searchParams.get('debug') === 'true';
  const isDebug = false;

  // Demo vars
  const [selectedSampleImage, setSelectedSampleImage] = useState<SampleImage | null>(null);
  const [fauxLoadingSampleImage, setFauxLoadingSampleImage] = useState(false);

  const { height: viewportHeight, width: viewportWidth } = useViewportSize();

  const {
    mutate: analyzeImageData,
    isPending: isAnalyzing,
    reset: resetAnalyzing,
  } = useAnalyzeImage({
    onSuccess: (data) => {
      // setRectangles((prev) => [...prev, ...r.filter((x) => (isDebug ? true : x.sensitive))]);
      // setRectangles((prev) => [...prev, ...r.filter((x) => x.sensitive)]);
      setRectangles(data);
    },
  });

  const {
    loadPdf,
    pdfUrl,
    pdfFile,
    ref,
    currentPageNumber,
    // currentPage,
    // setCurrentPage,
    // modifiedPdfUrl,
    onPdfLoaded,
    // manualBoxes,
    // setManualBoxes,
    canvasBox,
    addBox,
  } = usePdf();

  const { handleMouseDown, handleMouseMove, handleMouseUp, draftBox, resetDraftBox } =
    useManualDrawing({
      ref,
      addBox: (box) => addBox({ box, pageNumber: currentPageNumber }),
    });

  const onReset = () => {
    setShowRedacted(false);
    // setFile(null);
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

    if (!file) return;
    try {
      await handleFileUpload(file);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze image',
        color: 'red',
      });
    }
  };

  const onDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const node = document.getElementById('node');
    if (!node) {
      console.error('No element found with id "node"');
      notifications.show({
        title: 'Error',
        message: 'Target element not found',
        color: 'red',
      });
      setIsDownloading(false);
      return;
    }

    try {
      const imageUrl = await nodeToImageUrl({ node });

      if (!imageUrl) {
        throw new Error('Failed to generate image URL');
      }

      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notifications.show({
        message: 'Image downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to download image:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate image',
        color: 'red',
      });
    } finally {
      setIsDownloading(false);
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
}
