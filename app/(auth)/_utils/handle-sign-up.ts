'use server';

import { sendDiscordAlert } from '@/lib/discord/send-discord-notification';
import { LogDomain, logError } from '@/utils/logger';
import posthog from 'posthog-js';

const DOMAIN: LogDomain = 'sign-up';

export const handleSignUp = async ({
  name,
  email,
  source,
  userId,
  avatarUrl,
}: {
  name: string;
  email: string;
  source: 'Google' | 'Email';
  userId: string;
  avatarUrl: string;
}) => {
  await sendDiscordAlert({
    username: 'signup',
    title: 'New user signed up',
    variant: 'info',
    imageUrl: avatarUrl,
    context: [
      {
        name: 'Name',
        value: name,
        inline: true,
      },
      {
        name: 'Email',
        value: email,
        inline: true,
      },
      {
        name: 'Source',
        value: source,
        inline: true,
      },
    ],
  });

  try {
    posthog.capture('user-created', {
      distinctId: userId,
      userId,
      source,
    });
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Error capturing user-created event',
      error,
    });
  }
};
