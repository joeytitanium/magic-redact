'use client';

import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { CONFIG } from '@/config';
import { Anchor, Box, BoxProps, Center, Container, Grid, Stack, Text } from '@mantine/core';
import { IconBrandGithub, IconDatabase, IconShieldCheck } from '@tabler/icons-react';
import { ReactNode } from 'react';
import classes from './index.module.css';

const Card = ({
  title,
  description,
  icon,
  ...boxProps
}: BoxProps & { title: string; description: ReactNode; icon: ReactNode }) => (
  <Box {...boxProps}>
    <Center mb="lg">{icon}</Center>
    <JumboTitle order={5} ta="center" fz="xs" style={{ textWrap: 'balance' }} mb="sm">
      {title}
    </JumboTitle>
    <Text fz="xl" ta="center">
      {description}
    </Text>
  </Box>
);

export const Security = () => (
  <Container
    className={classes.root}
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid
  >
    <Container size="md" mb="calc(var(--mantine-spacing-lg) * 4)">
      <Stack gap="xs" align="center">
        <JumboTitle order={2} ta="center" fz="md" style={{ textWrap: 'balance' }}>
          Security
        </JumboTitle>
        <Text c="dimmed" fz="large" ta="center" style={{ textWrap: 'balance' }}>
          We understand security is a major concern, especially when handling sensitive documents.
          While we're not HIPAA-certified, we take privacy seriously:
        </Text>
      </Stack>
    </Container>
    <Container size="xl">
      <Grid gutter="calc(var(--mantine-spacing-lg) * 4)" align="center" mx="xl">
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card
            icon={<IconDatabase size={CONFIG.icon.size.xl} />}
            title="No Data Storage "
            description={
              <>
                Files are <strong>automatically deleted</strong> after processing.
              </>
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card
            icon={<IconBrandGithub size={CONFIG.icon.size.xl} />}
            title="Open Source"
            description={
              <>
                <strong>No black box</strong> — view the full source code on{' '}
                <Anchor href={CONFIG.github.repoUrl} target="_blank" inherit>
                  GitHub
                </Anchor>
                .
              </>
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card
            icon={<IconShieldCheck size={CONFIG.icon.size.xl} />}
            title="Trusted Vendors"
            description={
              <>
                <strong>Google Vision</strong> for OCR (text extraction) and <strong>OpenAI</strong>{' '}
                for detection.
              </>
            }
          />
        </Grid.Col>
      </Grid>
    </Container>
  </Container>
);
