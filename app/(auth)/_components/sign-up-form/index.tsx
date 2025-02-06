import { handleSignUp } from '@/app/(auth)/_utils/handle-sign-up';
import {
  AUTH_EMAIL_LENGTH_RANGE,
  AUTH_NAME_LENGTH_RANGE,
  AUTH_PASSWORD_LENGTH_RANGE,
} from '@/app/(auth)/constants';
import { supabaseClient } from '@/lib/supabase/client';
import { logDebugMessage } from '@/utils/logger';
import { Button, Flex, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { Session, User } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

const SCHEMA = z
  .object({
    name: z.string().min(AUTH_NAME_LENGTH_RANGE[0]).max(AUTH_NAME_LENGTH_RANGE[1]),
    email: z.string().email().max(AUTH_EMAIL_LENGTH_RANGE[1]),
    password: z.string().min(AUTH_PASSWORD_LENGTH_RANGE[0]).max(AUTH_PASSWORD_LENGTH_RANGE[1]),
    confirmPassword: z
      .string()
      .min(AUTH_PASSWORD_LENGTH_RANGE[0])
      .max(AUTH_PASSWORD_LENGTH_RANGE[1]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof SCHEMA>;

export const SignupForm = ({
  initialEmailValue,
  emailRedirectTo,
  onSuccess,
  onError,
  submitTitle = 'Sign-up',
}: {
  initialEmailValue: string;
  emailRedirectTo?: string;
  submitTitle?: string;
  onSuccess: (values: { user: User | null; session: Session | null }) => void;
  onError: (error: Error) => void;
}) => {
  const supabase = supabaseClient();
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      email: initialEmailValue,
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(SCHEMA),
  });

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: async ({ email, password, name }: FormValues) => {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo, // not used
        },
      });

      if (signUpError) {
        /* To provide some extra convenience, lets just try to log in with the same credentials.
         * If it works then just login them in and don't throw any errors.
         */
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInData.user) {
          return signInData;
        }

        throw signUpError;
      }

      if (signUpData.user) {
        await handleSignUp({
          email,
          name,
          source: 'Email',
          userId: signUpData.user.id,
          avatarUrl: signUpData.user.user_metadata.avatar_url,
        });
      }

      return signUpData;
    },
    onSuccess: async (data) => {
      onSuccess(data);
    },
    onError: (error) => {
      logDebugMessage({ message: 'error', context: { error } });
      onError(error);
    },
  });

  const onSubmit = async (values: FormValues) => {
    signUp(values);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Flex direction="column" gap="md">
        <TextInput
          type="email"
          label="Email"
          placeholder="johnnyappleseed@gmail.com"
          {...form.getInputProps('email')}
          required
        />
        <TextInput
          label="Name"
          placeholder="Johnny Appleseed"
          {...form.getInputProps('name')}
          required
          data-autofocus
        />

        <TextInput
          type="password"
          label="Password"
          placeholder="••••••••"
          {...form.getInputProps('password')}
          required
        />
        <TextInput
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          {...form.getInputProps('confirmPassword')}
          required
        />
        <Button fullWidth type="submit" loading={isPending} mt="md">
          {submitTitle}
        </Button>
      </Flex>
    </form>
  );
};
