'use client';

import { RotateCcw, Maximize2, Minimize2, Grid3X3, Camera, Palette, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { MeshMaterialPreset, ViewPreset } from '@/features/builder';
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
  materialPreset: MeshMaterialPreset;
  onMaterialPresetChange: (preset: MeshMaterialPreset) => void;
  viewPreset: ViewPreset;
  onViewPresetChange: (preset: ViewPreset) => void;
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
  materialPreset,
  onMaterialPresetChange,
  viewPreset,
  onViewPresetChange,
  disabled = false,
}: ViewerControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-white p-4 md:flex-row md:items-center md:gap-6 border-t border-gray-200">
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

        <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
          <label className="flex items-center gap-2 text-sm text-[--color-medical-text-secondary]">
            <Palette className="h-4 w-4" />
            <select
              value={materialPreset}
              onChange={(event) => onMaterialPresetChange(event.target.value as MeshMaterialPreset)}
              disabled={disabled}
              className="min-w-32 rounded-md border border-[--color-medical-border] bg-white px-2 py-1 text-sm text-[--color-medical-text-primary]"
            >
              <option value="clinical-relief">Clinical</option>
              <option value="bone-contrast">Bone</option>
              <option value="depth-heatmap">Depth</option>
              <option value="soft-tissue">Soft tissue</option>
              <option value="original-texture">Original</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-[--color-medical-text-secondary]">
            <Eye className="h-4 w-4" />
            <select
              value={viewPreset}
              onChange={(event) => onViewPresetChange(event.target.value as ViewPreset)}
              disabled={disabled}
              className="min-w-28 rounded-md border border-[--color-medical-border] bg-white px-2 py-1 text-sm text-[--color-medical-text-primary]"
            >
              <option value="front">Front</option>
              <option value="oblique">Oblique</option>
              <option value="side">Side</option>
              <option value="topographic">Topo</option>
            </select>
          </label>
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
