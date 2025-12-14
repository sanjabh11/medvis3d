'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { detectDevice, getMemoryWarning } from '@/lib/utils/device-detection';

export function MemoryWarning() {
  const [warning, setWarning] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const device = detectDevice();
    const warningMessage = getMemoryWarning(device);
    setWarning(warningMessage);
  }, []);

  if (!warning || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-800 flex-1">{warning}</p>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-amber-100 rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-amber-600" />
      </button>
    </div>
  );
}
