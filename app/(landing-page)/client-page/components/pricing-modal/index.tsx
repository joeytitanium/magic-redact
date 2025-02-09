import { Modal, Text } from '@mantine/core';

export type PricingModalProps = {
  opened: boolean;
  onClose: () => void;
};

export const PricingModal = ({ opened, onClose }: PricingModalProps) => (
  <Modal opened={opened} onClose={onClose}>
    <Text>Pricing modal</Text>
  </Modal>
);
