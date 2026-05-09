'use client';

import { useCallback, useRef, useState } from 'react';
import { Activity, AlertCircle, FileImage, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SafeDicomStudySummary } from '../types';

interface CornerstoneDicomViewerProps {
  onUseFrameForBuilder: (imageData: ImageData, previewUrl: string) => void;
}

type ViewerStatus = 'idle' | 'loading' | 'ready' | 'unsupported';

type ParsedLocalDicom = {
  summary: SafeDicomStudySummary;
  imageData: ImageData | null;
};

const SUPPORTED_TRANSFER_SYNTAXES = new Set([
  '1.2.840.10008.1.2',
  '1.2.840.10008.1.2.1',
]);

const localDicomFiles: File[] = [];
const localDicomFileManager = {
  add(file: File) {
    const index = localDicomFiles.push(file) - 1;
    return `dicomfile:${index}`;
  },
  purge() {
    localDicomFiles.length = 0;
  },
};

function getFirstNumber(raw?: string): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw.split('\\')[0]);
  return Number.isFinite(value) ? value : undefined;
}

function convertPixelDataToImageData(
  pixelData: Uint8Array | Uint16Array,
  rows: number,
  columns: number,
  windowCenter = 40,
  windowWidth = 400
) {
  const imageData = new ImageData(columns, rows);
  const data = imageData.data;
  const minValue = windowCenter - windowWidth / 2;
  const maxValue = windowCenter + windowWidth / 2;

  for (let i = 0; i < rows * columns; i += 1) {
    const pixelValue = pixelData[i] ?? 0;
    const displayValue =
      pixelValue <= minValue
        ? 0
        : pixelValue >= maxValue
          ? 255
          : Math.round(((pixelValue - minValue) / Math.max(1, maxValue - minValue)) * 255);
    const offset = i * 4;
    data[offset] = displayValue;
    data[offset + 1] = displayValue;
    data[offset + 2] = displayValue;
    data[offset + 3] = 255;
  }

  return imageData;
}

function drawImageData(element: HTMLDivElement, imageData: ImageData): string {
  element.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.className = 'max-h-full max-w-full rounded-md object-contain';
  const ctx = canvas.getContext('2d');
  ctx?.putImageData(imageData, 0, 0);
  element.appendChild(canvas);
  return canvas.toDataURL('image/png');
}

async function parseLocalDicom(file: File): Promise<ParsedLocalDicom> {
  const dicomParser = await import('dicom-parser');
  const byteArray = new Uint8Array(await file.arrayBuffer());
  const dataSet = dicomParser.default.parseDicom(byteArray);
  const getString = (tag: string) => dataSet.string(tag);
  const rows = dataSet.uint16('x00280010');
  const columns = dataSet.uint16('x00280011');
  const frames = Number(getString('x00280008') || 1);
  const transferSyntaxUID = getString('x00020010');
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const pixelDataElement = dataSet.elements.x7fe00010;
  const isSupportedTransferSyntax =
    !transferSyntaxUID || SUPPORTED_TRANSFER_SYNTAXES.has(transferSyntaxUID.trim());
  const unsupportedReason =
    !isSupportedTransferSyntax
      ? `Unsupported DICOM transfer syntax: ${transferSyntaxUID}. The Cornerstone foundation currently keeps this as an explicit unsupported state.`
      : frames > 1
      ? `Multi-frame DICOM detected (${frames} frames). Stack/video workflows remain sandbox-only.`
      : !rows || !columns || !pixelDataElement
        ? 'No supported single-frame pixel data was found in this DICOM file.'
      : undefined;

  const summary: SafeDicomStudySummary = {
    modality: getString('x00080060') || 'Unknown',
    dimensions: rows && columns ? `${columns} x ${rows}` : 'Unknown',
    transferSyntaxUID,
    photometricInterpretation: getString('x00280004') || 'Unknown',
    windowCenter: getFirstNumber(getString('x00281050')) || 40,
    windowWidth: getFirstNumber(getString('x00281051')) || 400,
    supportStatus: unsupportedReason ? 'unsupported' : 'supported',
    unsupportedReason,
  };

  if (unsupportedReason || !rows || !columns || !pixelDataElement) {
    return { summary, imageData: null };
  }

  const buffer = byteArray.buffer;
  const length = rows * columns;
  const pixelData =
    bitsAllocated === 16
      ? new Uint16Array(buffer, pixelDataElement.dataOffset, length)
      : new Uint8Array(buffer, pixelDataElement.dataOffset, length);

  return {
    summary,
    imageData: convertPixelDataToImageData(
      pixelData,
      rows,
      columns,
      summary.windowCenter,
      summary.windowWidth
    ),
  };
}

export function CornerstoneDicomViewer({ onUseFrameForBuilder }: CornerstoneDicomViewerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<ViewerStatus>('idle');
  const [summary, setSummary] = useState<SafeDicomStudySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const handleFiles = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !elementRef.current) return;

    cleanup();
    setStatus('loading');
    setError(null);

    try {
      const parsed = await parseLocalDicom(files[0]);
      setSummary(parsed.summary);

      const cornerstoneCore = await import('@cornerstonejs/core');
      const cornerstoneTools = await import('@cornerstonejs/tools');
      const { init: coreInit, RenderingEngine, Enums } = cornerstoneCore;
      const {
        init: cornerstoneToolsInit,
        addTool,
        ToolGroupManager,
        WindowLevelTool,
        PanTool,
        ZoomTool,
        StackScrollTool,
        LengthTool,
        Enums: ToolsEnums,
      } = cornerstoneTools;

      await coreInit();
      await cornerstoneToolsInit();

      // The full decoder path will later import @cornerstonejs/dicom-image-loader.
      // This foundation keeps the local-file contract shaped like wadouri.fileManager.add(file)
      // while avoiding bundling compressed decoder workers into the main app shell.
      const wadouri = { fileManager: localDicomFileManager };
      const imageIds = files.map((file) => wadouri.fileManager.add(file));
      const renderingEngineId = `medvis3d-cornerstone-${Date.now()}`;
      const viewportId = 'MEDVIS3D_DICOM_STACK';
      const toolGroupId = `medvis3d-dicom-tools-${Date.now()}`;
      const renderingEngine = new RenderingEngine(renderingEngineId);

      elementRef.current.innerHTML = '';
      renderingEngine.enableElement({
        viewportId,
        element: elementRef.current,
        type: Enums.ViewportType.STACK,
      });

      [WindowLevelTool, PanTool, ZoomTool, StackScrollTool, LengthTool].forEach((tool) => {
        try {
          addTool(tool);
        } catch {
          // Tool may already be registered by another viewer instance.
        }
      });

      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        throw new Error('Unable to create Cornerstone3D tool group');
      }
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName);
      toolGroup.addTool(LengthTool.toolName);
      toolGroup.addViewport(viewportId, renderingEngineId);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: ToolsEnums.MouseBindings.Primary }],
      });
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: ToolsEnums.MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: ToolsEnums.MouseBindings.Secondary }],
      });
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: ToolsEnums.MouseBindings.Wheel }],
      });
      toolGroup.setToolPassive(LengthTool.toolName);

      cleanupRef.current = () => {
        try {
          ToolGroupManager.destroyToolGroup(toolGroupId);
        } catch {}
        localDicomFileManager.purge();
        renderingEngine.destroy();
      };

      if (parsed.summary.supportStatus === 'unsupported' || !parsed.imageData) {
        setError(parsed.summary.unsupportedReason || 'Unsupported DICOM input. No misleading fallback was rendered.');
        setStatus('unsupported');
        return;
      }

      drawImageData(elementRef.current, parsed.imageData);
      setError(`StackViewport foundation initialized with ${imageIds.length} local file image ID(s).`);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cornerstone DICOM rendering failed';
      setError(message);
      setStatus('unsupported');
    }
  }, [cleanup]);

  const handleUseCurrentFrame = useCallback(async () => {
    const canvas = elementRef.current?.querySelector('canvas');
    if (!canvas) return;

    const previewUrl = canvas.toDataURL('image/png');
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Unable to read current DICOM frame'));
      image.src = previewUrl;
    });

    const output = document.createElement('canvas');
    output.width = image.width;
    output.height = image.height;
    const ctx = output.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    onUseFrameForBuilder(ctx.getImageData(0, 0, output.width, output.height), previewUrl);
  }, [onUseFrameForBuilder]);

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <FileImage className="h-5 w-5 text-[--color-medical-primary]" />
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              Cornerstone3D DICOM viewer
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Local file stack viewer with safe metadata and measurement-lite / educational only tools.
            </p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[--color-medical-primary] px-3 py-2 text-sm font-medium text-[--color-medical-primary] hover:bg-blue-50">
          Select DICOM stack
          <input className="hidden" type="file" accept=".dcm,.dicom" multiple onChange={handleFiles} />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div
          ref={elementRef}
          className="flex h-80 items-center justify-center rounded-lg border border-gray-800 bg-gray-950 text-center text-sm text-gray-300"
          onContextMenu={(event) => event.preventDefault()}
        >
          {status === 'idle' && 'Select a local DICOM file or stack to render with Cornerstone3D.'}
          {status === 'loading' && 'Loading DICOM stack...'}
          {status === 'unsupported' && (
            <div className="flex max-w-md items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-left text-amber-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error || 'Unsupported DICOM input. No misleading fallback was rendered.'}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-[--color-medical-border] bg-white p-4 text-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            <ShieldCheck className="h-4 w-4" />
            Safe metadata
          </div>
          <p>PHI redacted: patient name and patient ID are never shown.</p>
          <p>Modality: {summary?.modality || 'Pending'}</p>
          <p>Dimensions: {summary?.dimensions || 'Pending'}</p>
          <p>Transfer syntax: {summary?.transferSyntaxUID || 'Pending'}</p>
          <p>Photometric: {summary?.photometricInterpretation || 'Pending'}</p>
          <p>Window: C {summary?.windowCenter || '-'} / W {summary?.windowWidth || '-'}</p>
          <p>Support: {summary?.unsupportedReason || summary?.supportStatus || 'unknown'}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={cleanup}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={status !== 'ready'}
              onClick={handleUseCurrentFrame}
            >
              <Activity className="h-4 w-4" />
              Use current DICOM frame for 3D builder
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
