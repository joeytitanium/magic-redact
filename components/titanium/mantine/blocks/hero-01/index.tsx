'use client';

import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { Badge, Button, Container, Image, Stack, Text } from '@mantine/core';
import { motion } from 'motion/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import classes from './index.module.css';

export const Hero01 = () => (
  <Container
    bg="var(--mantine-color-body)"
    px={0}
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
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
            October 31, 2024
          </Badge>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
        >
          <JumboTitle order={1} fz="lg" ta="center" style={{ textWrap: 'balance' }} mb="sm">
            Introducing ChatGPT search
          </JumboTitle>
        </motion.div>
        <motion.div
          initial={{ opacity: 0.0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeInOut' }}
          viewport={{ once: true }}
        >
          <Text c="dimmed" fz="xl" ta="center" mb="xl" style={{ textWrap: 'balance' }}>
            Get fast, timely answers with links to relevant web sources.
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
              Plus and team users can try it now
            </Button>
          </motion.div>
        </motion.div>
      </Stack>
    </Container>
    <Container size="xl" mt="calc(var(--mantine-spacing-xl) * 2)" px={0}>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
        viewport={{ once: true }}
      >
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: 'var(--mantine-shadow-xl)' }}
          transition={{ type: 'spring' }}
        >
          <Image
            component={NextImage}
            src="https://images.unsplash.com/photo-1471520201477-47a62a269a87?q=80&w=1920&h=800&auto=format&fit=crop&crop=focalpoint&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            radius="sm"
            alt="Hero 01"
            width={1920}
            height={800}
          />
        </motion.div>
      </motion.div>
    </Container>
  </Container>
);
