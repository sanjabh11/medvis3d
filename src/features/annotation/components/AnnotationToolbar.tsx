'use client';

import { Circle, ArrowRight, Type, Pencil, Undo2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AnnotationType } from '../hooks/useAnnotation';

interface AnnotationToolbarProps {
  activeType: AnnotationType | null;
  onTypeChange: (type: AnnotationType | null) => void;
  onUndo: () => void;
  onClear: () => void;
  hasAnnotations: boolean;
  disabled?: boolean;
}

const TOOLS: { type: AnnotationType; icon: React.ReactNode; label: string }[] = [
  { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
  { type: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text' },
  { type: 'freehand', icon: <Pencil className="h-4 w-4" />, label: 'Freehand' },
];

export function AnnotationToolbar({
  activeType,
  onTypeChange,
  onUndo,
  onClear,
  hasAnnotations,
  disabled = false,
}: AnnotationToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 bg-white rounded-lg shadow-md border border-gray-200">
        {TOOLS.map(({ type, icon, label }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTypeChange(activeType === type ? null : type)}
                disabled={disabled}
                className={activeType === type ? 'bg-blue-100 text-[--color-medical-primary]' : ''}
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={disabled || !hasAnnotations}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={disabled || !hasAnnotations}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear All</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
