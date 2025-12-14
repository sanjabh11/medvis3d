'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useMultiframeDicom, type DicomFrame } from '../hooks/useMultiframeDicom';

interface MultiframeDicomViewerProps {
  onFrameSelect?: (frame: DicomFrame) => void;
  className?: string;
}

export function MultiframeDicomViewer({ onFrameSelect, className }: MultiframeDicomViewerProps) {
  const {
    status,
    result,
    error,
    currentFrameIndex,
    parseMultiframeDicom,
    setCurrentFrameIndex,
    getCurrentFrame,
    nextFrame,
    prevFrame,
    reset,
  } = useMultiframeDicom();

  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Render current frame to canvas
  useEffect(() => {
    const frame = getCurrentFrame();
    if (!frame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    ctx.putImageData(frame.imageData, 0, 0);
  }, [getCurrentFrame, currentFrameIndex]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !result) return;

    const frameInterval = result.frameRate ? 1000 / result.frameRate : 100;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        lastFrameTimeRef.current = timestamp;
        
        if (currentFrameIndex >= result.numberOfFrames - 1) {
          setCurrentFrameIndex(0);
        } else {
          nextFrame();
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, result, currentFrameIndex, nextFrame, setCurrentFrameIndex]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsPlaying(false);
      await parseMultiframeDicom(file);
    }
  }, [parseMultiframeDicom]);

  const handleUseFrame = useCallback(() => {
    const frame = getCurrentFrame();
    if (frame && onFrameSelect) {
      setIsPlaying(false);
      onFrameSelect(frame);
    }
  }, [getCurrentFrame, onFrameSelect]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  if (status === 'idle') {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-lg font-medium text-[--color-medical-text-primary] mb-2">
          Multi-frame DICOM Viewer
        </p>
        <p className="text-sm text-[--color-medical-text-secondary] mb-4">
          Load cine or 4D DICOM files to view and select frames
        </p>
        <Button
          variant="outline"
          onClick={() => document.getElementById('multiframe-input')?.click()}
        >
          Select DICOM File
        </Button>
        <input
          id="multiframe-input"
          type="file"
          accept=".dcm,.dicom"
          className="hidden"
          onChange={handleFileSelect}
        />
      </Card>
    );
  }

  if (status === 'parsing') {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-[--color-medical-text-primary]">Parsing multi-frame DICOM...</p>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className={`p-8 text-center border-red-300 bg-red-50 ${className}`}>
        <p className="text-red-800 font-medium mb-2">Error</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={reset}>Try Again</Button>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-black flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[300px] object-contain"
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Frame slider */}
        <div className="space-y-2">
          <Slider
            value={[currentFrameIndex]}
            onValueChange={([value]) => {
              setIsPlaying(false);
              setCurrentFrameIndex(value);
            }}
            max={result.numberOfFrames - 1}
            step={1}
          />
          <div className="flex justify-between text-xs text-[--color-medical-text-secondary]">
            <span>Frame {currentFrameIndex + 1} / {result.numberOfFrames}</span>
            {result.frameRate && <span>{result.frameRate.toFixed(1)} fps</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevFrame} disabled={currentFrameIndex === 0}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={nextFrame} disabled={currentFrameIndex >= result.numberOfFrames - 1}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleUseFrame} className="bg-[--color-medical-primary]">
            <Camera className="h-4 w-4 mr-2" />
            Use This Frame
          </Button>
        </div>
      </div>
    </Card>
  );
}
