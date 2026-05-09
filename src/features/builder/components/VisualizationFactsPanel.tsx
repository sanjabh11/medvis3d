'use client';

import { FileImage, Lock, ShieldAlert, Cpu } from 'lucide-react';
import type { VisualizationFacts } from '../types';

function confidenceClasses(confidence: VisualizationFacts['confidence']): string {
  switch (confidence) {
    case 'high':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low':
      return 'bg-amber-50 text-amber-800 border-amber-200';
  }
}

export function VisualizationFactsPanel({ facts }: { facts: VisualizationFacts | null }) {
  if (!facts) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[--color-medical-border] bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[--color-medical-primary]" />
          <p className="text-sm font-semibold text-[--color-medical-text-primary]">
            Visualization facts
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${confidenceClasses(facts.confidence)}`}>
          {facts.confidence} confidence educational view
        </span>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            <FileImage className="h-3.5 w-3.5" />
            Source
          </div>
          <p className="text-[--color-medical-text-primary]">{facts.sourceType}</p>
          <p className="text-xs text-[--color-medical-text-secondary]">{facts.imageQuality}</p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            <Cpu className="h-3.5 w-3.5" />
            Model
          </div>
          <p className="text-[--color-medical-text-primary]">{facts.modelName}</p>
          <p className="text-xs text-[--color-medical-text-secondary]">
            {facts.modelVariant} via {facts.backend}
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[--color-medical-text-secondary]">
            <Lock className="h-3.5 w-3.5" />
            Privacy
          </div>
          <p className="text-[--color-medical-text-primary]">{facts.privacyStatus}</p>
          <p className="text-xs text-[--color-medical-text-secondary]">No image pixels in share URLs by default.</p>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        Educational only; not a diagnostic interpretation.{' '}
        {facts.limitations.join(' ')}
      </div>
    </div>
  );
}
