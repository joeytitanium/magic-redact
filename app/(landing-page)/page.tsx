'use client';

import { CONFIG } from '@/config';
import { Box, Card, Container, Flex, Stack, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

import { imageCoordinates, scaledRects } from '@/app/utils/image-coordinates';
import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { Rect } from '@/types/rectangle';
import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Footer } from './footer';
import { ImageCanvas } from './image-canvas';
import classes from './page.module.css';

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
    setImage(null);
    setImageSize(null);
    setRectangles([]);
    setCurrentRect(null);
    setHoveredRectId(null);
    setStartPoint(null);
    resetAnalyzing();
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
      // TODO: Alert
      console.error('No element found');
      return;
    }

    try {
      const url = await nodeToImageUrl({ node });
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteRect = (id: string) => {
    setRectangles((prev) => prev.filter((rect) => rect.id !== id));
    setHoveredRectId(null);
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
        />
        <Box
          pos="fixed"
          left={0}
          right={0}
          bottom={0}
          h={CONFIG.layout.footerHeight}
          className="frosted-glass"
        >
          <Footer
            onDownload={onDownload}
            onReset={onReset}
            onAnalyzeImage={onAnalyzeImage}
            isAnalyzing={isAnalyzing}
          />
        </Box>
      </>
    );
  }

  return (
    <Container
      size={CONFIG.layout.containerSize}
      px={0}
      h={`calc(100vh - ${CONFIG.layout.headerHeight}px)`}
    >
      <Flex h="100%" justify="center" align="center" p="xl">
        <Card className={classes.dropzone} p="xl" radius="lg" withBorder>
          <Dropzone
            className={classes.dropzone}
            onDrop={(files) => {
              setImage(files[0]);

              const reader = new FileReader();
              reader.onload = (e) => {
                const img: HTMLImageElement = document.createElement('img');
                img.onload = () => {
                  setImageSize({
                    width: img.width,
                    height: img.height,
                  });
                };
                img.src = e.target?.result as string;
              };
              reader.readAsDataURL(files[0]);
            }}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={5 * 1024 ** 2}
            maw={800}
            accept={IMAGE_MIME_TYPE}
          >
            <Stack
              justify="center"
              align="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: 'none' }}
            >
              <Dropzone.Accept>
                <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={52} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" fw="bold" ta="center" inline>
                  Drag image here or click to select a file
                </Text>
                <Text c="dimmed" ta="center" mt="xs">
                  File should not exceed 5mb
                </Text>
              </div>
            </Stack>
          </Dropzone>
        </Card>
      </Flex>
    </Container>
  );
}
