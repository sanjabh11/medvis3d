'use client';

import { RotateCcw, Maximize2, Minimize2, Grid3X3, Camera, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViewerControlsProps {
  depthIntensity: number;
  onDepthIntensityChange: (value: number) => void;
  wireframe: boolean;
  onWireframeToggle: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onResetView: () => void;
  onScreenshot?: () => void;
  disabled?: boolean;
}

export function ViewerControls({
  depthIntensity,
  onDepthIntensityChange,
  wireframe,
  onWireframeToggle,
  isFullscreen,
  onFullscreenToggle,
  onResetView,
  onScreenshot,
  disabled = false,
}: ViewerControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 bg-white border-t border-gray-200">
        {/* Depth Intensity Slider */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[--color-medical-text-primary]">
              Depth Intensity
            </label>
            <span className="text-sm text-[--color-medical-text-secondary]">
              {Math.round(depthIntensity * 100)}%
            </span>
          </div>
          <Slider
            value={[depthIntensity]}
            onValueChange={([value]) => onDepthIntensityChange(value)}
            min={0}
            max={1}
            step={0.01}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onWireframeToggle}
                disabled={disabled}
                className={wireframe ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{wireframe ? 'Show Textured (W)' : 'Show Wireframe (W)'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onResetView}
                disabled={disabled}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View (R)</p>
            </TooltipContent>
          </Tooltip>

          {onScreenshot && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onScreenshot}
                  disabled={disabled}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Screenshot (⌘S)</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onFullscreenToggle}
                disabled={disabled}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
