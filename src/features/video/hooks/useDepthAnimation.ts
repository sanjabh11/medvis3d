'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface DepthFrame {
  imageData: ImageData;
  depthMap: Float32Array;
  frameIndex: number;
}

export type AnimationStatus = 'idle' | 'processing' | 'ready' | 'playing' | 'paused' | 'error';

interface UseDepthAnimationReturn {
  status: AnimationStatus;
  error: string | null;
  frames: DepthFrame[];
  currentFrameIndex: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  progress: number;
  addFrame: (imageData: ImageData, depthMap: Float32Array) => void;
  clearFrames: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekToFrame: (index: number) => void;
  setFps: (fps: number) => void;
  getCurrentFrame: () => DepthFrame | null;
}

const DEFAULT_FPS = 10;

export function useDepthAnimation(): UseDepthAnimationReturn {
  const [status, setStatus] = useState<AnimationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<DepthFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [isPlaying, setIsPlaying] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const addFrame = useCallback((imageData: ImageData, depthMap: Float32Array) => {
    setFrames(prev => {
      const newFrame: DepthFrame = {
        imageData,
        depthMap,
        frameIndex: prev.length,
      };
      return [...prev, newFrame];
    });
    setStatus('ready');
  }, []);

  const clearFrames = useCallback(() => {
    setFrames([]);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
    setStatus('idle');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (frames.length === 0) return;
    setIsPlaying(true);
    setStatus('playing');
  }, [frames.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    setStatus('paused');
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setStatus('ready');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const seekToFrame = useCallback((index: number) => {
    if (index >= 0 && index < frames.length) {
      setCurrentFrameIndex(index);
    }
  }, [frames.length]);

  const getCurrentFrame = useCallback((): DepthFrame | null => {
    if (frames.length === 0 || currentFrameIndex >= frames.length) return null;
    return frames[currentFrameIndex];
  }, [frames, currentFrameIndex]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const frameInterval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        lastFrameTimeRef.current = timestamp;

        setCurrentFrameIndex(prev => {
          if (prev >= frames.length - 1) {
            return 0; // Loop
          }
          return prev + 1;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frames.length, fps]);

  const progress = frames.length > 0 ? (currentFrameIndex / (frames.length - 1)) * 100 : 0;

  return {
    status,
    error,
    frames,
    currentFrameIndex,
    totalFrames: frames.length,
    fps,
    isPlaying,
    progress,
    addFrame,
    clearFrames,
    play,
    pause,
    stop,
    seekToFrame,
    setFps,
    getCurrentFrame,
  };
}
