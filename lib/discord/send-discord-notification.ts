import { DeviceInfo } from '@/types/device-info';
import { logDebugMessage, logError, logMessage } from '@/utils/logger';
import { DiscordMessage, DiscordMessageEmbedField } from './types';

const sendDiscordNotification = async (message: DiscordMessage) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    logMessage('Discord webhook URL not configured', { level: 'error' });
    return;
  }

  logDebugMessage('Sending Discord notification', { context: message });
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
    logError('Failed to send Discord notification', error);
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
  username: '/analyze-image';
  title: string;
  description?: string;
  variant: 'success' | 'error';
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

  await sendDiscordNotification({
    username,
    content: description,
    embeds: [
      {
        title: `${process.env.NODE_ENV !== 'production' ? '[TEST] ' : ''}${title}`,
        // description,
        color: variant === 'success' ? 0x00ff00 : 0xff0000,
        fields,
        image: imageUrl ? { url: imageUrl } : undefined,
      },
    ],
  });
};
