import { CONFIG } from '@/config';
import {
  ActionIcon,
  ActionIconProps,
  Button,
  Flex,
  FlexProps,
  Group,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';
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
  numPages,
  currentPageIndex,
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
  numPages: number;
}) => (
  <Flex
    justify="space-between"
    align="center"
    h="100%"
    gap="xs"
    px="lg"
    bg="transparent"
    {...flexProps}
  >
    {/* Dummy Button */}
    <Button
      leftSection={<IconDownload size={CONFIG.icon.size.sm} />}
      onClick={onDownload}
      radius="md"
      size="md"
      style={{ visibility: 'hidden' }}
      visibleFrom={CONFIG.layout.mobileBreakpoint}
    >
      Download
    </Button>
    <Group>
      <ActionButton
        icon={<IconTrash size={CONFIG.icon.size.sm} />}
        tooltip="Start over"
        onClick={onReset}
      />
      <Tooltip label="Redact" arrowSize={8} offset={8} withArrow>
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
      <ActionButton
        icon={
          showRedacted ? (
            <IconEye size={CONFIG.icon.size.sm} />
          ) : (
            <IconEyeOff size={CONFIG.icon.size.sm} />
          )
        }
        tooltip={showRedacted ? 'Hide redacted' : 'Show redacted'}
        onClick={onToggleRedacted}
      />
      <Group ml="xl" align="center">
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
          disabled={currentPageIndex === numPages - 1}
        />
      </Group>
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
