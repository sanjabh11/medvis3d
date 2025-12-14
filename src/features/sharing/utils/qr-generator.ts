import QRCode from 'qrcode';

interface QROptions {
  size?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

const DEFAULT_OPTIONS: Required<QROptions> = {
  size: 256,
  margin: 2,
  darkColor: '#000000',
  lightColor: '#ffffff',
  errorCorrectionLevel: 'M',
};

export async function generateQRCode(
  text: string,
  options: QROptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: opts.size,
      margin: opts.margin,
      color: {
        dark: opts.darkColor,
        light: opts.lightColor,
      },
      errorCorrectionLevel: opts.errorCorrectionLevel,
    });

    return dataUrl;
  } catch (error) {
    console.error('[QR] Generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeWithLogo(
  text: string,
  logoUrl: string,
  options: QROptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Generate QR code with higher error correction for logo overlay
  const qrDataUrl = await generateQRCode(text, {
    ...opts,
    errorCorrectionLevel: 'H', // High error correction for logo
  });

  // Overlay logo in center
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = opts.size;
    canvas.height = opts.size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 0, 0, opts.size, opts.size);

      // Load and draw logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoSize = opts.size * 0.2; // Logo is 20% of QR size
        const logoX = (opts.size - logoSize) / 2;
        const logoY = (opts.size - logoSize) / 2;

        // White background for logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        resolve(canvas.toDataURL('image/png'));
      };
      logo.onerror = () => {
        // If logo fails to load, return QR without logo
        resolve(qrDataUrl);
      };
      logo.src = logoUrl;
    };
    qrImage.onerror = () => reject(new Error('Failed to load QR image'));
    qrImage.src = qrDataUrl;
  });
}

export function downloadQRCode(dataUrl: string, filename: string = 'medvis3d-share.png'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateQRCodeCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  options: QROptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  await QRCode.toCanvas(canvas, text, {
    width: opts.size,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
}
