import { MainControls } from '@/app/(landing-page)/client-page/components/main-controls';
import { CONFIG } from '@/config';
import { BoundingBox } from '@/hooks/use-pdf';
import { Button, Flex, FlexProps, Group } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

export const MobileFooter = ({
  onDownload,
  onReset,
  onAnalyzeImage,
  isAnalyzing,
  showRedacted,
  onToggleRedacted,
  onNextPage,
  onPreviousPage,
  numberOfPages,
  currentPageIndex,
  canvasBox,
  ...flexProps
}: FlexProps & {
  onDownload: () => void;
  onReset: () => void;
  onAnalyzeImage: () => void;
  isAnalyzing: boolean;
  showRedacted: boolean;
  onToggleRedacted: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPageIndex: number;
  numberOfPages: number;
  canvasBox: BoundingBox;
}) => (
  <Flex
    justify="space-between"
    align="center"
    h="100%"
    gap="xs"
    px="sm"
    bg="var(--mantine-color-body)"
    style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    {...flexProps}
  >
    <Group justify="space-between" w={canvasBox.width}>
      <MainControls
        onReset={onReset}
        onAnalyzeImage={onAnalyzeImage}
        isAnalyzing={isAnalyzing}
        showRedacted={showRedacted}
        onToggleRedacted={onToggleRedacted}
      />
    </Group>
    <Button
      leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
      onClick={onDownload}
      radius="md"
      size="md"
      style={{ flexShrink: 0 }}
    >
      Download
    </Button>
  </Flex>
);
