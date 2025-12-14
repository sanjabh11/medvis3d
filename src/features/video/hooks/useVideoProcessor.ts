'use client';

import { useState, useCallback, useRef } from 'react';

export type VideoStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'processing' | 'error';

export interface VideoFrame {
  imageData: ImageData;
  timestamp: number;
  frameIndex: number;
}

interface UseVideoProcessorReturn {
  status: VideoStatus;
  error: string | null;
  videoUrl: string | null;
  currentFrame: VideoFrame | null;
  totalFrames: number;
  currentFrameIndex: number;
  fps: number;
  duration: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loadVideo: (file: File) => Promise<void>;
  play: () => void;
  pause: () => void;
  seekToFrame: (frameIndex: number) => void;
  extractCurrentFrame: () => ImageData | null;
  extractAllFrames: (interval?: number) => Promise<VideoFrame[]>;
  reset: () => void;
}

const DEFAULT_FPS = 30;

export function useVideoProcessor(): UseVideoProcessorReturn {
  const [status, setStatus] = useState<VideoStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<VideoFrame | null>(null);
  const [totalFrames, setTotalFrames] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadVideo = useCallback(async (file: File) => {
    setStatus('loading');
    setError(null);

    try {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }

      // Create URL
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      // Wait for video to load metadata
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current;
        if (!video) {
          reject(new Error('Video element not available'));
          return;
        }

        video.onloadedmetadata = () => {
          setDuration(video.duration);
          setTotalFrames(Math.floor(video.duration * DEFAULT_FPS));
          setFps(DEFAULT_FPS);
          resolve();
        };

        video.onerror = () => {
          reject(new Error('Failed to load video'));
        };

        video.src = url;
      });

      setStatus('ready');
      console.log('[Video] Loaded successfully');
    } catch (err) {
      console.error('[Video] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
      setStatus('error');
    }
  }, []);

  const extractCurrentFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const frame: VideoFrame = {
      imageData,
      timestamp: video.currentTime,
      frameIndex: Math.floor(video.currentTime * fps),
    };

    setCurrentFrame(frame);
    setCurrentFrameIndex(frame.frameIndex);

    return imageData;
  }, [fps]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setStatus('playing');
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setStatus('paused');
    }
  }, []);

  const seekToFrame = useCallback((frameIndex: number) => {
    const video = videoRef.current;
    if (video && fps > 0) {
      const time = frameIndex / fps;
      video.currentTime = Math.min(time, video.duration);
      setCurrentFrameIndex(frameIndex);
    }
  }, [fps]);

  const extractAllFrames = useCallback(async (interval: number = 1): Promise<VideoFrame[]> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return [];

    setStatus('processing');
    const frames: VideoFrame[] = [];
    const ctx = canvas.getContext('2d');

    if (!ctx) return [];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const totalToExtract = Math.ceil(totalFrames / interval);

    for (let i = 0; i < totalToExtract; i++) {
      const frameIndex = i * interval;
      const time = frameIndex / fps;

      if (time > video.duration) break;

      // Seek to time
      video.currentTime = time;

      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      // Extract frame
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      frames.push({
        imageData,
        timestamp: time,
        frameIndex,
      });
    }

    setStatus('ready');
    console.log(`[Video] Extracted ${frames.length} frames`);

    return frames;
  }, [fps, totalFrames]);

  const reset = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setStatus('idle');
    setError(null);
    setVideoUrl(null);
    setCurrentFrame(null);
    setTotalFrames(0);
    setCurrentFrameIndex(0);
    setDuration(0);
  }, [videoUrl]);

  return {
    status,
    error,
    videoUrl,
    currentFrame,
    totalFrames,
    currentFrameIndex,
    fps,
    duration,
    videoRef,
    canvasRef,
    loadVideo,
    play,
    pause,
    seekToFrame,
    extractCurrentFrame,
    extractAllFrames,
    reset,
  };
}
