'use client';

import { CONFIG } from '@/config';
import { Box, Card, Container, Flex, Group, Image, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
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
  const imageRef = useRef<HTMLImageElement>(null);

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
      setImageSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  }, [image]);

  if (image) {
    const imageUrl = URL.createObjectURL(image);

    return (
      <Container
        size={CONFIG.layout.containerSize}
        px={0}
        h={`calc(100vh - ${CONFIG.layout.headerHeight}px)`}
      >
        <Flex h="100%" justify="center" align="center" p="xl">
          <Box pos="relative" h="100%">
            <Image
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded image"
              fit="contain"
              h="100%"
              w="auto"
            />

            {imageSize &&
              rectangles.map((rect, index) => {
                const scaleX = imageSize.width / originalWidth;
                const scaleY = imageSize.height / originalHeight;
                return (
                  <Box
                    key={index}
                    style={{
                      position: 'absolute',
                      top: rect.y * scaleY,
                      left: rect.x * scaleX,
                      width: rect.width * scaleX,
                      height: rect.height * scaleY,
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                );
              })}
          </Box>
        </Flex>
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
