import { Anchor, type CSSVariablesResolver, Modal, createTheme, virtualColor } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'primary',
  defaultGradient: {
    from: 'light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-5))',
    to: 'light-dark(var(--mantine-color-black), var(--mantine-color-white))',
    deg: 0,
  },
  defaultRadius: 'md',
  primaryShade: 6,
  autoContrast: true,
  components: {
    Anchor: Anchor.extend({
      defaultProps: {
        underline: 'always',
      },
    }),
    Badge: {
      styles: {
        label: {
          // textTransform: 'none',
        },
      },
    },
    Modal: Modal.extend({
      styles: {
        title: {
          fontSize: 'var(--mantine-font-size-xl)',
          fontWeight: 'var(--mantine-h3-font-weight)',
        },
      },
      defaultProps: {
        padding: 'lg',
        overlayProps: {
          blur: 5,
          backgroundOpacity: 0.55,
        },
      },
    }),
  },
  colors: {
    black: [
      '#999999',
      '#7f7f7f',
      '#666666',
      '#4d4d4d',
      '#333333',
      '#262626',
      '#1a1a1a',
      '#0d0d0d',
      '#080808',
      '#000000',
    ],
    white: [
      '#ffffff',
      '#f2f2f2',
      '#e6e6e6',
      '#d9d9d9',
      '#cccccc',
      '#bfbfbf',
      '#b3b3b3',
      '#a6a6a6',
      '#999999',
      '#8c8c8c',
    ],
    primary: virtualColor({
      name: 'primary',
      dark: 'white',
      light: 'black',
    }),
  },
});

export const resolver: CSSVariablesResolver = (t) => ({
  variables: {
    // '--mantine-radius-default': t.radius.lg,
  },
  light: {
    '--mantine-color-body': t.colors.white[0],
    '--mantine-color-text': t.black,
    '--mantine-color-anchor': t.black,
  },
  dark: {
    '--mantine-color-body': t.colors.black[9],
    '--mantine-color-text': t.white,
    '--mantine-color-anchor': t.white,
  },
});
