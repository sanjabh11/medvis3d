'use client';

import { useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useVideoProcessor } from '../hooks/useVideoProcessor';

interface VideoPlayerProps {
  onFrameExtracted?: (imageData: ImageData) => void;
  className?: string;
}

export function VideoPlayer({ onFrameExtracted, className }: VideoPlayerProps) {
  const {
    status,
    error,
    videoUrl,
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
    reset,
  } = useVideoProcessor();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadVideo(file);
    }
  }, [loadVideo]);

  const handleExtractFrame = useCallback(() => {
    const imageData = extractCurrentFrame();
    if (imageData && onFrameExtracted) {
      onFrameExtracted(imageData);
    }
  }, [extractCurrentFrame, onFrameExtracted]);

  const handleSeek = useCallback((value: number[]) => {
    seekToFrame(value[0]);
  }, [seekToFrame]);

  const handleSkipBack = useCallback(() => {
    seekToFrame(Math.max(0, currentFrameIndex - fps));
  }, [currentFrameIndex, fps, seekToFrame]);

  const handleSkipForward = useCallback(() => {
    seekToFrame(Math.min(totalFrames - 1, currentFrameIndex + fps));
  }, [currentFrameIndex, totalFrames, fps, seekToFrame]);

  // Update frame index on time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const frameIndex = Math.floor(video.currentTime * fps);
      // Update is handled internally
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [fps, videoRef]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Idle state - show upload
  if (status === 'idle') {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="mb-4">
          <Play className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <p className="text-lg font-medium text-[--color-medical-text-primary] mb-2">
          Load Video for Frame Extraction
        </p>
        <p className="text-sm text-[--color-medical-text-secondary] mb-4">
          Extract frames from medical videos for 3D visualization
        </p>
        <Button
          variant="outline"
          onClick={() => document.getElementById('video-input')?.click()}
        >
          Select Video
        </Button>
        <input
          id="video-input"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </Card>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <Loader2 className="h-12 w-12 text-[--color-medical-primary] mx-auto mb-4 animate-spin" />
        <p className="text-[--color-medical-text-primary]">Loading video...</p>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className={`p-8 text-center border-red-300 bg-red-50 ${className}`}>
        <p className="text-red-800 font-medium mb-2">Error loading video</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
      </Card>
    );
  }

  // Player UI
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-[300px] object-contain"
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentFrameIndex]}
            onValueChange={handleSeek}
            max={totalFrames - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[--color-medical-text-secondary]">
            <span>{formatTime(currentFrameIndex / fps)}</span>
            <span>Frame {currentFrameIndex + 1} / {totalFrames}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>

            {status === 'playing' ? (
              <Button variant="outline" size="icon" onClick={pause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={play}>
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={handleSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleExtractFrame}
            className="bg-[--color-medical-primary] hover:bg-[--color-medical-primary-hover]"
          >
            <Camera className="h-4 w-4 mr-2" />
            Use This Frame
          </Button>
        </div>
      </div>
    </Card>
  );
}
