import { MainControls } from '@/app/(landing-page)/_components/client-page/components/main-controls';
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

const PAGE_CONTROL_WIDTH = 84;

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
  numberOfRedactions,
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
  numberOfRedactions: number;
}) => {
  const { width: downloadButtonWidth, ref: downloadButtonRef } = useElementSize();

  return (
    <Flex justify="space-between" align="center" h="100%" gap="xs" px="lg" {...flexProps}>
      <Box w={downloadButtonWidth} />
      <Group justify="space-between" w={canvasBox.width}>
        <Box w={PAGE_CONTROL_WIDTH} />
        <MainControls
          onReset={onReset}
          onAnalyzeImage={onAnalyzeImage}
          isAnalyzing={isAnalyzing}
          showRedacted={showRedacted}
          onToggleRedacted={onToggleRedacted}
          numberOfRedactions={numberOfRedactions}
        />
        {numberOfPages > 1 ? (
          <Group align="center" w={PAGE_CONTROL_WIDTH}>
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
        ) : (
          <Box w={PAGE_CONTROL_WIDTH} />
        )}
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
