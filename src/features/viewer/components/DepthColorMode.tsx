'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ColorMode = 'texture' | 'grayscale' | 'heatmap' | 'rainbow';

interface DepthColorModeProps {
  mode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
  disabled?: boolean;
}

const COLOR_MODES: { value: ColorMode; label: string; description: string }[] = [
  { value: 'texture', label: 'Original Texture', description: 'Show original image' },
  { value: 'grayscale', label: 'Grayscale Depth', description: 'Depth as grayscale' },
  { value: 'heatmap', label: 'Heatmap', description: 'Warm-cool depth colors' },
  { value: 'rainbow', label: 'Rainbow', description: 'Full spectrum depth' },
];

export function DepthColorMode({ mode, onModeChange, disabled }: DepthColorModeProps) {
  const currentMode = COLOR_MODES.find(m => m.value === mode) || COLOR_MODES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          title={`Color mode: ${currentMode.label}`}
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {COLOR_MODES.map(({ value, label, description }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onModeChange(value)}
            className={mode === value ? 'bg-blue-50' : ''}
          >
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
