'use client';

import { AuthContainer } from '@/app/(auth)/_components/auth-container';
import { SignupForm } from '@/app/(auth)/_components/sign-up-form';
import { SocialLogin } from '@/app/(auth)/_components/social-login';
import { usePostSignInUp } from '@/app/(auth)/use-post-sign-in-up';
import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, Divider, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import NextLink from 'next/link';

export const SignUpPage = ({ priceId }: { priceId?: string }) => {
  const { handleSignInUp } = usePostSignInUp({ priceId });

  return (
    <AuthContainer
      bottomSection={
        <Text ta="center" mt="xl">
          Already have an account?{' '}
          <Anchor
            component={NextLink}
            href={getRouteUrl({
              to: '/sign-in',
              params: { priceId: priceId?.toString() },
            })}
          >
            Sign-in
          </Anchor>
        </Text>
      }
    >
      <Title mb="lg">Sign-up</Title>
      <SocialLogin
        type="signup"
        onSuccess={async () => {
          await handleSignInUp();
        }}
      />
      <Divider mt="xl" mb="lg" label="Or" />
      <SignupForm
        initialEmailValue=""
        emailRedirectTo={getRouteUrl(
          { to: '/', params: { pricing: 'true' } },
          { absoluteUrl: true }
        )}
        onSuccess={async ({ user }) => {
          if (!user) return;
          await handleSignInUp();
        }}
        onError={(error) => {
          showNotification({
            message: error.message,
            color: 'red',
          });
        }}
      />
    </AuthContainer>
  );
};
