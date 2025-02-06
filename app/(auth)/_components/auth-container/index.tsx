import { Logo } from '@/components/logo';
import { getRouteUrl } from '@/routing/get-route-url';

import { Anchor, Center, Container, Paper } from '@mantine/core';
import { ReactNode } from 'react';

export const AuthContainer = ({
  children,
  bottomSection,
  hideLogo = false,
}: {
  children: ReactNode;
  bottomSection?: ReactNode;
  hideLogo?: boolean;
}) => (
  <Container size="xs" h="100vh">
    {!hideLogo && (
      <Center mt="xl">
        <Anchor href={getRouteUrl({ to: '/' })}>
          <Logo priority />
        </Anchor>
      </Center>
    )}
    <Paper withBorder shadow="md" p={30} radius="md" mt="10vh">
      {children}
    </Paper>
    {bottomSection}
  </Container>
);
