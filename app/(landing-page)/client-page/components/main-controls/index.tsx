import { CONFIG } from '@/config';
import { ActionIcon, ActionIconProps, Group, Tooltip } from '@mantine/core';
import { IconEye, IconEyeOff, IconTrash, IconWand } from '@tabler/icons-react';
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

type MainControlsProps = {
  onReset: () => void;
  onAnalyzeImage: () => void;
  isAnalyzing: boolean;
  showRedacted: boolean;
  onToggleRedacted: () => void;
};

export const MainControls = ({
  onReset,
  onAnalyzeImage,
  isAnalyzing,
  showRedacted,
  onToggleRedacted,
}: MainControlsProps) => (
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
  </Group>
);
