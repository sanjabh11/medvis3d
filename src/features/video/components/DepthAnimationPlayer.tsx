'use client';

import { useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useDepthAnimation, type DepthFrame } from '../hooks/useDepthAnimation';

interface DepthAnimationPlayerProps {
  onFrameChange?: (frame: DepthFrame) => void;
  className?: string;
}

export function DepthAnimationPlayer({ onFrameChange, className }: DepthAnimationPlayerProps) {
  const {
    status,
    frames,
    currentFrameIndex,
    totalFrames,
    fps,
    isPlaying,
    play,
    pause,
    stop,
    seekToFrame,
    setFps,
    getCurrentFrame,
  } = useDepthAnimation();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render current frame
  useEffect(() => {
    const frame = getCurrentFrame();
    if (!frame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    ctx.putImageData(frame.imageData, 0, 0);

    onFrameChange?.(frame);
  }, [currentFrameIndex, getCurrentFrame, onFrameChange]);

  if (totalFrames === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-[--color-medical-text-secondary]">
          No depth animation frames loaded.
          <br />
          Process multiple frames to create an animation.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gray-900 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[300px] object-contain"
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <div className="space-y-2">
          <Slider
            value={[currentFrameIndex]}
            onValueChange={([value]) => {
              if (isPlaying) pause();
              seekToFrame(value);
            }}
            max={totalFrames - 1}
            step={1}
          />
          <div className="flex justify-between text-xs text-[--color-medical-text-secondary]">
            <span>Frame {currentFrameIndex + 1} / {totalFrames}</span>
            <span>{fps} fps</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => seekToFrame(Math.max(0, currentFrameIndex - 1))}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {isPlaying ? (
              <Button variant="outline" size="icon" onClick={pause}>
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={play}>
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={stop}>
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => seekToFrame(Math.min(totalFrames - 1, currentFrameIndex + 1))}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* FPS selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[--color-medical-text-secondary]">Speed:</span>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value={5}>5 fps</option>
              <option value={10}>10 fps</option>
              <option value={15}>15 fps</option>
              <option value={24}>24 fps</option>
              <option value={30}>30 fps</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}
