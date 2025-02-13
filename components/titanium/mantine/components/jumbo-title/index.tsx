import { type MantineFontSize, Title, type TitleProps } from '@mantine/core';
import clsx from 'clsx';
import classes from './index.module.css';

export type JumboTitleOrder = 1 | 2 | 3 | 4 | 5;

const FONT_WEIGHT_MAP: Record<MantineFontSize, number> = {
  xl: 800,
  lg: 800,
  md: 700,
  sm: 600,
  xs: 500,
};

type Props = Omit<TitleProps, 'order'> & {
  /**
   * The order of the title.
   * e.g. order={1} will render an h1 .
   * @default 1
   */
  order?: JumboTitleOrder;

  /**
   * The font size of the title.
   * @default 'xl'
   */
  fz?: MantineFontSize;
};

export const JumboTitle = ({ className, children, order = 1, fz = 'xl', ...otherProps }: Props) => (
  <Title
    fw={FONT_WEIGHT_MAP[fz]}
    className={clsx(classes[fz], className)}
    lh={1}
    order={order}
    {...otherProps}
  >
    {children}
  </Title>
);
