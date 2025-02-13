import { Container } from '@mantine/core';
import { pdfjs } from 'react-pdf';

import { MobileCanvas } from '@/components/editor/components/canvas/mobile';
import { MobileFooter } from '@/components/editor/components/footer/mobile';
import { DesktopMobileProps } from '@/components/editor/types';
import { CONFIG } from '@/config';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const Mobile = ({
  file,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  draftBox,
  numberOfPages,
  imageRef,
  currentPageIndex,
  canvasBox,
  onPdfLoaded,
  hoveringOverBox,
  onDeleteBox,
  onDownload,
  onReset,
  onAnalyzeImage,
  isAnalyzing,
  fauxLoadingSampleImage,
  previewRedacted,
  onNextPage,
  onPreviousPage,
  togglePreviewRedacted,
  onPageChange,
  numberOfRedactions,
  ...containerProps
}: DesktopMobileProps) => (
  <Container px={0} fluid {...containerProps}>
    <MobileCanvas
      file={file}
      handleMouseDown={handleMouseDown}
      handleMouseMove={handleMouseMove}
      handleMouseUp={handleMouseUp}
      draftBox={draftBox}
      imageRef={imageRef}
      currentPageIndex={currentPageIndex}
      canvasBox={canvasBox}
      onPdfLoaded={onPdfLoaded}
      hoveringOverBox={hoveringOverBox}
      onDeleteBox={onDeleteBox}
      numberOfPages={numberOfPages}
      onPageChange={onPageChange}
    />
    <MobileFooter
      pos="fixed"
      style={{ zIndex: CONFIG.layout.zIndex.mobileFooter }}
      left={0}
      right={0}
      bottom={0}
      h={CONFIG.layout.footerHeight}
      onDownload={onDownload}
      onReset={onReset}
      onAnalyzeImage={onAnalyzeImage}
      isAnalyzing={isAnalyzing || fauxLoadingSampleImage}
      showRedacted={previewRedacted}
      onToggleRedacted={togglePreviewRedacted}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
      currentPageIndex={currentPageIndex}
      numberOfPages={numberOfPages}
      canvasBox={canvasBox}
      numberOfRedactions={numberOfRedactions}
    />
  </Container>
);
