'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Annotation } from '../hooks/useAnnotation';

interface AnnotationCanvasProps {
  annotations: Annotation[];
  isDrawing: boolean;
  width: number;
  height: number;
  className?: string;
  onMouseDown?: (x: number, y: number) => void;
  onMouseMove?: (x: number, y: number) => void;
  onMouseUp?: () => void;
}

export function AnnotationCanvas({
  annotations,
  isDrawing,
  width,
  height,
  className,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawAnnotation = useCallback((ctx: CanvasRenderingContext2D, ann: Annotation) => {
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = ann.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (ann.type) {
      case 'circle': {
        if (ann.points.length < 2) return;
        const [start, end] = ann.points;
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'arrow': {
        if (ann.points.length < 2) return;
        const [from, to] = ann.points;
        const headLength = 15;
        const angle = Math.atan2(to.y - from.y, to.x - from.x);

        // Draw line
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLength * Math.cos(angle - Math.PI / 6),
          to.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLength * Math.cos(angle + Math.PI / 6),
          to.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      }

      case 'freehand': {
        if (ann.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
        break;
      }

      case 'text': {
        if (!ann.text) return;
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = ann.color;
        
        // Draw background
        const metrics = ctx.measureText(ann.text);
        const padding = 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          ann.points[0].x - padding,
          ann.points[0].y - 14 - padding,
          metrics.width + padding * 2,
          18 + padding
        );
        
        // Draw text
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, ann.points[0].x, ann.points[0].y);
        break;
      }
    }
  }, []);

  // Redraw on annotations change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all annotations
    annotations.forEach(ann => drawAnnotation(ctx, ann));
  }, [annotations, width, height, drawAnnotation]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onMouseDown?.(x, y);
  }, [onMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onMouseMove?.(x, y);
  }, [onMouseMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    onMouseDown?.(x, y);
  }, [onMouseDown]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    onMouseMove?.(x, y);
  }, [onMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={onMouseUp}
    />
  );
}
