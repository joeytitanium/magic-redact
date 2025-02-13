import { CONFIG } from '@/config';
import { ActionIcon, ActionIconProps, Group, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
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
  numberOfRedactions: number;
};

export const MainControls = ({
  onReset,
  onAnalyzeImage,
  isAnalyzing,
  showRedacted,
  onToggleRedacted,
  numberOfRedactions,
}: MainControlsProps) => {
  const openModal = () =>
    modals.openConfirmModal({
      title: 'Confirm action',
      children: (
        <Text size="sm">
          Are you sure you want to discard your redactions? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: onReset,
    });

  return (
    <Group>
      <ActionButton
        icon={<IconTrash size={CONFIG.icon.size.sm} />}
        tooltip="Discard"
        onClick={() => {
          if (numberOfRedactions > 0) {
            openModal();
          } else {
            onReset();
          }
        }}
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
};
