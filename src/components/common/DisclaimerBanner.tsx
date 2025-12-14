'use client';

import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-800">
          For Educational Purposes Only
        </p>
        <p className="text-xs text-amber-700 mt-1">
          This AI-generated visualization is a simulation and may not perfectly 
          reflect anatomical reality. Not for diagnostic use. Consult your 
          physician for medical interpretation.
        </p>
      </div>
    </div>
  );
}
