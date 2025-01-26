import html2canvas from 'html2canvas';

/**
 * Converts a DOM node into a PNG image URL.
 * @param node The target HTMLElement to capture.
 * @returns A Promise that resolves to a PNG data URL.
 */
export const nodeToImageUrl = async ({ node }: { node: HTMLElement }): Promise<string> => {
  try {
    const clonedNode = node.cloneNode(true) as HTMLElement;

    // Create an offscreen container
    const offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'fixed';
    offscreenContainer.style.top = '-9999px';
    offscreenContainer.style.left = '-9999px';
    offscreenContainer.style.width = `${clonedNode.offsetWidth}px`;
    offscreenContainer.style.height = `${clonedNode.offsetHeight}px`;
    offscreenContainer.style.opacity = '0'; // Make it invisible without hiding
    offscreenContainer.style.pointerEvents = 'none';
    offscreenContainer.style.overflow = 'hidden';

    // Append the cloned node to the offscreen container
    offscreenContainer.appendChild(clonedNode);
    document.body.appendChild(offscreenContainer);

    // Ensure all images within the cloned node are loaded
    const imgs = clonedNode.querySelectorAll('img');
    const loadImages = Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve, reject) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
          }
        })
    );

    await Promise.all(loadImages);

    // Wait for fonts to load
    await document.fonts.ready;

    // Introduce a slight delay to ensure rendering
    // eslint-disable-next-line no-promise-executor-return
    await new Promise<void>((resolve) => setTimeout(resolve, 100));

    // Use html2canvas to capture the cloned node
    const canvas = await html2canvas(clonedNode, {
      scale: 2, // Increase resolution for better quality
      useCORS: true, // Enable cross-origin images
      backgroundColor: null, // Preserve transparency
      logging: true, // Enable logging for debugging
      allowTaint: false, // Prevent cross-origin content from tainting the canvas
    });

    document.body.removeChild(offscreenContainer);

    // Convert the canvas to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error; // Re-throw the error after logging
  }
};
