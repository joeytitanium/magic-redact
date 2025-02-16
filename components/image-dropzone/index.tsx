import { SAMPLE_IMAGES, SampleImage, sampleImageThumbnail } from '@/utils/sample-images';
import {
  Card,
  Container,
  ContainerProps,
  Group,
  Image,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

// TODO: Add paste from clipboard

export type ImageDropzoneProps = {
  containerProps?: ContainerProps;
  setFile: (image: File) => void;
  onClickSampleImage: (image: SampleImage) => void;
};

export const ImageDropzone = ({
  setFile,
  onClickSampleImage,
  containerProps,
}: ImageDropzoneProps) => (
  <Container w={800} fluid {...containerProps}>
    <Stack h="100%" justify="center" align="center">
      <Card p="calc(2 * var(--mantine-spacing-xl))" mx="lg" radius="lg" w="100%" withBorder>
        <Dropzone
          onDrop={(files) => setFile(files[0])}
          maxSize={20 * 1024 ** 2}
          accept={[
            'image/png',
            // 'image/gif',
            'image/jpeg',
            // 'image/svg+xml',
            'image/webp',
            'image/avif',
            'image/heic',
            'image/heif',
            'application/pdf',
          ]}
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
              <Text size="xl" fw="bold" ta="center" style={{ textWrap: 'balance' }} inline>
                Drag image here or click to select a file
              </Text>
              <Text c="dimmed" ta="center" mt="xs">
                File should not exceed 20mb
              </Text>
            </div>
          </Stack>
        </Dropzone>
      </Card>
      <Text c="dimmed" fz="sm">
        Or select a sample
      </Text>
      <Group justify="center">
        {SAMPLE_IMAGES.map((imageName, idx) => (
          <UnstyledButton key={idx} onClick={() => onClickSampleImage(imageName)}>
            <Card w={60} h={60} p={0} withBorder>
              <Image
                radius="md"
                src={sampleImageThumbnail[imageName]}
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
