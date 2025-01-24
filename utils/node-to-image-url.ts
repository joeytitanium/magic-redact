import { changeDpiDataUrl } from 'changedpi';
import domtoimage from 'dom-to-image';

const SCALE = 2;
const BASE_DPI = 72;

export const nodeToImageUrl = async ({ node }: { node: HTMLElement }) => {
  await domtoimage.toPng(node, { quality: 1 });
  /* We need to do this twice on Safari */
  const url = await domtoimage.toPng(node, {
    width: node.offsetWidth * SCALE,
    height: node.offsetHeight * SCALE,
    style: {
      transform: `scale(${SCALE})`,
      transformOrigin: 'top left',
      width: `${node.offsetWidth}px`,
      height: `${node.offsetHeight}px`,
    },
  });
  return changeDpiDataUrl(url, BASE_DPI * SCALE);
};
