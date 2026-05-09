'use client';

import { Layers3, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DEMO_SEGMENTATION_OVERLAYS, SEGMENTATION_PROVIDERS } from '../data/demo-overlays';

export function SegmentationResearchPanel({ imageUrl }: { imageUrl: string | null }) {
  const overlay = DEMO_SEGMENTATION_OVERLAYS[0];

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-[--color-medical-primary]" />
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              Segmentation research overlay
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Demo-mask provider architecture for future MedSAM2, TotalSegmentator, and MONAI Label research.
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          <ShieldAlert className="h-3.5 w-3.5" />
          experimental overlay · non-diagnostic
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative h-72 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Source image with demo segmentation overlay"
              className="absolute inset-0 h-full w-full object-contain opacity-85"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-300">
              Load a demo case or image to preview the educational demo-mask overlay.
            </div>
          )}
          <div className="absolute left-[28%] top-[22%] h-[44%] w-[42%] rounded-[46%] border-2 border-cyan-300 bg-cyan-300/20 shadow-[0_0_30px_rgba(103,232,249,0.45)]" />
          <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1 text-xs font-medium text-cyan-100">
            {overlay.label} · provider: {overlay.provider}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-[--color-medical-border] bg-white p-4 text-sm">
          <p className="font-semibold text-[--color-medical-text-primary]">Research providers</p>
          {SEGMENTATION_PROVIDERS.map((provider) => (
            <div key={provider.id} className="rounded-md bg-gray-50 p-2">
              <p className="font-medium">{provider.label}</p>
              <p className="text-xs text-[--color-medical-text-secondary]">{provider.mode}</p>
            </div>
          ))}
          <p className="text-xs leading-relaxed text-amber-900">
            {overlay.limitations.join(' ')} nonDiagnostic: {String(overlay.nonDiagnostic)}
          </p>
        </div>
      </div>
    </Card>
  );
}
