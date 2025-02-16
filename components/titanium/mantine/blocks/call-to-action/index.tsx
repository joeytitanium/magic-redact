import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { getRouteUrl } from '@/routing/get-route-url';
import { Button, Card, Container, Stack, Text } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import NextLink from 'next/link';

export const CallToAction01 = () => (
  <Container
    bg="var(--mantine-color-body)"
    py={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid
  >
    <Container size="lg">
      <Card radius="lg" mih={400} p="xl">
        <Stack align="center" justify="center" h="100%" gap="xl" flex={1} p="xl">
          <Stack align="center" gap="sm">
            <JumboTitle order={3} fz="xs" ta="center" style={{ textWrap: 'balance' }} maw="80%">
              Redact Smarter. Faster. For Free.
            </JumboTitle>
            <Text ta="center" fz="lg" maw="80%" style={{ textWrap: 'balance' }}>
              No sign-ups, no hassle. Just instant, AI-powered redaction. Try it for free or upgrade
              for more power.
            </Text>
          </Stack>
          <Button
            component={NextLink}
            href={getRouteUrl({ to: '/', fragment: 'editor' })}
            radius="xl"
            size="lg"
            rightSection={<IconArrowUpRight />}
          >
            Start Redacting Now
          </Button>
        </Stack>
      </Card>
    </Container>
  </Container>
);
