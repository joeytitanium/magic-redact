'use client';

import { JumboTitle } from '@/components/titanium/mantine/components/jumbo-title';
import {
  Box,
  BoxProps,
  Button,
  Container,
  Group,
  GroupProps,
  MantineBreakpoint,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { isNil } from 'lodash';
import { useState, type ReactNode } from 'react';
import classes from './index.module.css';

type IconVariant = 'check-on' | 'check-off' | 'x' | 'none';
type CallToAction = {
  key: string;
  label: string;
  onClick: () => void;
};

type RowData =
  | {
      key: string;
      type: 'subheader';
      title: string;
    }
  | {
      key: string;
      type: 'cell';
      items: Array<{
        key: string;
        children: ReactNode;
      }>;
    };

type InternalRowData =
  | RowData
  | {
      key: string;
      type: 'header';
      titles: string[];
    }
  | {
      key: string;
      type: 'footer';
      callToActions: (CallToAction | null)[];
    };

const DataRows = ({
  data,
  highlightedColumnIndex,
  selectedColumnIndex,
  numColumns,
  breakpoint,
  ...boxProps
}: BoxProps & {
  data: InternalRowData[];
  highlightedColumnIndex: number;
  selectedColumnIndex?: number;
  numColumns: number;
  breakpoint: MantineBreakpoint;
}) => (
  <Box display="grid" {...boxProps}>
    {data.map((row) => {
      if (row.type === 'header') {
        if (selectedColumnIndex !== undefined) {
          return null;
        }
        return (
          <Box key={row.key}>
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}>
              {row.titles.map((title, colIndex) => (
                <Box
                  key={title}
                  className={
                    colIndex === highlightedColumnIndex ? classes.highlightedHeaderCell : undefined
                  }
                >
                  <Text fz="xl" fw="bold" px={{ base: 'md', [breakpoint]: 'xl' }} py="lg">
                    {title}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        );
      }

      if (row.type === 'footer') {
        return (
          <Box
            key={row.key}
            style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}
            className={classes.row}
          >
            {row.callToActions.map((callToAction, colIndex) => {
              if (isNil(callToAction)) {
                return <Box key={colIndex} />;
              }

              return (
                <Box
                  key={callToAction.key}
                  className={
                    colIndex === highlightedColumnIndex ? classes.highlightedFooterCell : undefined
                  }
                  style={{
                    display:
                      selectedColumnIndex !== undefined
                        ? colIndex === selectedColumnIndex
                          ? 'block'
                          : 'none'
                        : undefined,
                  }}
                  px={{ base: 'md', [breakpoint]: 'xl' }}
                  py="xl"
                >
                  <Button
                    onClick={callToAction.onClick}
                    size="lg"
                    variant="light"
                    className={
                      colIndex === highlightedColumnIndex ? classes.highlightedCta : undefined
                    }
                    fullWidth
                  >
                    {callToAction.label}
                  </Button>
                </Box>
              );
            })}
          </Box>
        );
      }

      if (row.type === 'cell') {
        return (
          <Box
            key={row.key}
            className={classes.row}
            style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}
          >
            {row.items.map((item, colIndex) => (
              <Box
                key={item.key}
                className={clsx({
                  [classes.highlightedRow]: colIndex === highlightedColumnIndex && numColumns > 1,
                })}
                style={{
                  display:
                    selectedColumnIndex !== undefined
                      ? colIndex === selectedColumnIndex
                        ? 'block'
                        : 'none'
                      : undefined,
                }}
              >
                {item.children}
              </Box>
            ))}
          </Box>
        );
      }

      return (
        <Box
          key={row.key}
          className={classes.row}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}
        >
          {Array.from({ length: numColumns }).map((_, colIndex) => (
            <Box
              key={colIndex}
              className={clsx({
                [classes.highlightedRow]: colIndex === highlightedColumnIndex && numColumns > 1,
              })}
              style={{
                display:
                  selectedColumnIndex !== undefined
                    ? colIndex === 0
                      ? 'block'
                      : 'none'
                    : undefined,
              }}
            >
              <Text fz="lg" fw="bold" px={{ base: 'md', [breakpoint]: 'xl' }} py="xl">
                {colIndex === 0 ? row.title : undefined}
              </Text>
            </Box>
          ))}
        </Box>
      );
    })}
  </Box>
);

export type Pricing02Props = {
  title?: string;
  subtitle?: string;
  /**
   * The titles of the columns displayed at the top of the pricing table.
   */
  headerTitles?: string[];

  /**
   * The call to action buttons to display at the bottom of the pricing table.
   */
  callToActions?: (CallToAction | null)[];

  /**
   * The data to display in the pricing table.
   */
  data?: RowData[];

  /**
   * The index of the column that is highlighted.
   */
  highlightedColumnIndex?: number;

  /**
   * The breakpoint at which the pricing table is displayed in a single column with a select menu.
   */
  breakpoint?: MantineBreakpoint;
};

export const Pricing02 = ({
  headerTitles = ['Free', 'Plus', 'Pro', 'Business'],
  callToActions,
  data = DEMO_DATA,
  highlightedColumnIndex = 2,
  breakpoint = 'md',
  title = 'Plans and features',
  subtitle = 'Used by the world’s most innovative teams',
}: Pricing02Props) => {
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const numColumns = headerTitles.length;

  const fullData: InternalRowData[] = [
    {
      key: 'header',
      type: 'header',
      titles: headerTitles,
    },
    ...data,
    {
      key: 'footer',
      type: 'footer',
      callToActions: callToActions ?? [],
    },
  ];

  return (
    <Container
      bg="var(--mantine-color-body)"
      py={{
        base: 'calc(var(--mantine-spacing-lg) * 4)',
        xs: 'calc(var(--mantine-spacing-lg) * 5)',
        lg: 'calc(var(--mantine-spacing-lg) * 6)',
      }}
      fluid
    >
      <Container size="md">
        <Stack align="center" gap="xs">
          <JumboTitle order={2} fz="md" ta="center" style={{ textWrap: 'balance' }}>
            {title}
          </JumboTitle>
          <Text c="dimmed" ta="center" fz="xl" style={{ textWrap: 'balance' }}>
            {subtitle}
          </Text>
        </Stack>
      </Container>
      <Container size="xl">
        <DataRows
          mt="calc(var(--mantine-spacing-xl) * 2)"
          data={fullData}
          highlightedColumnIndex={highlightedColumnIndex}
          numColumns={numColumns}
          visibleFrom={breakpoint}
          breakpoint={breakpoint}
        />
        <Stack hiddenFrom={breakpoint} mt="xl">
          <Select
            data={headerTitles}
            value={headerTitles[selectedColumnIndex]}
            onChange={(value) => setSelectedColumnIndex(headerTitles.indexOf(value ?? ''))}
            allowDeselect={false}
            size="lg"
          />
          <DataRows
            data={fullData}
            highlightedColumnIndex={highlightedColumnIndex}
            numColumns={1}
            selectedColumnIndex={selectedColumnIndex}
            breakpoint={breakpoint}
          />
        </Stack>
      </Container>
    </Container>
  );
};

/**
 * The following is demo code. You can remove it.
 */

const Cell = ({
  children,
  iconVariant,
  ...groupProps
}: GroupProps & { iconVariant: IconVariant; children: ReactNode }) => (
  <Group px={{ base: 'md', md: 'xl' }} py="md" wrap="nowrap" {...groupProps}>
    {iconVariant !== 'none' && (
      <ThemeIcon
        radius="xl"
        size="sm"
        variant="transparent"
        c={iconVariant === 'x' ? 'dimmed' : undefined}
        className={clsx({
          [classes.iconOn]: iconVariant === 'check-on',
          [classes.iconOff]: iconVariant !== 'check-on',
        })}
      >
        {iconVariant === 'check-on' && <IconCheck size={16} />}
        {iconVariant === 'check-off' && <IconCheck size={16} />}
        {iconVariant === 'x' && <IconX size={16} />}
      </ThemeIcon>
    )}
    <Box>{children}</Box>
  </Group>
);

const DEMO_DATA: RowData[] = [
  {
    key: 'price',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: (
          <Cell iconVariant="none">
            <Text fz="xl" fw="bold" inherit span>
              $0
            </Text>{' '}
            <Text c="dimmed" inherit span>
              /month
            </Text>
          </Cell>
        ),
      },
      {
        key: 'plus',
        children: (
          <Cell iconVariant="none">
            <Text fz="xl" fw="bold" inherit span>
              $5
            </Text>{' '}
            <Text c="dimmed" inherit span>
              /month
            </Text>
          </Cell>
        ),
      },
      {
        key: 'pro',
        children: (
          <Cell iconVariant="none">
            <Text fz="xl" fw="bold" inherit span>
              $15
            </Text>{' '}
            <Text c="dimmed" inherit span>
              /month
            </Text>
          </Cell>
        ),
      },
      {
        key: 'business',
        children: (
          <Cell iconVariant="none">
            <Text fz="xl" fw="bold" inherit span>
              $50
            </Text>{' '}
            <Text c="dimmed" inherit span>
              /month
            </Text>
          </Cell>
        ),
      },
    ],
  },
  {
    key: 'manual-redactions',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: (
          <Cell iconVariant="check-on">
            Unlimited{' '}
            <Text c="dimmed" inherit span>
              manual redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'plus',
        children: (
          <Cell iconVariant="check-on">
            Unlimited{' '}
            <Text c="dimmed" inherit span>
              manual redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'pro',
        children: (
          <Cell iconVariant="check-on">
            Unlimited{' '}
            <Text c="dimmed" inherit span>
              manual redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'enterprise',
        children: (
          <Cell iconVariant="check-on">
            Unlimited{' '}
            <Text c="dimmed" inherit span>
              manual redactions
            </Text>
          </Cell>
        ),
      },
    ],
  },
  {
    key: 'auto-redactions',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: (
          <Cell iconVariant="check-off">
            3{' '}
            <Text c="dimmed" inherit span>
              AI auto-redactions per day
            </Text>
          </Cell>
        ),
      },
      {
        key: 'plus',
        children: (
          <Cell iconVariant="check-off">
            250{' '}
            <Text c="dimmed" inherit span>
              AI auto-redacted pages/images per month
            </Text>
          </Cell>
        ),
      },
      {
        key: 'pro',
        children: (
          <Cell iconVariant="check-off">
            1,000{' '}
            <Text c="dimmed" inherit span>
              AI auto-redacted pages/images per month
            </Text>
          </Cell>
        ),
      },
      {
        key: 'enterprise',
        children: (
          <Cell iconVariant="check-on">
            Unlimited{' '}
            <Text c="dimmed" inherit span>
              AI auto-redacted pages/images per month
            </Text>
          </Cell>
        ),
      },
    ],
  },
  {
    key: 'page-limits',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: (
          <Cell iconVariant="x">
            Multi-page{' '}
            <Text c="dimmed" inherit span>
              PDF redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'plus',
        children: (
          <Cell iconVariant="check-on">
            Multi-page{' '}
            <Text c="dimmed" inherit span>
              PDF redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'pro',
        children: (
          <Cell iconVariant="check-on">
            Multi-page{' '}
            <Text c="dimmed" inherit span>
              PDF redactions
            </Text>
          </Cell>
        ),
      },
      {
        key: 'enterprise',
        children: (
          <Cell iconVariant="check-on">
            Multi-page{' '}
            <Text c="dimmed" inherit span>
              PDF redactions
            </Text>
          </Cell>
        ),
      },
    ],
  },
  {
    key: 'account-management',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: (
          <Cell iconVariant="check-off">
            No{' '}
            <Text c="dimmed" inherit span>
              Account required
            </Text>
          </Cell>
        ),
      },
      {
        key: 'plus',
        children: (
          <Cell iconVariant="check-off">
            <Text c="dimmed" inherit span>
              Account required
            </Text>
          </Cell>
        ),
      },
      {
        key: 'pro',
        children: (
          <Cell iconVariant="check-off">
            <Text c="dimmed" inherit span>
              Account required
            </Text>
          </Cell>
        ),
      },
      {
        key: 'business',
        children: (
          <Cell iconVariant="check-off">
            <Text c="dimmed" inherit span>
              Account required
            </Text>
          </Cell>
        ),
      },
    ],
  },
  {
    key: 'file-support',
    type: 'subheader',
    title: 'Supported file types',
  },
  {
    key: 'pdf',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">PDF</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">PDF</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">PDF</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">PDF</Cell>,
      },
    ],
  },
  {
    key: 'jpg',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">JPG</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">JPG</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">JPG</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">JPG</Cell>,
      },
    ],
  },
  {
    key: 'png',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">PNG</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">PNG</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">PNG</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">PNG</Cell>,
      },
    ],
  },
  {
    key: 'webp',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">WEBP</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">WEBP</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">WEBP</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">WEBP</Cell>,
      },
    ],
  },
  {
    key: 'heic',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">HEIC</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">HEIC</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">HEIC</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">HEIC</Cell>,
      },
    ],
  },
  {
    key: 'heif',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">HEIF</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">HEIF</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">HEIF</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">HEIF</Cell>,
      },
    ],
  },
  {
    key: 'avif',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">AVIF</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">AVIF</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">AVIF</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">AVIF</Cell>,
      },
    ],
  },
  {
    key: 'svg',
    type: 'cell',
    items: [
      {
        key: 'free',
        children: <Cell iconVariant="check-on">SVG</Cell>,
      },
      {
        key: 'plus',
        children: <Cell iconVariant="check-on">SVG</Cell>,
      },
      {
        key: 'pro',
        children: <Cell iconVariant="check-on">SVG</Cell>,
      },
      {
        key: 'business',
        children: <Cell iconVariant="check-on">SVG</Cell>,
      },
    ],
  },
];
