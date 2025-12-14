'use client';

import { useState, useCallback } from 'react';
import { Download, FileText, Printer, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  generatePdfReport,
  downloadReport,
  printReport,
  type PdfReportData,
} from '../utils/pdf-generator';
import { generateTimestampFilename } from '@/features/viewer/utils/screenshot';

interface ExportDialogProps {
  originalImageUrl: string;
  depthMapUrl?: string;
  viewer3DCanvas?: HTMLCanvasElement | null;
  onClose: () => void;
  isOpen: boolean;
}

const DISCLAIMER = `This AI-generated visualization is a simulation created for educational purposes only. 
It may not perfectly reflect anatomical reality and should NOT be used for medical diagnosis or treatment decisions. 
Always consult your healthcare provider for medical interpretation and advice.`;

export function ExportDialog({
  originalImageUrl,
  depthMapUrl,
  viewer3DCanvas,
  onClose,
  isOpen,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleScreenshot = useCallback(() => {
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
  }, [viewer3DCanvas]);

  const handleExportReport = useCallback(async () => {
    setIsExporting(true);

    try {
      const viewer3DUrl = viewer3DCanvas?.toDataURL('image/png');

      const reportData: PdfReportData = {
        title: 'Medical Image Analysis Report',
        date: new Date().toLocaleString(),
        originalImageUrl,
        depthMapUrl,
        viewer3DUrl,
        disclaimer: DISCLAIMER,
      };

      const blob = await generatePdfReport(reportData);
      downloadReport(blob, generateTimestampFilename('medvis3d-report').replace('.png', '.html'));
    } catch (err) {
      console.error('[Export] Report generation failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [originalImageUrl, depthMapUrl, viewer3DCanvas]);

  const handlePrint = useCallback(async () => {
    setIsExporting(true);

    try {
      const viewer3DUrl = viewer3DCanvas?.toDataURL('image/png');

      const reportData: PdfReportData = {
        title: 'Medical Image Analysis Report',
        date: new Date().toLocaleString(),
        originalImageUrl,
        depthMapUrl,
        viewer3DUrl,
        disclaimer: DISCLAIMER,
      };

      const blob = await generatePdfReport(reportData);
      printReport(blob);
    } catch (err) {
      console.error('[Export] Print failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [originalImageUrl, depthMapUrl, viewer3DCanvas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
            Export Options
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {viewer3DCanvas && (
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={handleScreenshot}
            >
              <Camera className="h-5 w-5 mr-3 text-[--color-medical-primary]" />
              <div className="text-left">
                <div className="font-medium">3D Screenshot</div>
                <div className="text-sm text-gray-500">Save current 3D view as PNG</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            <FileText className="h-5 w-5 mr-3 text-[--color-medical-primary]" />
            <div className="text-left">
              <div className="font-medium">Export Report</div>
              <div className="text-sm text-gray-500">Download analysis as HTML report</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handlePrint}
            disabled={isExporting}
          >
            <Printer className="h-5 w-5 mr-3 text-[--color-medical-primary]" />
            <div className="text-left">
              <div className="font-medium">Print Report</div>
              <div className="text-sm text-gray-500">Open print dialog</div>
            </div>
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            All exports include the educational use disclaimer
          </p>
        </div>
      </Card>
    </div>
  );
}
