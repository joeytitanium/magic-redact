'use client';

import { ImageDropzone, ImageDropzoneProps } from '@/components/image-dropzone';
import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { Badge, Button, Container, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import NextLink from 'next/link';
import classes from './index.module.css';

export type Hero01Props = Pick<ImageDropzoneProps, 'setFile' | 'onClickSampleImage'>;

export const Hero01 = ({ setFile, onClickSampleImage }: Hero01Props) => (
  <Container
    bg="var(--mantine-color-body)"
    px={0}
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 3)',
      xs: 'calc(var(--mantine-spacing-lg) * 4)',
      lg: 'calc(var(--mantine-spacing-lg) * 5)',
    }}
    fluid
  >
    <Container size="md" px={0}>
      <Stack align="center" gap="xs">
        <motion.div
          initial={{ opacity: 0.0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <Badge variant="light" size="xl" mb="lg">
            🔒 Auto-Redact Sensitive Info
          </Badge>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
        >
          <JumboTitle
            order={1}
            fz="lg"
            ta="center"
            style={{ textWrap: 'balance' }}
            mb="sm"
            maw={700}
          >
            Redact PDFs & Images Instantly. Free & Secure
          </JumboTitle>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeInOut' }}
          viewport={{ once: true }}
        >
          <Text c="dimmed" fz="xl" ta="center" mb="xl" style={{ textWrap: 'balance' }}>
            Need to hide confidential data from PDFs or images? Our free redaction tool makes it
            easy. Just upload your file, and we'll automatically detect and remove sensitive text.
            No manual work required.
          </Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeInOut' }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button component={NextLink} href="#" radius="xl" size="xl" className={classes.cta}>
              Redact Your PDF or Image Now!
            </Button>
          </motion.div>
        </motion.div>
      </Stack>
    </Container>
    <Container size="xl" pt="calc(var(--mantine-spacing-xl) * 2)" px={0} id="editor">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
        viewport={{ once: true }}
      >
        <ImageDropzone onClickSampleImage={onClickSampleImage} setFile={setFile} />
      </motion.div>
    </Container>
  </Container>
);
