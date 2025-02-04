import { BoundingBox, BoundingBoxWithMetadata } from '@/hooks/use-pdf';
import { Rect } from '@/types/rectangle';
import { ContainerProps } from '@mantine/core';
import { DocumentCallback } from 'react-pdf/dist/cjs/shared/types';

export type DesktopMobileProps = ContainerProps & {
  canvasBox: BoundingBox;
  currentPageIndex: number;
  draftBox: Rect | null;
  fauxLoadingSampleImage: boolean;
  file: File | string;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  hoveringOverBox: BoundingBoxWithMetadata | null;
  imageRef: React.RefObject<HTMLDivElement>;
  isAnalyzing: boolean;
  numberOfPages: number;
  onAnalyzeImage: () => void;
  onDeleteBox: (id: string) => void;
  onDownload: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onPdfLoaded: (props: DocumentCallback) => void;
  onPreviousPage: () => void;
  onReset: () => void;
  previewRedacted: boolean;
  togglePreviewRedacted: () => void;
};
