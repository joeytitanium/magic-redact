'use client';

import { AuthContainer } from '@/app/(auth)/_components/auth-container';
import { SocialLogin } from '@/app/(auth)/_components/social-login';
import { AUTH_EMAIL_LENGTH_RANGE, AUTH_PASSWORD_LENGTH_RANGE } from '@/app/(auth)/constants';
import { usePostSignInUp } from '@/app/(auth)/use-post-sign-in-up';
import { supabaseClient } from '@/lib/supabase/client';
import { getRouteUrl } from '@/routing/get-route-url';
import { Anchor, Button, Divider, Flex, Text, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import NextLink from 'next/link';
import { z } from 'zod';

const SCHEMA = z.object({
  email: z.string().email().max(AUTH_EMAIL_LENGTH_RANGE[1]),
  password: z.string().min(AUTH_PASSWORD_LENGTH_RANGE[0]).max(AUTH_PASSWORD_LENGTH_RANGE[1]),
});
type FormValues = z.infer<typeof SCHEMA>;

const SignInPage = ({ priceId }: { priceId?: string }) => {
  const supabase = supabaseClient();
  const form = useForm<FormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(SCHEMA),
  });
  const { handleSignInUp } = usePostSignInUp({ priceId });

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: async ({ email, password }: FormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: async () => {
      await handleSignInUp();
    },
    onError: () => {
      showNotification({
        message: 'Invalid credentials',
        color: 'red',
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    signIn(values);
  };

  return (
    <AuthContainer
      bottomSection={
        <Text ta="center" mt="xl">
          Don't have an account?{' '}
          <Anchor
            component={NextLink}
            href={getRouteUrl({
              to: '/sign-up',
              params: { priceId },
            })}
          >
            Sign up
          </Anchor>
        </Text>
      }
    >
      <Title mb="xl">Sign-in</Title>
      <SocialLogin
        type="signin"
        onSuccess={async () => {
          await handleSignInUp();
        }}
      />
      <Divider mt="xl" mb="lg" label="Or" />
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Flex direction="column" gap="md">
          <TextInput
            type="email"
            label="Email"
            placeholder="john@gmail.com"
            {...form.getInputProps('email')}
            required
          />
          <TextInput
            type="password"
            label="Password"
            {...form.getInputProps('password')}
            required
          />
          <Button fullWidth mt="md" type="submit" loading={isPending}>
            Sign-in
          </Button>
          {/* <Button
            component={NextLink}
            href={getRouteUrl({
              to: '/reset-password',
              params: { email: form.getValues().email },
            })}
            variant="white"
          >
            Reset password
          </Button> */}
        </Flex>
      </form>
    </AuthContainer>
  );
};

export default SignInPage;
