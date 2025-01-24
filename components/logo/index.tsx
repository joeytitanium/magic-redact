import { CONFIG } from '@/config';
import { type BoxProps, Flex, Image } from '@mantine/core';

import NextImage from 'next/image';

type LogoProps = BoxProps & {
  priority?: boolean;
  width?: number;
  height?: number;
};

export const Logo = ({
  priority,
  width = 138,
  height = 23,
  ...flexProps
}: LogoProps) => (
  <Flex align="center" {...flexProps}>
    <Image
      component={NextImage}
      src="/logo-light.png"
      width={width}
      height={height}
      alt={`${CONFIG.site.name}`}
      priority={priority}
      darkHidden
    />
    <Image
      component={NextImage}
      src="/logo-dark.png"
      width={width}
      height={height}
      alt={`${CONFIG.site.name}`}
      priority={priority}
      lightHidden
    />
  </Flex>
);
