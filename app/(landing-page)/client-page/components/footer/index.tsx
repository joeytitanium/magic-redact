import { MainControls } from '@/app/(landing-page)/client-page/components/main-controls';
import { CONFIG } from '@/config';
import { BoundingBox } from '@/hooks/use-pdf';
import {
  ActionIcon,
  ActionIconProps,
  Box,
  Button,
  Flex,
  FlexProps,
  Group,
  Tooltip,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconDownload } from '@tabler/icons-react';
import { ReactNode } from 'react';

const ActionButton = ({
  tooltip,
  onClick,
  loading,
  icon,
  ...actionIconProps
}: ActionIconProps & {
  tooltip: string;
  onClick: () => void;
  loading?: boolean;
  icon: ReactNode;
}) => (
  <Tooltip label={tooltip} arrowSize={8} offset={8} withArrow>
    <ActionIcon
      variant="default"
      onClick={onClick}
      radius="xl"
      size="lg"
      loading={loading}
      {...actionIconProps}
    >
      {icon}
    </ActionIcon>
  </Tooltip>
);

export const Footer = ({
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
}) => {
  const { width: pageArrowControlWidth, ref: pageArrowControlRef } = useElementSize();
  const { width: downloadButtonWidth, ref: downloadButtonRef } = useElementSize();

  return (
    <Flex justify="space-between" align="center" h="100%" gap="xs" px="lg" {...flexProps}>
      <Box w={downloadButtonWidth} />
      <Group justify="space-between" w={canvasBox.width}>
        <Box w={pageArrowControlWidth} />
        <MainControls
          onReset={onReset}
          onAnalyzeImage={onAnalyzeImage}
          isAnalyzing={isAnalyzing}
          showRedacted={showRedacted}
          onToggleRedacted={onToggleRedacted}
        />
        <Group align="center" ref={pageArrowControlRef}>
          <ActionButton
            tooltip="Previous page"
            onClick={onPreviousPage}
            icon={<IconChevronLeft />}
            disabled={currentPageIndex === 0}
          />
          <ActionButton
            tooltip="Next page"
            onClick={onNextPage}
            icon={<IconChevronRight />}
            disabled={currentPageIndex === numberOfPages - 1}
          />
        </Group>
      </Group>
      <Box ref={downloadButtonRef}>
        <Button
          leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
          onClick={onDownload}
          radius="md"
          size="md"
        >
          Download
        </Button>
      </Box>
    </Flex>
  );
};
