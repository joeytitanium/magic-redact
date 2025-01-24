'use client';

import { CONFIG } from '@/config';
import { ActionIcon, Box, Button, Card, Container, Flex, Group, Image, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { useEffect, useRef, useState } from 'react';
import classes from './page.module.css';

type Rectangle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [hoveredRectId, setHoveredRectId] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

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

  // Get displayed image size after it loads
  useEffect(() => {
    if (imageRef.current) {
      const viewport = {
        width: window.innerWidth * 0.9, // 90% of viewport width
        height: window.innerHeight * 0.8, // 80% of viewport height
      };

      const imgElement = imageRef.current.querySelector('img');
      if (imgElement) {
        const { naturalWidth } = imgElement;
        const { naturalHeight } = imgElement;

        // Calculate scaling to fit within viewport
        const scaleX = viewport.width / naturalWidth;
        const scaleY = viewport.height / naturalHeight;
        const scale = Math.min(scaleX, scaleY);

        // Set new dimensions maintaining aspect ratio
        setImageSize({
          width: naturalWidth * scale,
          height: naturalHeight * scale,
        });
      }
    }
  }, [image]);

  const onDownload = async () => {
    // if (loading) return;
    // setLoading(true);

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
      // setLoading(false);
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
              maxWidth: '90vw',
              maxHeight: `calc(80vh - ${CONFIG.layout.headerHeight}px - ${CONFIG.layout.footerHeight}px)`,
              width: imageSize?.width ?? 'auto',
              height: imageSize?.height ?? 'auto',
              cursor: 'crosshair',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              src={imageUrl}
              alt="Uploaded image"
              fit="contain"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
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
                  border: '1px solid black',
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
        <Box pos="absolute" left={0} right={0} bottom={0} h={CONFIG.layout.footerHeight}>
          <Flex justify="center" align="start" h="100%">
            <Button
              className={classes.downloadButton}
              leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
              onClick={onDownload}
              radius="xl"
              size="lg"
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
            onDrop={(files) => setImage(files[0])}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={5 * 1024 ** 2}
            maw={800}
            accept={IMAGE_MIME_TYPE}
          >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag images here or click to select files
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Attach as many files as you like, each file should not exceed 5mb
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Card>
      </Flex>
    </Container>
  );
}
