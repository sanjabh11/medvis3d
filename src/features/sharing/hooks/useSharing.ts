'use client';

import { useState, useCallback } from 'react';
import {
  createShareUrl,
  parseShareUrl,
  canCreateShareUrl,
  compressImageForSharing,
  generateQRCode,
  URL_IMAGE_SHARING_DISABLED_REASON,
  type ShareableSession,
} from '../utils';

export type SharingStatus = 'idle' | 'generating' | 'ready' | 'error';

interface UseSharingReturn {
  status: SharingStatus;
  shareUrl: string | null;
  qrCodeUrl: string | null;
  error: string | null;
  canShare: boolean;
  generateShareLink: (
    imageData: ImageData,
    depthIntensity: number,
    annotations?: string,
    notes?: string
  ) => Promise<void>;
  copyToClipboard: () => Promise<boolean>;
  reset: () => void;
}

export function useSharing(): UseSharingReturn {
  const [status, setStatus] = useState<SharingStatus>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(true);

  const generateShareLink = useCallback(async (
    imageData: ImageData,
    depthIntensity: number,
    annotations?: string,
    notes?: string
  ) => {
    setStatus('generating');
    setError(null);

    try {
      if (!canCreateShareUrl('')) {
        setCanShare(false);
        throw new Error(URL_IMAGE_SHARING_DISABLED_REASON);
      }

      // Compress image for sharing
      const compressedImage = compressImageForSharing(imageData, 200);

      // Check if URL would be valid
      if (!canCreateShareUrl(compressedImage)) {
        setCanShare(false);
        throw new Error('Image too large for URL sharing. Try a smaller image.');
      }

      // Create share URL
      const url = createShareUrl({
        imageDataUrl: compressedImage,
        depthIntensity,
        annotations,
        notes,
      });

      setShareUrl(url);

      // Generate QR code
      const qr = await generateQRCode(url, { size: 200 });
      setQrCodeUrl(qr);

      setStatus('ready');
      console.log('[Share] Link generated:', url.length, 'chars');
    } catch (err) {
      console.error('[Share] Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
      setStatus('error');
    }
  }, []);

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!shareUrl) return false;

    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (err) {
      console.error('[Share] Copy failed:', err);
      return false;
    }
  }, [shareUrl]);

  const reset = useCallback(() => {
    setStatus('idle');
    setShareUrl(null);
    setQrCodeUrl(null);
    setError(null);
    setCanShare(true);
  }, []);

  return {
    status,
    shareUrl,
    qrCodeUrl,
    error,
    canShare,
    generateShareLink,
    copyToClipboard,
    reset,
  };
}

// Hook to restore session from URL
export function useSessionRestore(): {
  session: ShareableSession | null;
  isSharedSession: boolean;
} {
  const [session] = useState<ShareableSession | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return parseShareUrl(window.location.href);
  });

  return {
    session,
    isSharedSession: session !== null,
  };
}
