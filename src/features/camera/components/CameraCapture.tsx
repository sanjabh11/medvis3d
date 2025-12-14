'use client';

import { useCallback } from 'react';
import { Camera, SwitchCamera, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCamera } from '../hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (imageData: ImageData, previewUrl: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const {
    status,
    error,
    videoRef,
    canvasRef,
    capturedImage,
    capturedImageData,
    startCamera,
    stopCamera,
    capturePhoto,
    retake,
    switchCamera,
    isFrontCamera,
  } = useCamera();

  const handleCapture = useCallback(() => {
    const imageData = capturePhoto();
    // Don't call onCapture yet - wait for user confirmation
  }, [capturePhoto]);

  const handleConfirm = useCallback(() => {
    if (capturedImageData && capturedImage) {
      onCapture(capturedImageData, capturedImage);
    }
  }, [capturedImageData, capturedImage, onCapture]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  // Initial state - show start camera button
  if (status === 'idle') {
    return (
      <Card className="p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-[--color-medical-text-primary] mb-2">
          Camera Capture
        </p>
        <p className="text-sm text-[--color-medical-text-secondary] mb-6">
          Take a photo of an X-ray or medical image on a light box
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={startCamera} className="bg-[--color-medical-primary]">
            <Camera className="h-4 w-4 mr-2" />
            Open Camera
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  // Requesting permission
  if (status === 'requesting') {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-12 w-12 text-[--color-medical-primary] mx-auto mb-4 animate-spin" />
        <p className="text-lg font-medium text-[--color-medical-text-primary]">
          Requesting Camera Access...
        </p>
        <p className="text-sm text-[--color-medical-text-secondary] mt-2">
          Please allow camera access when prompted
        </p>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className="p-8 text-center border-red-300 bg-red-50">
        <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-red-800 mb-2">
          Camera Error
        </p>
        <p className="text-sm text-red-600 mb-6">
          {error || 'Failed to access camera'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={startCamera} variant="outline" className="border-red-300">
            Try Again
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  // Captured state - show preview
  if (status === 'captured' && capturedImage) {
    return (
      <Card className="overflow-hidden">
        <div className="relative bg-black">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-[400px] object-contain"
          />
        </div>
        <div className="p-4 flex justify-between items-center bg-white border-t">
          <Button variant="outline" onClick={retake}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake
          </Button>
          <Button onClick={handleConfirm} className="bg-[--color-medical-success]">
            <Check className="h-4 w-4 mr-2" />
            Use This Photo
          </Button>
        </div>
      </Card>
    );
  }

  // Active camera view
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[400px] object-cover"
          style={{ transform: isFrontCamera ? 'scaleX(-1)' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={switchCamera}
            className="bg-white/90 hover:bg-white"
            title="Switch Camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleCapture}
            className="h-16 w-16 rounded-full bg-white hover:bg-gray-100 border-4 border-[--color-medical-primary]"
            title="Capture"
          >
            <div className="h-12 w-12 rounded-full bg-[--color-medical-primary]" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="bg-white/90 hover:bg-white"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Framing guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] border-2 border-white/50 rounded-lg" />
        </div>
      </div>
      
      <div className="p-3 bg-gray-900 text-center">
        <p className="text-sm text-gray-400">
          Position the X-ray within the frame and tap to capture
        </p>
      </div>
    </Card>
  );
}
