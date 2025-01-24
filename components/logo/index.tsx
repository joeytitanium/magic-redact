import { type BoxProps, Flex } from '@mantine/core';

type LogoProps = BoxProps & {
  priority?: boolean;
  width?: number;
  height?: number;
};

export const Logo = ({ priority, width = 138, height = 23, ...flexProps }: LogoProps) => (
  <Flex align="center" {...flexProps}>
    {/* <Text fz="h1" fw={800}>
      Pixelate
    </Text> */}
    {/* <Image
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
    /> */}
  </Flex>
);
