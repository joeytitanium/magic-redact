'use client';

import { CONFIG } from '@/config';
import { Box } from '@mantine/core';

import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { Rect } from '@/types/rectangle';
import { imageCoordinates, scaledRects } from '@/utils/image-coordinates';
import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { SampleImage, sampleImageRects } from '@/utils/sample-images';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Footer } from './footer';
import { ImageCanvas } from './image-canvas';
import { ImageDropzone } from './image-dropzone';

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [rectangles, setRectangles] = useState<Rect[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);
  const [hoveredRectId, setHoveredRectId] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRedacted, setShowRedacted] = useState(false);
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
      const r: Rect[] = data.map((rect) => ({ ...rect, source: 'server' }));
      setRectangles((prev) => [...prev, ...r]);
    },
  });

  const onReset = () => {
    setShowRedacted(false);
    setImage(null);
    setImageSize(null);
    setRectangles([]);
    setCurrentRect(null);
    setHoveredRectId(null);
    setStartPoint(null);
    resetAnalyzing();
    setSelectedSampleImage(null);
  };

  const coordinates = imageCoordinates({
    imageSize: imageSize ?? { width: 0, height: 0 },
    viewportSize: { width: viewportWidth, height: viewportHeight },
    headerHeight: CONFIG.layout.headerHeight,
    footerHeight: CONFIG.layout.footerHeight,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRect({ id: uuidv4(), source: 'user', x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Calculate dimensions based on start point and current point
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);

    // Determine the top-left position based on drag direction
    const x = currentX < startPoint.x ? currentX : startPoint.x;
    const y = currentY < startPoint.y ? currentY : startPoint.y;

    setCurrentRect((prev) => {
      if (!prev) return null;
      return { ...prev, x, y, width, height };
    });
  };

  const handleMouseUp = () => {
    if (currentRect && currentRect.width > 5 && currentRect.height > 5) {
      setRectangles((prev) => [...prev, currentRect]);
    }
    setIsDrawing(false);
    setCurrentRect(null);
    setStartPoint(null);
  };

  const onAnalyzeImage = async () => {
    if (selectedSampleImage) {
      setFauxLoadingSampleImage(true);
      setTimeout(() => {
        setFauxLoadingSampleImage(false);
        setRectangles(sampleImageRects[selectedSampleImage]);
      }, 2000);
      return;
    }

    if (!image) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);

      reader.onload = async () => {
        const base64Image = reader.result as string;
        void analyzeImageData({ imageUrl: base64Image });
      };
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
      .then((blob) => setImage(new File([blob], sampleImage)));
  };

  const r = scaledRects({
    rects: rectangles,
    scaledImageSize: { width: coordinates.width, height: coordinates.height },
    originalImageSize: imageSize ?? { width: 0, height: 0 },
  });

  if (image) {
    const imageUrl = URL.createObjectURL(image);

    return (
      <>
        <Box pos="fixed" top={0} left={0} right={0} bottom={0} />
        <ImageCanvas
          imageRef={imageRef}
          coordinates={coordinates}
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
        />
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
      setImage={setImage}
      setImageSize={setImageSize}
      onClickSampleImage={onClickSampleImage}
    />
  );
}
