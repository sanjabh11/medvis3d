'use client';

import { FlaskConical, PlayCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DemoCase } from '../types';
import { DEMO_CASES } from '../data/demo-cases';

interface DemoCaseLibraryProps {
  onLoadCase: (demoCase: DemoCase) => Promise<void>;
}

export function DemoCaseLibrary({ onLoadCase }: DemoCaseLibraryProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-[--color-medical-primary]" />
          <div>
            <h2 className="text-lg font-semibold text-[--color-medical-text-primary]">
              Demo case gallery visible
            </h2>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Synthetic, de-identified proof inputs for outreach and browser smoke.
            </p>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          No PHI demo data
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DEMO_CASES.map((demoCase) => (
          <div
            key={demoCase.id}
            className="flex min-h-48 flex-col justify-between rounded-lg border border-[--color-medical-border] bg-white p-4"
          >
            <div>
              <p className="text-sm font-semibold text-[--color-medical-text-primary]">
                {demoCase.title}
              </p>
              <p className="mt-1 text-xs text-[--color-medical-text-secondary]">
                {demoCase.kind} · {demoCase.bodyRegion}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[--color-medical-text-secondary]">
                {demoCase.claimBoundary}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4 border-[--color-medical-primary] text-[--color-medical-primary] hover:bg-blue-50"
              onClick={() => onLoadCase(demoCase)}
            >
              <PlayCircle className="h-4 w-4" />
              Load Demo Case
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
