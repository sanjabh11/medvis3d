'use client';

import { BadgeCheck, Brain, Eye, FileImage, Sparkles } from 'lucide-react';

const STEPS = [
  { label: 'Upload', icon: FileImage },
  { label: 'Enhance', icon: Sparkles },
  { label: 'Infer depth', icon: Brain },
  { label: 'Build 3D', icon: Eye },
  { label: 'Explain', icon: BadgeCheck },
];

export function BuilderWorkflowStrip() {
  return (
    <section className="rounded-lg border border-[--color-medical-border] bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-[--color-medical-text-primary]">
          3D Builder workflow
        </p>
        <p className="text-xs text-[--color-medical-text-secondary]">
          Browser-local educational visualization with enhancement, model provenance, and confidence labeling.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[--color-medical-primary] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <Icon className="h-4 w-4 text-[--color-medical-primary]" />
              <span className="text-sm font-medium text-[--color-medical-text-primary]">{step.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
