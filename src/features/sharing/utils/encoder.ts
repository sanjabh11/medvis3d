import { compress, decompress } from 'lz-string';

export interface ShareableSession {
  version: number;
  timestamp: number;
  imageDataUrl: string; // Base64 encoded image (compressed)
  depthIntensity: number;
  annotations?: string; // JSON stringified annotations
  notes?: string;
}

const SHARE_VERSION = 1;
const MAX_URL_LENGTH = 8000; // Safe URL length limit

export function encodeSession(session: Omit<ShareableSession, 'version' | 'timestamp'>): string {
  const fullSession: ShareableSession = {
    version: SHARE_VERSION,
    timestamp: Date.now(),
    ...session,
  };

  const json = JSON.stringify(fullSession);
  const compressed = compress(json);
  
  // URL-safe base64
  return encodeURIComponent(compressed);
}

export function decodeSession(encoded: string): ShareableSession | null {
  try {
    const compressed = decodeURIComponent(encoded);
    const json = decompress(compressed);
    
    if (!json) {
      throw new Error('Failed to decompress session data');
    }

    const session = JSON.parse(json) as ShareableSession;

    // Version check
    if (session.version !== SHARE_VERSION) {
      console.warn('[Share] Session version mismatch:', session.version);
    }

    return session;
  } catch (error) {
    console.error('[Share] Failed to decode session:', error);
    return null;
  }
}

export function createShareUrl(session: Omit<ShareableSession, 'version' | 'timestamp'>): string {
  const encoded = encodeSession(session);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/share?data=${encoded}`;
}

export function parseShareUrl(url: string): ShareableSession | null {
  try {
    const urlObj = new URL(url);
    const data = urlObj.searchParams.get('data');
    
    if (!data) {
      return null;
    }

    return decodeSession(data);
  } catch (error) {
    console.error('[Share] Failed to parse share URL:', error);
    return null;
  }
}

export function isValidShareUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has('data');
  } catch {
    return false;
  }
}

export function canCreateShareUrl(imageDataUrl: string): boolean {
  // Check if the resulting URL would be too long
  const testSession = {
    imageDataUrl,
    depthIntensity: 0.5,
  };
  
  try {
    const url = createShareUrl(testSession);
    return url.length <= MAX_URL_LENGTH;
  } catch {
    return false;
  }
}

export function compressImageForSharing(
  imageData: ImageData,
  maxSize: number = 256
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Calculate scaled dimensions
  const scale = Math.min(maxSize / imageData.width, maxSize / imageData.height, 1);
  const newWidth = Math.floor(imageData.width * scale);
  const newHeight = Math.floor(imageData.height * scale);

  // Create temp canvas for original image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) {
    throw new Error('Failed to create temp canvas context');
  }

  tempCtx.putImageData(imageData, 0, 0);

  // Scale down
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);

  // Export as compressed JPEG
  return canvas.toDataURL('image/jpeg', 0.6);
}
