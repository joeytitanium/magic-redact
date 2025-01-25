import { CONFIG } from '@/config';
import { ActionIcon, Button, Flex, Group, Tooltip } from '@mantine/core';
import { IconDownload, IconTrash, IconWand } from '@tabler/icons-react';

export const Footer = ({
  onDownload,
  onReset,
  onAnalyzeImage,
  isAnalyzing,
}: {
  onDownload: () => void;
  onReset: () => void;
  onAnalyzeImage: () => void;
  isAnalyzing: boolean;
}) => (
  <Flex justify="space-between" align="center" h="100%" gap="xs" px="lg">
    {/* Dummy Button */}
    <Button
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
      leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
      onClick={onDownload}
      radius="md"
      size="md"
    >
      Download
    </Button>
  </Flex>
);
