'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, Copy, Check, QrCode, X, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSharing } from '../hooks/useSharing';
import { downloadQRCode } from '../utils';

interface ShareDialogProps {
  imageData: ImageData | null;
  depthIntensity: number;
  annotations?: string;
  notes?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({
  imageData,
  depthIntensity,
  annotations,
  notes,
  isOpen,
  onClose,
}: ShareDialogProps) {
  const {
    status,
    shareUrl,
    qrCodeUrl,
    error,
    canShare,
    generateShareLink,
    copyToClipboard,
    reset,
  } = useSharing();

  const [copied, setCopied] = useState(false);

  // Generate link when dialog opens
  useEffect(() => {
    if (isOpen && imageData && status === 'idle') {
      generateShareLink(imageData, depthIntensity, annotations, notes);
    }
  }, [isOpen, imageData, depthIntensity, annotations, notes, status, generateShareLink]);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCopied(false);
    }
  }, [isOpen, reset]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copyToClipboard]);

  const handleDownloadQR = useCallback(() => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, 'medvis3d-share-qr.png');
    }
  }, [qrCodeUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[--color-medical-text-primary] flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Visualization
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {status === 'generating' && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[--color-medical-primary] mx-auto mb-4" />
            <p className="text-[--color-medical-text-secondary]">
              Generating share link...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="p-3 bg-red-50 rounded-full w-fit mx-auto mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-800 font-medium mb-2">Unable to Share</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {status === 'ready' && shareUrl && (
          <div className="space-y-6">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="text-center">
                <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="Share QR Code"
                    className="w-40 h-40 mx-auto"
                  />
                </div>
                <p className="text-sm text-[--color-medical-text-secondary] mt-2">
                  Scan to view on another device
                </p>
              </div>
            )}

            {/* Share URL */}
            <div>
              <label className="text-sm font-medium text-[--color-medical-text-primary] mb-2 block">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 truncate"
                />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className={copied ? 'bg-green-50 border-green-300' : ''}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {qrCodeUrl && (
                <Button variant="outline" className="flex-1" onClick={handleDownloadQR}>
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[--color-medical-text-secondary] text-center">
              Links expire after 24 hours. Do not share PHI.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
