'use client';

import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { Box, Card, Container, Flex, Grid, Stack, Text } from '@mantine/core';
import {
  IconBook,
  IconBuildings,
  IconCamera,
  IconFile,
  IconFolder,
  IconPalette,
  IconShoppingBag,
  IconTools,
  IconZoom,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';

type Feature = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
};

const FEATURES: Feature[] = [
  {
    icon: <IconFile />,
    title: 'Legal & Business Documents',
    description:
      'Easily hide confidential info in contracts, NDAs, reports, and financial statements before sharing.',
  },
  {
    icon: <IconZoom />,
    title: 'Researchers & Journalists',
    description:
      'Protect identities and sensitive details in case studies, interviews, and investigative reports.',
  },
  {
    icon: <IconFolder />,
    title: 'Personal & Public Sharing',
    description:
      'Remove private details from IDs, invoices, receipts, and screenshots before posting online.',
  },
  {
    icon: <IconCamera />,
    title: 'Content Creators & Influencers',
    description:
      'Blur or remove private details in screenshots and documents before sharing with an audience.',
  },
  {
    icon: <IconBook />,
    title: 'Educators & Students',
    description: 'Anonymize documents for classroom use, research papers, and peer reviews.',
  },
  {
    icon: <IconBuildings />,
    title: 'Corporate & Internal Use',
    description:
      'Protect proprietary info in meeting notes, strategy docs, and internal communications.',
  },
  {
    icon: <IconShoppingBag />,
    title: ' E-commerce & Customer Support',
    description:
      'Hide customer PII (personal information) in order receipts, support tickets, and invoices.',
  },
  {
    icon: <IconTools />,
    title: ' IT & Security Teams',
    description:
      'Ensure sensitive data is removed before sharing logs, reports, and technical documentation.',
  },
  {
    icon: <IconPalette />,
    title: 'Design & Marketing Agencies',
    description:
      'Remove confidential client details from design mockups, presentations, and marketing materials before sharing with stakeholders.',
  },
] as const;

const UseCaseCell = ({
  icon,
  title,
  description,
  iconSize,
}: Feature & {
  iconSize?: number;
}) => (
  <motion.div
    initial={{ opacity: 0.0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0, ease: 'easeInOut' }}
    viewport={{ once: true }}
    style={{ height: '100%' }}
  >
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: 'var(--mantine-shadow-xl)' }}
      transition={{ type: 'spring' }}
      style={{
        borderRadius: 'var(--mantine-radius-lg)',
        height: '100%',
      }}
    >
      <Card radius="lg" p="xl" h="100%" bg="transparent">
        <Stack gap="xs">
          <Flex w={iconSize} h={iconSize} justify="center" align="center">
            {icon}
          </Flex>
          <Box mt="xs">
            <Text fz="xl" fw="bold">
              {title}
            </Text>
            <Text fz="md" c="dimmed">
              {description}
            </Text>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  </motion.div>
);

type Feature02Props = {
  title?: string;
  features?: Feature[];
  iconSize?: number;
};

export const UseCases01 = ({
  title = 'Use Cases',
  features = FEATURES,
  iconSize = 20,
}: Feature02Props) => (
  <Container
    id="use-cases"
    bg="var(--mantine-color-body)"
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid
  >
    <Container size="lg" px={0}>
      <JumboTitle order={2} ta="center" fz="md" style={{ textWrap: 'balance' }}>
        {title}
      </JumboTitle>
    </Container>
    <Container size="lg" p={0} mt="calc(var(--mantine-spacing-lg) * 3)">
      <Grid gutter="xl">
        {features.map((feature) => (
          <Grid.Col key={feature.title} span={{ base: 12, xs: 6, md: 4 }} mih="100%">
            <UseCaseCell
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconSize={iconSize}
            />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  </Container>
);
