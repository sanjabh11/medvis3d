'use client';

import { useState, useCallback, useRef } from 'react';

export type AnnotationType = 'circle' | 'arrow' | 'text' | 'freehand';

export interface Annotation {
  id: string;
  type: AnnotationType;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  text?: string;
  timestamp: number;
}

interface UseAnnotationReturn {
  annotations: Annotation[];
  activeType: AnnotationType | null;
  isDrawing: boolean;
  setActiveType: (type: AnnotationType | null) => void;
  startDrawing: (x: number, y: number) => void;
  continueDrawing: (x: number, y: number) => void;
  finishDrawing: () => void;
  addTextAnnotation: (x: number, y: number, text: string) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  undoLast: () => void;
  exportAnnotations: () => string;
  importAnnotations: (json: string) => void;
}

const DEFAULT_COLOR = '#2563EB';
const DEFAULT_STROKE_WIDTH = 2;

function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useAnnotation(): UseAnnotationReturn {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeType, setActiveType] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentAnnotation = useRef<Annotation | null>(null);

  const startDrawing = useCallback((x: number, y: number) => {
    if (!activeType || activeType === 'text') return;

    setIsDrawing(true);
    currentAnnotation.current = {
      id: generateId(),
      type: activeType,
      points: [{ x, y }],
      color: DEFAULT_COLOR,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      timestamp: Date.now(),
    };
  }, [activeType]);

  const continueDrawing = useCallback((x: number, y: number) => {
    if (!isDrawing || !currentAnnotation.current) return;

    const ann = currentAnnotation.current;
    
    if (ann.type === 'freehand') {
      // Add point for freehand drawing
      ann.points.push({ x, y });
    } else {
      // For circle and arrow, update the second point
      if (ann.points.length === 1) {
        ann.points.push({ x, y });
      } else {
        ann.points[1] = { x, y };
      }
    }
  }, [isDrawing]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || !currentAnnotation.current) return;

    const ann = currentAnnotation.current;
    
    // Only add if we have at least 2 points
    if (ann.points.length >= 2) {
      setAnnotations(prev => [...prev, ann]);
    }
    
    currentAnnotation.current = null;
    setIsDrawing(false);
  }, [isDrawing]);

  const addTextAnnotation = useCallback((x: number, y: number, text: string) => {
    const annotation: Annotation = {
      id: generateId(),
      type: 'text',
      points: [{ x, y }],
      color: DEFAULT_COLOR,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      text,
      timestamp: Date.now(),
    };
    setAnnotations(prev => [...prev, annotation]);
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  const undoLast = useCallback(() => {
    setAnnotations(prev => prev.slice(0, -1));
  }, []);

  const exportAnnotations = useCallback((): string => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  const importAnnotations = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json) as Annotation[];
      setAnnotations(imported);
    } catch (e) {
      console.error('[Annotation] Failed to import:', e);
    }
  }, []);

  return {
    annotations,
    activeType,
    isDrawing,
    setActiveType,
    startDrawing,
    continueDrawing,
    finishDrawing,
    addTextAnnotation,
    removeAnnotation,
    clearAnnotations,
    undoLast,
    exportAnnotations,
    importAnnotations,
  };
}
