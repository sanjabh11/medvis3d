'use client';

import { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react';
import { useAppStore } from '@/stores';
import { Card } from '@/components/ui/card';
import { DisclaimerBanner } from '@/components/common';
import {
  ViewerControls,
  ViewerErrorBoundary,
  ViewerLoading,
  ViewerPlaceholder,
  KeyboardShortcutsHelp,
  useKeyboardShortcuts,
  generateTimestampFilename,
} from '@/features/viewer';
import { MODEL_INPUT_SIZE } from '@/lib/onnx';

// Lazy load the 3D viewer to reduce initial bundle size
const Viewer3D = lazy(() => 
  import('@/features/viewer/components/Viewer3D').then(mod => ({ default: mod.Viewer3D }))
);

export function ViewerSection() {
  const { file, previewUrl, depthMap, depthIntensity, setDepthIntensity } = useAppStore();
  const [wireframe, setWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('[Viewer] Fullscreen error:', err);
    }
  }, []);

  const handleResetView = useCallback(() => {
    // Reset is handled by the Viewer3D component internally
    // We could expose a ref to control it, but for now just log
    console.log('[Viewer] Reset view requested');
  }, []);

  const handleWireframeToggle = useCallback(() => {
    setWireframe(prev => !prev);
  }, []);

  const handleScreenshot = useCallback(() => {
    // Find the canvas element inside the container
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) {
      console.error('[Viewer] Canvas not found for screenshot');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = generateTimestampFilename('medvis3d');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('[Viewer] Screenshot saved');
    } catch (err) {
      console.error('[Viewer] Screenshot failed:', err);
    }
  }, []);

  const handleIncreaseDepth = useCallback(() => {
    setDepthIntensity(Math.min(1, depthIntensity + 0.05));
  }, [depthIntensity, setDepthIntensity]);

  const handleDecreaseDepth = useCallback(() => {
    setDepthIntensity(Math.max(0, depthIntensity - 0.05));
  }, [depthIntensity, setDepthIntensity]);

  // Keyboard shortcuts
  const hasDepthMap = depthMap !== null && depthMap.length > 0;
  
  useKeyboardShortcuts({
    onResetView: handleResetView,
    onToggleWireframe: handleWireframeToggle,
    onToggleFullscreen: handleFullscreenToggle,
    onCaptureScreenshot: handleScreenshot,
    onIncreaseDepth: handleIncreaseDepth,
    onDecreaseDepth: handleDecreaseDepth,
    enabled: hasDepthMap,
  });

  // Don't render if no file uploaded
  if (!file) {
    return null;
  }

  return (
    <section className="space-y-4">
      <DisclaimerBanner />
      
      <Card className="overflow-hidden relative" ref={containerRef}>
        <div className="bg-gray-900 h-[400px] md:h-[500px] relative">
          <ViewerErrorBoundary>
            {hasDepthMap && previewUrl ? (
              <>
                <Suspense fallback={<ViewerLoading message="Initializing 3D viewer..." />}>
                  <Viewer3D
                    imageUrl={previewUrl}
                    depthMap={depthMap}
                    depthSize={MODEL_INPUT_SIZE}
                    displacementScale={depthIntensity}
                    wireframe={wireframe}
                  />
                </Suspense>
                <KeyboardShortcutsHelp />
              </>
            ) : (
              <ViewerPlaceholder hasImage={!!file} hasDepthMap={hasDepthMap} />
            )}
          </ViewerErrorBoundary>
        </div>
        
        <ViewerControls
          depthIntensity={depthIntensity}
          onDepthIntensityChange={setDepthIntensity}
          wireframe={wireframe}
          onWireframeToggle={handleWireframeToggle}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          onResetView={handleResetView}
          onScreenshot={handleScreenshot}
          disabled={!hasDepthMap}
        />
      </Card>
    </section>
  );
}
