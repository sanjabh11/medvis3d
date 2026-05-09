'use client';

import { useCallback, useState } from 'react';
import { Camera, FileText, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Annotation } from '@/features/annotation';
import type { ConsultContext, VisualizationFacts } from '@/features/builder';
import {
  downloadReport,
  generateConsultSnapshot,
  printReport,
  type ConsultSnapshotData,
} from '../utils/pdf-generator';
import { generateTimestampFilename } from '@/features/viewer/utils/screenshot';

interface ExportDialogProps {
  originalImageUrl?: string | null;
  enhancedImageUrl?: string | null;
  depthMapUrl?: string | null;
  getViewer3DCanvas?: () => HTMLCanvasElement | null;
  consultContext: ConsultContext;
  visualizationFacts: VisualizationFacts | null;
  notes: string;
  patientQuestion: string;
  annotations: Annotation[];
  onClose: () => void;
  isOpen: boolean;
}

const DISCLAIMER = `This educational visualization is generated from image processing and depth estimation. It may not reflect anatomical reality and must not be used for diagnosis, treatment decisions, surgical planning, or emergency care. Discuss medical questions with the responsible clinician.`;

export function ExportDialog({
  originalImageUrl,
  enhancedImageUrl,
  depthMapUrl,
  getViewer3DCanvas,
  consultContext,
  visualizationFacts,
  notes,
  patientQuestion,
  annotations,
  onClose,
  isOpen,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [includeSourceImage, setIncludeSourceImage] = useState(false);
  const [includeEnhancedImage, setIncludeEnhancedImage] = useState(false);
  const [includeDepthMap, setIncludeDepthMap] = useState(false);
  const [include3DView, setInclude3DView] = useState(true);

  const handleScreenshot = useCallback(() => {
    const viewer3DCanvas = getViewer3DCanvas?.();
    if (!viewer3DCanvas) return;

    try {
      const dataUrl = viewer3DCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = generateTimestampFilename('medvis3d-3d');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[Export] Screenshot failed:', err);
    }
  }, [getViewer3DCanvas]);

  const buildSnapshotData = useCallback((): ConsultSnapshotData => {
    const viewer3DCanvas = getViewer3DCanvas?.();
    const viewer3DUrl = include3DView ? viewer3DCanvas?.toDataURL('image/png') : undefined;

    return {
      title: 'MedVis3D Consult Snapshot',
      date: new Date().toLocaleString(),
      originalImageUrl: includeSourceImage ? originalImageUrl || undefined : undefined,
      enhancedImageUrl: includeEnhancedImage ? enhancedImageUrl || undefined : undefined,
      depthMapUrl: includeDepthMap ? depthMapUrl || undefined : undefined,
      viewer3DUrl,
      consultContext,
      visualizationFacts,
      notes,
      patientQuestion,
      annotations,
      disclaimer: DISCLAIMER,
    };
  }, [
    annotations,
    consultContext,
    depthMapUrl,
    enhancedImageUrl,
    include3DView,
    includeDepthMap,
    includeEnhancedImage,
    includeSourceImage,
    notes,
    originalImageUrl,
    patientQuestion,
    getViewer3DCanvas,
    visualizationFacts,
  ]);

  const handleDownloadSnapshot = useCallback(async () => {
    setIsExporting(true);

    try {
      const blob = await generateConsultSnapshot(buildSnapshotData());
      downloadReport(
        blob,
        generateTimestampFilename('medvis3d-consult-snapshot').replace('.png', '.html')
      );
    } catch (err) {
      console.error('[Export] Consult snapshot generation failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [buildSnapshotData]);

  const handlePrint = useCallback(async () => {
    setIsExporting(true);

    try {
      const blob = await generateConsultSnapshot(buildSnapshotData());
      printReport(blob);
    } catch (err) {
      console.error('[Export] Print failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [buildSnapshotData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              Consult Snapshot
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Local HTML artifact with provenance, notes, annotations, and disclaimers.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
          The source image excluded by default setting reduces accidental PHI exposure. Only
          enable image sections when the local snapshot is intended for a controlled consult.
        </div>

        <div className="space-y-2 rounded-md border border-[--color-medical-border] p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={include3DView}
              onChange={(event) => setInclude3DView(event.target.checked)}
            />
            Include current 3D view
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeEnhancedImage}
              onChange={(event) => setIncludeEnhancedImage(event.target.checked)}
            />
            Include enhanced image
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeDepthMap}
              onChange={(event) => setIncludeDepthMap(event.target.checked)}
            />
            Include depth map
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeSourceImage}
              onChange={(event) => setIncludeSourceImage(event.target.checked)}
            />
            Include original source image
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {getViewer3DCanvas && (
            <Button
              variant="outline"
              className="h-auto w-full justify-start py-3"
              onClick={handleScreenshot}
            >
              <Camera className="mr-3 h-5 w-5 text-[--color-medical-primary]" />
              <div className="text-left">
                <div className="font-medium">3D Screenshot</div>
                <div className="text-sm text-gray-500">Save current 3D view as PNG</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="h-auto w-full justify-start py-3"
            onClick={handleDownloadSnapshot}
            disabled={isExporting}
          >
            <FileText className="mr-3 h-5 w-5 text-[--color-medical-primary]" />
            <div className="text-left">
              <div className="font-medium">Download Consult Snapshot</div>
              <div className="text-sm text-gray-500">Save sanitized local HTML</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto w-full justify-start py-3"
            onClick={handlePrint}
            disabled={isExporting}
          >
            <Printer className="mr-3 h-5 w-5 text-[--color-medical-primary]" />
            <div className="text-left">
              <div className="font-medium">Print Snapshot</div>
              <div className="text-sm text-gray-500">Open print dialog</div>
            </div>
          </Button>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-center text-xs text-gray-500">
            All snapshots include educational-only and non-diagnostic limitations.
          </p>
        </div>
      </Card>
    </div>
  );
}
