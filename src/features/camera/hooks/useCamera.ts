'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'captured';

interface UseCameraReturn {
  status: CameraStatus;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  capturedImage: string | null;
  capturedImageData: ImageData | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => ImageData | null;
  retake: () => void;
  switchCamera: () => Promise<void>;
  isFrontCamera: boolean;
}

export function useCamera(): UseCameraReturn {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageData, setCapturedImageData] = useState<ImageData | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setStatus('requesting');
    setError(null);

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('active');
      console.log('[Camera] Started successfully');
    } catch (err) {
      console.error('[Camera] Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
      setStatus('error');
    }
  }, [isFrontCamera]);

  const switchCamera = useCallback(async () => {
    setIsFrontCamera(prev => !prev);
    if (status === 'active') {
      stopCamera();
      // Wait a bit then restart
      setTimeout(() => startCamera(), 100);
    }
  }, [status, stopCamera, startCamera]);

  const capturePhoto = useCallback((): ImageData | null => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCapturedImageData(imageData);

    // Get data URL for preview
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Stop the camera after capture
    stopCamera();
    setStatus('captured');

    console.log('[Camera] Photo captured:', canvas.width, 'x', canvas.height);
    return imageData;
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setCapturedImageData(null);
    startCamera();
  }, [startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
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
  };
}
