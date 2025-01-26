import { changeDpiDataUrl } from 'changedpi';
import domtoimage from 'dom-to-image';

const SCALE = 2;
const BASE_DPI = 72;

export const nodeToImageUrl = async ({ node }: { node: HTMLElement }) => {
  // Clone the node
  const clonedNode = node.cloneNode(true) as HTMLElement;

  // Store the original position style
  const originalPosition = clonedNode.style.position;

  // Temporarily change the position to absolute
  clonedNode.style.position = 'absolute';
  clonedNode.style.top = '0';
  clonedNode.style.left = '0';

  // Append the cloned node to the body
  document.body.appendChild(clonedNode);

  // Render the cloned node
  const url = await domtoimage.toPng(clonedNode, {
    width: clonedNode.offsetWidth * SCALE,
    height: clonedNode.offsetHeight * SCALE,
    style: {
      transform: `scale(${SCALE})`,
      transformOrigin: 'top left',
      width: `${clonedNode.offsetWidth}px`,
      height: `${clonedNode.offsetHeight}px`,
    },
  });

  // Remove the cloned node from the body
  document.body.removeChild(clonedNode);

  // Revert the position style back to its original value
  node.style.position = originalPosition;

  return changeDpiDataUrl(url, BASE_DPI * SCALE);
};
