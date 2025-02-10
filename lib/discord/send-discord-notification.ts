import { DeviceInfo } from '@/types/device-info';
import { LogDomain, logDebugMessage, logError } from '@/utils/logger';
import { DiscordMessage, DiscordMessageEmbedField } from './types';

const DOMAIN: LogDomain = 'discord-send-notification';

const sendDiscordNotification = async (message: DiscordMessage) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    logError({
      domain: DOMAIN,
      message: 'Discord webhook URL not configured',
      context: { message },
    });
    return;
  }

  logDebugMessage({ domain: DOMAIN, message: 'Sending Discord notification' });
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with status ${response.status}`);
    }
  } catch (error) {
    logError({
      domain: DOMAIN,
      message: 'Failed to send Discord notification',
      error,
      context: { message },
    });
  }
};

export const sendDiscordAlert = async ({
  username,
  title,
  description,
  variant,
  deviceInfo,
  imageUrl,
  context = [],
}: {
  username: '/analyze-image' | 'signup';
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
  deviceInfo?: DeviceInfo;
  imageUrl?: string;
  context?: DiscordMessageEmbedField[];
}) => {
  const fields: DiscordMessageEmbedField[] = [];
  if (context.length > 0) {
    fields.push(...context);
  }
  fields.push(
    {
      name: 'IP Address',
      value: deviceInfo?.ipAddress ?? 'Unknown',
      inline: true,
    },
    {
      name: 'Location',
      value: `${deviceInfo?.geolocation.city}, ${deviceInfo?.geolocation.country} ${deviceInfo?.geolocation.flag}`,
      inline: true,
    },
    {
      name: 'Device',
      value: `${deviceInfo?.device.model} ${deviceInfo?.device.vendor}`,
      inline: true,
    }
  );

  const color = (() => {
    if (variant === 'success') return 0x00ff00;
    if (variant === 'error') return 0xff0000;
    return 0x0000ff;
  })();

  await sendDiscordNotification({
    username,
    content: description,
    embeds: [
      {
        title: `${process.env.NODE_ENV !== 'production' ? '[TEST] ' : ''}${title}`,
        // description,
        color,
        fields,
        image: imageUrl ? { url: imageUrl } : undefined,
      },
    ],
  });
};
