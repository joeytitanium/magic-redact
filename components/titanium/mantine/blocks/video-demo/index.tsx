import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import { Center, Container, Stack } from '@mantine/core';

export const VideoDemo = () => (
  <Container
    bg="var(--mantine-color-body)"
    pt={{
      base: 'calc(var(--mantine-spacing-lg) * 4)',
      xs: 'calc(var(--mantine-spacing-lg) * 5)',
      lg: 'calc(var(--mantine-spacing-lg) * 6)',
    }}
    fluid
  >
    <Stack justify="center" gap="xl">
      <JumboTitle order={2} fz="md" ta="center" style={{ textWrap: 'balance' }}>
        Video Demo
      </JumboTitle>
      <Center>
        <iframe
          width="1200"
          height="675"
          src="https://www.youtube.com/embed/JphyIN4dr6U?si=PEDmYTnu7OcFIOPv"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ borderRadius: '1rem' }}
        />
      </Center>
    </Stack>
  </Container>
);
