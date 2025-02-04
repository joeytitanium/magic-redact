import { CONFIG } from '@/config';

import { Badge, Paper, ScrollArea, Stack, UnstyledButton } from '@mantine/core';
import clsx from 'clsx';
import { Document, Page, pdfjs } from 'react-pdf';

import classes from './index.module.css';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type PagesTrackProps = {
  file: File;
  numberOfPages: number;
  onPageChange: (page: number) => void;
  currentPageIndex: number;
};

export const PagesTrack = ({
  file,
  numberOfPages,
  onPageChange,
  currentPageIndex,
}: PagesTrackProps) => (
  <ScrollArea pos="fixed" top={CONFIG.layout.headerHeight} left={0} bottom={0} px="md">
    <Document file={file}>
      <Stack align="center" gap="xl" py="lg">
        {Array.from({ length: numberOfPages }).map((_, index) => (
          <UnstyledButton pos="relative" key={index} onClick={() => onPageChange(index)}>
            <Paper
              withBorder
              radius="md"
              className={clsx({
                [classes.page]: index !== currentPageIndex,
                [classes.selectedPage]: index === currentPageIndex,
              })}
              style={{ overflow: 'hidden' }}
            >
              <Page pageIndex={index} width={256} />
              <Badge
                className={clsx({
                  [classes.badge]: index !== currentPageIndex,
                  [classes.selectedBadge]: index === currentPageIndex,
                })}
                pos="absolute"
                bottom={8}
                right={8}
                size="sm"
                variant="filled"
              >
                {index + 1}
              </Badge>
            </Paper>
          </UnstyledButton>
        ))}
      </Stack>
    </Document>
  </ScrollArea>
);
