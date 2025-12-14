export async function captureScreenshot(
  canvas: HTMLCanvasElement,
  filename: string = 'medvis3d-capture.png'
): Promise<void> {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[Screenshot] Captured successfully');
  } catch (error) {
    console.error('[Screenshot] Failed to capture:', error);
    throw new Error('Failed to capture screenshot');
  }
}

export async function captureScreenshotAsBlob(
  canvas: HTMLCanvasElement
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export function generateTimestampFilename(prefix: string = 'medvis3d'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${timestamp}.png`;
}
