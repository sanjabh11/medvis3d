'use client';

import { AlertTriangle, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { EnhancementProfile, EnhancedImageResult, ImageQualityReport } from '../types';
import { getQualityLabel } from '../utils/image-quality';

const PROFILE_OPTIONS: { value: EnhancementProfile; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'xray', label: 'X-ray' },
  { value: 'ct-mri-slice', label: 'CT/MRI' },
  { value: 'ultrasound-like', label: 'Ultrasound' },
  { value: 'general-photo', label: 'Photo' },
];

function getBadgeClasses(overall: ImageQualityReport['overall']): string {
  switch (overall) {
    case 'good':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'enhanceable':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low-confidence':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'insufficient':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-[--color-medical-text-secondary]">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[--color-medical-primary]"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ImageQualityPanel({
  report,
  selectedProfile,
  enhancedResult,
  onProfileChange,
}: {
  report: ImageQualityReport;
  selectedProfile: EnhancementProfile;
  enhancedResult: EnhancedImageResult | null;
  onProfileChange: (profile: EnhancementProfile) => void;
}) {
  return (
    <div className="rounded-lg border border-[--color-medical-border] bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {report.overall === 'good' ? (
              <CheckCircle2 className="h-4 w-4 text-[--color-medical-success]" />
            ) : (
              <Sparkles className="h-4 w-4 text-[--color-medical-primary]" />
            )}
            <p className="text-sm font-semibold text-[--color-medical-text-primary]">
              Image quality and enhancement
            </p>
          </div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getBadgeClasses(report.overall)}`}>
            {getQualityLabel(report.overall)}
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-[--color-medical-text-secondary]">
          <SlidersHorizontal className="h-4 w-4" />
          <select
            value={selectedProfile}
            onChange={(event) => onProfileChange(event.target.value as EnhancementProfile)}
            className="rounded-md border border-[--color-medical-border] bg-white px-2 py-1 text-sm text-[--color-medical-text-primary]"
          >
            {PROFILE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ScoreBar label="Contrast" value={report.contrastScore} />
        <ScoreBar label="Sharpness" value={report.blurScore} />
        <ScoreBar label="Exposure" value={report.exposureScore} />
      </div>

      {enhancedResult && (
        <p className="mt-3 text-xs leading-relaxed text-[--color-medical-text-secondary]">
          Enhancement profile: <span className="font-medium text-[--color-medical-text-primary]">{enhancedResult.profile}</span>.
          Applied {enhancedResult.appliedSteps.join(', ')} before depth estimation.
        </p>
      )}

      {report.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {report.warnings.map((warning) => (
            <div key={warning} className="flex gap-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
