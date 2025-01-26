import { CONFIG } from '@/config';
import { SAMPLE_IMAGES, SampleImage, sampleImageSize } from '@/utils/sample-images';
import { Card, Container, Group, Image, Stack, Text, UnstyledButton } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

// TODO: Add paste from clipboard

export const ImageDropzone = ({
  setImage,
  setImageSize,
  onClickSampleImage,
}: {
  setImage: (image: File) => void;
  setImageSize: (imageSize: { width: number; height: number }) => void;
  onClickSampleImage: (image: SampleImage) => void;
}) => (
  <Container px={0} h={`calc(100vh - ${CONFIG.layout.headerHeight}px)`} fluid>
    <Stack h="100%" justify="center" align="center">
      <Card p="calc(2 * var(--mantine-spacing-xl))" radius="lg" withBorder>
        <Dropzone
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
          maxFiles={1}
          style={{ cursor: 'pointer' }}
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
      <Text c="dimmed" fz="sm">
        Or select from sample images
      </Text>
      <Group justify="center">
        {SAMPLE_IMAGES.map((imageName, idx) => (
          <UnstyledButton
            key={idx}
            onClick={() => {
              setImageSize(sampleImageSize[imageName]);
              onClickSampleImage(imageName);
            }}
          >
            <Card w={60} h={60} p={0} withBorder>
              <Image
                radius="md"
                fit="cover"
                bg="red"
                src={imageName}
                alt="Sample image"
                w="100%"
                h="100%"
              />
            </Card>
          </UnstyledButton>
        ))}
      </Group>
    </Stack>
  </Container>
);
