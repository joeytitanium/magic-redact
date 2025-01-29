import { geolocation } from '@vercel/functions';

export type DeviceInfo = UAParser.IResult & {
  geolocation: ReturnType<typeof geolocation>;
  ipAddress: string | undefined;
};
