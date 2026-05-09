'use client';

import { useState, useRef, useCallback, lazy, Suspense, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useAppStore } from '@/stores';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { VisualizationFactsPanel } from '@/features/builder';
import { ExportDialog } from '@/features/export';

// Lazy load the 3D viewer to reduce initial bundle size
const Viewer3D = lazy(() => 
  import('@/features/viewer/components/Viewer3D').then(mod => ({ default: mod.Viewer3D }))
);

function createDepthMapDataUrl(depthMap: Float32Array | null): string | null {
  if (!depthMap || depthMap.length === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.createImageData(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  for (let i = 0; i < depthMap.length; i++) {
    const value = Math.max(0, Math.min(255, Math.round(depthMap[i] * 255)));
    const index = i * 4;
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
    imageData.data[index + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function ViewerSection() {
  const {
    file,
    previewUrl,
    enhancedPreviewUrl,
    depthMap,
    depthIntensity,
    meshMaterialPreset,
    viewPreset,
    visualizationFacts,
    consultContext,
    consultNotes,
    patientQuestion,
    consultAnnotations,
    setDepthIntensity,
    setMeshMaterialPreset,
    setViewPreset,
  } = useAppStore();
  const [wireframe, setWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [graphicsRecoveryMessage, setGraphicsRecoveryMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setResetToken((token) => token + 1);
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

  const getViewer3DCanvas = useCallback(() => {
    return containerRef.current?.querySelector('canvas') || null;
  }, []);

  const handleIncreaseDepth = useCallback(() => {
    setDepthIntensity(Math.min(1, depthIntensity + 0.05));
  }, [depthIntensity, setDepthIntensity]);

  const handleDecreaseDepth = useCallback(() => {
    setDepthIntensity(Math.max(0, depthIntensity - 0.05));
  }, [depthIntensity, setDepthIntensity]);

  // Keyboard shortcuts
  const hasDepthMap = depthMap !== null && depthMap.length > 0;
  const viewerImageUrl = enhancedPreviewUrl || previewUrl;
  const depthMapUrl = useMemo(() => createDepthMapDataUrl(depthMap), [depthMap]);
  
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
            {hasDepthMap && viewerImageUrl ? (
              <>
                <Suspense fallback={<ViewerLoading message="Initializing 3D viewer..." />}>
                  <Viewer3D
                    imageUrl={viewerImageUrl}
                    depthMap={depthMap}
                    depthSize={MODEL_INPUT_SIZE}
                    displacementScale={depthIntensity}
                    wireframe={wireframe}
                    materialPreset={meshMaterialPreset}
                    viewPreset={viewPreset}
                    resetToken={resetToken}
                    onContextLost={() => {
                      setGraphicsRecoveryMessage('Graphics context lost. The viewer will recover if the browser restores it.');
                    }}
                    onContextRestored={() => {
                      setGraphicsRecoveryMessage(null);
                    }}
                  />
                </Suspense>
                {graphicsRecoveryMessage && (
                  <div className="absolute inset-x-4 top-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                    {graphicsRecoveryMessage}
                  </div>
                )}
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
          materialPreset={meshMaterialPreset}
          onMaterialPresetChange={setMeshMaterialPreset}
          viewPreset={viewPreset}
          onViewPresetChange={setViewPreset}
          disabled={!hasDepthMap}
        />
      </Card>

      <div className="flex flex-col gap-3 rounded-lg border border-[--color-medical-border] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[--color-medical-text-primary]">
            Consult artifact
          </p>
          <p className="text-xs text-[--color-medical-text-secondary]">
            Download a local educational snapshot with facts, notes, annotations, and no raw metadata.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExportOpen(true)}
          disabled={!hasDepthMap}
          className="border-[--color-medical-primary] text-[--color-medical-primary] hover:bg-blue-50"
        >
          <FileText className="h-4 w-4" />
          Consult Snapshot
        </Button>
      </div>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        originalImageUrl={previewUrl}
        enhancedImageUrl={enhancedPreviewUrl}
        depthMapUrl={depthMapUrl}
        getViewer3DCanvas={getViewer3DCanvas}
        consultContext={consultContext}
        visualizationFacts={visualizationFacts}
        notes={consultNotes}
        patientQuestion={patientQuestion}
        annotations={consultAnnotations}
      />
      <VisualizationFactsPanel facts={visualizationFacts} />
    </section>
  );
}
