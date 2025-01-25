'use client';

import { CONFIG } from '@/config';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import {
  IconDownload,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconWand,
  IconX,
} from '@tabler/icons-react';

import { useAnalyzeImage } from '@/hooks/use-analyze-image';
import { Rectangle } from '@/types/rectangle';
import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { notifications } from '@mantine/notifications';
import { useRef, useState } from 'react';
import classes from './page.module.css';

type Rect = Rectangle & { id: string };

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

  const {
    mutate: analyzeImageData,
    isPending: isAnalyzing,
    reset: resetAnalyzing,
  } = useAnalyzeImage({
    onSuccess: (data) => {
      setRectangles((prev) => [...prev, ...data]);
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
    setCurrentRect({ id: crypto.randomUUID(), x, y, width: 0, height: 0 });
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

  if (image) {
    const imageUrl = URL.createObjectURL(image);

    return (
      <Container
        size={CONFIG.layout.containerSize}
        px={0}
        h={`calc(100vh - ${CONFIG.layout.headerHeight}px - ${CONFIG.layout.footerHeight}px)`}
      >
        <Flex
          h="100%"
          justify="center"
          align="center"
          mih={`calc(100vh - ${CONFIG.layout.headerHeight}px - ${CONFIG.layout.footerHeight}px)`}
        >
          <Box
            ref={imageRef}
            pos="relative"
            id="node"
            style={{
              width: imageSize?.width ?? 'auto',
              height: imageSize?.height ?? 'auto',
              cursor: 'crosshair',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image src={imageUrl} bg="blue" alt="Uploaded image" />
            {rectangles.map((rect) => (
              <Box
                key={rect.id}
                style={{
                  position: 'absolute',
                  top: rect.y,
                  left: rect.x,
                  width: rect.width,
                  height: rect.height,
                  backgroundColor:
                    hoveredRectId === rect.id ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 1)',
                  transition: 'all 0.2s ease',
                  zIndex: hoveredRectId === rect.id ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredRectId(rect.id)}
                onMouseLeave={() => setHoveredRectId(null)}
              >
                {hoveredRectId === rect.id && (
                  <ActionIcon
                    variant="filled"
                    color="red"
                    size="sm"
                    radius="xl"
                    pos="absolute"
                    top={-10}
                    right={-10}
                    onClick={() => handleDeleteRect(rect.id)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )}
              </Box>
            ))}
            {currentRect && (
              <Box
                style={{
                  position: 'absolute',
                  top: currentRect.y,
                  left: currentRect.x,
                  width: currentRect.width,
                  height: currentRect.height,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid black',
                }}
              />
            )}
          </Box>
        </Flex>
        <Box
          pos="fixed"
          left={0}
          right={0}
          bottom={0}
          h={CONFIG.layout.footerHeight}
          className="frosted-glass"
        >
          <Flex justify="space-between" align="center" h="100%" gap="xs" px="lg">
            {/* Dummy Button */}
            <Button
              className={classes.downloadButton}
              leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
              onClick={onDownload}
              radius="md"
              size="md"
              style={{ visibility: 'hidden' }}
            >
              Download
            </Button>
            <Group>
              <Tooltip label="Reset Image" arrowSize={8} withArrow>
                <ActionIcon variant="filled" onClick={onReset} radius="xl" size="xl">
                  <IconTrash />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Censor" arrowSize={8} withArrow>
                <ActionIcon
                  variant="filled"
                  onClick={onAnalyzeImage}
                  radius="xl"
                  size="xl"
                  loading={isAnalyzing}
                >
                  <IconWand />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Button
              className={classes.downloadButton}
              leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
              onClick={onDownload}
              radius="md"
              size="md"
            >
              Download
            </Button>
          </Flex>
        </Box>
      </Container>
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
