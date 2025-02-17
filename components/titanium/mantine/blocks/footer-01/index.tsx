'use client';

import { CONFIG } from '@/config';
import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, Box, Container, Divider, Flex, Grid, Image, Text } from '@mantine/core';
import { IconBrandGithubFilled, IconBrandX } from '@tabler/icons-react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';
import classes from './index.module.css';

type LinkItem = {
  title: ReactNode;
  href: string;
};

type LinkGroupItem = {
  title: string;
  links: LinkItem[];
};

const LinkGroup = ({ title, links }: LinkGroupItem) => (
  <Box>
    <Text fw="bold">{title}</Text>
    {links.map((link) => (
      <Anchor
        c="dimmed"
        className={classes.link}
        display="block"
        fz="sm"
        href={link.href}
        key={link.href}
        py={4}
        underline="never"
      >
        {link.title}
      </Anchor>
    ))}
  </Box>
);

export const Footer01 = () => (
  <Container component="footer" className={classes.container} fluid>
    <Container
      size="xl"
      px={0}
      py={{
        base: 'xl',
        sm: 'calc(var(--mantine-spacing-xl) * 2)',
      }}
    >
      <Grid>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <LinkGroup
            title="Product"
            links={[
              { title: 'Editor', href: getRouteUrl({ to: '/', fragment: 'editor' }) },
              { title: 'Use cases', href: getRouteUrl({ to: '/', fragment: 'use-cases' }) },
              { title: 'How it works', href: getRouteUrl({ to: '/', fragment: 'how-it-works' }) },
              {
                title: 'Plans and features',
                href: getRouteUrl({ to: '/', fragment: 'plans-and-features' }),
              },
              {
                title: 'Frequently asked questions',
                href: getRouteUrl({ to: '/', fragment: 'frequently-asked-questions' }),
              },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <LinkGroup
            title="Pages"
            links={[
              { title: 'Privacy Policy', href: getRouteUrl({ to: '/privacy' }) },
              { title: 'Terms of Service', href: getRouteUrl({ to: '/terms' }) },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <LinkGroup
            title="Social"
            links={[
              {
                title: (
                  <Flex align="center" gap={4}>
                    <IconBrandGithubFilled size={16} /> Github
                  </Flex>
                ),
                href: CONFIG.social.github.url,
              },
              {
                title: (
                  <Flex align="center" gap={4}>
                    <IconBrandX size={16} /> X
                  </Flex>
                ),
                href: CONFIG.social.x.url,
              },
            ]}
          />
        </Grid.Col>
      </Grid>
      <Divider my="xl" />
      <Flex justify={{ sm: 'space-between' }} wrap="wrap" gap="xl">
        <Box maw={{ sm: 300 }}>
          <Flex align="center">
            <Image
              component={NextImage}
              src="/logo-light.png"
              width={138}
              height={23}
              alt="Titanium"
              darkHidden
            />
            <Image
              component={NextImage}
              src="/logo-dark.png"
              width={138}
              height={23}
              alt="Titanium"
              lightHidden
            />
          </Flex>
          <Text mt="xs" size="xs" c="dimmed">
            © {new Date().getFullYear()} Titanium, Inc. All rights reserved.
          </Text>
        </Box>
      </Flex>
    </Container>
  </Container>
);
