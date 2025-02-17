import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { CONFIG } from '@/config';
import { Anchor, Box, Container, Flex, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

type Faq = {
  value: string;
  question: ReactNode;
  answer: ReactNode;
};

const FAQ: Faq[] = [
  {
    value: 'how-it-works',
    question: 'How does this tool work?',
    answer:
      'Simply upload your PDF or image, and our AI will automatically detect and redact sensitive information. You can also manually edit redactions before downloading your file.',
  },
  {
    value: 'supported-file-types',
    question: 'What file types do you support?',
    answer:
      'We support PDFs and various image formats, including PNG, JPEG, SVG, WEBP, AVIF, HEIC, and HEIF.',
  },
  {
    value: 'free-ai-redactions',
    question: 'How many AI auto-redactions do I get for free?',
    answer:
      'Free users get up to 3 AI auto-redacted pages/images per day. If you need more, you can upgrade to a paid plan.',
  },
  {
    value: 'multi-page-support',
    question: 'Can I redact multi-page PDFs?',
    answer:
      "Free users can only redact single-page PDFs/images. To redact multi-page documents, you'll need a Plus, Pro, or Business plan.",
  },
  {
    value: 'data-security',
    question: 'Is my data secure?',
    answer:
      'Yes! Your files are temporarily stored during processing and automatically deleted immediately afterward. Since our code is open-source, anyone can verify our security practices.',
  },
  {
    value: 'manual-redaction',
    question: 'Is manual redaction free?',
    answer: 'Yes! Manual redaction is always free and unlimited, with or without an account.',
  },
  {
    value: 'account-requirement',
    question: 'Do I need an account to use this?',
    answer:
      'No! You can redact files for free with no sign-up required. An account is only needed for higher AI redaction limits and multi-page support.',
  },

  {
    value: 'open-source',
    question: 'Is this tool open source?',
    answer:
      'Yes! Our code is fully open-source, so anyone can audit, contribute, or self-host it if they prefer.',
  },
  {
    value: 'accuracy',
    question: 'How accurate is the AI auto-redaction?',
    answer:
      'Our AI is trained to detect common sensitive information like names, addresses, phone numbers, and more. While highly accurate, we recommend reviewing the results and using manual redaction for additional precision when needed.',
  },
];

const FaqCell = ({ question, answer }: Faq) => (
  <Box
    p={{
      base: 'xl',
      lg: 'calc(var(--mantine-spacing-lg) * 2)',
    }}
    w={{
      base: '100%',
      lg: '33.333%',
    }}
  >
    <Text fz="lg" fw="bold" component="blockquote" mb={4}>
      {question}
    </Text>
    <Text fz="md" component="blockquote">
      {answer}
    </Text>
  </Box>
);

export const Faq01 = () => (
  <Container
    id="frequently-asked-questions"
    bg="var(--mantine-color-body)"
    pt={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid
  >
    <Container size="md">
      <Stack gap="xs" align="center">
        <JumboTitle order={2} fz="sm" ta="center" style={{ textWrap: 'balance' }} mb="sm">
          Frequently Asked Questions
        </JumboTitle>
        <Text c="dimmed" ta="center" fz="lg" style={{ textWrap: 'balance' }}>
          Can't find what you're looking for? Drop us an{' '}
          <Anchor href={`mailto:${CONFIG.support.email}`} underline="always" c="dimmed" inherit>
            email
          </Anchor>{' '}
          and our support team will assist you promptly.
        </Text>
      </Stack>
    </Container>
    <Container size="xl">
      <Flex mt="calc(var(--mantine-spacing-lg) * 3)" wrap="wrap" justify="center">
        {FAQ.map((faq) => (
          <FaqCell key={faq.value} {...faq} />
        ))}
      </Flex>
    </Container>
  </Container>
);
