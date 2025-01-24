'use client';

import { CONFIG } from '@/config';
import { Box, Button, Card, Container, Flex, Group, Image, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

import { nodeToImageUrl } from '@/utils/node-to-image-url';
import { useEffect, useRef, useState } from 'react';
import classes from './page.module.css';

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function HomePage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Original image dimensions
  const originalWidth = 1096;
  const originalHeight = 1388;

  // Rectangles in original dimensions
  const rectangles: Rectangle[] = [
    { x: 54, y: 724, width: 36, height: 19 },
    { x: 90, y: 724, width: 270, height: 23 },
    { x: 54, y: 780, width: 306, height: 23 },
    { x: 56, y: 836, width: 64, height: 19 },
    { x: 128, y: 836, width: 288, height: 19 },
  ];

  // Get displayed image size after it loads
  useEffect(() => {
    if (imageRef.current) {
      const viewport = {
        width: window.innerWidth * 0.95, // 90% of viewport width
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

  if (image) {
    const imageUrl = URL.createObjectURL(image);

    return (
      <Container
        size={CONFIG.layout.containerSize}
        px={0}
        h={`calc(100vh - ${CONFIG.layout.headerHeight}px)`}
      >
        <Flex h="100%" justify="center" align="center" p="xl">
          <Box
            ref={imageRef}
            pos="relative"
            id="node"
            style={{
              maxWidth: '95vw',
              maxHeight: '80vh',
              width: imageSize?.width ?? 'auto',
              height: imageSize?.height ?? 'auto',
            }}
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
            {imageSize &&
              rectangles.map((rect, index) => {
                const scaleX = imageSize.width / originalWidth;
                const scaleY = imageSize.height / originalHeight;
                return (
                  <Box
                    id="node"
                    key={index}
                    style={{
                      position: 'absolute',
                      top: rect.y * scaleY,
                      left: rect.x * scaleX,
                      width: rect.width * scaleX,
                      height: rect.height * scaleY,
                      backgroundColor: 'black',
                    }}
                  />
                );
              })}
          </Box>
        </Flex>
        <Box pos="absolute" left={0} right={0} bottom={0} h={CONFIG.layout.footerHeight}>
          <Flex justify="center" align="center" h="100%">
            <Button
              leftSection={<IconDownload size={14} />}
              onClick={onDownload}
              radius="xl"
              size="xl"
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
