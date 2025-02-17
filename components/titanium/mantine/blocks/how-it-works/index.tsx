'use client';

import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { CONFIG } from '@/config';
import {
  Accordion,
  AccordionProps,
  Card,
  Container,
  Flex,
  MantineBreakpoint,
  Text,
  TextProps,
  Title,
} from '@mantine/core';
import { IconChevronUp } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

type Item = {
  /** The value of the accordion item. */
  value: string;

  /** The title of the feature. */
  title: ReactNode;

  /** The description of the feature. */
  description: ReactNode;

  /** Props to be passed to the description text. */
  descriptionProps?: TextProps;

  /** The image of the feature. */
  media: {
    src: string;
  };
};

type HowItWorks01Props = {
  /** Props to be passed to the accordion component. */
  accordionProps?: AccordionProps;

  /** The breakpoint at which the accordion collapses. */
  collapseBreakpoint?: MantineBreakpoint;

  /** The items to be displayed in the feature section. */
  items?: Item[];

  /** The title of the section. */
  title?: string;
};

export const HowItWorks01 = ({
  accordionProps,
  collapseBreakpoint = CONFIG.layout.mobileBreakpoint,
  items = ITEMS,
  title = 'How It Works',
}: HowItWorks01Props) => {
  const [selectedValue, setSelectedValue] = useState<string>(items[0].value);

  return (
    <Container
      id="how-it-works"
      bg="var(--mantine-color-body)"
      py={{
        base: 'calc(var(--mantine-spacing-lg) * 4)',
        xs: 'calc(var(--mantine-spacing-lg) * 5)',
        lg: 'calc(var(--mantine-spacing-lg) * 6)',
      }}
    >
      <Container size="lg" px={0}>
        <JumboTitle order={2} ta="center" fz="md" style={{ textWrap: 'balance' }}>
          {title}
        </JumboTitle>
      </Container>
      <Container fluid p={0} mt="calc(var(--mantine-spacing-lg) * 3)">
        <Flex
          justify="space-between"
          gap="calc(var(--mantine-spacing-lg) * 3)"
          wrap={{
            base: 'wrap',
            lg: 'nowrap',
          }}
          maw="100%"
        >
          <Flex justify="center" align="center" w="100%">
            <Accordion
              w="100%"
              chevron={<IconChevronUp color="var(--mantine-color-dimmed)" size={24} />}
              chevronSize={24}
              value={selectedValue}
              onChange={(value) => {
                if (value === null) return;
                setSelectedValue(value);
              }}
              styles={{
                control: {
                  height: 60,
                },
              }}
              {...accordionProps}
            >
              {items.map((item) => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.Control>
                    <Title c="var(--mantine-color-text)" order={4} fz="xl">
                      {item.title}
                    </Title>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text
                      fz={{
                        base: 'sm',
                        sm: 'md',
                      }}
                      {...item.descriptionProps}
                    >
                      {item.description}
                    </Text>
                    <Card hiddenFrom={collapseBreakpoint} mt="xl">
                      <video width="100%" playsInline autoPlay muted loop>
                        <source src={item.media.src} />
                      </video>
                    </Card>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Flex>
          <Flex visibleFrom={collapseBreakpoint} maw="60%" align="center">
            {items.map((item) => (
              <Flex
                key={item.value}
                visibleFrom={collapseBreakpoint}
                justify="flex-start"
                align="center"
                ml="xl"
                style={{
                  display: selectedValue === item.value ? 'initial' : 'none',
                  overflow: 'hidden',
                }}
              >
                <Card radius="lg" withBorder>
                  <video width={640} playsInline controls autoPlay muted loop>
                    <source src={item.media.src} />
                  </video>
                </Card>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Container>
    </Container>
  );
};

const ITEMS: Item[] = [
  {
    value: 'upload',
    media: { src: '/how-it-works-1.mp4' },
    title: 'Upload your PDF or image',
    description:
      'Simply drag and drop your file—no installation, no sign-ups. Our tool works right in your browser, ensuring a seamless and secure experience.',
  },
  {
    value: 'redaction',
    media: { src: '/how-it-works-2.mp4' },
    title: 'AI-powered redaction',
    description:
      'Our advanced AI instantly scans your document, detecting and redacting sensitive information with pinpoint accuracy, saving you time and effort.',
  },
  {
    value: 'download',
    media: { src: '/how-it-works-3.mp4' },
    title: 'Full control with manual redaction',
    description:
      'Automatically detect sensitive information, or manually add or remove redactions as needed. Highlight, black out, or erase text and areas for complete customization.',
  },
];
